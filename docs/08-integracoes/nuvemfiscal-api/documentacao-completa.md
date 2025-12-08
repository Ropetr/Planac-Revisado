# 📄 NUVEM FISCAL API - Documentação Completa

> **Plataforma de Automação Fiscal para Desenvolvedores**  
> Emissão + Recepção de Documentos Fiscais Eletrônicos

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Autenticação](#2-autenticação)
3. [Serviços de Emissão](#3-serviços-de-emissão)
4. [Serviços de Recepção (DFe)](#4-serviços-de-recepção-dfe)
5. [Eventos e Operações](#5-eventos-e-operações)
6. [Integração com Planac](#6-integração-com-planac)
7. [Estrutura de Tabelas](#7-estrutura-de-tabelas)

---

## 1. Visão Geral

### Informações Gerais

| Item | Valor |
|------|-------|
| **Base URL** | `https://api.nuvemfiscal.com.br` |
| **Protocolo** | HTTPS REST |
| **Autenticação** | OAuth2 (Client Credentials) |
| **Formatos** | JSON |
| **Ambiente** | `producao` / `homologacao` |

### Credenciais Planac

| Campo | Valor |
|-------|-------|
| **Client ID** | AJReDlHes8aBNlTzTF9X |
| **Client Secret** | 3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL |

---

## 2. Autenticação

### Obter Token de Acesso

```bash
curl -X POST "https://auth.nuvemfiscal.com.br/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=AJReDlHes8aBNlTzTF9X" \
  -d "client_secret=3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL" \
  -d "scope=empresa cep cnpj nfe nfce mdfe cte cteos nfse dfe"
```

### Resposta

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "empresa cep cnpj nfe nfce mdfe cte cteos nfse dfe"
}
```

### Scopes Disponíveis

| Scope | Descrição |
|-------|-----------|
| `empresa` | Cadastro de empresas |
| `nfe` | NF-e (Nota Fiscal Eletrônica) |
| `nfce` | NFC-e (Nota Fiscal do Consumidor) |
| `nfse` | NFS-e (Nota Fiscal de Serviços) |
| `cte` | CT-e (Conhecimento de Transporte) |
| `cteos` | CT-e OS (CT-e Outros Serviços) |
| `mdfe` | MDF-e (Manifesto de Documentos) |
| `dfe` | Distribuição DF-e (Notas de Entrada) |
| `cnpj` | Consulta CNPJ |
| `cep` | Consulta CEP |

---

## 3. Serviços de Emissão

### 3.1 NF-e (Nota Fiscal Eletrônica) - Modelo 55

**Uso:** Vendas de produtos (B2B e B2C não presencial)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/nfe` | POST | Emitir NF-e |
| `/nfe` | GET | Listar NF-e |
| `/nfe/{id}` | GET | Consultar NF-e |
| `/nfe/{id}` | DELETE | Cancelar NF-e |
| `/nfe/{id}/carta-correcao` | POST | Carta de Correção |
| `/nfe/{id}/pdf` | GET | Baixar DANFE (PDF) |
| `/nfe/{id}/xml` | GET | Baixar XML |
| `/nfe/lote` | POST | Emitir em lote |
| `/nfe/inutilizar` | POST | Inutilizar numeração |
| `/nfe/status` | GET | Status do serviço SEFAZ |

### 3.2 NFC-e (Nota Fiscal do Consumidor) - Modelo 65

**Uso:** Vendas no varejo (presencial)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/nfce` | POST | Emitir NFC-e |
| `/nfce` | GET | Listar NFC-e |
| `/nfce/{id}` | GET | Consultar NFC-e |
| `/nfce/{id}` | DELETE | Cancelar NFC-e |
| `/nfce/{id}/pdf` | GET | Baixar DANFCE (PDF) |
| `/nfce/{id}/xml` | GET | Baixar XML |
| `/nfce/inutilizar` | POST | Inutilizar numeração |

### 3.3 NFS-e (Nota Fiscal de Serviços)

**Uso:** Prestação de serviços (instalação, frete interno)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/nfse` | POST | Emitir NFS-e |
| `/nfse` | GET | Listar NFS-e |
| `/nfse/{id}` | GET | Consultar NFS-e |
| `/nfse/{id}/cancelar` | POST | Cancelar NFS-e |
| `/nfse/{id}/pdf` | GET | Baixar PDF |
| `/nfse/{id}/xml` | GET | Baixar XML |
| `/nfse/cidades` | GET | Listar cidades disponíveis |

### 3.4 CT-e (Conhecimento de Transporte) - Modelo 57

**Uso:** Transporte de cargas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/cte` | POST | Emitir CT-e |
| `/cte` | GET | Listar CT-e |
| `/cte/{id}` | GET | Consultar CT-e |
| `/cte/{id}/cancelar` | POST | Cancelar CT-e |
| `/cte/{id}/carta-correcao` | POST | Carta de Correção |
| `/cte/{id}/pdf` | GET | Baixar DACTE (PDF) |
| `/cte/{id}/xml` | GET | Baixar XML |
| `/cte/inutilizar` | POST | Inutilizar numeração |

### 3.5 MDF-e (Manifesto de Documentos Fiscais) - Modelo 58

**Uso:** Transporte de cargas com múltiplos documentos

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/mdfe` | POST | Emitir MDF-e |
| `/mdfe` | GET | Listar MDF-e |
| `/mdfe/{id}` | GET | Consultar MDF-e |
| `/mdfe/{id}/cancelar` | POST | Cancelar MDF-e |
| `/mdfe/{id}/encerrar` | POST | Encerrar MDF-e |
| `/mdfe/{id}/incluir-condutor` | POST | Incluir condutor |
| `/mdfe/{id}/incluir-dfe` | POST | Incluir DF-e |
| `/mdfe/{id}/pdf` | GET | Baixar DAMDFE (PDF) |
| `/mdfe/{id}/xml` | GET | Baixar XML |

---

## 4. Serviços de Recepção (DFe)

### 4.1 Distribuição DF-e (Notas de Entrada)

**O que é?** Permite baixar XMLs de documentos fiscais emitidos **CONTRA** o CNPJ da empresa:
- NF-e de fornecedores (compras)
- CT-e de transportadoras
- Eventos (cancelamentos, cartas de correção)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/dfe/nfe` | GET | Listar NF-e recebidas |
| `/dfe/nfe/{id}` | GET | Consultar NF-e específica |
| `/dfe/nfe/{id}/xml` | GET | Baixar XML da NF-e |
| `/dfe/nfe/manifestar` | POST | Manifestar destinatário |
| `/dfe/cte` | GET | Listar CT-e recebidos |
| `/dfe/cte/{id}` | GET | Consultar CT-e específico |
| `/dfe/sincronizar` | POST | Sincronizar com SEFAZ |

### 4.2 Tipos de Consulta DFe

```bash
# Por NSU (Número Sequencial Único)
GET /dfe/nfe?nsu_inicial=1&nsu_final=100

# Por período
GET /dfe/nfe?data_inicio=2024-01-01&data_fim=2024-01-31

# Por chave de acesso
GET /dfe/nfe?chave=35240112345678000190550010000001231234567890
```

### 4.3 Manifestação do Destinatário

| Tipo | Código | Descrição |
|------|--------|-----------|
| Ciência da Operação | 210210 | Confirma conhecimento |
| Confirmação da Operação | 210200 | Confirma recebimento |
| Desconhecimento da Operação | 210220 | Desconhece a nota |
| Operação não Realizada | 210240 | Operação não ocorreu |

```json
// POST /dfe/nfe/manifestar
{
  "chave_nfe": "35240112345678000190550010000001231234567890",
  "tipo_evento": "210200",
  "justificativa": "Mercadoria recebida conforme pedido"
}
```

---

## 5. Eventos e Operações

### 5.1 Eventos de NF-e/CT-e

| Evento | Código | Descrição |
|--------|--------|-----------|
| Cancelamento | 110111 | Cancela documento |
| Carta de Correção | 110110 | Corrige dados |
| EPEC | 110140 | Emissão em contingência |
| Ciência da Operação | 210210 | Destinatário ciente |
| Confirmação da Operação | 210200 | Destinatário confirma |
| Desconhecimento | 210220 | Destinatário desconhece |
| Operação não Realizada | 210240 | Não houve operação |

### 5.2 Status dos Documentos

| Status | Descrição |
|--------|-----------|
| `pendente` | Aguardando envio |
| `processando` | Em processamento na SEFAZ |
| `autorizado` | Autorizado com sucesso |
| `rejeitado` | Rejeitado pela SEFAZ |
| `cancelado` | Cancelado |
| `denegado` | Denegado (irregularidade fiscal) |
| `erro` | Erro de comunicação |

---

## 6. Integração com Planac

### 6.1 Fluxos Principais

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXOS NUVEM FISCAL → PLANAC                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  EMISSÃO (Saída)                                                    │
│  ──────────────                                                     │
│  Pedido Aprovado → Gerar NF-e → Enviar Nuvem Fiscal → Autorização   │
│                                        ↓                            │
│                              Salvar XML/PDF → Atualizar Pedido      │
│                                                                      │
│  RECEPÇÃO (Entrada)                                                 │
│  ─────────────────                                                  │
│  Job Agendado → Consultar DFe → Baixar XMLs → Processar             │
│                                        ↓                            │
│                              Criar Nota Entrada → Dar Entrada Estoque│
│                                        ↓                            │
│                              Manifestar Destinatário                │
│                                                                      │
│  TRANSPORTE                                                         │
│  ──────────                                                         │
│  Expedição → Gerar MDF-e → Vincular NF-e → Autorizar                │
│                    ↓                                                │
│           CT-e Recebido → Vincular NF-e → Custo Frete               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Casos de Uso - Planac

| Módulo | Documento | Direção | Uso |
|--------|-----------|---------|-----|
| **Vendas** | NF-e | Emissão | Faturamento de pedidos |
| **PDV** | NFC-e | Emissão | Venda balcão |
| **Serviços** | NFS-e | Emissão | Instalação drywall |
| **Compras** | NF-e | Recepção | Notas de fornecedores |
| **Expedição** | MDF-e | Emissão | Manifesto de carga |
| **Frete** | CT-e | Recepção | CT-e transportadoras |

---

## 7. Estrutura de Tabelas

### 7.1 Tabela de Documentos Fiscais Emitidos

```sql
CREATE TABLE documentos_fiscais_emitidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Identificação
    tipo TEXT NOT NULL,                -- 'nfe', 'nfce', 'nfse', 'cte', 'mdfe'
    modelo TEXT NOT NULL,              -- '55', '65', 'nfse', '57', '58'
    serie INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    
    -- Chaves
    chave_acesso CHAR(44),             -- Chave de 44 dígitos
    nuvemfiscal_id TEXT,               -- ID na Nuvem Fiscal
    protocolo_autorizacao TEXT,
    
    -- Datas
    data_emissao DATETIME NOT NULL,
    data_autorizacao DATETIME,
    data_cancelamento DATETIME,
    
    -- Valores
    valor_total REAL NOT NULL,
    valor_produtos REAL,
    valor_servicos REAL,
    valor_frete REAL,
    valor_desconto REAL,
    valor_tributos REAL,               -- IBPT
    
    -- Destinatário/Tomador
    destinatario_cpf_cnpj TEXT,
    destinatario_nome TEXT,
    destinatario_uf CHAR(2),
    
    -- Status
    status TEXT NOT NULL,              -- 'pendente', 'autorizado', 'cancelado', etc
    ambiente TEXT NOT NULL,            -- 'producao', 'homologacao'
    
    -- Origem
    pedido_id TEXT,                    -- FK pedidos
    os_id TEXT,                        -- FK ordens_servico
    
    -- XMLs e PDFs
    xml_envio TEXT,                    -- XML enviado
    xml_retorno TEXT,                  -- XML retorno SEFAZ
    xml_procnfe TEXT,                  -- XML completo (NF-e + protocolo)
    pdf_url TEXT,                      -- URL do DANFE/DACTE
    
    -- Erros
    codigo_erro TEXT,
    mensagem_erro TEXT,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    
    UNIQUE(empresa_id, tipo, serie, numero),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_doc_emitidos_empresa ON documentos_fiscais_emitidos(empresa_id);
CREATE INDEX idx_doc_emitidos_chave ON documentos_fiscais_emitidos(chave_acesso);
CREATE INDEX idx_doc_emitidos_status ON documentos_fiscais_emitidos(status);
CREATE INDEX idx_doc_emitidos_data ON documentos_fiscais_emitidos(data_emissao);
CREATE INDEX idx_doc_emitidos_dest ON documentos_fiscais_emitidos(destinatario_cpf_cnpj);
```

### 7.2 Tabela de Documentos Fiscais Recebidos (DFe)

```sql
CREATE TABLE documentos_fiscais_recebidos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Identificação
    tipo TEXT NOT NULL,                -- 'nfe', 'cte'
    modelo TEXT NOT NULL,              -- '55', '57'
    
    -- Chaves
    chave_acesso CHAR(44) NOT NULL,
    nsu TEXT,                          -- Número Sequencial Único
    
    -- Emitente
    emitente_cnpj TEXT NOT NULL,
    emitente_razao_social TEXT,
    emitente_nome_fantasia TEXT,
    emitente_uf CHAR(2),
    
    -- Dados do Documento
    numero INTEGER,
    serie INTEGER,
    data_emissao DATETIME,
    data_recebimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Valores
    valor_total REAL,
    valor_produtos REAL,
    valor_frete REAL,
    valor_icms REAL,
    valor_ipi REAL,
    
    -- Status e Manifestação
    status TEXT NOT NULL,              -- 'pendente', 'ciencia', 'confirmado', 'desconhecido'
    manifestacao_tipo TEXT,            -- '210200', '210210', '210220', '210240'
    manifestacao_data DATETIME,
    manifestacao_protocolo TEXT,
    
    -- Vinculação
    nota_entrada_id TEXT,              -- FK notas_entrada (quando processada)
    pedido_compra_id TEXT,             -- FK pedidos_compra
    
    -- XML
    xml_resumo TEXT,                   -- XML resumido (distribuição)
    xml_completo TEXT,                 -- XML completo (após download)
    xml_eventos TEXT,                  -- Eventos (cancelamento, CC-e)
    
    -- Situação do Documento
    situacao_nfe TEXT,                 -- 'autorizada', 'cancelada', 'denegada'
    tem_eventos INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processado_em DATETIME,
    processado_por TEXT,
    
    UNIQUE(empresa_id, chave_acesso),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_doc_recebidos_empresa ON documentos_fiscais_recebidos(empresa_id);
CREATE INDEX idx_doc_recebidos_chave ON documentos_fiscais_recebidos(chave_acesso);
CREATE INDEX idx_doc_recebidos_emitente ON documentos_fiscais_recebidos(emitente_cnpj);
CREATE INDEX idx_doc_recebidos_status ON documentos_fiscais_recebidos(status);
CREATE INDEX idx_doc_recebidos_data ON documentos_fiscais_recebidos(data_emissao);
CREATE INDEX idx_doc_recebidos_nsu ON documentos_fiscais_recebidos(nsu);
```

### 7.3 Tabela de Eventos de Documentos

```sql
CREATE TABLE documentos_fiscais_eventos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    
    -- Documento relacionado
    documento_emitido_id TEXT,         -- FK documentos_fiscais_emitidos
    documento_recebido_id TEXT,        -- FK documentos_fiscais_recebidos
    chave_acesso CHAR(44) NOT NULL,
    
    -- Evento
    tipo_evento TEXT NOT NULL,         -- '110111', '110110', '210200', etc
    descricao_evento TEXT,             -- 'Cancelamento', 'Carta Correção', etc
    sequencia INTEGER DEFAULT 1,
    
    -- Dados do Evento
    data_evento DATETIME NOT NULL,
    protocolo TEXT,
    justificativa TEXT,
    correcao TEXT,                     -- Texto da carta de correção
    
    -- Status
    status TEXT NOT NULL,              -- 'pendente', 'registrado', 'rejeitado'
    codigo_retorno TEXT,
    mensagem_retorno TEXT,
    
    -- XML
    xml_evento TEXT,
    xml_retorno TEXT,
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (documento_emitido_id) REFERENCES documentos_fiscais_emitidos(id),
    FOREIGN KEY (documento_recebido_id) REFERENCES documentos_fiscais_recebidos(id)
);

CREATE INDEX idx_eventos_documento ON documentos_fiscais_eventos(chave_acesso);
CREATE INDEX idx_eventos_tipo ON documentos_fiscais_eventos(tipo_evento);
```

### 7.4 Tabela de Configuração (Atualizada)

```sql
CREATE TABLE integracoes_nuvemfiscal_config (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    api_id TEXT NOT NULL,
    
    -- Credenciais
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    access_token TEXT,
    token_expira_em DATETIME,
    
    -- Ambiente
    ambiente TEXT DEFAULT 'homologacao', -- 'homologacao', 'producao'
    
    -- Configurações de Emissão
    emite_nfe INTEGER DEFAULT 1,
    emite_nfce INTEGER DEFAULT 1,
    emite_nfse INTEGER DEFAULT 0,
    emite_cte INTEGER DEFAULT 0,
    emite_mdfe INTEGER DEFAULT 0,
    
    -- Séries
    serie_nfe INTEGER DEFAULT 1,
    serie_nfce INTEGER DEFAULT 1,
    serie_nfse INTEGER DEFAULT 1,
    serie_cte INTEGER DEFAULT 1,
    serie_mdfe INTEGER DEFAULT 1,
    
    -- Numeração atual
    proximo_numero_nfe INTEGER DEFAULT 1,
    proximo_numero_nfce INTEGER DEFAULT 1,
    proximo_numero_nfse INTEGER DEFAULT 1,
    
    -- Configurações de Recepção (DFe)
    recebe_dfe INTEGER DEFAULT 1,
    ultimo_nsu TEXT,                   -- Último NSU processado
    intervalo_sync_minutos INTEGER DEFAULT 60,
    
    -- Manifestação automática
    manifestacao_automatica INTEGER DEFAULT 0,
    tipo_manifestacao_padrao TEXT DEFAULT '210210', -- Ciência
    
    -- Certificado
    certificado_id TEXT,               -- ID do certificado na Nuvem Fiscal
    certificado_validade DATE,
    certificado_senha TEXT,            -- Senha (criptografada)
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (api_id) REFERENCES integracoes_apis(id)
);
```

### 7.5 Tabela de Itens de Documentos Recebidos

```sql
CREATE TABLE documentos_fiscais_recebidos_itens (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    documento_id TEXT NOT NULL,        -- FK documentos_fiscais_recebidos
    
    -- Identificação
    numero_item INTEGER NOT NULL,
    
    -- Produto
    codigo_produto TEXT,
    descricao TEXT NOT NULL,
    ncm TEXT,
    cfop TEXT,
    unidade TEXT,
    
    -- Quantidades e Valores
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    valor_total REAL NOT NULL,
    valor_desconto REAL DEFAULT 0,
    
    -- Tributos
    valor_icms REAL DEFAULT 0,
    valor_ipi REAL DEFAULT 0,
    valor_pis REAL DEFAULT 0,
    valor_cofins REAL DEFAULT 0,
    
    -- Vinculação com produto Planac
    produto_id TEXT,                   -- FK produtos (quando identificado)
    
    -- Auditoria
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (documento_id) REFERENCES documentos_fiscais_recebidos(id)
);

CREATE INDEX idx_doc_itens_documento ON documentos_fiscais_recebidos_itens(documento_id);
CREATE INDEX idx_doc_itens_produto ON documentos_fiscais_recebidos_itens(produto_id);
CREATE INDEX idx_doc_itens_ncm ON documentos_fiscais_recebidos_itens(ncm);
```

---

## Resumo das Tabelas Nuvem Fiscal

| # | Tabela | Descrição | Campos |
|---|--------|-----------|--------|
| 1 | `integracoes_nuvemfiscal_config` | Configuração da API | 26 |
| 2 | `documentos_fiscais_emitidos` | NF-e, NFC-e, CT-e emitidos | 32 |
| 3 | `documentos_fiscais_recebidos` | NF-e, CT-e de entrada (DFe) | 30 |
| 4 | `documentos_fiscais_eventos` | Cancelamentos, CC-e, Manifestação | 16 |
| 5 | `documentos_fiscais_recebidos_itens` | Itens das notas de entrada | 18 |

**Total: 5 tabelas | ~122 campos**

---

**Documento gerado em:** 08/12/2025  
**Para o projeto:** Planac ERP  
**Desenvolvido por:** DEV.com
