# 📊 GAP ANALYSIS - TABELAS PARA INTEGRAÇÕES EXTERNAS

> **Projeto:** Planac ERP  
> **Data:** 08/12/2025  
> **Versão:** 3.0 (com Nuvem Fiscal completa)  
> **Análise:** DEV.com - DBA + CTO  

---

## 📋 RESUMO EXECUTIVO

### APIs no Escopo Final

| API | Uso Principal | Tabelas |
|-----|---------------|---------|
| **Baselinker** | Hub de marketplaces | 3 |
| **IBPT** | Transparência tributária | 1 + alteração |
| **Nuvem Fiscal** | Emissão + Recepção documentos fiscais | 5 |

### Totais

| Métrica | Quantidade |
|---------|------------|
| **Novo módulo** | 1 (Módulo 15: Integrações) |
| **Novas tabelas** | 10 |
| **Tabela alterada** | 1 (ncm) |
| **Novos campos** | ~217 |

---

## 📦 ESTRUTURA COMPLETA - MÓDULO 15: INTEGRAÇÕES

```
Módulo 15: Integrações (10 tabelas)
│
├── 15.1 CORE (1 tabela)
│   └── integracoes_apis
│
├── 15.2 BASELINKER (3 tabelas)
│   ├── integracoes_baselinker_config
│   ├── integracoes_baselinker_mapeamento
│   └── integracoes_baselinker_log
│
├── 15.3 IBPT (1 tabela + alteração)
│   ├── integracoes_ibpt_cache
│   └── ALTER TABLE ncm (+10 campos)
│
└── 15.4 NUVEM FISCAL (5 tabelas)
    ├── integracoes_nuvemfiscal_config
    ├── documentos_fiscais_emitidos
    ├── documentos_fiscais_recebidos
    ├── documentos_fiscais_recebidos_itens
    └── documentos_fiscais_eventos
```

---

## 🗄️ TODAS AS TABELAS - SQL COMPLETO

### 15.1.1 integracoes_apis

```sql
CREATE TABLE integracoes_apis (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    codigo TEXT NOT NULL,              -- 'baselinker', 'ibpt', 'nuvemfiscal'
    nome TEXT NOT NULL,
    descricao TEXT,
    ambiente TEXT DEFAULT 'producao',
    base_url TEXT,
    versao_api TEXT,
    auth_tipo TEXT,
    auth_token TEXT,
    auth_token_secundario TEXT,
    auth_validade DATETIME,
    limite_requisicoes INTEGER,
    timeout_segundos INTEGER DEFAULT 30,
    ativo INTEGER DEFAULT 1,
    ultima_sincronizacao DATETIME,
    ultima_resposta_ok DATETIME,
    ultimo_erro TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(empresa_id, codigo),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_int_apis_empresa ON integracoes_apis(empresa_id);
```

---

### 15.2.1 integracoes_baselinker_config

```sql
CREATE TABLE integracoes_baselinker_config (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    api_id TEXT NOT NULL,
    inventory_id TEXT NOT NULL,
    price_group_id TEXT,
    warehouse_id TEXT,
    sync_produtos INTEGER DEFAULT 1,
    sync_estoque INTEGER DEFAULT 1,
    sync_precos INTEGER DEFAULT 1,
    sync_pedidos INTEGER DEFAULT 1,
    sync_categorias INTEGER DEFAULT 1,
    status_novo TEXT,
    status_processando TEXT,
    status_enviado TEXT,
    status_entregue TEXT,
    status_cancelado TEXT,
    intervalo_produtos_min INTEGER DEFAULT 60,
    intervalo_estoque_min INTEGER DEFAULT 5,
    intervalo_pedidos_min INTEGER DEFAULT 5,
    filtro_order_source TEXT,
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
    tipo TEXT NOT NULL,
    planac_id TEXT NOT NULL,
    baselinker_id TEXT NOT NULL,
    sku TEXT,
    ean TEXT,
    ultima_sincronizacao DATETIME,
    hash_dados TEXT,
    direcao_ultima TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, tipo, planac_id),
    UNIQUE(empresa_id, tipo, baselinker_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_bl_map_sku ON integracoes_baselinker_mapeamento(empresa_id, sku);
```

---

### 15.2.3 integracoes_baselinker_log

```sql
CREATE TABLE integracoes_baselinker_log (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    operacao TEXT NOT NULL,
    metodo_api TEXT,
    direcao TEXT NOT NULL,
    status TEXT NOT NULL,
    registros_processados INTEGER DEFAULT 0,
    registros_sucesso INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    request_payload TEXT,
    response_payload TEXT,
    erro_mensagem TEXT,
    erro_codigo TEXT,
    duracao_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_bl_log_data ON integracoes_baselinker_log(created_at);
```

---

### 15.3.1 integracoes_ibpt_cache

```sql
CREATE TABLE integracoes_ibpt_cache (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    codigo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    uf CHAR(2) NOT NULL,
    descricao TEXT,
    aliquota_nacional REAL NOT NULL,
    aliquota_estadual REAL NOT NULL,
    aliquota_municipal REAL NOT NULL,
    aliquota_importado REAL NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL,
    versao TEXT,
    chave TEXT,
    fonte TEXT DEFAULT 'IBPT',
    consultado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, codigo, uf),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_ibpt_vigencia ON integracoes_ibpt_cache(vigencia_fim);
```

---

### 15.3.2 ALTER TABLE ncm

```sql
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

CREATE INDEX idx_ncm_vigencia ON ncm(vigencia_fim);
```

---

### 15.4.1 integracoes_nuvemfiscal_config

```sql
CREATE TABLE integracoes_nuvemfiscal_config (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    api_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    access_token TEXT,
    token_expira_em DATETIME,
    ambiente TEXT DEFAULT 'homologacao',
    emite_nfe INTEGER DEFAULT 1,
    emite_nfce INTEGER DEFAULT 1,
    emite_nfse INTEGER DEFAULT 0,
    emite_cte INTEGER DEFAULT 0,
    emite_mdfe INTEGER DEFAULT 0,
    serie_nfe INTEGER DEFAULT 1,
    serie_nfce INTEGER DEFAULT 1,
    serie_nfse INTEGER DEFAULT 1,
    serie_cte INTEGER DEFAULT 1,
    serie_mdfe INTEGER DEFAULT 1,
    proximo_numero_nfe INTEGER DEFAULT 1,
    proximo_numero_nfce INTEGER DEFAULT 1,
    proximo_numero_nfse INTEGER DEFAULT 1,
    recebe_dfe INTEGER DEFAULT 1,
    ultimo_nsu TEXT,
    intervalo_sync_minutos INTEGER DEFAULT 60,
    manifestacao_automatica INTEGER DEFAULT 0,
    tipo_manifestacao_padrao TEXT DEFAULT '210210',
    certificado_id TEXT,
    certificado_validade DATE,
    certificado_senha TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (api_id) REFERENCES integracoes_apis(id)
);
```

---

### 15.4.2 documentos_fiscais_emitidos

```sql
CREATE TABLE documentos_fiscais_emitidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    modelo TEXT NOT NULL,
    serie INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    chave_acesso CHAR(44),
    nuvemfiscal_id TEXT,
    protocolo_autorizacao TEXT,
    data_emissao DATETIME NOT NULL,
    data_autorizacao DATETIME,
    data_cancelamento DATETIME,
    valor_total REAL NOT NULL,
    valor_produtos REAL,
    valor_servicos REAL,
    valor_frete REAL,
    valor_desconto REAL,
    valor_tributos REAL,
    destinatario_cpf_cnpj TEXT,
    destinatario_nome TEXT,
    destinatario_uf CHAR(2),
    status TEXT NOT NULL,
    ambiente TEXT NOT NULL,
    pedido_id TEXT,
    os_id TEXT,
    xml_envio TEXT,
    xml_retorno TEXT,
    xml_procnfe TEXT,
    pdf_url TEXT,
    codigo_erro TEXT,
    mensagem_erro TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(empresa_id, tipo, serie, numero),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_doc_emit_chave ON documentos_fiscais_emitidos(chave_acesso);
CREATE INDEX idx_doc_emit_status ON documentos_fiscais_emitidos(status);
CREATE INDEX idx_doc_emit_data ON documentos_fiscais_emitidos(data_emissao);
```

---

### 15.4.3 documentos_fiscais_recebidos

```sql
CREATE TABLE documentos_fiscais_recebidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    modelo TEXT NOT NULL,
    chave_acesso CHAR(44) NOT NULL,
    nsu TEXT,
    emitente_cnpj TEXT NOT NULL,
    emitente_razao_social TEXT,
    emitente_nome_fantasia TEXT,
    emitente_uf CHAR(2),
    numero INTEGER,
    serie INTEGER,
    data_emissao DATETIME,
    data_recebimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total REAL,
    valor_produtos REAL,
    valor_frete REAL,
    valor_icms REAL,
    valor_ipi REAL,
    status TEXT NOT NULL,
    manifestacao_tipo TEXT,
    manifestacao_data DATETIME,
    manifestacao_protocolo TEXT,
    nota_entrada_id TEXT,
    pedido_compra_id TEXT,
    xml_resumo TEXT,
    xml_completo TEXT,
    xml_eventos TEXT,
    situacao_nfe TEXT,
    tem_eventos INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processado_em DATETIME,
    processado_por TEXT,
    UNIQUE(empresa_id, chave_acesso),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE INDEX idx_doc_receb_chave ON documentos_fiscais_recebidos(chave_acesso);
CREATE INDEX idx_doc_receb_emit ON documentos_fiscais_recebidos(emitente_cnpj);
CREATE INDEX idx_doc_receb_status ON documentos_fiscais_recebidos(status);
CREATE INDEX idx_doc_receb_nsu ON documentos_fiscais_recebidos(nsu);
```

---

### 15.4.4 documentos_fiscais_recebidos_itens

```sql
CREATE TABLE documentos_fiscais_recebidos_itens (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    documento_id TEXT NOT NULL,
    numero_item INTEGER NOT NULL,
    codigo_produto TEXT,
    descricao TEXT NOT NULL,
    ncm TEXT,
    cfop TEXT,
    unidade TEXT,
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    valor_total REAL NOT NULL,
    valor_desconto REAL DEFAULT 0,
    valor_icms REAL DEFAULT 0,
    valor_ipi REAL DEFAULT 0,
    valor_pis REAL DEFAULT 0,
    valor_cofins REAL DEFAULT 0,
    produto_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (documento_id) REFERENCES documentos_fiscais_recebidos(id)
);
CREATE INDEX idx_doc_itens_doc ON documentos_fiscais_recebidos_itens(documento_id);
CREATE INDEX idx_doc_itens_prod ON documentos_fiscais_recebidos_itens(produto_id);
```

---

### 15.4.5 documentos_fiscais_eventos

```sql
CREATE TABLE documentos_fiscais_eventos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    documento_emitido_id TEXT,
    documento_recebido_id TEXT,
    chave_acesso CHAR(44) NOT NULL,
    tipo_evento TEXT NOT NULL,
    descricao_evento TEXT,
    sequencia INTEGER DEFAULT 1,
    data_evento DATETIME NOT NULL,
    protocolo TEXT,
    justificativa TEXT,
    correcao TEXT,
    status TEXT NOT NULL,
    codigo_retorno TEXT,
    mensagem_retorno TEXT,
    xml_evento TEXT,
    xml_retorno TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (documento_emitido_id) REFERENCES documentos_fiscais_emitidos(id),
    FOREIGN KEY (documento_recebido_id) REFERENCES documentos_fiscais_recebidos(id)
);
CREATE INDEX idx_eventos_chave ON documentos_fiscais_eventos(chave_acesso);
CREATE INDEX idx_eventos_tipo ON documentos_fiscais_eventos(tipo_evento);
```

---

## 📊 RESUMO FINAL

### Tabelas por API

| API | Tabelas | Campos |
|-----|---------|--------|
| **Core** | 1 | 21 |
| **Baselinker** | 3 | 44 |
| **IBPT** | 1 + ALTER | 16 + 10 |
| **Nuvem Fiscal** | 5 | 126 |
| **TOTAL** | **10 + ALTER** | **~217** |

### Contagem de Índices

| Tabela | Índices |
|--------|---------|
| integracoes_apis | 1 |
| integracoes_baselinker_mapeamento | 1 |
| integracoes_baselinker_log | 1 |
| integracoes_ibpt_cache | 1 |
| ncm (ALTER) | 1 |
| documentos_fiscais_emitidos | 3 |
| documentos_fiscais_recebidos | 4 |
| documentos_fiscais_recebidos_itens | 2 |
| documentos_fiscais_eventos | 2 |
| **TOTAL** | **16** |

### Atualização do Modelo de Dados

| Antes | Depois |
|-------|--------|
| 207 tabelas | **217 tabelas** |
| 14 módulos | **15 módulos** |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Estrutura Base
- [ ] Criar tabela `integracoes_apis`
- [ ] Criar tabelas Baselinker (3)
- [ ] Criar tabela IBPT cache
- [ ] ALTER TABLE `ncm`

### Fase 2: Nuvem Fiscal
- [ ] Criar `integracoes_nuvemfiscal_config`
- [ ] Criar `documentos_fiscais_emitidos`
- [ ] Criar `documentos_fiscais_recebidos`
- [ ] Criar `documentos_fiscais_recebidos_itens`
- [ ] Criar `documentos_fiscais_eventos`

### Fase 3: Índices
- [ ] Criar todos os 16 índices

### Fase 4: Dados Iniciais
- [ ] Inserir config APIs na `integracoes_apis`
- [ ] Configurar credenciais Nuvem Fiscal

---

**Documento gerado em:** 08/12/2025  
**Versão:** 3.0 Final  
**Especialistas:** 🗄️ DBA + 👨‍💻 CTO DEV.com
