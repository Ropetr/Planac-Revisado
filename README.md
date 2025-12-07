# 🏢 ERP PLANAC - Sistema de Gestão Empresarial

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)]()
[![Versão](https://img.shields.io/badge/Versão-5.0-blue)]()
[![Documentação](https://img.shields.io/badge/Docs-28%20Capítulos-green)]()

---

## 📋 Sobre o Projeto

Sistema ERP completo, multi-empresas, multi-integrações, desenvolvido em módulos para gerir empresas de **atacado**, **varejo** e **atacarejo**.

**Empresa:** PLANAC Distribuidora  
**Segmento:** Materiais para Construção (Drywall, Steel Frame, etc.)

---

## 📁 Estrutura do Repositório

```
📁 Planac/
├── 📁 docs/                          # Documentação completa
│   ├── 📁 01-sumario/                # Estrutura de módulos (28 capítulos)
│   ├── 📁 02-regras-negocio/         # 313 regras por módulo
│   ├── 📁 03-casos-uso/              # 185 casos de uso
│   ├── 📁 04-fluxogramas/            # 25 fluxogramas em Mermaid
│   ├── 📁 05-modelo-dados/           # 207 tabelas
│   ├── 📁 06-especificacao-telas/    # 203 telas especificadas
│   ├── 📁 07-apis/                   # Endpoints e integrações
│   ├── 📁 08-integracoes/            # 10 sistemas externos
│   ├── 📁 09-manuais/                # Usuário e Admin
│   └── 📁 10-anexos/                 # Arquitetura, Glossário, Roadmap
├── 📁 src/                           # Código-fonte (futuro)
├── CHECKLIST.md                      # Status de cada documento
└── README.md                         # Este arquivo
```

---

## 🎯 Módulos do Sistema

### Estrutura de Partes (13 Partes)

| Parte | Nome | Capítulos |
|:-----:|------|:---------:|
| 1 | Módulos Core | 01-03 |
| 2 | Módulo Comercial (12 submódulos) | 04 |
| 3 | Módulo Compras (12 submódulos) | 05 |
| 4 | Módulos Financeiros | 06-09 |
| 5 | Módulos Fiscais e Contábeis | 10-14 |
| 6 | Separação e Expedição | 15 |
| 7 | Módulos de Inteligência | 16 |
| 8 | Marketing, E-commerce e Atendimento | 17-19 |
| 9 | Módulos de Integração | 20-21 |
| 10 | Módulos de Interface | 22-23 |
| 11 | Módulos de Suporte | 24-25 |
| 12 | Recursos Humanos | 26-27 |
| 13 | Contratos | 28 |

### Menus Principais

| Menu | Submódulos |
|------|------------|
| **📁 COMERCIAL** | CRM, CalcPro, Orçamentos, Pedido de Venda, PDV, Programa de Indicações, Devolução, Troca, Serviços, Consignação, Garantia, Gamificação |
| **📁 COMPRAS** | Cotações, Pedido de Compra, Recebimento, Devolução, Troca, Importação NF, Análise de Preços, Estoque, WMS, Produção/PCP, Kits, Custos/Precificação |
| **📁 FINANCEIRO** | Contas a Receber, Contas a Pagar, Fluxo de Caixa, Bancos e Tesouraria |
| **📁 FISCAL** | Tributário, Documentos Fiscais, Obrigações, Contabilidade, Patrimônio |
| **📁 RH** | Colaboradores, Ponto, Férias, Folha, Benefícios, App do Colaborador |

---

## 📊 Status da Documentação

| Fase | Documentos | Progresso |
|------|------------|-----------|
| 1 - Negócio | Sumário, Regras, Casos de Uso | ✅ **100%** |
| 2 - Funcional | Fluxogramas, Telas, Relatórios | 🟡 **60%** |
| 3 - Técnica | Modelo de Dados, APIs, Integrações | ⏳ **20%** |
| 4 - Implantação | Manuais, Testes | ⏳ **0%** |

### Documentos Completos

| Documento | Quantidade | Status |
|-----------|------------|--------|
| ✅ Sumário Geral | 28 capítulos | Completo |
| ✅ Regras de Negócio | 313 regras | Completo |
| ✅ Casos de Uso | 185 casos | Completo |
| ✅ Fluxogramas | 25 fluxos | Completo |
| ✅ Modelo de Dados | 207 tabelas | Completo |
| ✅ Telas | 203 telas | Completo |
| ✅ Integrações | 10 APIs | Completo |

**Detalhes:** [CHECKLIST.md](./CHECKLIST.md)

---

## 🚀 Funcionalidades Principais

### Comercial
- ✅ Vendas com entregas fracionadas (.E1, .E2, .E3)
- ✅ Orçamentos com mesclar/desmembrar
- ✅ Programa de indicações com crédito
- ✅ Consignação com acerto automático
- ✅ Garantia de produtos
- ✅ Gamificação para vendedores

### E-commerce
- ✅ Loja B2B + B2C integrada
- ✅ Aprovação de cadastro B2B
- ✅ Rastreamento GPS em tempo real
- ✅ Área do cliente completa

### Financeiro
- ✅ Múltiplas formas de pagamento por venda
- ✅ Régua de cobrança automática
- ✅ Limite de crédito com compromisso na venda

### RH
- ✅ App do Colaborador
- ✅ Ponto com geolocalização
- ✅ Folha de pagamento integrada

---

## 👥 Equipe

- **Rodrigo** - Product Owner / PLANAC
- **Claude AI** - Assistente de Documentação
- **DEV.com** - Fábrica de Software Virtual

---

## 📅 Histórico

| Data | Versão | Descrição |
|------|--------|-----------|
| 07/12/2025 | 5.0 | Revisão completa: correção de métricas (313 regras, 185 casos, 207 tabelas, 10 integrações) |
| 06/12/2025 | 4.0 | Varredura completa, IDs Cloudflare, Nuvem Fiscal |
| 01/12/2025 | 3.0 | Documentação completa: 295 regras, 145 casos de uso, 25 fluxogramas |
| 29/11/2025 | 2.1 | Adicionado: E-commerce, RH, GPS, Custos, Contratos |
| 28/11/2025 | 2.0 | Reorganização: 23 capítulos |
| 28/11/2025 | 1.0 | Estrutura inicial: 34 capítulos |

---

*Documentação gerada com auxílio de IA - Anthropic Claude*
