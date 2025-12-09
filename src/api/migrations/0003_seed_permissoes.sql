-- =============================================
-- 🌱 PLANAC ERP - Migration 0003
-- Seed: Permissões do Sistema
-- =============================================
-- Criado em: 09/12/2025

-- =============================================
-- PERMISSÕES - Módulos e Ações
-- =============================================

-- DASHBOARD
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_dash_ver', 'dashboard', 'ver', 'Visualizar dashboard');

-- EMPRESAS (Administração)
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_emp_ver', 'empresas', 'ver', 'Visualizar empresas'),
('perm_emp_criar', 'empresas', 'criar', 'Criar empresas'),
('perm_emp_editar', 'empresas', 'editar', 'Editar empresas'),
('perm_emp_excluir', 'empresas', 'excluir', 'Excluir empresas');

-- FILIAIS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_fil_ver', 'filiais', 'ver', 'Visualizar filiais'),
('perm_fil_criar', 'filiais', 'criar', 'Criar filiais'),
('perm_fil_editar', 'filiais', 'editar', 'Editar filiais'),
('perm_fil_excluir', 'filiais', 'excluir', 'Excluir filiais');

-- USUÁRIOS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_usr_ver', 'usuarios', 'ver', 'Visualizar usuários'),
('perm_usr_criar', 'usuarios', 'criar', 'Criar usuários'),
('perm_usr_editar', 'usuarios', 'editar', 'Editar usuários'),
('perm_usr_excluir', 'usuarios', 'excluir', 'Excluir/Desativar usuários'),
('perm_usr_resetar', 'usuarios', 'resetar', 'Resetar senha de usuários');

-- PERFIS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_perf_ver', 'perfis', 'ver', 'Visualizar perfis'),
('perm_perf_criar', 'perfis', 'criar', 'Criar perfis'),
('perm_perf_editar', 'perfis', 'editar', 'Editar perfis'),
('perm_perf_excluir', 'perfis', 'excluir', 'Excluir perfis');

-- CLIENTES
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_cli_ver', 'clientes', 'ver', 'Visualizar clientes'),
('perm_cli_criar', 'clientes', 'criar', 'Criar clientes'),
('perm_cli_editar', 'clientes', 'editar', 'Editar clientes'),
('perm_cli_excluir', 'clientes', 'excluir', 'Excluir clientes'),
('perm_cli_credito', 'clientes', 'aprovar_credito', 'Aprovar limite de crédito');

-- FORNECEDORES
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_forn_ver', 'fornecedores', 'ver', 'Visualizar fornecedores'),
('perm_forn_criar', 'fornecedores', 'criar', 'Criar fornecedores'),
('perm_forn_editar', 'fornecedores', 'editar', 'Editar fornecedores'),
('perm_forn_excluir', 'fornecedores', 'excluir', 'Excluir fornecedores');

-- PRODUTOS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_prod_ver', 'produtos', 'ver', 'Visualizar produtos'),
('perm_prod_criar', 'produtos', 'criar', 'Criar produtos'),
('perm_prod_editar', 'produtos', 'editar', 'Editar produtos'),
('perm_prod_excluir', 'produtos', 'excluir', 'Excluir produtos'),
('perm_prod_custo', 'produtos', 'ver_custo', 'Visualizar custos'),
('perm_prod_preco', 'produtos', 'editar_preco', 'Editar preços');

-- ESTOQUE
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_est_ver', 'estoque', 'ver', 'Visualizar estoque'),
('perm_est_movimentar', 'estoque', 'movimentar', 'Movimentar estoque'),
('perm_est_inventario', 'estoque', 'inventario', 'Realizar inventário'),
('perm_est_transferir', 'estoque', 'transferir', 'Transferir entre filiais');

-- ORÇAMENTOS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_orc_ver', 'orcamentos', 'ver', 'Visualizar orçamentos'),
('perm_orc_criar', 'orcamentos', 'criar', 'Criar orçamentos'),
('perm_orc_editar', 'orcamentos', 'editar', 'Editar orçamentos'),
('perm_orc_excluir', 'orcamentos', 'excluir', 'Excluir orçamentos'),
('perm_orc_desconto', 'orcamentos', 'aplicar_desconto', 'Aplicar descontos');

-- PEDIDOS DE VENDA
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_ped_ver', 'pedidos', 'ver', 'Visualizar pedidos'),
('perm_ped_criar', 'pedidos', 'criar', 'Criar pedidos'),
('perm_ped_editar', 'pedidos', 'editar', 'Editar pedidos'),
('perm_ped_cancelar', 'pedidos', 'cancelar', 'Cancelar pedidos'),
('perm_ped_aprovar', 'pedidos', 'aprovar', 'Aprovar pedidos'),
('perm_ped_faturar', 'pedidos', 'faturar', 'Faturar pedidos');

-- COMPRAS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_comp_ver', 'compras', 'ver', 'Visualizar compras'),
('perm_comp_criar', 'compras', 'criar', 'Criar pedidos de compra'),
('perm_comp_editar', 'compras', 'editar', 'Editar pedidos de compra'),
('perm_comp_cancelar', 'compras', 'cancelar', 'Cancelar pedidos de compra'),
('perm_comp_aprovar', 'compras', 'aprovar', 'Aprovar pedidos de compra'),
('perm_comp_receber', 'compras', 'receber', 'Receber mercadorias');

-- FINANCEIRO - CONTAS A RECEBER
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_receber_ver', 'contas_receber', 'ver', 'Visualizar contas a receber'),
('perm_receber_criar', 'contas_receber', 'criar', 'Criar títulos a receber'),
('perm_receber_editar', 'contas_receber', 'editar', 'Editar títulos a receber'),
('perm_receber_baixar', 'contas_receber', 'baixar', 'Baixar títulos'),
('perm_receber_estornar', 'contas_receber', 'estornar', 'Estornar baixas');

-- FINANCEIRO - CONTAS A PAGAR
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_pagar_ver', 'contas_pagar', 'ver', 'Visualizar contas a pagar'),
('perm_pagar_criar', 'contas_pagar', 'criar', 'Criar títulos a pagar'),
('perm_pagar_editar', 'contas_pagar', 'editar', 'Editar títulos a pagar'),
('perm_pagar_baixar', 'contas_pagar', 'baixar', 'Pagar títulos'),
('perm_pagar_aprovar', 'contas_pagar', 'aprovar', 'Aprovar pagamentos');

-- FINANCEIRO - CAIXA/BANCOS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_caixa_ver', 'caixa', 'ver', 'Visualizar caixa'),
('perm_caixa_movimentar', 'caixa', 'movimentar', 'Movimentar caixa'),
('perm_caixa_fechar', 'caixa', 'fechar', 'Fechar caixa'),
('perm_bancos_ver', 'bancos', 'ver', 'Visualizar contas bancárias'),
('perm_bancos_conciliar', 'bancos', 'conciliar', 'Conciliar extratos');

-- FISCAL - NOTAS FISCAIS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_nfe_ver', 'nfe', 'ver', 'Visualizar NF-e'),
('perm_nfe_emitir', 'nfe', 'emitir', 'Emitir NF-e'),
('perm_nfe_cancelar', 'nfe', 'cancelar', 'Cancelar NF-e'),
('perm_nfe_inutilizar', 'nfe', 'inutilizar', 'Inutilizar numeração'),
('perm_nfce_emitir', 'nfce', 'emitir', 'Emitir NFC-e');

-- EXPEDIÇÃO/LOGÍSTICA
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_exp_ver', 'expedicao', 'ver', 'Visualizar expedição'),
('perm_exp_separar', 'expedicao', 'separar', 'Separar pedidos'),
('perm_exp_conferir', 'expedicao', 'conferir', 'Conferir volumes'),
('perm_exp_embarcar', 'expedicao', 'embarcar', 'Embarcar entregas'),
('perm_ent_rastrear', 'entregas', 'rastrear', 'Rastrear entregas'),
('perm_ent_confirmar', 'entregas', 'confirmar', 'Confirmar entregas');

-- RELATÓRIOS
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_rel_vendas', 'relatorios', 'vendas', 'Relatórios de vendas'),
('perm_rel_estoque', 'relatorios', 'estoque', 'Relatórios de estoque'),
('perm_rel_financeiro', 'relatorios', 'financeiro', 'Relatórios financeiros'),
('perm_rel_fiscal', 'relatorios', 'fiscal', 'Relatórios fiscais'),
('perm_rel_gerencial', 'relatorios', 'gerencial', 'Relatórios gerenciais');

-- CONFIGURAÇÕES
INSERT INTO permissoes (id, modulo, acao, descricao) VALUES 
('perm_config_ver', 'configuracoes', 'ver', 'Visualizar configurações'),
('perm_config_editar', 'configuracoes', 'editar', 'Editar configurações'),
('perm_audit_ver', 'audit', 'ver', 'Visualizar logs de auditoria');
