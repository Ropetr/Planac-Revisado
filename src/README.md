# 🚀 PLANAC ERP

Sistema de Gestão Empresarial para distribuidora de materiais de construção.

## 📋 Visão Geral

O PLANAC ERP é um sistema completo de gestão empresarial desenvolvido para atender as necessidades de distribuidoras de materiais de construção, com foco em operações B2B e B2C.

## 🏗️ Arquitetura

```
planac-erp/
├── packages/
│   ├── api/          # Backend (Cloudflare Workers + Hono)
│   ├── web/          # Frontend (React + Vite + TailwindCSS)
│   └── shared/       # Código compartilhado (Types, Utils, Validations)
├── docs/             # Documentação técnica
├── package.json      # Configuração do monorepo
├── turbo.json        # Configuração do Turborepo
├── wrangler.toml     # Configuração do Cloudflare Workers
└── tsconfig.json     # Configuração do TypeScript
```

## 🛠️ Stack Tecnológica

### Backend
- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **Storage:** Cloudflare R2
- **Validação:** Zod

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** TailwindCSS
- **State:** TanStack Query
- **Forms:** React Hook Form
- **Icons:** Lucide React

### DevOps
- **Monorepo:** Turborepo
- **CI/CD:** GitHub Actions
- **Hosting:** Cloudflare Pages (web) + Workers (api)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm 10+
- Conta Cloudflare (para deploy)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Ropetr/Planac-Revisado.git
cd Planac-Revisado

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### Desenvolvimento

```bash
# Inicia todos os projetos em modo dev
npm run dev

# Ou individualmente
npm run dev --workspace=@planac/api
npm run dev --workspace=@planac/web
```

### Build

```bash
# Build de todos os projetos
npm run build
```

### Deploy

```bash
# Deploy para produção
npm run deploy
```

## 📚 Documentação

- [Sumário do Sistema](docs/01-sumario/README.md)
- [Fluxogramas](docs/04-fluxogramas/README.md)
- [Modelo de Dados](docs/05-modelo-dados/README.md)
- [Segurança](docs/10-anexos/SEGURANCA.md)

## 📊 Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| Core | Empresas, Usuários, Permissões |
| Comercial | CRM, Orçamentos, Vendas, PDV |
| Compras | Cotações, Pedidos, Estoque, PCP |
| Financeiro | Contas a Receber/Pagar, Fluxo de Caixa |
| Fiscal | NF-e, NFC-e, SPED, Contabilidade |
| E-commerce | Loja Virtual B2B/B2C |
| RH | Colaboradores, Ponto, Folha |

## 🔐 Segurança

- Autenticação JWT + Refresh Token
- 2FA (Two-Factor Authentication)
- RBAC (Role-Based Access Control)
- Multi-tenant com isolamento por empresa
- Criptografia AES-256 para dados sensíveis
- Conformidade com LGPD

## 📄 Licença

Proprietário - PLANAC Distribuidora

## 👥 Equipe

Desenvolvido pela equipe virtual **DEV.com**

---

**PLANAC ERP** - Gestão inteligente para sua distribuidora.
