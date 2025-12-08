# 📊 GAP ANALYSIS - TABELAS PARA INTEGRAÇÕES EXTERNAS

> **Projeto:** Planac ERP  
> **Data:** 08/12/2025  
> **Versão:** 2.0 (sem SERPRO)  
> **Análise:** DEV.com - DBA + CTO  

---

## 📋 RESUMO EXECUTIVO

### Situação Atual
- **207 tabelas** existentes no modelo de dados
- **Tabela `ncm`** existe mas está incompleta (faltam campos IBPT)
- **Não existe** módulo de integrações externas

### APIs no Escopo

| API | Uso | Status Doc |
|-----|-----|------------|
| **Baselinker** | Hub de marketplaces | ✅ 100% |
| **IBPT** | Transparência tributária | ✅ 100% |
| **Nuvem Fiscal** | Emissão NF-e/NFC-e | ✅ Credenciais OK |
| ~~SERPRO~~ | ~~Consulta Renda/Faturamento~~ | ❌ Removido |

### O que Precisa ser Criado

| Categoria | Quantidade |
|-----------|------------|
| **Novo módulo** | 1 (Módulo 15: Integrações) |
| **Novas tabelas** | 6 |
| **Tabela alterada** | 1 (ncm) |
| **Novos campos** | ~95 |

---

## 📦 ESTRUTURA DO MÓDULO 15: INTEGRAÇÕES

```
Módulo 15: Integrações (6 tabelas)
│
├── 15.1 CORE
│   └── integracoes_apis (master de todas as APIs)
│
├── 15.2 BASELINKER (3 tabelas)
│   ├── integracoes_baselinker_config
│   ├── integracoes_baselinker_mapeamento
│   └── integracoes_baselinker_log
│
├── 15.3 IBPT (1 tabela + alteração)
│   ├── integracoes_ibpt_cache (serviços NBS/LC116)
│   └── ALTER TABLE ncm (adicionar 10 campos)
│
└── 15.4 NUVEM FISCAL (1 tabela)
    └── integracoes_nuvemfiscal_config
```

---

## 🗄️ DEFINIÇÃO DAS TABELAS

### 15.1.1 integracoes_apis (Master de APIs)

```sql
CREATE TABLE integracoes_apis (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Identificação
    codigo TEXT NOT NULL,              -- 'baselinker', 'ibpt', 'nuvemfiscal'
    nome TEXT NOT NULL,                -- Nome amigável
    descricao TEXT,
    
    -- Configuração
    ambiente TEXT DEFAULT 'producao',  -- 'sandbox', 'producao'
    base_url TEXT,                     -- URL base da API
    versao_api TEXT,                   -- Versão da API
    
    -- Autenticação
    auth_tipo TEXT,                    -- 'token', 'oauth2', 'basic'
    auth_token TEXT,                   -- Token principal
    auth_token_secundario TEXT,        -- Client Secret, etc
    auth_validade DATETIME,            -- Validade do token
    
    -- Limites
    limite_requisicoes INTEGER,        -- Requisições por minuto
    timeout_segundos INTEGER DEFAULT 30,
    
    -- Status
    ativo INTEGER DEFAULT 1,
    ultima_sincronizacao DATETIME,
    ultima_resposta_ok DATETIME,
    ultimo_erro TEXT,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    
    UNIQUE(empresa_id, codigo),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_integracoes_apis_empresa ON integracoes_apis(empresa_id);
CREATE INDEX idx_integracoes_apis_codigo ON integracoes_apis(codigo);
```

---

### 15.2.1 integracoes_baselinker_config

```sql
CREATE TABLE integracoes_baselinker_config (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    api_id TEXT NOT NULL,              -- FK integracoes_apis
    
    -- IDs do Baselinker
    inventory_id TEXT NOT NULL,        -- ID do catálogo
    price_group_id TEXT,               -- ID do grupo de preços
    warehouse_id TEXT,                 -- ID do armazém (bl_XXXXX)
    
    -- Configurações de Sincronização
    sync_produtos INTEGER DEFAULT 1,    -- Sincronizar produtos?
    sync_estoque INTEGER DEFAULT 1,     -- Sincronizar estoque?
    sync_precos INTEGER DEFAULT 1,      -- Sincronizar preços?
    sync_pedidos INTEGER DEFAULT 1,     -- Importar pedidos?
    sync_categorias INTEGER DEFAULT 1,  -- Sincronizar categorias?
    
    -- Mapeamento de Status
    status_novo TEXT,                   -- ID status Baselinker para "Novo"
    status_processando TEXT,            -- ID status para "Processando"
    status_enviado TEXT,                -- ID status para "Enviado"
    status_entregue TEXT,               -- ID status para "Entregue"
    status_cancelado TEXT,              -- ID status para "Cancelado"
    
    -- Intervalo de Sincronização (minutos)
    intervalo_produtos_min INTEGER DEFAULT 60,
    intervalo_estoque_min INTEGER DEFAULT 5,
    intervalo_pedidos_min INTEGER DEFAULT 5,
    
    -- Filtros
    filtro_order_source TEXT,           -- Filtrar por origem
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (api_id) REFERENCES integracoes_apis(id)
);
```

---

### 15.2.2 integracoes_baselinker_mapeamento

```sql
CREATE TABLE integracoes_baselinker_mapeamento (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Tipo de registro
    tipo TEXT NOT NULL,                -- 'produto', 'categoria', 'fabricante', 'cliente'
    
    -- IDs
    planac_id TEXT NOT NULL,           -- ID no Planac
    baselinker_id TEXT NOT NULL,       -- ID no Baselinker
    
    -- Identificadores auxiliares
    sku TEXT,                          -- SKU para produtos
    ean TEXT,                          -- EAN para produtos
    
    -- Controle de Sincronização
    ultima_sincronizacao DATETIME,
    hash_dados TEXT,                   -- Hash para detectar alterações
    direcao_ultima TEXT,               -- 'planac_para_bl', 'bl_para_planac'
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, tipo, planac_id),
    UNIQUE(empresa_id, tipo, baselinker_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_bl_map_planac ON integracoes_baselinker_mapeamento(empresa_id, tipo, planac_id);
CREATE INDEX idx_bl_map_baselinker ON integracoes_baselinker_mapeamento(empresa_id, tipo, baselinker_id);
CREATE INDEX idx_bl_map_sku ON integracoes_baselinker_mapeamento(empresa_id, sku);
```

---

### 15.2.3 integracoes_baselinker_log

```sql
CREATE TABLE integracoes_baselinker_log (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Identificação
    operacao TEXT NOT NULL,            -- 'sync_produtos', 'sync_estoque', 'import_pedidos'
    metodo_api TEXT,                   -- 'addInventoryProduct', 'getOrders', etc
    
    -- Direção
    direcao TEXT NOT NULL,             -- 'envio', 'recebimento'
    
    -- Resultado
    status TEXT NOT NULL,              -- 'sucesso', 'erro', 'parcial'
    registros_processados INTEGER DEFAULT 0,
    registros_sucesso INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    
    -- Detalhes
    request_payload TEXT,              -- JSON da requisição
    response_payload TEXT,             -- JSON da resposta
    erro_mensagem TEXT,
    erro_codigo TEXT,
    
    -- Tempo
    duracao_ms INTEGER,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_bl_log_empresa ON integracoes_baselinker_log(empresa_id);
CREATE INDEX idx_bl_log_data ON integracoes_baselinker_log(created_at);
CREATE INDEX idx_bl_log_operacao ON integracoes_baselinker_log(operacao, status);
```

---

### 15.3.1 integracoes_ibpt_cache (Para Serviços)

```sql
-- A tabela NCM será alterada para produtos
-- Esta tabela é para cache de SERVIÇOS (NBS/LC116)
CREATE TABLE integracoes_ibpt_cache (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Identificação
    codigo TEXT NOT NULL,              -- NBS ou LC116
    tipo TEXT NOT NULL,                -- 'NBS', 'LC116'
    uf CHAR(2) NOT NULL,
    descricao TEXT,
    
    -- Alíquotas
    aliquota_nacional REAL NOT NULL,
    aliquota_estadual REAL NOT NULL,
    aliquota_municipal REAL NOT NULL,
    aliquota_importado REAL NOT NULL,
    
    -- Vigência
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL,
    
    -- Metadados IBPT
    versao TEXT,
    chave TEXT,
    fonte TEXT DEFAULT 'IBPT',
    
    -- Controle
    consultado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, codigo, uf),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_ibpt_codigo_uf ON integracoes_ibpt_cache(codigo, uf);
CREATE INDEX idx_ibpt_vigencia ON integracoes_ibpt_cache(vigencia_fim);
```

---

### 15.4.1 integracoes_nuvemfiscal_config

```sql
CREATE TABLE integracoes_nuvemfiscal_config (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    api_id TEXT NOT NULL,
    
    -- Credenciais específicas
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    
    -- Configurações por tipo de documento
    emite_nfe INTEGER DEFAULT 1,
    emite_nfce INTEGER DEFAULT 1,
    emite_nfse INTEGER DEFAULT 0,
    emite_cte INTEGER DEFAULT 0,
    emite_mdfe INTEGER DEFAULT 0,
    
    -- Séries
    serie_nfe INTEGER DEFAULT 1,
    serie_nfce INTEGER DEFAULT 1,
    serie_nfse INTEGER DEFAULT 1,
    
    -- Ambiente
    ambiente TEXT DEFAULT 'homologacao', -- 'homologacao', 'producao'
    
    -- Certificado
    certificado_id TEXT,               -- ID do certificado no Nuvem Fiscal
    certificado_validade DATE,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (api_id) REFERENCES integracoes_apis(id)
);
```

---

## 🔧 ALTERAÇÃO NA TABELA NCM EXISTENTE

```sql
-- Adicionar campos do IBPT à tabela NCM existente
ALTER TABLE ncm ADD COLUMN aliquota_nacional REAL DEFAULT 0;
ALTER TABLE ncm ADD COLUMN aliquota_estadual REAL DEFAULT 0;
ALTER TABLE ncm ADD COLUMN aliquota_municipal REAL DEFAULT 0;
ALTER TABLE ncm ADD COLUMN aliquota_importado REAL DEFAULT 0;
ALTER TABLE ncm ADD COLUMN vigencia_inicio DATE;
ALTER TABLE ncm ADD COLUMN vigencia_fim DATE;
ALTER TABLE ncm ADD COLUMN ibpt_versao TEXT;
ALTER TABLE ncm ADD COLUMN ibpt_fonte TEXT DEFAULT 'IBPT';
ALTER TABLE ncm ADD COLUMN ibpt_chave TEXT;
ALTER TABLE ncm ADD COLUMN ibpt_atualizado_em DATETIME;

-- Índice para consulta por vigência
CREATE INDEX idx_ncm_vigencia ON ncm(vigencia_fim);
```

---

## 📊 RESUMO FINAL

### Tabelas a Criar (Módulo 15)

| # | Tabela | Descrição | Campos |
|---|--------|-----------|--------|
| 1 | `integracoes_apis` | Master de configuração de APIs | 18 |
| 2 | `integracoes_baselinker_config` | Config Baselinker | 18 |
| 3 | `integracoes_baselinker_mapeamento` | Mapeamento IDs | 12 |
| 4 | `integracoes_baselinker_log` | Log de sincronização | 14 |
| 5 | `integracoes_ibpt_cache` | Cache de serviços IBPT | 14 |
| 6 | `integracoes_nuvemfiscal_config` | Config Nuvem Fiscal | 14 |

### Tabela a Alterar

| Tabela | Alteração | Campos Novos |
|--------|-----------|--------------|
| `ncm` | Adicionar campos IBPT | 10 |

### Totais

| Métrica | Valor |
|---------|-------|
| **Tabelas novas** | 6 |
| **Tabela alterada** | 1 |
| **Campos novos** | ~100 |
| **Índices novos** | 8 |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Criar Estrutura
- [ ] Criar tabela `integracoes_apis`
- [ ] Criar tabela `integracoes_baselinker_config`
- [ ] Criar tabela `integracoes_baselinker_mapeamento`
- [ ] Criar tabela `integracoes_baselinker_log`
- [ ] Criar tabela `integracoes_ibpt_cache`
- [ ] Criar tabela `integracoes_nuvemfiscal_config`
- [ ] Alterar tabela `ncm` (10 campos)
- [ ] Criar índices

### Fase 2: Configurar APIs
- [ ] Inserir config IBPT na `integracoes_apis`
- [ ] Inserir config Baselinker na `integracoes_apis`
- [ ] Inserir config Nuvem Fiscal na `integracoes_apis`

### Fase 3: Implementar Integrações
- [ ] Worker de sincronização Baselinker
- [ ] Consulta IBPT no cadastro de produtos
- [ ] Integração NF-e com Nuvem Fiscal

---

## 📈 ATUALIZAÇÃO DO MODELO DE DADOS

### Antes (207 tabelas)
```
Módulo 14: Patrimônio ............ 6 tabelas
(fim)
```

### Depois (213 tabelas)
```
Módulo 14: Patrimônio ............ 6 tabelas
Módulo 15: Integrações ........... 6 tabelas  ← NOVO
```

**Total: 207 + 6 = 213 tabelas**

---

**Documento gerado em:** 08/12/2025  
**Especialistas:** 🗄️ DBA + 👨‍💻 CTO DEV.com
