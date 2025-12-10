// ============================================
// PLANAC ERP - Rotas de Contas a Pagar
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const contasPagar = new Hono<{ Bindings: Bindings; Variables: Variables }>();

contasPagar.use('/*', requireAuth());

// Schemas
const contaPagarSchema = z.object({
  filial_id: z.string().uuid(),
  fornecedor_id: z.string().uuid(),
  pedido_compra_id: z.string().uuid().optional(),
  nfe_entrada_id: z.string().uuid().optional(),
  numero_documento: z.string().max(50),
  tipo: z.enum(['DUPLICATA', 'BOLETO', 'NOTA_FISCAL', 'FATURA', 'RECIBO', 'OUTROS']).default('DUPLICATA'),
  categoria: z.enum(['MERCADORIA', 'SERVICO', 'DESPESA_FIXA', 'DESPESA_VARIAVEL', 'IMPOSTO', 'OUTROS']).default('MERCADORIA'),
  parcela: z.number().int().min(1).default(1),
  total_parcelas: z.number().int().min(1).default(1),
  valor_original: z.number().min(0.01),
  valor_juros: z.number().min(0).default(0),
  valor_multa: z.number().min(0).default(0),
  valor_desconto: z.number().min(0).default(0),
  data_emissao: z.string(),
  data_vencimento: z.string(),
  forma_pagamento_id: z.string().uuid().optional(),
  conta_bancaria_id: z.string().uuid().optional(),
  centro_custo_id: z.string().uuid().optional(),
  codigo_barras: z.string().optional(),
  linha_digitavel: z.string().optional(),
  chave_pix: z.string().optional(),
  observacao: z.string().optional()
});

const pagamentoSchema = z.object({
  data_pagamento: z.string(),
  valor_pago: z.number().min(0.01),
  valor_juros: z.number().min(0).default(0),
  valor_multa: z.number().min(0).default(0),
  valor_desconto: z.number().min(0).default(0),
  conta_bancaria_id: z.string().uuid().optional(),
  formas: z.array(z.object({
    forma_pagamento_id: z.string().uuid(),
    valor: z.number().min(0.01),
    observacao: z.string().optional()
  })),
  observacao: z.string().optional()
});

// GET /financeiro/contas-pagar - Listar
contasPagar.get('/', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { 
    page = '1', limit = '20', status, fornecedor_id, categoria,
    data_vencimento_inicio, data_vencimento_fim, vencidas, filial_id 
  } = c.req.query();

  let query = `
    SELECT cp.*, 
           f.razao_social as fornecedor_nome, f.cpf_cnpj as fornecedor_documento,
           fi.nome as filial_nome,
           pc.numero as pedido_compra_numero
    FROM contas_pagar cp
    JOIN fornecedores f ON cp.fornecedor_id = f.id
    JOIN filiais fi ON cp.filial_id = fi.id
    LEFT JOIN pedidos_compra pc ON cp.pedido_compra_id = pc.id
    WHERE cp.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND cp.status = ?`;
    params.push(status);
  }

  if (fornecedor_id) {
    query += ` AND cp.fornecedor_id = ?`;
    params.push(fornecedor_id);
  }

  if (categoria) {
    query += ` AND cp.categoria = ?`;
    params.push(categoria);
  }

  if (data_vencimento_inicio) {
    query += ` AND cp.data_vencimento >= ?`;
    params.push(data_vencimento_inicio);
  }

  if (data_vencimento_fim) {
    query += ` AND cp.data_vencimento <= ?`;
    params.push(data_vencimento_fim);
  }

  if (vencidas === 'true') {
    query += ` AND cp.data_vencimento < date('now') AND cp.status = 'ABERTO'`;
  }

  if (filial_id) {
    query += ` AND cp.filial_id = ?`;
    params.push(filial_id);
  }

  // Contagem
  const countQuery = query.replace(/SELECT cp\.\*, [\s\S]*? FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  // Paginação
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  query += ` ORDER BY cp.data_vencimento ASC LIMIT ? OFFSET ?`;
  params.push(limitNum, (pageNum - 1) * limitNum);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: countResult?.total || 0,
      pages: Math.ceil((countResult?.total || 0) / limitNum)
    }
  });
});

// GET /financeiro/contas-pagar/resumo - Dashboard
contasPagar.get('/resumo', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { filial_id } = c.req.query();

  let filtroFilial = '';
  const params: any[] = [usuario.empresa_id];
  
  if (filial_id) {
    filtroFilial = ' AND filial_id = ?';
    params.push(filial_id);
  }

  // Totais por status
  const totais = await c.env.DB.prepare(`
    SELECT 
      SUM(CASE WHEN status = 'ABERTO' THEN valor_saldo ELSE 0 END) as total_aberto,
      SUM(CASE WHEN status = 'ABERTO' AND data_vencimento < date('now') THEN valor_saldo ELSE 0 END) as total_vencido,
      SUM(CASE WHEN status = 'ABERTO' AND data_vencimento >= date('now') THEN valor_saldo ELSE 0 END) as total_a_vencer,
      SUM(CASE WHEN status = 'PAGO' AND strftime('%Y-%m', data_pagamento) = strftime('%Y-%m', 'now') THEN valor_pago ELSE 0 END) as pago_mes,
      COUNT(CASE WHEN status = 'ABERTO' THEN 1 END) as qtd_aberto,
      COUNT(CASE WHEN status = 'ABERTO' AND data_vencimento < date('now') THEN 1 END) as qtd_vencido
    FROM contas_pagar WHERE empresa_id = ?${filtroFilial}
  `).bind(...params).first();

  // Por categoria
  const porCategoria = await c.env.DB.prepare(`
    SELECT categoria, SUM(valor_saldo) as total
    FROM contas_pagar 
    WHERE empresa_id = ? AND status = 'ABERTO'
    GROUP BY categoria
    ORDER BY total DESC
  `).bind(usuario.empresa_id).all();

  // Vencimentos próximos 7 dias
  const proximosVencimentos = await c.env.DB.prepare(`
    SELECT cp.*, f.razao_social as fornecedor_nome
    FROM contas_pagar cp
    JOIN fornecedores f ON cp.fornecedor_id = f.id
    WHERE cp.empresa_id = ? AND cp.status = 'ABERTO'
      AND cp.data_vencimento BETWEEN date('now') AND date('now', '+7 days')
    ORDER BY cp.data_vencimento
    LIMIT 10
  `).bind(usuario.empresa_id).all();

  // Maiores credores
  const maioresCredores = await c.env.DB.prepare(`
    SELECT f.id, f.razao_social, f.cpf_cnpj,
           SUM(cp.valor_saldo) as total_devido,
           COUNT(*) as qtd_titulos
    FROM contas_pagar cp
    JOIN fornecedores f ON cp.fornecedor_id = f.id
    WHERE cp.empresa_id = ? AND cp.status = 'ABERTO'
    GROUP BY f.id
    ORDER BY total_devido DESC
    LIMIT 10
  `).bind(usuario.empresa_id).all();

  return c.json({
    success: true,
    data: {
      totais,
      por_categoria: porCategoria.results,
      proximos_vencimentos: proximosVencimentos.results,
      maiores_credores: maioresCredores.results
    }
  });
});

// GET /financeiro/contas-pagar/fluxo-caixa - Projeção
contasPagar.get('/fluxo-caixa', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { dias = '30' } = c.req.query();

  const numDias = parseInt(dias);

  // Contas a pagar por dia
  const pagar = await c.env.DB.prepare(`
    SELECT data_vencimento as data, SUM(valor_saldo) as valor
    FROM contas_pagar
    WHERE empresa_id = ? AND status = 'ABERTO'
      AND data_vencimento BETWEEN date('now') AND date('now', '+${numDias} days')
    GROUP BY data_vencimento
    ORDER BY data_vencimento
  `).bind(usuario.empresa_id).all();

  // Contas a receber por dia
  const receber = await c.env.DB.prepare(`
    SELECT data_vencimento as data, SUM(valor_saldo) as valor
    FROM contas_receber
    WHERE empresa_id = ? AND status = 'ABERTO'
      AND data_vencimento BETWEEN date('now') AND date('now', '+${numDias} days')
    GROUP BY data_vencimento
    ORDER BY data_vencimento
  `).bind(usuario.empresa_id).all();

  return c.json({
    success: true,
    data: {
      periodo_dias: numDias,
      contas_pagar: pagar.results,
      contas_receber: receber.results
    }
  });
});

// GET /financeiro/contas-pagar/:id - Buscar
contasPagar.get('/:id', requirePermission('financeiro', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const conta = await c.env.DB.prepare(`
    SELECT cp.*, 
           f.razao_social as fornecedor_nome, f.cpf_cnpj as fornecedor_documento,
           f.email as fornecedor_email, f.telefone as fornecedor_telefone,
           fi.nome as filial_nome,
           pc.numero as pedido_compra_numero,
           cb.nome as conta_bancaria_nome,
           fp.nome as forma_pagamento_nome
    FROM contas_pagar cp
    JOIN fornecedores f ON cp.fornecedor_id = f.id
    JOIN filiais fi ON cp.filial_id = fi.id
    LEFT JOIN pedidos_compra pc ON cp.pedido_compra_id = pc.id
    LEFT JOIN contas_bancarias cb ON cp.conta_bancaria_id = cb.id
    LEFT JOIN formas_pagamento fp ON cp.forma_pagamento_id = fp.id
    WHERE cp.id = ? AND cp.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  // Pagamentos
  const pagamentos = await c.env.DB.prepare(`
    SELECT p.*, u.nome as usuario_nome
    FROM pagamentos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.conta_pagar_id = ?
    ORDER BY p.data_pagamento DESC
  `).bind(id).all();

  // Formas de pagamento
  for (const pag of pagamentos.results as any[]) {
    const formas = await c.env.DB.prepare(`
      SELECT pf.*, fp.nome as forma_nome
      FROM pagamentos_formas pf
      JOIN formas_pagamento fp ON pf.forma_pagamento_id = fp.id
      WHERE pf.pagamento_id = ?
    `).bind(pag.id).all();
    pag.formas = formas.results;
  }

  return c.json({
    success: true,
    data: {
      ...conta,
      pagamentos: pagamentos.results
    }
  });
});

// POST /financeiro/contas-pagar - Criar
contasPagar.post('/', requirePermission('financeiro', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = contaPagarSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  const valorTotal = data.valor_original + data.valor_juros + data.valor_multa - data.valor_desconto;

  await c.env.DB.prepare(`
    INSERT INTO contas_pagar (
      id, empresa_id, filial_id, fornecedor_id, pedido_compra_id, nfe_entrada_id,
      numero_documento, tipo, categoria, parcela, total_parcelas, valor_original,
      valor_juros, valor_multa, valor_desconto, valor_total, valor_saldo,
      data_emissao, data_vencimento, forma_pagamento_id, conta_bancaria_id,
      centro_custo_id, codigo_barras, linha_digitavel, chave_pix, observacao, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTO')
  `).bind(
    id, usuario.empresa_id, data.filial_id, data.fornecedor_id,
    data.pedido_compra_id || null, data.nfe_entrada_id || null,
    data.numero_documento, data.tipo, data.categoria, data.parcela, data.total_parcelas,
    data.valor_original, data.valor_juros, data.valor_multa, data.valor_desconto,
    valorTotal, valorTotal, data.data_emissao, data.data_vencimento,
    data.forma_pagamento_id || null, data.conta_bancaria_id || null,
    data.centro_custo_id || null, data.codigo_barras || null,
    data.linha_digitavel || null, data.chave_pix || null, data.observacao || null
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'contas_pagar',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id } }, 201);
});

// POST /financeiro/contas-pagar/:id/pagar - Baixar título
contasPagar.post('/:id/pagar', requirePermission('financeiro', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = pagamentoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Buscar conta
  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_pagar WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  if (conta.status !== 'ABERTO') {
    return c.json({ success: false, error: 'Conta já foi paga ou cancelada' }, 400);
  }

  const pagamentoId = crypto.randomUUID();
  const valorLiquido = data.valor_pago + data.valor_juros + data.valor_multa - data.valor_desconto;

  // Criar pagamento
  await c.env.DB.prepare(`
    INSERT INTO pagamentos (
      id, empresa_id, conta_pagar_id, data_pagamento, valor_pago,
      valor_juros, valor_multa, valor_desconto, valor_liquido,
      conta_bancaria_id, usuario_id, observacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    pagamentoId, usuario.empresa_id, id, data.data_pagamento, data.valor_pago,
    data.valor_juros, data.valor_multa, data.valor_desconto, valorLiquido,
    data.conta_bancaria_id || null, usuario.id, data.observacao || null
  ).run();

  // Inserir formas de pagamento
  for (const forma of data.formas) {
    const formaId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO pagamentos_formas (id, pagamento_id, forma_pagamento_id, valor, observacao)
      VALUES (?, ?, ?, ?, ?)
    `).bind(formaId, pagamentoId, forma.forma_pagamento_id, forma.valor, forma.observacao || null).run();
  }

  // Atualizar saldo da conta
  const novoSaldo = conta.valor_saldo - data.valor_pago;
  const novoStatus = novoSaldo <= 0 ? 'PAGO' : 'ABERTO';

  await c.env.DB.prepare(`
    UPDATE contas_pagar SET 
      valor_saldo = ?,
      valor_pago = valor_pago + ?,
      status = ?,
      data_pagamento = CASE WHEN ? <= 0 THEN ? ELSE data_pagamento END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(Math.max(0, novoSaldo), data.valor_pago, novoStatus, novoSaldo, data.data_pagamento, id).run();

  // Se tiver conta bancária, criar movimentação
  if (data.conta_bancaria_id) {
    const movId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO movimentacoes_bancarias (
        id, empresa_id, conta_bancaria_id, tipo, valor, data_movimento,
        descricao, origem_tipo, origem_id
      ) VALUES (?, ?, ?, 'DEBITO', ?, ?, ?, 'PAGAMENTO', ?)
    `).bind(
      movId, usuario.empresa_id, data.conta_bancaria_id, valorLiquido,
      data.data_pagamento, `Pagamento - ${conta.numero_documento}`, pagamentoId
    ).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'PAGAR',
    entidade: 'contas_pagar',
    entidade_id: id,
    dados_anteriores: { saldo: conta.valor_saldo, status: conta.status },
    dados_novos: { saldo: novoSaldo, status: novoStatus, pagamento_id: pagamentoId }
  });

  return c.json({ 
    success: true, 
    data: { pagamento_id: pagamentoId, novo_saldo: Math.max(0, novoSaldo), status: novoStatus } 
  });
});

// POST /financeiro/contas-pagar/:id/cancelar - Cancelar título
contasPagar.post('/:id/cancelar', requirePermission('financeiro', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { motivo } = await c.req.json();

  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_pagar WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE contas_pagar SET status = 'CANCELADO', observacao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(motivo || (conta as any).observacao, id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CANCELAR',
    entidade: 'contas_pagar',
    entidade_id: id,
    dados_anteriores: conta,
    dados_novos: { status: 'CANCELADO', motivo }
  });

  return c.json({ success: true, message: 'Conta cancelada' });
});

// PUT /financeiro/contas-pagar/:id/vencimento - Alterar vencimento
contasPagar.put('/:id/vencimento', requirePermission('financeiro', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { data_vencimento, motivo } = await c.req.json();

  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_pagar WHERE id = ? AND empresa_id = ? AND status = 'ABERTO'
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada ou já baixada' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE contas_pagar SET data_vencimento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(data_vencimento, id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ALTERAR_VENCIMENTO',
    entidade: 'contas_pagar',
    entidade_id: id,
    dados_anteriores: { data_vencimento: (conta as any).data_vencimento },
    dados_novos: { data_vencimento, motivo }
  });

  return c.json({ success: true, message: 'Vencimento alterado' });
});

export default contasPagar;
