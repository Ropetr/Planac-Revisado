# 📖 RUNBOOK - ERP PLANAC

> Guia operacional para desenvolvimento, deploy e troubleshooting.  
> Última atualização: 2025-12-12

---

## 🚀 COMO RODAR LOCAL

### Pré-requisitos

```bash
# Node.js 20+
node --version  # v20.x.x

# npm 10+
npm --version   # 10.x.x

# Wrangler CLI (Cloudflare)
npm install -g wrangler
wrangler --version  # 3.x.x

# Git
git --version
```

### Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/Ropetr/Planac-Revisado.git
cd Planac-Revisado

# 2. Instalar dependências
cd src
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com valores reais

# 4. Login no Cloudflare (primeira vez)
wrangler login

# 5. Executar migrations localmente
wrangler d1 migrations apply Planac-erp-database --local

# 6. Rodar em desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev         # API em modo desenvolvimento (hot reload)
npm run dev:web     # Frontend em modo desenvolvimento

# Build
npm run build       # Build de produção

# Testes
npm run test        # Rodar todos os testes
npm run test:watch  # Testes em modo watch

# Linting
npm run lint        # Verificar código
npm run lint:fix    # Corrigir automaticamente

# Database
npm run db:migrate  # Aplicar migrations
npm run db:seed     # Popular dados iniciais
npm run db:reset    # Reset completo (DEV only!)

# Deploy
npm run deploy      # Deploy para Cloudflare
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### Lista de Secrets (sem valores)

| Variável | Descrição | Onde configurar |
|----------|-----------|-----------------|
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare | wrangler.toml / Secrets |
| `CLOUDFLARE_API_TOKEN` | Token de API | GitHub Secrets |
| `JWT_SECRET` | Chave para tokens JWT | Cloudflare Secrets |
| `NUVEM_FISCAL_CLIENT_ID` | ID do cliente Nuvem Fiscal | Cloudflare Secrets |
| `NUVEM_FISCAL_CLIENT_SECRET` | Secret Nuvem Fiscal | Cloudflare Secrets |
| `TECNOSPEED_TOKEN` | Token TecnoSpeed | Cloudflare Secrets |
| `WHATSAPP_BSP_TOKEN` | Token WhatsApp BSP | Cloudflare Secrets |
| `CPF_CNPJ_TOKEN` | Token CPF.CNPJ API | Cloudflare Secrets |
| `CNPJA_API_KEY` | Chave CNPJá | Cloudflare Secrets |
| `SERPRO_TOKEN` | Token SERPRO | Cloudflare Secrets |

### Configurar Secrets no Cloudflare

```bash
# Via Wrangler CLI
wrangler secret put JWT_SECRET
wrangler secret put NUVEM_FISCAL_CLIENT_ID
wrangler secret put NUVEM_FISCAL_CLIENT_SECRET
# ... etc
```

---

## ✅ CHECKLIST DE VALIDAÇÃO DE PR

Antes de aprovar um PR, verificar:

### Código

- [ ] Testes passando (`npm run test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Build sem erros (`npm run build`)
- [ ] Sem `console.log` / código de debug
- [ ] Sem secrets hardcoded

### Segurança

- [ ] Toda query filtra por `empresa_id` (multi-tenant)
- [ ] Inputs validados com Zod
- [ ] Rate limiting aplicado em endpoints sensíveis
- [ ] Logs não expõem dados sensíveis

### Documentação

- [ ] CHANGELOG.md atualizado
- [ ] PROJECT_MEMORY.md atualizado (se métrica mudou)
- [ ] ADR criado (se decisão arquitetural)
- [ ] OpenAPI atualizado (se endpoint novo/alterado)

### Banco de Dados

- [ ] Migration criada (se schema mudou)
- [ ] Migration é reversível (down)
- [ ] Índices adequados para queries frequentes
- [ ] Sem dados sensíveis em seed

---

## 🔧 TROUBLESHOOTING

### Erro: "D1_ERROR: no such table"

**Causa:** Migrations não foram aplicadas.

**Solução:**
```bash
# Local
wrangler d1 migrations apply Planac-erp-database --local

# Produção
wrangler d1 migrations apply Planac-erp-database --remote
```

### Erro: "Authentication failed"

**Causa:** Token JWT expirado ou inválido.

**Solução:**
1. Verificar se JWT_SECRET está configurado
2. Verificar expiração do token
3. Fazer logout/login novamente

### Erro: "Rate limit exceeded"

**Causa:** Muitas requisições em curto período.

**Solução:**
1. Aguardar período de cooldown (1 minuto)
2. Verificar se não há loop infinito no código
3. Aumentar limite no KV Rate Limit (se necessário)

### Erro: "empresa_id is required"

**Causa:** Requisição sem contexto de tenant.

**Solução:**
1. Verificar se token JWT contém `empresa_id`
2. Verificar middleware de multi-tenant
3. Confirmar que usuário está vinculado a uma empresa

### Erro: "Nuvem Fiscal - 401 Unauthorized"

**Causa:** Credenciais inválidas ou expiradas.

**Solução:**
1. Verificar se Client ID e Secret estão corretos
2. Gerar novo access token OAuth2
3. Verificar se ambiente (sandbox/produção) está correto

### Deploy travado no Cloudflare

**Causa:** Conflito de versão ou erro de build.

**Solução:**
```bash
# Forçar rebuild
wrangler deploy --force

# Se persistir, verificar logs
wrangler tail
```

---

## 📊 MONITORAMENTO

### Logs em Tempo Real

```bash
# Ver logs do Worker
wrangler tail

# Filtrar por status
wrangler tail --status error

# Filtrar por path
wrangler tail --search "/api/clientes"
```

### Métricas Cloudflare Dashboard

1. Acessar [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages > planac-erp-api
3. Verificar:
   - Requests por minuto
   - Erros por endpoint
   - Latência média
   - CPU time

### Health Check

```bash
# Endpoint de health
curl https://planac-erp.workers.dev/health

# Resposta esperada
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-12-12T15:00:00Z"
}
```

---

## 🚨 PROCEDIMENTOS DE EMERGÊNCIA

### Rollback de Deploy

```bash
# Listar versões
wrangler deployments list

# Rollback para versão anterior
wrangler rollback
```

### Desativar Endpoint Específico

Adicionar no `wrangler.toml`:
```toml
[vars]
DISABLE_ENDPOINT_CLIENTES = "true"
```

### Modo Manutenção

```bash
# Ativar manutenção
wrangler secret put MAINTENANCE_MODE --value "true"

# Desativar
wrangler secret put MAINTENANCE_MODE --value "false"
```

---

## 📞 CONTATOS

| Papel | Responsável | Contato |
|-------|-------------|---------|
| Product Owner | Rodrigo (PLANAC) | - |
| DevOps/Infra | DEV.com | - |
| Suporte Cloudflare | - | [Support](https://dash.cloudflare.com/support) |
| Suporte Nuvem Fiscal | - | suporte@nfrsonline.com.br |
| Suporte TecnoSpeed | - | suporte@tecnospeed.com.br |

---

*Este runbook é mantido pela DEV.com e atualizado a cada release.*
