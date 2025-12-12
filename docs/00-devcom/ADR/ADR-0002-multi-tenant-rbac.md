# ADR-0002: Multi-Tenancy e Controle de Acesso (RBAC)

**Status:** Aceito  
**Data:** 2025-12-12  
**Decisores:** CTO DEV.com, DBA DEV.com, Segurança/LGPD DEV.com

---

## Contexto

O ERP PLANAC será comercializado como SaaS para múltiplas empresas (tenants). Requisitos:

1. **Isolamento de dados**: Empresa A nunca vê dados da Empresa B
2. **Multi-filial**: Cada empresa pode ter N filiais
3. **Permissões granulares**: Vendedor só vê clientes, CFO vê financeiro
4. **Auditoria**: Quem fez o quê e quando

## Decisão

### Multi-Tenancy: Abordagem "Shared Database, Shared Schema"

Todas as empresas compartilham o mesmo banco D1, mas com **isolamento por coluna `empresa_id`**.

```sql
-- Toda tabela principal tem empresa_id
CREATE TABLE clientes (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL,  -- 🔒 Obrigatório
  nome TEXT NOT NULL,
  -- ...
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Índice composto para queries eficientes
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
```

**Regra de Ouro:** TODA query DEVE filtrar por `empresa_id`. Sem exceção.

```typescript
// ✅ CORRETO
const clientes = await db
  .select()
  .from(clientes)
  .where(eq(clientes.empresa_id, ctx.empresa_id));

// ❌ ERRADO - Expõe dados de outras empresas!
const clientes = await db.select().from(clientes);
```

### RBAC: Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                    HIERARQUIA DE ACESSO                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Empresa (tenant)                                          │
│      │                                                       │
│      ├── Filial 1                                           │
│      │      ├── Usuário A (Perfil: Admin)                  │
│      │      ├── Usuário B (Perfil: Vendedor)               │
│      │      └── Usuário C (Perfil: Financeiro)             │
│      │                                                       │
│      └── Filial 2                                           │
│             ├── Usuário D (Perfil: Vendedor)               │
│             └── Usuário E (Perfil: Estoquista)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Permissões

```sql
-- Perfis (grupos de permissões)
CREATE TABLE perfis (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL,
  nome TEXT NOT NULL,      -- "Vendedor", "Admin", "Financeiro"
  descricao TEXT,
  ativo INTEGER DEFAULT 1
);

-- Permissões granulares
CREATE TABLE permissoes (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,  -- "clientes.criar", "pedidos.aprovar"
  modulo TEXT NOT NULL,         -- "clientes", "pedidos", "financeiro"
  acao TEXT NOT NULL,           -- "criar", "ler", "editar", "deletar", "aprovar"
  descricao TEXT
);

-- Vínculo perfil <-> permissões
CREATE TABLE perfis_permissoes (
  perfil_id TEXT NOT NULL,
  permissao_id TEXT NOT NULL,
  PRIMARY KEY (perfil_id, permissao_id)
);

-- Vínculo usuário <-> perfil
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL,
  perfil_id TEXT NOT NULL,
  filial_id TEXT,  -- NULL = acesso a todas filiais
  -- ...
);
```

### Permissões Pré-definidas (132 total)

| Módulo | Permissões |
|--------|------------|
| clientes | criar, ler, editar, deletar, exportar |
| produtos | criar, ler, editar, deletar, importar, exportar |
| orcamentos | criar, ler, editar, deletar, aprovar, converter |
| pedidos | criar, ler, editar, deletar, aprovar, cancelar, faturar |
| estoque | ler, movimentar, inventariar, transferir |
| financeiro | ler, receber, pagar, conciliar |
| fiscal | emitir, cancelar, inutilizar, consultar |
| usuarios | criar, ler, editar, deletar, resetar_senha |
| configuracoes | ler, editar |
| relatorios | visualizar, exportar |

### Middleware de Autorização

```typescript
// Middleware que valida permissão em cada rota
export const requirePermission = (permissao: string) => {
  return async (c: Context, next: Next) => {
    const usuario = c.get('usuario');
    
    // Verificar se usuário tem a permissão
    const temPermissao = await verificarPermissao(
      usuario.perfil_id,
      permissao
    );
    
    if (!temPermissao) {
      return c.json({ error: 'Acesso negado' }, 403);
    }
    
    await next();
  };
};

// Uso nas rotas
app.post('/api/clientes', 
  requirePermission('clientes.criar'),
  criarCliente
);
```

## Alternativas Consideradas

### Database per Tenant
- ✅ Isolamento perfeito
- ❌ Complexidade operacional (N databases)
- ❌ Custo multiplicado
- ❌ Migrations em N lugares

### Schema per Tenant
- ✅ Bom isolamento
- ❌ D1 não suporta múltiplos schemas
- ❌ Complexidade de queries cross-schema

### Row-Level Security (RLS) nativo
- ✅ Isolamento a nível de banco
- ❌ D1/SQLite não tem RLS nativo
- ⚠️ Simulamos via middleware

## Consequências

### Positivas
- ✅ Simplicidade operacional (1 database)
- ✅ Migrations únicas
- ✅ Queries cross-tenant possíveis (para admin DEV.com)
- ✅ Custo fixo por database

### Negativas
- ⚠️ Risco de vazamento se esquecer filtro
- ⚠️ Performance pode degradar com muitos tenants
- ⚠️ Backup é tudo-ou-nada

### Mitigações
- Lint rule para detectar queries sem `empresa_id`
- Testes automatizados de isolamento
- Índices compostos por empresa_id
- Middleware obrigatório em todas as rotas

## Auditoria

Toda ação de escrita gera log:

```sql
CREATE TABLE logs_auditoria (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  acao TEXT NOT NULL,        -- "criar", "editar", "deletar"
  entidade TEXT NOT NULL,    -- "clientes", "pedidos"
  entidade_id TEXT NOT NULL,
  dados_antes TEXT,          -- JSON do estado anterior
  dados_depois TEXT,         -- JSON do estado novo
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Referências

- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenant)
- [RBAC Best Practices](https://auth0.com/docs/manage-users/access-control/rbac)
