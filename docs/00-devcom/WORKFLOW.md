# 🔄 WORKFLOW - ERP PLANAC

> Processo obrigatório de desenvolvimento. Todo trabalho segue esta ordem.

---

## 📋 ORDEM OBRIGATÓRIA DE DESENVOLVIMENTO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PIPELINE DE DESENVOLVIMENTO                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ESCOPO/FLUXO DO USUÁRIO                                                 │
│     └─► Definir o que o usuário quer fazer                                  │
│         Documentar em casos de uso                                          │
│                                                                              │
│  2. CONTRATOS/API                                                           │
│     └─► Definir endpoints (OpenAPI)                                         │
│         Request/Response schemas                                            │
│                                                                              │
│  3. MODELO DE DADOS                                                         │
│     └─► Tabelas necessárias                                                 │
│         Migrations SQL                                                      │
│                                                                              │
│  4. ARQUITETURA DE MÓDULOS                                                  │
│     └─► Onde fica cada coisa no código                                      │
│         Services, Routes, Types                                             │
│                                                                              │
│  5. INFRA/AMBIENTES/SECRETS                                                 │
│     └─► Variáveis de ambiente                                               │
│         Configurações Cloudflare                                            │
│                                                                              │
│  6. CI/CD                                                                   │
│     └─► GitHub Actions                                                      │
│         Deploy automático                                                   │
│                                                                              │
│  7. IMPLEMENTAÇÃO (SLICES VERTICAIS)                                        │
│     └─► Desenvolver feature completa                                        │
│         Backend + Frontend + Testes                                         │
│                                                                              │
│  8. TESTES                                                                  │
│     └─► Unitários, Integração, E2E                                         │
│         Cobertura mínima: 80%                                               │
│                                                                              │
│  9. OBSERVABILIDADE                                                         │
│     └─► Logs estruturados                                                   │
│         Métricas de performance                                             │
│                                                                              │
│  10. HARDENING                                                              │
│      └─► Segurança, rate limiting                                          │
│          Validações de entrada                                              │
│                                                                              │
│  11. RELEASE                                                                │
│      └─► Tag de versão                                                     │
│          Deploy para produção                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌿 DISCIPLINA GITHUB

### Branches

```
main                    # Produção - NUNCA commit direto
├── develop            # Integração - PRs vão para cá
├── feature/xyz        # Nova funcionalidade
├── fix/xyz            # Correção de bug
├── refactor/xyz       # Refatoração sem mudança funcional
├── docs/xyz           # Apenas documentação
└── test/xyz           # Apenas testes
```

### Padrão de Branch

```
feature/brain-pack-1.0
feature/auth-jwt-2fa
fix/orcamento-calculo-desconto
refactor/cliente-service-cleanup
docs/api-openapi-endpoints
```

### Commits (Conventional Commits)

```
feat: add login with JWT authentication
fix: correct discount calculation in quotation
refactor: extract validation to shared utils
docs: add OpenAPI spec for clients endpoint
test: add unit tests for auth service
chore: update dependencies
ci: add GitHub Actions workflow
```

**Regras:**
- Commits pequenos e atômicos
- Uma mudança lógica por commit
- Mensagem em inglês, imperativo, presente

### Pull Requests

Todo PR deve conter:

```markdown
## O que mudou
- Lista de alterações

## Como testar
1. Passo a passo para validar

## Riscos
- Possíveis impactos negativos

## Checklist
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado
- [ ] Sem console.log/debug
```

---

## ✅ DEFINITION OF DONE

Uma tarefa só está "done" quando:

| Critério | Obrigatório |
|----------|:-----------:|
| Código implementado e funcionando | ✅ |
| Testes escritos e passando | ✅ |
| PR aprovado (code review) | ✅ |
| Merge na branch develop | ✅ |
| Documentação atualizada | ✅ |
| CHANGELOG atualizado | ✅ |
| ADR criado (se decisão arquitetural) | ⚠️ |
| PROJECT_MEMORY atualizado (se métrica mudou) | ⚠️ |

---

## 🚨 BLOCKERS

Se encontrar um BLOCKER, **PARAR IMEDIATAMENTE** e:

1. Documentar o blocker em um issue
2. Notificar stakeholders
3. NÃO tentar contornar sem discussão
4. Aguardar decisão antes de continuar

**Exemplos de BLOCKER:**
- Mudança que quebra contrato de API existente
- Alteração em tabela com dados de produção
- Integração externa fora do ar
- Conflito de requisitos entre módulos

---

## 👥 COORDENAÇÃO DE ESPECIALISTAS

### Triagem (Sempre)

| Especialista | Quando ativar |
|--------------|---------------|
| 🎯 CEO DEV.com | Escopo, prioridades |
| 🔐 Segurança/LGPD | Qualquer dado sensível |
| ✅ QA Técnico | Antes de merge |

### Domínio (Conforme impacto)

| Área | Especialistas |
|------|---------------|
| Comercial | Vendas + Pricing + CRM |
| Fiscal | Tributário + ERP |
| Financeiro | CFO + Pricing |
| Estoque/Logística | Logística + Estoque + Compras |

### Execução (Conforme tipo)

| Tipo de mudança | Especialistas |
|-----------------|---------------|
| Backend/API | ⚙️ Backend + CTO |
| Banco de Dados | 🗄️ DBA + Backend |
| Frontend | 🌐 Frontend + UX/UI |
| Infra/Deploy | 🚀 DevOps + GitHub/CF |
| Integrações | ⚙️ Backend + Especialista específico |

---

## 📄 ATUALIZAÇÃO DE DOCUMENTOS

Toda mudança relevante deve atualizar:

| Documento | Quando |
|-----------|--------|
| PROJECT_MEMORY.md | Métricas mudaram |
| CHANGELOG.md | Qualquer mudança |
| ADR/ADR-xxxx.md | Decisão arquitetural |
| openapi.yaml | Endpoint novo/alterado |
| RUNBOOK.md | Novo processo operacional |
| module-map.json | Novo módulo/domínio |
| impact-map.json | Nova regra de roteamento |

---

## 🔄 CONTEXT PACK (Antes de Codificar)

Antes de qualquer alteração de código, gerar um Context Pack listando:

```markdown
## Context Pack - [Nome da Tarefa]

### Escopo
- O que será feito

### Impacto Mapeado
- Regras: RN-xxx, RN-yyy
- Casos de Uso: UC-xxx
- Tabelas: tabela_a, tabela_b
- Telas: TELA-xxx
- APIs: GET /api/xxx

### Arquivos Afetados
- src/api/src/routes/xxx.routes.ts
- src/api/src/services/xxx.service.ts

### Riscos
- Possíveis quebras
- Dependências

### Especialistas Necessários
- Backend, DBA, QA
```

---

*Este workflow é obrigatório. Atalhos geram retrabalho.*
