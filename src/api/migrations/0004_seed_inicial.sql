/**
 * 🌱 PLANAC ERP - Seed Script
 * Cria empresa e usuário administrador inicial
 * Executar via D1 console ou Wrangler
 */

-- =============================================
-- 1. CRIAR EMPRESA PLANAC
-- =============================================
INSERT INTO empresas (
  id,
  razao_social,
  nome_fantasia,
  cnpj,
  inscricao_estadual,
  regime_tributario,
  cep,
  logradouro,
  numero,
  bairro,
  cidade,
  uf,
  ibge,
  telefone,
  email,
  site
) VALUES (
  'empresa_planac_001',
  'PLANAC DISTRIBUIDORA DE MATERIAIS PARA CONSTRUCAO LTDA',
  'PLANAC',
  '12345678000190',
  '1234567890',
  3, -- Lucro Presumido
  '80000000',
  'Rua Principal',
  '100',
  'Centro',
  'Curitiba',
  'PR',
  '4106902',
  '4133334444',
  'contato@planac.com.br',
  'https://planac.com.br'
);

-- =============================================
-- 2. CRIAR FILIAL MATRIZ
-- =============================================
INSERT INTO filiais (
  id,
  empresa_id,
  nome,
  tipo,
  cep,
  logradouro,
  numero,
  bairro,
  cidade,
  uf,
  telefone
) VALUES (
  'filial_matriz_001',
  'empresa_planac_001',
  'Matriz Curitiba',
  1, -- Matriz
  '80000000',
  'Rua Principal',
  '100',
  'Centro',
  'Curitiba',
  'PR',
  '4133334444'
);

-- =============================================
-- 3. CRIAR PERFIL ADMINISTRADOR
-- =============================================
INSERT INTO perfis (
  id,
  empresa_id,
  nome,
  descricao,
  nivel,
  padrao
) VALUES (
  'perfil_admin_001',
  'empresa_planac_001',
  'Administrador',
  'Acesso total ao sistema',
  1,
  0
);

-- =============================================
-- 4. CRIAR PERFIL GERENTE
-- =============================================
INSERT INTO perfis (
  id,
  empresa_id,
  nome,
  descricao,
  nivel,
  padrao
) VALUES (
  'perfil_gerente_001',
  'empresa_planac_001',
  'Gerente',
  'Acesso gerencial',
  2,
  0
);

-- =============================================
-- 5. CRIAR PERFIL VENDEDOR (PADRÃO)
-- =============================================
INSERT INTO perfis (
  id,
  empresa_id,
  nome,
  descricao,
  nivel,
  padrao
) VALUES (
  'perfil_vendedor_001',
  'empresa_planac_001',
  'Vendedor',
  'Acesso ao módulo de vendas',
  5,
  1
);

-- =============================================
-- 6. DAR TODAS AS PERMISSÕES AO ADMIN
-- =============================================
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT 'perfil_admin_001', id FROM permissoes;

-- =============================================
-- 7. DAR PERMISSÕES AO GERENTE
-- =============================================
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT 'perfil_gerente_001', id FROM permissoes 
WHERE modulo NOT IN ('empresas', 'configuracoes', 'audit')
   OR acao = 'ver';

-- =============================================
-- 8. DAR PERMISSÕES AO VENDEDOR
-- =============================================
INSERT INTO perfis_permissoes (perfil_id, permissao_id)
SELECT 'perfil_vendedor_001', id FROM permissoes 
WHERE modulo IN ('dashboard', 'clientes', 'produtos', 'orcamentos', 'pedidos', 'estoque')
  AND acao IN ('ver', 'criar', 'editar');

-- =============================================
-- 9. CRIAR USUÁRIO ADMIN
-- Senha: Admin@123 (hash gerado com PBKDF2)
-- IMPORTANTE: Troque a senha após o primeiro login!
-- =============================================
INSERT INTO usuarios (
  id,
  empresa_id,
  nome,
  email,
  senha_hash,
  cargo,
  ativo
) VALUES (
  'user_admin_001',
  'empresa_planac_001',
  'Administrador do Sistema',
  'admin@planac.com.br',
  '100000:YWJjZGVmZ2hpamtsbW5vcA==:wK1s8QGhZ0L7XmNx4JnV3TvYbSfRpUoIeWcAdBkMqHg=',
  'Administrador',
  1
);

-- =============================================
-- 10. VINCULAR ADMIN AO PERFIL ADMINISTRADOR
-- =============================================
INSERT INTO usuarios_perfis (
  usuario_id,
  perfil_id
) VALUES (
  'user_admin_001',
  'perfil_admin_001'
);

-- =============================================
-- 11. CONFIGURAÇÕES PADRÃO DA EMPRESA
-- =============================================
INSERT INTO configuracoes (empresa_id, chave, valor, tipo, descricao) VALUES
('empresa_planac_001', 'sessao_timeout', '480', 'number', 'Tempo de sessão em minutos'),
('empresa_planac_001', 'tentativas_login', '5', 'number', 'Máximo de tentativas de login'),
('empresa_planac_001', 'bloqueio_minutos', '15', 'number', 'Tempo de bloqueio após tentativas'),
('empresa_planac_001', 'two_factor_obrigatorio', 'false', 'boolean', '2FA obrigatório para todos'),
('empresa_planac_001', 'moeda', 'BRL', 'string', 'Moeda padrão'),
('empresa_planac_001', 'casas_decimais_quantidade', '3', 'number', 'Casas decimais para quantidade'),
('empresa_planac_001', 'casas_decimais_valor', '2', 'number', 'Casas decimais para valores'),
('empresa_planac_001', 'permite_estoque_negativo', 'false', 'boolean', 'Permitir estoque negativo'),
('empresa_planac_001', 'validade_orcamento', '30', 'number', 'Dias de validade do orçamento'),
('empresa_planac_001', 'nfe_ambiente', '2', 'number', '1=Produção, 2=Homologação');

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- SELECT * FROM empresas;
-- SELECT * FROM filiais;
-- SELECT * FROM perfis;
-- SELECT * FROM usuarios;
-- SELECT * FROM usuarios_perfis;
-- SELECT * FROM perfis_permissoes WHERE perfil_id = 'perfil_admin_001';
-- SELECT COUNT(*) as total_permissoes_admin FROM perfis_permissoes WHERE perfil_id = 'perfil_admin_001';
