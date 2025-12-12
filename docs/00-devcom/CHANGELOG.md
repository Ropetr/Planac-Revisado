# 📝 CHANGELOG - ERP PLANAC

Todas as mudanças notáveis do projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Added
- Brain Pack 1.0: estrutura de governança do projeto
  - `docs/00-devcom/PROJECT_MEMORY.md` - Cérebro do projeto
  - `docs/00-devcom/WORKFLOW.md` - Processo de desenvolvimento
  - `docs/00-devcom/RUNBOOK.md` - Guia operacional
  - `docs/00-devcom/CHANGELOG.md` - Este arquivo
  - `docs/00-devcom/ADR/` - Architecture Decision Records
  - `docs/00-devcom/MAP/` - Mapas de módulos e impacto
  - `docs/00-devcom/METRICS/` - Métricas medidas
- `docs/07-apis/openapi.yaml` - Skeleton do contrato OpenAPI 3.0
- `tools/measure-metrics.mjs` - Script para medir métricas automaticamente

### Changed
- `CHECKLIST.md` - Atualizado com seção "documentado vs medido"

---

## [6.0.0] - 2025-12-07

### Added
- Correção de métricas oficiais:
  - 313 regras de negócio (contadas)
  - 185 casos de uso (contados)
  - 207 tabelas no modelo de dados (contadas)
  - 10 integrações documentadas

### Changed
- README.md atualizado com métricas corretas

---

## [5.0.0] - 2025-12-07

### Added
- Documentação completa do modelo de dados (207 tabelas)
- Especificação de 203 telas
- 25 fluxogramas em Mermaid

### Changed
- Reorganização das regras de negócio por módulo

---

## [4.0.0] - 2025-12-06

### Added
- Integração Nuvem Fiscal documentada (NF-e, NFC-e, NFS-e, CT-e, MDF-e)
- IDs reais dos recursos Cloudflare no `wrangler.toml`
- `.env.example` com template de variáveis

### Changed
- Varredura completa de consistência nos documentos

---

## [3.0.0] - 2025-12-01

### Added
- 295 regras de negócio iniciais
- 145 casos de uso iniciais
- 25 fluxogramas base

---

## [2.1.0] - 2025-11-29

### Added
- Módulo E-commerce
- Módulo RH completo
- Rastreamento GPS
- Módulo Custos
- Módulo Contratos

---

## [2.0.0] - 2025-11-28

### Changed
- Reorganização para 23 capítulos
- Nova estrutura de pastas `docs/`

---

## [1.0.0] - 2025-11-28

### Added
- Estrutura inicial do projeto
- 34 capítulos de documentação
- README.md base
- CHECKLIST.md inicial

---

## Legenda

- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas em breve
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de vulnerabilidades

---

*Mantenha este arquivo atualizado a cada mudança relevante.*
