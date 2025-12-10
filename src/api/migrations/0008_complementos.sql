-- ============================================
-- PLANAC ERP - Migration 0008: Complementos
-- Tabelas auxiliares que faltavam
-- ============================================

-- Regiões de atendimento das transportadoras
CREATE TABLE IF NOT EXISTS transportadoras_regioes (
  id TEXT PRIMARY KEY,
  transportadora_id TEXT NOT NULL,
  uf TEXT NOT NULL,
  cidade TEXT,
  cep_inicial TEXT,
  cep_final TEXT,
  prazo_dias INTEGER DEFAULT 0,
  valor_adicional REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transp_regioes_transportadora ON transportadoras_regioes(transportadora_id);
CREATE INDEX IF NOT EXISTS idx_transp_regioes_uf ON transportadoras_regioes(uf);

-- Adicionar campos que podem estar faltando na tabela transportadoras
-- (SQLite não suporta ADD COLUMN IF NOT EXISTS, então usamos pragma para verificar)

-- Histórico de alterações de preço (para auditoria de pricing)
CREATE TABLE IF NOT EXISTS produtos_historico_preco (
  id TEXT PRIMARY KEY,
  produto_id TEXT NOT NULL,
  tabela_preco_id TEXT,
  preco_anterior REAL,
  preco_novo REAL NOT NULL,
  motivo TEXT,
  usuario_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (tabela_preco_id) REFERENCES tabelas_preco(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_hist_preco_produto ON produtos_historico_preco(produto_id);
CREATE INDEX IF NOT EXISTS idx_hist_preco_data ON produtos_historico_preco(created_at);

-- Veículos das transportadoras (para roteirização futura)
CREATE TABLE IF NOT EXISTS transportadoras_veiculos (
  id TEXT PRIMARY KEY,
  transportadora_id TEXT NOT NULL,
  placa TEXT NOT NULL,
  tipo TEXT DEFAULT 'caminhao', -- caminhao, van, moto, carro
  capacidade_kg REAL,
  capacidade_m3 REAL,
  motorista_nome TEXT,
  motorista_telefone TEXT,
  ativo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_veiculos_transportadora ON transportadoras_veiculos(transportadora_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON transportadoras_veiculos(placa);
