-- =============================================
-- 🏢 PLANAC ERP - Migration 004 - Comercial
-- Orçamentos, Pedidos de Venda
-- =============================================

-- =============================================
-- ORÇAMENTOS
-- =============================================

CREATE TABLE IF NOT EXISTS orcamentos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id),
    filial_id TEXT NOT NULL REFERENCES filiais(id),
    numero TEXT NOT NULL,
    
    -- Dados do Cliente (snapshot)
    cliente_id TEXT NOT NULL REFERENCES clientes(id),
    cliente_nome TEXT NOT NULL,
    cliente_cpf_cnpj TEXT NOT NULL,
    cliente_email TEXT,
    cliente_telefone TEXT,
    
    -- Dados do Vendedor (snapshot)
    vendedor_id TEXT REFERENCES usuarios(id),
    vendedor_nome TEXT,
    
    -- Referências
    tabela_preco_id TEXT REFERENCES tabelas_preco(id),
    condicao_pagamento_id TEXT REFERENCES condicoes_pagamento(id),
    
    -- Status e Datas
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado', 'convertido', 'expirado')),
    data_emissao TEXT NOT NULL,
    validade_dias INTEGER DEFAULT 30,
    data_validade TEXT NOT NULL,
    
    -- Valores
    valor_subtotal REAL DEFAULT 0,
    valor_desconto REAL DEFAULT 0,
    valor_acrescimo REAL DEFAULT 0,
    valor_frete REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    
    -- Conversão em Pedido
    pedido_id TEXT,
    
    -- Observações
    observacao TEXT,
    observacao_interna TEXT,
    
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(empresa_id, filial_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_empresa ON orcamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_filial ON orcamentos(filial_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_vendedor ON orcamentos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data ON orcamentos(data_emissao);

-- Itens do Orçamento
CREATE TABLE IF NOT EXISTS orcamentos_itens (
    id TEXT PRIMARY KEY,
    orcamento_id TEXT NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    sequencia INTEGER NOT NULL,
    
    -- Produto (snapshot)
    produto_id TEXT NOT NULL REFERENCES produtos(id),
    produto_codigo TEXT NOT NULL,
    produto_nome TEXT NOT NULL,
    produto_ncm TEXT,
    
    -- Valores
    quantidade REAL NOT NULL,
    preco_unitario REAL NOT NULL,
    desconto_percentual REAL DEFAULT 0,
    valor_desconto REAL DEFAULT 0,
    valor_subtotal REAL NOT NULL,
    valor_total REAL NOT NULL,
    
    observacao TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_orcamento ON orcamentos_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_produto ON orcamentos_itens(produto_id);

-- Histórico do Orçamento
CREATE TABLE IF NOT EXISTS orcamentos_historico (
    id TEXT PRIMARY KEY,
    orcamento_id TEXT NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    status_anterior TEXT,
    status_novo TEXT NOT NULL,
    observacao TEXT,
    usuario_id TEXT REFERENCES usuarios(id),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_historico_orcamento ON orcamentos_historico(orcamento_id);

-- =============================================
-- PEDIDOS DE VENDA
-- =============================================

CREATE TABLE IF NOT EXISTS pedidos_venda (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id),
    filial_id TEXT NOT NULL REFERENCES filiais(id),
    numero TEXT NOT NULL,
    
    -- Origem
    orcamento_id TEXT REFERENCES orcamentos(id),
    canal TEXT DEFAULT 'interno' CHECK (canal IN ('interno', 'ecommerce', 'marketplace', 'whatsapp', 'telefone')),
    
    -- Dados do Cliente (snapshot)
    cliente_id TEXT NOT NULL REFERENCES clientes(id),
    cliente_nome TEXT NOT NULL,
    cliente_cpf_cnpj TEXT NOT NULL,
    cliente_email TEXT,
    cliente_telefone TEXT,
    
    -- Dados do Vendedor (snapshot)
    vendedor_id TEXT REFERENCES usuarios(id),
    vendedor_nome TEXT,
    
    -- Referências
    tabela_preco_id TEXT REFERENCES tabelas_preco(id),
    condicao_pagamento_id TEXT REFERENCES condicoes_pagamento(id),
    transportadora_id TEXT REFERENCES transportadoras(id),
    
    -- Endereço de Entrega (snapshot)
    endereco_entrega_id TEXT,
    endereco_entrega_cep TEXT,
    endereco_entrega_logradouro TEXT,
    endereco_entrega_numero TEXT,
    endereco_entrega_complemento TEXT,
    endereco_entrega_bairro TEXT,
    endereco_entrega_cidade TEXT,
    endereco_entrega_uf TEXT,
    
    -- Status e Datas
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'separando', 'separado', 'faturado', 'em_entrega', 'entregue', 'cancelado')),
    data_emissao TEXT NOT NULL,
    data_aprovacao TEXT,
    data_separacao TEXT,
    data_faturamento TEXT,
    data_entrega_prevista TEXT,
    data_entrega_realizada TEXT,
    
    -- Valores
    valor_subtotal REAL DEFAULT 0,
    valor_desconto REAL DEFAULT 0,
    valor_acrescimo REAL DEFAULT 0,
    valor_frete REAL DEFAULT 0,
    valor_total REAL DEFAULT 0,
    
    -- Fiscal
    nfe_numero TEXT,
    nfe_serie TEXT,
    nfe_chave TEXT,
    nfe_protocolo TEXT,
    nfe_data TEXT,
    
    -- Cancelamento
    motivo_cancelamento TEXT,
    
    -- Observações
    observacao TEXT,
    observacao_interna TEXT,
    
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(empresa_id, filial_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_empresa ON pedidos_venda(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_filial ON pedidos_venda(filial_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_cliente ON pedidos_venda(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_vendedor ON pedidos_venda(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_status ON pedidos_venda(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_data ON pedidos_venda(data_emissao);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_nfe ON pedidos_venda(nfe_chave);

-- Itens do Pedido de Venda
CREATE TABLE IF NOT EXISTS pedidos_venda_itens (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
    sequencia INTEGER NOT NULL,
    
    -- Produto (snapshot)
    produto_id TEXT NOT NULL REFERENCES produtos(id),
    produto_codigo TEXT NOT NULL,
    produto_nome TEXT NOT NULL,
    produto_ncm TEXT,
    
    -- Valores
    quantidade REAL NOT NULL,
    quantidade_separada REAL DEFAULT 0,
    quantidade_faturada REAL DEFAULT 0,
    quantidade_entregue REAL DEFAULT 0,
    preco_unitario REAL NOT NULL,
    preco_custo REAL DEFAULT 0,
    desconto_percentual REAL DEFAULT 0,
    valor_desconto REAL DEFAULT 0,
    valor_subtotal REAL NOT NULL,
    valor_total REAL NOT NULL,
    
    -- Fiscal
    cfop TEXT,
    cst_icms TEXT,
    aliquota_icms REAL,
    valor_icms REAL,
    
    observacao TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_itens_pedido ON pedidos_venda_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_itens_produto ON pedidos_venda_itens(produto_id);

-- Parcelas do Pedido
CREATE TABLE IF NOT EXISTS pedidos_venda_parcelas (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    valor REAL NOT NULL,
    data_vencimento TEXT NOT NULL,
    forma_pagamento TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    data_pagamento TEXT,
    titulo_id TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_parcelas_pedido ON pedidos_venda_parcelas(pedido_id);

-- Histórico do Pedido
CREATE TABLE IF NOT EXISTS pedidos_venda_historico (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
    status_anterior TEXT,
    status_novo TEXT NOT NULL,
    observacao TEXT,
    usuario_id TEXT REFERENCES usuarios(id),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_historico_pedido ON pedidos_venda_historico(pedido_id);
