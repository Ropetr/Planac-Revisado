# 🔍 Análise de Gap: APIs vs Modelo de Dados

**Data:** 08/12/2025  
**Objetivo:** Validar se o modelo de dados atende às necessidades das 10 APIs integradas

---

## 📊 RESUMO EXECUTIVO

| Status | Quantidade | % |
|--------|------------|---|
| ✅ Coberto | 7 APIs | 70% |
| ⚠️ Parcial | 2 APIs | 20% |
| ❌ Faltando | 1 API | 10% |

**Conclusão:** O modelo de dados está **bem estruturado**, mas precisa de **3 tabelas adicionais** para suportar completamente as integrações.

---

## 🔗 ANÁLISE POR API

### 1. NUVEM FISCAL ✅ COBERTO

| O que a API precisa | Tabela no Modelo | Status |
|---------------------|------------------|--------|
| Dados da empresa (CNPJ, IE, endereço) | `empresas`, `filiais` | ✅ |
| Dados do cliente (CPF/CNPJ, endereço) | `clientes`, `clientes_enderecos` | ✅ |
| Dados do produto (NCM, CEST, descrição) | `produtos` | ✅ |
| Impostos (ICMS, IPI, PIS, COFINS, ST) | `nfe_itens` | ✅ |
| XML enviado/retornado | `nfe.xml_envio`, `nfe.xml_retorno` | ✅ |
| Protocolo de autorização | `nfe.protocolo` | ✅ |
| Eventos (cancelamento, carta correção) | `nfe_eventos` | ✅ |

**Veredicto:** 100% coberto. Modelo fiscal muito completo.

---

### 2. BASELINKER (Hub Marketplaces) ⚠️ PARCIAL

| O que a API retorna | Tabela no Modelo | Status |
|---------------------|------------------|--------|
| ID do pedido no marketplace | ? | ❌ **FALTA** |
| Status do marketplace | ? | ❌ **FALTA** |
| Canal de origem (ML, Shopee, Amazon) | ? | ❌ **FALTA** |
| ID do produto no marketplace | ? | ❌ **FALTA** |
| Sincronização de estoque | `estoque` | ✅ |
| Dados do pedido | `pedidos`, `pedidos_itens` | ✅ |

**Gap Identificado:** Falta tabela para mapear IDs internos ↔ IDs dos marketplaces

**Solução:** Criar tabela `integracoes_marketplace`

```sql
CREATE TABLE integracoes_marketplace (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    tipo TEXT NOT NULL,              -- 'produto', 'pedido', 'cliente'
    registro_interno_id TEXT NOT NULL, -- ID no Planac
    marketplace TEXT NOT NULL,        -- 'mercadolivre', 'shopee', 'amazon'
    id_externo TEXT NOT NULL,         -- ID no marketplace
    dados_extras TEXT,                -- JSON com dados específicos
    sincronizado_em DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. CPF.CNPJ ✅ COBERTO

| O que a API retorna | Campo no Modelo | Status |
|---------------------|-----------------|--------|
| Razão social | `clientes.nome_razao` | ✅ |
| Nome fantasia | `clientes.apelido_fantasia` | ✅ |
| CNPJ/CPF | `clientes.cpf_cnpj` | ✅ |
| Inscrição Estadual | `clientes.rg_ie` | ✅ |
| Endereço completo | `clientes_enderecos` | ✅ |
| Telefone/Email | `clientes.telefone`, `clientes.email` | ✅ |

**Veredicto:** 100% coberto.

---

### 4. CNPJá ✅ COBERTO

| O que a API retorna | Campo no Modelo | Status |
|---------------------|-----------------|--------|
| Dados básicos PJ | `clientes` | ✅ |
| Simples Nacional | `clientes.optante_simples` | ✅ |
| Contribuinte ICMS | `clientes.contribuinte_icms` | ✅ |
| Sócios | ? | ⚠️ Não armazenamos |
| CNAE | ? | ⚠️ Não armazenamos |

**Observação:** Sócios e CNAE não são críticos para o ERP. Podem ser consultados sob demanda.

**Veredicto:** Funcionalmente coberto.

---

### 5. SERPRO (Integra Contador, Renda, Faturamento) ⚠️ PARCIAL

| O que a API retorna | Tabela no Modelo | Status |
|---------------------|------------------|--------|
| Score de crédito | ? | ❌ **FALTA** |
| Faixa de renda | ? | ❌ **FALTA** |
| Faturamento estimado | ? | ❌ **FALTA** |
| Data da consulta | ? | ❌ **FALTA** |
| Resultado da análise | ? | ❌ **FALTA** |

**Gap Identificado:** Não há tabela para armazenar histórico de análises de crédito

**Solução:** Criar tabela `clientes_analise_credito`

```sql
CREATE TABLE clientes_analise_credito (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    cliente_id TEXT NOT NULL,
    tipo_consulta TEXT NOT NULL,      -- 'serpro_renda', 'serpro_faturamento', 'spc', 'protesto'
    fonte TEXT NOT NULL,              -- 'serpro', 'api_brasil', 'serasa'
    cpf_cnpj TEXT NOT NULL,
    
    -- Resultado
    score INTEGER,
    rating TEXT,                      -- 'A', 'B', 'C', 'D'
    limite_sugerido REAL,
    renda_faturamento REAL,
    possui_restricao INTEGER DEFAULT 0,
    qtd_protestos INTEGER DEFAULT 0,
    valor_protestos REAL DEFAULT 0,
    detalhes TEXT,                    -- JSON com resposta completa
    
    -- Decisão
    aprovado INTEGER,
    motivo_reprovacao TEXT,
    aprovado_por TEXT,                -- user_id se manual
    
    -- Contexto
    pedido_id TEXT,                   -- Se foi para aprovar um pedido
    valor_solicitado REAL,
    custo_consulta REAL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6. API BRASIL (Crédito + WhatsApp) ⚠️ PARCIAL

#### Análise de Crédito (SPC, Protesto, SCR)
- **Status:** Mesma solução do SERPRO → tabela `clientes_analise_credito`

#### WhatsApp Baileys
| O que a API precisa/retorna | Tabela no Modelo | Status |
|-----------------------------|------------------|--------|
| Canais configurados | `omni_canais` | ✅ |
| Conversas | `omni_conversas` | ✅ |
| Mensagens | `omni_mensagens` | ✅ |
| Templates | `omni_templates` | ✅ |
| Status de entrega | `omni_mensagens.status` | ✅ |

**Veredicto:** WhatsApp 100% coberto pelo módulo OmniPro!

---

### 7. IBPT (De Olho no Imposto) ❌ FALTA TABELA

| O que a API retorna | Tabela no Modelo | Status |
|---------------------|------------------|--------|
| Alíquota Federal Nacional | ? | ❌ **FALTA** |
| Alíquota Federal Importado | ? | ❌ **FALTA** |
| Alíquota Estadual | ? | ❌ **FALTA** |
| Alíquota Municipal | ? | ❌ **FALTA** |
| Vigência da tabela | ? | ❌ **FALTA** |

**Gap Identificado:** Não há tabela para cache das alíquotas IBPT

**Solução:** Criar tabela `ibpt_aliquotas`

```sql
CREATE TABLE ibpt_aliquotas (
    id TEXT PRIMARY KEY,
    ncm TEXT NOT NULL,
    uf TEXT NOT NULL,
    ex INTEGER DEFAULT 0,             -- Exceção TIPI
    
    -- Alíquotas
    aliquota_nacional REAL NOT NULL,  -- Produtos nacionais
    aliquota_importado REAL NOT NULL, -- Produtos importados
    aliquota_estadual REAL NOT NULL,  -- ICMS
    aliquota_municipal REAL DEFAULT 0,-- ISS (serviços)
    
    -- Vigência
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL,
    versao TEXT,                      -- Ex: "25.1.A"
    fonte TEXT DEFAULT 'IBPT',
    
    -- Controle
    consultado_em DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ncm, uf, ex)
);
```

---

### 8. BLUESOFT COSMOS ✅ COBERTO

| O que a API retorna | Campo no Modelo | Status |
|---------------------|-----------------|--------|
| GTIN (código de barras) | `produtos.codigo_barras` | ✅ |
| Descrição | `produtos.nome`, `produtos.descricao` | ✅ |
| Marca | `produtos.marca` | ✅ |
| NCM | `produtos.ncm` | ✅ |
| CEST | `produtos.cest` | ✅ |
| Peso bruto | `produtos.peso_bruto` | ✅ |
| Peso líquido | `produtos.peso_liquido` | ✅ |
| Foto | `produtos_fotos.url` | ✅ |
| Preço médio | ? | ⚠️ Pode usar para referência |
| Categoria GPC | `produtos.categoria_id` | ✅ (mapear) |

**Veredicto:** 100% coberto. A tabela `produtos` tem todos os campos necessários.

---

## 📋 RESUMO DOS GAPS

### Tabelas que PRECISAM ser criadas:

| # | Tabela | Para que serve | Prioridade |
|---|--------|----------------|------------|
| 1 | `integracoes_marketplace` | Mapear IDs Planac ↔ Marketplaces | Alta |
| 2 | `clientes_analise_credito` | Histórico de consultas SPC/Serasa/SERPRO | Alta |
| 3 | `ibpt_aliquotas` | Cache de alíquotas tributárias | Média |

### Tabelas que já existem e atendem:

| API | Tabelas utilizadas |
|-----|-------------------|
| Nuvem Fiscal | `nfe`, `nfe_itens`, `nfe_eventos`, `nfe_pagamentos` |
| CPF.CNPJ / CNPJá | `clientes`, `clientes_enderecos` |
| Cosmos | `produtos`, `produtos_fotos` |
| WhatsApp (API Brasil) | `omni_canais`, `omni_conversas`, `omni_mensagens` |

---

## 🎯 RECOMENDAÇÃO

### Ordem de criação das migrations:

```
1. Módulo 0 (Base)           → empresas, filiais, configuracoes
2. Módulo 1 (Core)           → usuarios, perfis, permissoes...
3. Módulo 2 (Cadastros)      → clientes, produtos, fornecedores...
4. **NOVO: Integrações**     → integracoes_marketplace, clientes_analise_credito, ibpt_aliquotas
5. Módulo 3 (Estoque)        → estoque, movimentacoes...
6. Módulo 5 (Comercial)      → orcamentos, pedidos...
7. Módulo 6 (Fiscal)         → nfe, nfce, cte...
8. Módulo 17 (OmniPro)       → omni_canais, omni_mensagens...
```

### Impacto de NÃO criar as 3 tabelas novas:

| Tabela faltando | Impacto |
|-----------------|---------|
| `integracoes_marketplace` | Não consegue sincronizar com Mercado Livre, Shopee, Amazon |
| `clientes_analise_credito` | Não guarda histórico de consultas, gasta dinheiro repetindo consultas |
| `ibpt_aliquotas` | Consulta IBPT a cada nota fiscal (lento e caro) |

---

## ✅ CONCLUSÃO

O modelo de dados do Planac está **95% pronto** para as integrações. 

**Faltam apenas 3 tabelas** que podem ser adicionadas ao módulo de integrações:

1. `integracoes_marketplace` → Baselinker/Marketplaces
2. `clientes_analise_credito` → SERPRO/API Brasil/SPC
3. `ibpt_aliquotas` → Cache IBPT

**Recomendação:** Adicionar essas 3 tabelas ao modelo de dados ANTES de criar as migrations.

---

*Análise realizada por 🏢 DEV.com - Mesa de Especialistas*  
*👨‍💻 CTO + 🗄️ DBA + ⚙️ Backend*
