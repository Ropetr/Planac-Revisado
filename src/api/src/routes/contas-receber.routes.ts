// ============================================
// PLANAC ERP - Rotas de Contas a Receber
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const contasReceber = new Hono<{ Bindings: Bindings; Variables: Variables }>();

contasReceber.use('/*', requireAuth());

// Schemas
const contaReceberSchema = z.object({
  filial_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  pedido_id: z.string().uuid().optional(),
  nfe_id: z.string().uuid().optional(),
  numero_documento: z.string().max(50),
  tipo: z.enum(['DUPLICATA', 'BOLETO', 'CHEQUE', 'CARTAO', 'PIX', 'OUTROS']).default('DUPLICATA'),
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
  nosso_numero: z.string().optional(),
  linha_digitavel: z.string().optional(),
  codigo_barras: z.string().optional(),
  pix_copia_cola: z.string().optional(),
  observacao: z.string().optional()
});

const recebimentoSchema = z.object({
  data_recebimento: z.string(),
  valor_recebido: z.number().min(0.01),
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

// GET /financeiro/contas-receber - Listar
contasReceber.get('/', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { 
    page = '1', limit = '20', status, cliente_id, data_vencimento_inicio, 
    data_vencimento_fim, vencidas, filial_id 
  } = c.req.query();

  let query = `
    SELECT cr.*, 
           c.razao_social as cliente_nome, c.cpf_cnpj as cliente_documento,
           f.nome as filial_nome,
           p.numero as pedido_numero
    FROM contas_receber cr
    JOIN clientes c ON cr.cliente_id = c.id
    JOIN filiais f ON cr.filial_id = f.id
    LEFT JOIN pedidos p ON cr.pedido_id = p.id
    WHERE cr.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND cr.status = ?`;
    params.push(status);
  }

  if (cliente_id) {
    query += ` AND cr.cliente_id = ?`;
    params.push(cliente_id);
  }

  if (data_vencimento_inicio) {
    query += ` AND cr.data_vencimento >= ?`;
    params.push(data_vencimento_inicio);
  }

  if (data_vencimento_fim) {
    query += ` AND cr.data_vencimento <= ?`;
    params.push(data_vencimento_fim);
  }

  if (vencidas === 'true') {
    query += ` AND cr.data_vencimento < date('now') AND cr.status = 'ABERTO'`;
  }

  if (filial_id) {
    query += ` AND cr.filial_id = ?`;
    params.push(filial_id);
  }

  // Contagem
  const countQuery = query.replace(/SELECT cr\.\*, [\s\S]*? FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  // Paginação
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  query += ` ORDER BY cr.data_vencimento ASC LIMIT ? OFFSET ?`;
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

// GET /financeiro/contas-receber/resumo - Dashboard
contasReceber.get('/resumo', requirePermission('financeiro', 'listar'), async (c) => {
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
      SUM(CASE WHEN status = 'RECEBIDO' AND strftime('%Y-%m', data_recebimento) = strftime('%Y-%m', 'now') THEN valor_recebido ELSE 0 END) as recebido_mes,
      COUNT(CASE WHEN status = 'ABERTO' THEN 1 END) as qtd_aberto,
      COUNT(CASE WHEN status = 'ABERTO' AND data_vencimento < date('now') THEN 1 END) as qtd_vencido
    FROM contas_receber WHERE empresa_id = ?${filtroFilial}
  `).bind(...params).first();

  // Vencimentos próximos 7 dias
  const proximosVencimentos = await c.env.DB.prepare(`
    SELECT cr.*, c.razao_social as cliente_nome
    FROM contas_receber cr
    JOIN clientes c ON cr.cliente_id = c.id
    WHERE cr.empresa_id = ? AND cr.status = 'ABERTO'
      AND cr.data_vencimento BETWEEN date('now') AND date('now', '+7 days')
    ORDER BY cr.data_vencimento
    LIMIT 10
  `).bind(usuario.empresa_id).all();

  // Maiores devedores
  const maioresDevedores = await c.env.DB.prepare(`
    SELECT c.id, c.razao_social, c.cpf_cnpj,
           SUM(cr.valor_saldo) as total_devido,
           COUNT(*) as qtd_titulos
    FROM contas_receber cr
    JOIN clientes c ON cr.cliente_id = c.id
    WHERE cr.empresa_id = ? AND cr.status = 'ABERTO'
    GROUP BY c.id
    ORDER BY total_devido DESC
    LIMIT 10
  `).bind(usuario.empresa_id).all();

  return c.json({
    success: true,
    data: {
      totais,
      proximos_vencimentos: proximosVencimentos.results,
      maiores_devedores: maioresDevedores.results
    }
  });
});

// GET /financeiro/contas-receber/:id - Buscar
contasReceber.get('/:id', requirePermission('financeiro', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const conta = await c.env.DB.prepare(`
    SELECT cr.*, 
           c.razao_social as cliente_nome, c.cpf_cnpj as cliente_documento,
           c.email as cliente_email, c.telefone as cliente_telefone,
           f.nome as filial_nome,
           p.numero as pedido_numero,
           cb.nome as conta_bancaria_nome,
           fp.nome as forma_pagamento_nome
    FROM contas_receber cr
    JOIN clientes c ON cr.cliente_id = c.id
    JOIN filiais f ON cr.filial_id = f.id
    LEFT JOIN pedidos p ON cr.pedido_id = p.id
    LEFT JOIN contas_bancarias cb ON cr.conta_bancaria_id = cb.id
    LEFT JOIN formas_pagamento fp ON cr.forma_pagamento_id = fp.id
    WHERE cr.id = ? AND cr.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  // Recebimentos
  const recebimentos = await c.env.DB.prepare(`
    SELECT r.*, u.nome as usuario_nome
    FROM recebimentos r
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.conta_receber_id = ?
    ORDER BY r.data_recebimento DESC
  `).bind(id).all();

  // Formas de pagamento dos recebimentos
  for (const rec of recebimentos.results as any[]) {
    const formas = await c.env.DB.prepare(`
      SELECT rf.*, fp.nome as forma_nome
      FROM recebimentos_formas rf
      JOIN formas_pagamento fp ON rf.forma_pagamento_id = fp.id
      WHERE rf.recebimento_id = ?
    `).bind(rec.id).all();
    rec.formas = formas.results;
  }

  return c.json({
    success: true,
    data: {
      ...conta,
      recebimentos: recebimentos.results
    }
  });
});

// POST /financeiro/contas-receber - Criar
contasReceber.post('/', requirePermission('financeiro', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = contaReceberSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  const valorTotal = data.valor_original + data.valor_juros + data.valor_multa - data.valor_desconto;

  await c.env.DB.prepare(`
    INSERT INTO contas_receber (
      id, empresa_id, filial_id, cliente_id, pedido_id, nfe_id, numero_documento,
      tipo, parcela, total_parcelas, valor_original, valor_juros, valor_multa,
      valor_desconto, valor_total, valor_saldo, data_emissao, data_vencimento,
      forma_pagamento_id, conta_bancaria_id, nosso_numero, linha_digitavel,
      codigo_barras, pix_copia_cola, observacao, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTO')
  `).bind(
    id, usuario.empresa_id, data.filial_id, data.cliente_id, data.pedido_id || null,
    data.nfe_id || null, data.numero_documento, data.tipo, data.parcela, data.total_parcelas,
    data.valor_original, data.valor_juros, data.valor_multa, data.valor_desconto,
    valorTotal, valorTotal, data.data_emissao, data.data_vencimento,
    data.forma_pagamento_id || null, data.conta_bancaria_id || null,
    data.nosso_numero || null, data.linha_digitavel || null,
    data.codigo_barras || null, data.pix_copia_cola || null, data.observacao || null
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'contas_receber',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id } }, 201);
});

// POST /financeiro/contas-receber/:id/receber - Baixar título
contasReceber.post('/:id/receber', requirePermission('financeiro', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = recebimentoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Buscar conta
  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_receber WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  if (conta.status !== 'ABERTO') {
    return c.json({ success: false, error: 'Conta já foi baixada ou cancelada' }, 400);
  }

  const recebimentoId = crypto.randomUUID();
  const valorLiquido = data.valor_recebido + data.valor_juros + data.valor_multa - data.valor_desconto;

  // Criar recebimento
  await c.env.DB.prepare(`
    INSERT INTO recebimentos (
      id, empresa_id, conta_receber_id, data_recebimento, valor_recebido,
      valor_juros, valor_multa, valor_desconto, valor_liquido,
      conta_bancaria_id, usuario_id, observacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    recebimentoId, usuario.empresa_id, id, data.data_recebimento, data.valor_recebido,
    data.valor_juros, data.valor_multa, data.valor_desconto, valorLiquido,
    data.conta_bancaria_id || null, usuario.id, data.observacao || null
  ).run();

  // Inserir formas de pagamento
  for (const forma of data.formas) {
    const formaId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO recebimentos_formas (id, recebimento_id, forma_pagamento_id, valor, observacao)
      VALUES (?, ?, ?, ?, ?)
    `).bind(formaId, recebimentoId, forma.forma_pagamento_id, forma.valor, forma.observacao || null).run();
  }

  // Atualizar saldo da conta
  const novoSaldo = conta.valor_saldo - data.valor_recebido;
  const novoStatus = novoSaldo <= 0 ? 'RECEBIDO' : 'ABERTO';

  await c.env.DB.prepare(`
    UPDATE contas_receber SET 
      valor_saldo = ?,
      valor_recebido = valor_recebido + ?,
      status = ?,
      data_recebimento = CASE WHEN ? <= 0 THEN ? ELSE data_recebimento END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(Math.max(0, novoSaldo), data.valor_recebido, novoStatus, novoSaldo, data.data_recebimento, id).run();

  // Se tiver conta bancária, criar movimentação
  if (data.conta_bancaria_id) {
    const movId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO movimentacoes_bancarias (
        id, empresa_id, conta_bancaria_id, tipo, valor, data_movimento,
        descricao, origem_tipo, origem_id
      ) VALUES (?, ?, ?, 'CREDITO', ?, ?, ?, 'RECEBIMENTO', ?)
    `).bind(
      movId, usuario.empresa_id, data.conta_bancaria_id, valorLiquido,
      data.data_recebimento, `Recebimento - ${conta.numero_documento}`, recebimentoId
    ).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'RECEBER',
    entidade: 'contas_receber',
    entidade_id: id,
    dados_anteriores: { saldo: conta.valor_saldo, status: conta.status },
    dados_novos: { saldo: novoSaldo, status: novoStatus, recebimento_id: recebimentoId }
  });

  return c.json({ 
    success: true, 
    data: { recebimento_id: recebimentoId, novo_saldo: Math.max(0, novoSaldo), status: novoStatus } 
  });
});

// POST /financeiro/contas-receber/:id/cancelar - Cancelar título
contasReceber.post('/:id/cancelar', requirePermission('financeiro', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { motivo } = await c.req.json();

  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_receber WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE contas_receber SET status = 'CANCELADO', observacao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(motivo || (conta as any).observacao, id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CANCELAR',
    entidade: 'contas_receber',
    entidade_id: id,
    dados_anteriores: conta,
    dados_novos: { status: 'CANCELADO', motivo }
  });

  return c.json({ success: true, message: 'Conta cancelada' });
});

// PUT /financeiro/contas-receber/:id/vencimento - Alterar vencimento
contasReceber.put('/:id/vencimento', requirePermission('financeiro', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { data_vencimento, motivo } = await c.req.json();

  const conta = await c.env.DB.prepare(`
    SELECT * FROM contas_receber WHERE id = ? AND empresa_id = ? AND status = 'ABERTO'
  `).bind(id, usuario.empresa_id).first();

  if (!conta) {
    return c.json({ success: false, error: 'Conta não encontrada ou já baixada' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE contas_receber SET data_vencimento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(data_vencimento, id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ALTERAR_VENCIMENTO',
    entidade: 'contas_receber',
    entidade_id: id,
    dados_anteriores: { data_vencimento: (conta as any).data_vencimento },
    dados_novos: { data_vencimento, motivo }
  });

  return c.json({ success: true, message: 'Vencimento alterado' });
});

export default contasReceber;
