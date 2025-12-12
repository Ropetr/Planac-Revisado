# ADR-0003: Integrações Externas e Modelo de Provedores

**Status:** Aceito  
**Data:** 2025-12-12  
**Decisores:** CTO DEV.com, CEO DEV.com, Rodrigo (PLANAC)

---

## Contexto

O ERP PLANAC precisa integrar com diversos sistemas externos brasileiros:
- Fiscal (emissão de NF-e, NFC-e)
- Financeiro (boletos, PIX, conciliação)
- Marketplaces (Mercado Livre, Shopee, Amazon)
- Comunicação (WhatsApp)
- Validação (CPF, CNPJ, dados cadastrais)

**Decisão crítica:** Como a DEV.com vai gerenciar essas integrações para múltiplos clientes?

## Decisão

Adotar **modelo híbrido** com dois tipos de integração:

### 1. Modelo Software House (DEV.com gerencia)

A DEV.com possui credenciais **master** e cria sub-contas para cada cliente. O cliente não precisa criar conta própria nos provedores.

| Integração | Provedor | Modelo | Justificativa |
|------------|----------|--------|---------------|
| Fiscal | Nuvem Fiscal | Software House | White-label, multi-empresa |
| Boletos | TecnoSpeed | Software House | API única, múltiplos cedentes |
| PIX | TecnoSpeed | Software House | Integrado com boletos |
| Marketplaces | TecnoSpeed Plug4Market | Software House | White-label, 80+ canais |
| WhatsApp | BSP (Baileys) | Software House | Multi-número por cliente |

**Vantagens:**
- ✅ Cliente não precisa saber dos provedores
- ✅ Onboarding simplificado
- ✅ Negociação de volume (melhor preço)
- ✅ Suporte centralizado na DEV.com

**Fluxo:**
```
Cliente PLANAC → ERP PLANAC → DEV.com Master Account → Provedor
                                    ↓
                              Sub-conta do cliente
```

### 2. Modelo Global (Credenciais compartilhadas)

Alguns serviços de consulta não precisam de isolamento por cliente.

| Integração | Provedor | Modelo | Justificativa |
|------------|----------|--------|---------------|
| Validação CPF/CNPJ | CPF.CNPJ | Global | Consulta simples |
| Consulta CNPJ | CNPJá | Global | Enriquecimento |
| Dados Fiscais | SERPRO | Global | APIs governamentais |
| Tributação | IBPT | Global | Tabela nacional |
| Catálogo Produtos | Bluesoft Cosmos | Global | Base única |

**Fluxo:**
```
Cliente PLANAC → ERP PLANAC → API Global (DEV.com key) → Provedor
```

## Arquitetura de Integrações

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ERP PLANAC                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    INTEGRATION LAYER                                 │   │
│  │                                                                      │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │   │  Fiscal  │  │Financeiro│  │Marketplac│  │  Comum   │          │   │
│  │   │ Service  │  │ Service  │  │ Service  │  │ Service  │          │   │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │   │
│  │        │             │             │             │                  │   │
│  └────────┼─────────────┼─────────────┼─────────────┼──────────────────┘   │
│           │             │             │             │                       │
├───────────┼─────────────┼─────────────┼─────────────┼───────────────────────┤
│           ▼             ▼             ▼             ▼                       │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│   │Nuvem Fiscal │ │ TecnoSpeed  │ │ Plug4Market │ │  CPF.CNPJ   │          │
│   │             │ │             │ │             │ │  CNPJá      │          │
│   │  NF-e       │ │  Boletos    │ │  ML, Shopee │ │  SERPRO     │          │
│   │  NFC-e      │ │  PIX        │ │  Amazon     │ │  IBPT       │          │
│   │  NFS-e      │ │  Concil.    │ │  Magalu     │ │  Cosmos     │          │
│   │  CT-e       │ │             │ │  +80        │ │             │          │
│   │  MDF-e      │ │             │ │             │ │             │          │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                              │
│   SOFTWARE HOUSE ◄──────────────────────────────► GLOBAL                   │
│   (Multi-tenant)                                   (Shared)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Credenciais e Secrets

### Estrutura no Cloudflare Secrets

```
# Software House (master)
NUVEM_FISCAL_CLIENT_ID=AJReDlHes8aBNlTzTF9X
NUVEM_FISCAL_CLIENT_SECRET=***
TECNOSPEED_MASTER_TOKEN=***
PLUG4MARKET_MASTER_TOKEN=***
WHATSAPP_BSP_TOKEN=***

# Global
CPF_CNPJ_TOKEN=***
CNPJA_API_KEY=***
SERPRO_TOKEN=***
BLUESOFT_TOKEN=***
```

### Tabela de Credenciais por Tenant

```sql
CREATE TABLE integracoes_credenciais (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL,
  provedor TEXT NOT NULL,     -- 'nuvem_fiscal', 'tecnospeed', etc.
  ambiente TEXT DEFAULT 'sandbox',  -- 'sandbox', 'producao'
  credenciais TEXT NOT NULL,  -- JSON criptografado
  ativo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);
```

## Alternativas Consideradas

### Baselinker para Marketplaces
- ✅ Já conhecíamos
- ❌ **Sem modelo Software House** (cliente cria conta própria)
- ❌ Sem white-label
- **Decisão:** Descartado em favor do Plug4Market

### APIs Diretas dos Marketplaces
- ✅ Sem intermediário
- ❌ N integrações separadas
- ❌ Autenticação individual por marketplace
- ❌ Manutenção constante

### Outros Hubs (Anymarket, Bling)
- ⚠️ White-label parcial
- ❌ São ERPs concorrentes
- **Decisão:** Plug4Market é focado em hub, não compete

## Consequências

### Positivas
- ✅ Onboarding do cliente em minutos
- ✅ Suporte unificado
- ✅ Melhor negociação de preços
- ✅ Código mais simples (1 integração por categoria)

### Negativas
- ⚠️ Dependência de provedores específicos
- ⚠️ Se provedor cair, afeta todos os clientes
- ⚠️ Precisa manter relacionamento comercial com provedores

### Mitigações
- Contratos SLA com provedores
- Fallback documentado (trocar provedor se necessário)
- Monitoramento de uptime dos provedores

## Provedores Selecionados

| Categoria | Provedor | Status | Custo Estimado |
|-----------|----------|--------|----------------|
| Fiscal | Nuvem Fiscal | ✅ Configurado | R$ 0,15/documento |
| Boletos | TecnoSpeed | ✅ Documentado | R$ 0,50/boleto |
| PIX | TecnoSpeed | ✅ Documentado | R$ 0,30/PIX |
| Marketplaces | Plug4Market | ⏳ A contratar | Sob consulta |
| WhatsApp | API Brasil (Baileys) | ✅ Documentado | R$ 49,50/mês |
| Validação | CPF.CNPJ | ✅ Configurado | Gratuito |
| CNPJ | CNPJá | ✅ Configurado | Pay-as-you-go |
| Gov | SERPRO | ✅ Documentado | Sob consulta |
| Tributário | IBPT | ⏳ A implementar | Gratuito |
| Catálogo | Bluesoft Cosmos | ⏳ A implementar | Gratuito |

---

## Referências

- [Nuvem Fiscal API](https://dev.nuvemfiscal.com.br/)
- [TecnoSpeed Plug4Market](https://tecnospeed.com.br/plug4market/)
- [API Brasil](https://www.apibrasil.com.br/)
- [Bluesoft Cosmos](https://cosmos.bluesoft.com.br/)
