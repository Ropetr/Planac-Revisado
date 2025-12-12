# 🧠 PROJECT MEMORY - ERP PLANAC

> **Cérebro do Projeto** - Fonte de verdade consolidada para o dev.com-orquestrador/Claude.  
> Última atualização: 2025-12-12 | Versão: 1.0

---

## 📌 VISÃO DO PROJETO

### O que é o ERP PLANAC

Sistema ERP multi-tenant completo para empresas de **atacado**, **varejo** e **atacarejo**, desenvolvido para a PLANAC Distribuidora (materiais para construção - Drywall, Steel Frame).

**Características:**
- Multi-empresas (tenants isolados)
- Multi-filiais por empresa
- Multi-integrações externas
- Modelo de revenda (Software House DEV.com)

### O que NÃO é

- ❌ Sistema genérico (é focado em distribuição/materiais de construção)
- ❌ Sistema standalone (depende de integrações externas para fiscal/financeiro)
- ❌ Sistema legado (arquitetura serverless moderna)

---

## 🎯 ESCOPO DO MVP (Slice 1)

### Módulos Prioritários

| Prioridade | Módulo | Justificativa |
|:----------:|--------|---------------|
| P0 | Auth + Multi-tenant | Base de tudo |
| P0 | Empresas + Filiais | Estrutura organizacional |
| P0 | Usuários + Permissões | Acesso e segurança |
| P1 | Clientes | Cadastro básico para vendas |
| P1 | Produtos + Estoque | Core do negócio |
| P1 | Orçamentos → Pedidos | Fluxo comercial básico |
| P2 | Contas a Receber | Financeiro mínimo |
| P2 | NF-e (Nuvem Fiscal) | Fiscal obrigatório |

### Fora do MVP

- CRM avançado, Gamificação
- E-commerce próprio (usa marketplaces via integração)
- RH/Folha de pagamento
- BI avançado

---

## ✅ DECISÕES JÁ TOMADAS

| ID | Decisão | Detalhes |
|----|---------|----------|
| [ADR-0001](./ADR/ADR-0001-stack-e-principios.md) | Stack Cloudflare | Workers + D1 + KV + R2 |
| [ADR-0002](./ADR/ADR-0002-multi-tenant-rbac.md) | Multi-tenant + RBAC | empresa_id em todas tabelas + 132 permissões |
| [ADR-0003](./ADR/ADR-0003-integracoes-e-provedores.md) | Modelo Software House | DEV.com gerencia credenciais master |

---

## 🚫 NÃO QUEBRAR (Restrições)

1. **Isolamento de tenant**: TODA query DEVE filtrar por `empresa_id`
2. **Convenção de nomes**: Recursos Cloudflare = `Planac-erp-*`
3. **Auditoria obrigatória**: Toda ação de escrita gera log
4. **Sem números inventados**: Métricas devem ser medidas por script
5. **Documentação viva**: Toda mudança atualiza docs + CHANGELOG

---

## 📊 MÉTRICAS ATUAIS (Medidas)

> Geradas automaticamente em: [METRICS/metrics.json](./METRICS/metrics.json)

### Documentação (docs/)

| Pasta | Conteúdo Documentado | Arquivos |
|-------|---------------------|----------|
| 01-sumario | 28 capítulos | 1 |
| 02-regras-negocio | 313 regras | 1 |
| 03-casos-uso | 185 casos | 1 |
| 04-fluxogramas | 25 fluxos | 1 |
| 05-modelo-dados | 207 tabelas | 1 |
| 06-especificacao-telas | 203 telas | 1 |
| 07-apis | Em construção | 1 |
| 08-integracoes | 10 sistemas | 5 |
| 09-manuais | Pendente | 1 |
| 10-anexos | Segurança + Guias | 3 |

### Código (src/)

| Área | Quantidade | Observação |
|------|------------|------------|
| Rotas API (.routes.ts) | 58 | Módulos únicos |
| Migrations SQL | 8 | Esquema completo |
| Tabelas D1 | 207 | Conforme modelo de dados |

### Infraestrutura Cloudflare

| Recurso | ID |
|---------|-----|
| D1 Database | `12f9a7d5-fe09-4b09-bf72-59bae24d65b2` |
| KV Cache | `d053dab81a554dc6961884eae41f75f7` |
| KV Sessions | `80c6322699844ba1bb99e841f0c84306` |
| KV Rate Limit | `f9991a8379d74873a8030e42dad416bd` |
| R2 Storage | `planac-erp-storage` |

---

## 🔗 REFERÊNCIAS RÁPIDAS

### Documentação de Negócio
- [Sumário (28 capítulos)](../01-sumario/)
- [Regras de Negócio (313)](../02-regras-negocio/)
- [Casos de Uso (185)](../03-casos-uso/)
- [Fluxogramas (25)](../04-fluxogramas/)

### Documentação Técnica
- [Modelo de Dados (207 tabelas)](../05-modelo-dados/)
- [Especificação de Telas (203)](../06-especificacao-telas/)
- [APIs/OpenAPI](../07-apis/openapi.yaml)
- [Integrações (10)](../08-integracoes/)

### Governança
- [CHECKLIST.md](../../CHECKLIST.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [WORKFLOW.md](./WORKFLOW.md)
- [RUNBOOK.md](./RUNBOOK.md)

---

## 🏢 INTEGRAÇÕES EXTERNAS (10)

| # | Sistema | Categoria | Modelo |
|---|---------|-----------|--------|
| 1 | Nuvem Fiscal | Fiscal | Software House |
| 2 | TecnoSpeed Boletos | Financeiro | Software House |
| 3 | TecnoSpeed PIX | Financeiro | Software House |
| 4 | TecnoSpeed Plug4Market | Marketplaces | Software House |
| 5 | WhatsApp (BSP) | Comunicação | Software House |
| 6 | CPF.CNPJ | Validação | Global |
| 7 | CNPJá | Validação | Global |
| 8 | SERPRO | Gov/Fiscal | Global |
| 9 | IBPT | Tributário | Global |
| 10 | Bluesoft Cosmos | Catálogo | Global |

---

## 👥 STAKEHOLDERS

| Papel | Nome/Entidade | Responsabilidade |
|-------|---------------|------------------|
| Product Owner | Rodrigo (PLANAC) | Visão de negócio, prioridades |
| Software House | DEV.com | Desenvolvimento, integrações |
| Orquestrador | Claude AI + 44 Especialistas | Governança, documentação |
| Cliente Piloto | PLANAC Distribuidora | Validação, feedback |

---

*Este documento é atualizado automaticamente pelo dev.com-orquestrador.*
