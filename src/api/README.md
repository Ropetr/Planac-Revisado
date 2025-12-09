# 🏢 PLANAC ERP

<div align="center">

![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Stack](https://img.shields.io/badge/Stack-Cloudflare%20Workers-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**Sistema ERP completo para distribuidora de drywall e materiais de construção**

*Desenvolvido por [DEV.com](https://github.com/Ropetr) - Fábrica de Software Virtual*

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Módulos](#módulos)
- [API Endpoints](#api-endpoints)
- [Banco de Dados](#banco-de-dados)
- [Instalação](#instalação)
- [Deploy](#deploy)
- [Integrações](#integrações)
- [Roadmap](#roadmap)

---

## 📖 Sobre o Projeto

O **PLANAC ERP** é um sistema de gestão empresarial desenvolvido especificamente para a **Planac**, distribuidora de drywall e materiais de construção localizada no Paraná, Brasil.

### Objetivos

- 🎯 Gestão completa de vendas, estoque e financeiro
- 🔄 Integração com sistemas fiscais brasileiros (NF-e, NFC-e)
- 📊 Dashboard e relatórios gerenciais
- 🚚 Controle logístico e entregas
- 💼 Multi-empresa e multi-filial

### Características

- ✅ **Multi-tenant**: Suporte a múltiplas empresas e filiais
- ✅ **Controle de Acesso**: Perfis e permissões granulares
- ✅ **Auditoria Completa**: Registro de todas as operações
- ✅ **API RESTful**: Backend moderno e escalável
- ✅ **Compliance Fiscal**: Integração com sistemas brasileiros

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                    Claude.ai Artifacts / Vercel                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKERS (API)                          │
│                         Hono Framework                               │
├─────────────────────────────────────────────────────────────────────┤
│  Auth  │  Usuários  │  Clientes  │  Produtos  │  Vendas  │  ...    │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  D1 Database │    │   KV Storage    │    │   R2 Storage    │
│   (SQLite)   │    │  (Cache/Session)│    │    (Arquivos)   │
└─────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INTEGRAÇÕES EXTERNAS                            │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Nuvem    │  IBPT    │  Cosmos  │  SERPRO  │  CNPJá   │  TecnoSpeed  │
│ Fiscal   │  Tributos│  Produtos│  Consultas│  CNPJ   │  Bancário    │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Uso |
|------------|-----|
| **Cloudflare Workers** | Runtime serverless |
| **Hono** | Framework web (Express-like) |
| **TypeScript** | Linguagem tipada |
| **D1** | Banco de dados SQLite distribuído |
| **KV** | Cache e sessões |
| **R2** | Armazenamento de arquivos |

### Frontend (Planejado)
| Tecnologia | Uso |
|------------|-----|
| **React** | Framework UI |
| **TypeScript** | Linguagem tipada |
| **Tailwind CSS** | Estilização |
| **React Query** | Gerenciamento de estado |

### Integrações
| Serviço | Função |
|---------|--------|
| **Nuvem Fiscal** | Emissão NF-e, NFC-e, NFS-e, CT-e, MDF-e |
| **IBPT** | Transparência tributária (Lei 12.741) |
| **Bluesoft Cosmos** | Catálogo de produtos (GTIN/EAN) |
| **SERPRO** | Consultas CPF/CNPJ, Renda, Faturamento |
| **CNPJá** | Consulta dados empresariais |
| **TecnoSpeed** | Integração bancária (boletos, PIX) |

---

## 📁 Estrutura do Projeto

```
planac-erp/
├── src/
│   ├── index.ts              # Entry point - integra todas as rotas
│   ├── routes/               # Rotas da API
│   │   ├── index.ts          # Exportação centralizada
│   │   ├── auth.routes.ts    # Autenticação e sessões
│   │   ├── usuarios.routes.ts
│   │   ├── perfis.routes.ts
│   │   ├── clientes.routes.ts
│   │   ├── fornecedores.routes.ts
│   │   ├── produtos.routes.ts
│   │   ├── estoque.routes.ts
│   │   ├── orcamentos.routes.ts
│   │   └── pedidos.routes.ts
│   ├── middleware/           # Middlewares
│   │   ├── index.ts
│   │   └── auth.ts           # Autenticação JWT
│   ├── services/             # Lógica de negócio
│   │   ├── index.ts
│   │   └── auth.service.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Utilitários
│       ├── index.ts
│       ├── auditoria.ts      # Registro de auditoria
│       └── helpers.ts        # Funções auxiliares
├── migrations/               # Migrations SQL
│   ├── 001_base.sql          # Estrutura base (empresas, usuários, auth)
│   ├── 002_cadastros.sql     # Cadastros (clientes, fornecedores, produtos)
│   ├── 003_estoque.sql       # Estoque e movimentações
│   └── 004_comercial.sql     # Orçamentos e pedidos
├── package.json
├── tsconfig.json
├── wrangler.toml             # Configuração Cloudflare
└── README.md
```

---

## 📦 Módulos

### Fase 1 - Autenticação & Base ✅
| Módulo | Tabelas | Status |
|--------|---------|--------|
| Empresas e Filiais | 2 | ✅ |
| Usuários | 1 | ✅ |
| Perfis e Permissões | 4 | ✅ |
| Sessões | 1 | ✅ |
| Auditoria | 2 | ✅ |
| Configurações | 2 | ✅ |
| Sequências | 1 | ✅ |
| **Total Fase 1** | **13** | ✅ |

### Fase 2 - Cadastros ✅
| Módulo | Tabelas | Status |
|--------|---------|--------|
| Clientes | 4 | ✅ |
| Fornecedores | 4 | ✅ |
| Produtos | 5 | ✅ |
| Tabelas Auxiliares | 3 | ✅ |
| **Total Fase 2** | **16** | ✅ |

### Fase 3 - Comercial ✅
| Módulo | Tabelas | Status |
|--------|---------|--------|
| Estoque | 5 | ✅ |
| Orçamentos | 3 | ✅ |
| Pedidos de Venda | 5 | ✅ |
| Condições Comerciais | 5 | ✅ |
| **Total Fase 3** | **18** | ✅ |

### **TOTAL: 47 Tabelas**

---

## 🔌 API Endpoints

### Autenticação (`/api/auth`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Encerrar sessão |
| GET | `/auth/me` | Dados do usuário logado |
| PUT | `/auth/senha` | Alterar senha |
| GET | `/auth/permissoes` | Listar permissões |

### Usuários (`/api/usuarios`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/usuarios` | Listar usuários |
| GET | `/usuarios/:id` | Buscar usuário |
| POST | `/usuarios` | Criar usuário |
| PUT | `/usuarios/:id` | Editar usuário |
| DELETE | `/usuarios/:id` | Desativar usuário |
| POST | `/usuarios/:id/resetar-senha` | Resetar senha |

### Perfis (`/api/perfis`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/perfis` | Listar perfis |
| GET | `/perfis/:id` | Buscar perfil |
| POST | `/perfis` | Criar perfil |
| PUT | `/perfis/:id` | Editar perfil |
| DELETE | `/perfis/:id` | Desativar perfil |
| GET | `/permissoes/todas` | Listar permissões |

### Clientes (`/api/clientes`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/:id` | Buscar cliente |
| POST | `/clientes` | Criar cliente |
| PUT | `/clientes/:id` | Editar cliente |
| DELETE | `/clientes/:id` | Desativar cliente |
| POST | `/clientes/:id/enderecos` | Adicionar endereço |
| POST | `/clientes/:id/contatos` | Adicionar contato |
| POST | `/clientes/:id/bloquear` | Bloquear/desbloquear |

### Fornecedores (`/api/fornecedores`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/fornecedores` | Listar fornecedores |
| GET | `/fornecedores/:id` | Buscar fornecedor |
| POST | `/fornecedores` | Criar fornecedor |
| PUT | `/fornecedores/:id` | Editar fornecedor |
| DELETE | `/fornecedores/:id` | Desativar fornecedor |
| POST | `/fornecedores/:id/avaliar` | Registrar avaliação |
| POST | `/fornecedores/:id/enderecos` | Adicionar endereço |
| POST | `/fornecedores/:id/contatos` | Adicionar contato |

### Produtos (`/api/produtos`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/produtos` | Listar produtos |
| GET | `/produtos/:id` | Buscar produto |
| POST | `/produtos` | Criar produto |
| PUT | `/produtos/:id` | Editar produto |
| DELETE | `/produtos/:id` | Desativar produto |
| POST | `/produtos/:id/fornecedores` | Vincular fornecedor |
| GET | `/produtos/aux/categorias` | Listar categorias |
| GET | `/produtos/aux/unidades` | Listar unidades |
| POST | `/produtos/aux/categorias` | Criar categoria |
| POST | `/produtos/aux/unidades` | Criar unidade |

### Estoque (`/api/estoque`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/estoque` | Consultar estoque |
| GET | `/estoque/produto/:id` | Estoque por produto |
| POST | `/estoque/movimentacao` | Registrar movimentação |
| GET | `/estoque/movimentacoes` | Histórico movimentações |
| POST | `/estoque/reserva` | Criar reserva |
| DELETE | `/estoque/reserva/:id` | Cancelar reserva |
| GET | `/estoque/locais` | Listar locais |
| POST | `/estoque/locais` | Criar local |
| GET | `/estoque/alertas` | Produtos abaixo do mínimo |

### Orçamentos (`/api/orcamentos`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/orcamentos` | Listar orçamentos |
| GET | `/orcamentos/:id` | Buscar orçamento |
| POST | `/orcamentos` | Criar orçamento |
| PUT | `/orcamentos/:id` | Editar orçamento |
| DELETE | `/orcamentos/:id` | Cancelar orçamento |
| POST | `/orcamentos/:id/itens` | Adicionar item |
| DELETE | `/orcamentos/:id/itens/:itemId` | Remover item |
| POST | `/orcamentos/:id/enviar` | Enviar ao cliente |
| POST | `/orcamentos/:id/aprovar` | Aprovar orçamento |
| POST | `/orcamentos/:id/converter` | Converter em pedido |

### Pedidos (`/api/pedidos`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/pedidos` | Listar pedidos |
| GET | `/pedidos/:id` | Buscar pedido |
| POST | `/pedidos` | Criar pedido |
| PUT | `/pedidos/:id` | Editar pedido |
| POST | `/pedidos/:id/aprovar` | Aprovar pedido |
| POST | `/pedidos/:id/separar` | Iniciar separação |
| POST | `/pedidos/:id/confirmar-separacao` | Confirmar separação |
| POST | `/pedidos/:id/faturar` | Faturar pedido |
| POST | `/pedidos/:id/entregar` | Registrar entrega |
| POST | `/pedidos/:id/cancelar` | Cancelar pedido |
| GET | `/pedidos/dashboard` | Dashboard de vendas |

---

## 🗄️ Banco de Dados

### Diagrama Simplificado

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   empresas  │────<│   filiais   │────<│   usuarios  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
              ┌─────▼─────┐            ┌───────▼───────┐          ┌───────▼───────┐
              │  clientes │            │  fornecedores │          │   produtos    │
              └─────┬─────┘            └───────┬───────┘          └───────┬───────┘
                    │                          │                          │
              ┌─────▼─────┐            ┌───────▼───────┐          ┌───────▼───────┐
              │ enderecos │            │   avaliacoes  │          │    estoque    │
              │ contatos  │            └───────────────┘          │  movimentacoes│
              └─────┬─────┘                                       └───────┬───────┘
                    │                                                     │
              ┌─────▼─────────────────────────────────────────────────────▼─────┐
              │                         COMERCIAL                               │
              ├─────────────────┬─────────────────────────┬────────────────────┤
              │   orcamentos    │      pedidos_venda      │    expedições      │
              │   orcamento_    │      pedido_venda_      │    entregas        │
              │     itens       │        itens            │                    │
              └─────────────────┴─────────────────────────┴────────────────────┘
```

### Migrations

```bash
# Executar migrations localmente
npm run db:migrate

# Executar migrations em produção
npm run db:migrate:remote

# Abrir D1 Studio (interface visual)
npm run db:studio
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- npm ou yarn
- Conta Cloudflare com Workers habilitado
- Wrangler CLI instalado

### Setup Local

```bash
# Clonar repositório
git clone https://github.com/Ropetr/Planac-Revisado.git
cd Planac-Revisado

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar migrations
npm run db:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_API_TOKEN=seu_api_token

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Nuvem Fiscal
NUVEM_FISCAL_CLIENT_ID=AJReDlHes8aBNlTzTF9X
NUVEM_FISCAL_CLIENT_SECRET=seu_client_secret

# Outras integrações
IBPT_TOKEN=seu_token
COSMOS_TOKEN=seu_token
```

---

## 📤 Deploy

### Deploy para Cloudflare Workers

```bash
# Deploy em desenvolvimento
npm run deploy

# Deploy em produção
wrangler deploy --env production
```

### Configurar Secrets

```bash
# JWT Secret
wrangler secret put JWT_SECRET

# Nuvem Fiscal
wrangler secret put NUVEM_FISCAL_CLIENT_ID
wrangler secret put NUVEM_FISCAL_CLIENT_SECRET
```

### Recursos Cloudflare

| Recurso | Nome | Tipo |
|---------|------|------|
| Worker | planac-erp-api | Workers |
| Database | Planac-erp-database | D1 |
| Cache | Planac-erp-cache | KV |
| Sessions | Planac-erp-sessions | KV |
| Storage | Planac-erp-storage | R2 |
| Docs | Planac-erp-docs | R2 |
| Backup | Planac-erp-backup | R2 |

---

## 🔗 Integrações

### Nuvem Fiscal
- **Client ID**: AJReDlHes8aBNlTzTF9X
- **Serviços**: NF-e, NFC-e, NFS-e, CT-e, MDF-e
- **Documentação**: [nuvemfiscal.com.br/docs](https://nuvemfiscal.com.br/docs)

### SERPRO
- **Contratos**: 229986 (Integra Contador), 261076 (Renda), 261077 (Faturamento)
- **APIs**: Consulta CPF/CNPJ, Renda, Faturamento

### Outras Integrações
- **IBPT**: Transparência tributária
- **Bluesoft Cosmos**: Catálogo de produtos
- **CNPJá**: Consulta empresarial
- **CPF.CNPJ**: Validação de documentos
- **TecnoSpeed** (Planejado): Integração bancária

---

## 🗺️ Roadmap

### ✅ Concluído
- [x] Fase 1: Autenticação e Base
- [x] Fase 2: Cadastros
- [x] Fase 3: Comercial (Estoque, Orçamentos, Pedidos)
- [x] Backend API completo

### 🚧 Em Andamento
- [ ] Deploy no Cloudflare
- [ ] Testes de integração
- [ ] Frontend React

### 📋 Planejado
- [ ] Fase 4: Financeiro (Contas a Pagar/Receber)
- [ ] Fase 5: Fiscal (NF-e, NFC-e)
- [ ] Fase 6: Logística (Entregas, Roteirização)
- [ ] Fase 7: BI e Dashboards
- [ ] App Mobile (Motorista, Vendedor)

---

## 👥 Equipe

Desenvolvido por **DEV.com** - Fábrica de Software Virtual

| Papel | Especialista |
|-------|-------------|
| 🎯 CEO | Visão estratégica |
| 📋 CPO | Gestão de produto |
| 👨‍💻 CTO | Arquitetura técnica |
| ⚙️ Backend | APIs e regras de negócio |
| 🗄️ DBA | Modelagem de dados |
| 🔐 Segurança | LGPD e compliance |

---

## 📄 Licença

Projeto proprietário - © 2024 DEV.com / Planac

---

<div align="center">

**PLANAC ERP** - Sistema de Gestão Empresarial

*47 Tabelas • 69+ Endpoints • Cloudflare Workers*

🏢 Desenvolvido para Planac - Distribuidora de Drywall

</div>
