// ============================================
// PLANAC ERP - Rotas de Compras
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const compras = new Hono<{ Bindings: Bindings; Variables: Variables }>();

compras.use('/*', requireAuth());

// Schemas
const requisicaoSchema = z.object({
  descricao: z.string(),
  local_estoque_id: z.string().uuid().optional(),
  prioridade: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']).default('NORMAL'),
  data_necessidade: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().positive(),
    observacao: z.string().optional()
  })).min(1)
});

const cotacaoSchema = z.object({
  requisicao_id: z.string().uuid().optional(),
  descricao: z.string(),
  data_limite_resposta: z.string(),
  observacoes: z.string().optional(),
  fornecedores_ids: z.array(z.string().uuid()).min(1),
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().positive(),
    especificacao: z.string().optional()
  })).min(1)
});

const respostaCotacaoSchema = z.object({
  preco_unitario: z.number().positive(),
  prazo_entrega: z.number().int().positive(),
  condicao_pagamento: z.string(),
  validade_proposta: z.string().optional(),
  observacoes: z.string().optional()
});

const pedidoCompraSchema = z.object({
  fornecedor_id: z.string().uuid(),
  cotacao_id: z.string().uuid().optional(),
  data_entrega_prevista: z.string(),
  condicao_pagamento_id: z.string().uuid().optional(),
  local_entrega_id: z.string().uuid().optional(),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().positive(),
    preco_unitario: z.number().positive()
  })).min(1)
});

// ==========================================
// REQUISIÇÕES DE COMPRA
// ==========================================

// GET /compras/requisicoes - Listar
compras.get('/requisicoes', requirePermission('compras', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { status, prioridade, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      r.*,
      u.nome as solicitante_nome,
      le.nome as local_estoque_nome,
      (SELECT COUNT(*) FROM requisicoes_itens WHERE requisicao_id = r.id) as total_itens
    FROM requisicoes_compra r
    JOIN usuarios u ON r.solicitante_id = u.id
    LEFT JOIN locais_estoque le ON r.local_estoque_id = le.id
    WHERE r.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }

  if (prioridade) {
    query += ` AND r.prioridade = ?`;
    params.push(prioridade);
  }

  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY 
    CASE r.prioridade 
      WHEN 'URGENTE' THEN 1 
      WHEN 'ALTA' THEN 2 
      WHEN 'NORMAL' THEN 3 
      ELSE 4 
    END,
    r.created_at DESC
    LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult?.total || 0,
      pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /compras/requisicoes/:id - Buscar
compras.get('/requisicoes/:id', requirePermission('compras', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const requisicao = await c.env.DB.prepare(`
    SELECT 
      r.*,
      u.nome as solicitante_nome,
      ua.nome as aprovador_nome,
      le.nome as local_estoque_nome
    FROM requisicoes_compra r
    JOIN usuarios u ON r.solicitante_id = u.id
    LEFT JOIN usuarios ua ON r.aprovador_id = ua.id
    LEFT JOIN locais_estoque le ON r.local_estoque_id = le.id
    WHERE r.id = ? AND r.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!requisicao) {
    return c.json({ success: false, error: 'Requisição não encontrada' }, 404);
  }

  const itens = await c.env.DB.prepare(`
    SELECT 
      ri.*,
      p.codigo,
      p.descricao as produto_descricao,
      un.sigla as unidade_sigla
    FROM requisicoes_itens ri
    JOIN produtos p ON ri.produto_id = p.id
    LEFT JOIN unidades un ON p.unidade_id = un.id
    WHERE ri.requisicao_id = ?
  `).bind(id).all();

  return c.json({
    success: true,
    data: { ...requisicao, itens: itens.results }
  });
});

// POST /compras/requisicoes - Criar
compras.post('/requisicoes', requirePermission('compras', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = requisicaoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  const seq = await c.env.DB.prepare(`
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 as proximo
    FROM requisicoes_compra WHERE empresa_id = ?
  `).bind(usuario.empresa_id).first<{ proximo: number }>();

  const numero = String(seq?.proximo || 1).padStart(6, '0');

  await c.env.DB.prepare(`
    INSERT INTO requisicoes_compra (
      id, empresa_id, numero, descricao, solicitante_id, local_estoque_id,
      prioridade, data_necessidade, observacoes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE')
  `).bind(
    id, usuario.empresa_id, numero, data.descricao, usuario.id,
    data.local_estoque_id || null, data.prioridade, data.data_necessidade || null,
    data.observacoes || null
  ).run();

  for (const item of data.itens) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO requisicoes_itens (id, requisicao_id, produto_id, quantidade, observacao)
      VALUES (?, ?, ?, ?, ?)
    `).bind(itemId, id, item.produto_id, item.quantidade, item.observacao || null).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'requisicoes_compra',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id, numero } }, 201);
});

// POST /compras/requisicoes/:id/aprovar - Aprovar
compras.post('/requisicoes/:id/aprovar', requirePermission('compras', 'aprovar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const requisicao = await c.env.DB.prepare(`
    SELECT * FROM requisicoes_compra WHERE id = ? AND empresa_id = ? AND status = 'PENDENTE'
  `).bind(id, usuario.empresa_id).first();

  if (!requisicao) {
    return c.json({ success: false, error: 'Requisição não encontrada ou já processada' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE requisicoes_compra SET 
      status = 'APROVADA',
      aprovador_id = ?,
      data_aprovacao = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(usuario.id, id).run();

  return c.json({ success: true, message: 'Requisição aprovada' });
});

// POST /compras/requisicoes/:id/rejeitar - Rejeitar
compras.post('/requisicoes/:id/rejeitar', requirePermission('compras', 'aprovar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const requisicao = await c.env.DB.prepare(`
    SELECT * FROM requisicoes_compra WHERE id = ? AND empresa_id = ? AND status = 'PENDENTE'
  `).bind(id, usuario.empresa_id).first();

  if (!requisicao) {
    return c.json({ success: false, error: 'Requisição não encontrada ou já processada' }, 404);
  }

  const { motivo } = body;

  await c.env.DB.prepare(`
    UPDATE requisicoes_compra SET 
      status = 'REJEITADA',
      aprovador_id = ?,
      data_aprovacao = CURRENT_TIMESTAMP,
      observacoes = COALESCE(observacoes || ' | ', '') || 'REJEITADA: ' || ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(usuario.id, motivo || 'Sem motivo informado', id).run();

  return c.json({ success: true, message: 'Requisição rejeitada' });
});

// ==========================================
// COTAÇÕES
// ==========================================

// GET /compras/cotacoes - Listar
compras.get('/cotacoes', requirePermission('compras', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { status, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      c.*,
      u.nome as comprador_nome,
      (SELECT COUNT(*) FROM cotacoes_itens WHERE cotacao_id = c.id) as total_itens,
      (SELECT COUNT(*) FROM cotacoes_fornecedores WHERE cotacao_id = c.id) as total_fornecedores,
      (SELECT COUNT(*) FROM cotacoes_fornecedores WHERE cotacao_id = c.id AND respondido = 1) as fornecedores_responderam
    FROM cotacoes c
    JOIN usuarios u ON c.comprador_id = u.id
    WHERE c.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult?.total || 0,
      pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /compras/cotacoes/:id - Buscar
compras.get('/cotacoes/:id', requirePermission('compras', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const cotacao = await c.env.DB.prepare(`
    SELECT 
      c.*,
      u.nome as comprador_nome,
      r.numero as requisicao_numero
    FROM cotacoes c
    JOIN usuarios u ON c.comprador_id = u.id
    LEFT JOIN requisicoes_compra r ON c.requisicao_id = r.id
    WHERE c.id = ? AND c.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cotacao) {
    return c.json({ success: false, error: 'Cotação não encontrada' }, 404);
  }

  const itens = await c.env.DB.prepare(`
    SELECT 
      ci.*,
      p.codigo,
      p.descricao as produto_descricao,
      un.sigla as unidade_sigla
    FROM cotacoes_itens ci
    JOIN produtos p ON ci.produto_id = p.id
    LEFT JOIN unidades un ON p.unidade_id = un.id
    WHERE ci.cotacao_id = ?
  `).bind(id).all();

  const fornecedores = await c.env.DB.prepare(`
    SELECT 
      cf.*,
      f.razao_social as fornecedor_nome,
      f.cnpj as fornecedor_cnpj,
      f.email as fornecedor_email
    FROM cotacoes_fornecedores cf
    JOIN fornecedores f ON cf.fornecedor_id = f.id
    WHERE cf.cotacao_id = ?
    ORDER BY cf.valor_total
  `).bind(id).all();

  return c.json({
    success: true,
    data: { ...cotacao, itens: itens.results, fornecedores: fornecedores.results }
  });
});

// POST /compras/cotacoes - Criar
compras.post('/cotacoes', requirePermission('compras', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = cotacaoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  const seq = await c.env.DB.prepare(`
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 as proximo
    FROM cotacoes WHERE empresa_id = ?
  `).bind(usuario.empresa_id).first<{ proximo: number }>();

  const numero = String(seq?.proximo || 1).padStart(6, '0');

  await c.env.DB.prepare(`
    INSERT INTO cotacoes (
      id, empresa_id, numero, requisicao_id, descricao, comprador_id,
      data_limite_resposta, observacoes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ABERTA')
  `).bind(
    id, usuario.empresa_id, numero, data.requisicao_id || null, data.descricao,
    usuario.id, data.data_limite_resposta, data.observacoes || null
  ).run();

  // Itens
  for (const item of data.itens) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO cotacoes_itens (id, cotacao_id, produto_id, quantidade, especificacao)
      VALUES (?, ?, ?, ?, ?)
    `).bind(itemId, id, item.produto_id, item.quantidade, item.especificacao || null).run();
  }

  // Fornecedores
  for (const fornecedorId of data.fornecedores_ids) {
    const cfId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO cotacoes_fornecedores (id, cotacao_id, fornecedor_id, respondido)
      VALUES (?, ?, ?, 0)
    `).bind(cfId, id, fornecedorId).run();
  }

  // Atualizar status da requisição se houver
  if (data.requisicao_id) {
    await c.env.DB.prepare(`
      UPDATE requisicoes_compra SET status = 'EM_COTACAO', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(data.requisicao_id).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'cotacoes',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id, numero } }, 201);
});

// POST /compras/cotacoes/:id/resposta/:fornecedor_id - Registrar resposta
compras.post('/cotacoes/:id/resposta/:fornecedor_id', requirePermission('compras', 'editar'), async (c) => {
  const { id, fornecedor_id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const cotacaoFornecedor = await c.env.DB.prepare(`
    SELECT cf.* FROM cotacoes_fornecedores cf
    JOIN cotacoes c ON cf.cotacao_id = c.id
    WHERE cf.cotacao_id = ? AND cf.fornecedor_id = ? AND c.empresa_id = ?
  `).bind(id, fornecedor_id, usuario.empresa_id).first();

  if (!cotacaoFornecedor) {
    return c.json({ success: false, error: 'Cotação/fornecedor não encontrado' }, 404);
  }

  const validation = respostaCotacaoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Calcular total (precisa dos itens)
  const itens = await c.env.DB.prepare(`
    SELECT quantidade FROM cotacoes_itens WHERE cotacao_id = ?
  `).bind(id).all();

  const valorTotal = (itens.results as any[]).reduce((acc, item) => 
    acc + (item.quantidade * data.preco_unitario), 0
  );

  await c.env.DB.prepare(`
    UPDATE cotacoes_fornecedores SET
      preco_unitario = ?,
      prazo_entrega = ?,
      condicao_pagamento = ?,
      validade_proposta = ?,
      observacoes = ?,
      valor_total = ?,
      respondido = 1,
      data_resposta = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE cotacao_id = ? AND fornecedor_id = ?
  `).bind(
    data.preco_unitario, data.prazo_entrega, data.condicao_pagamento,
    data.validade_proposta || null, data.observacoes || null, valorTotal,
    id, fornecedor_id
  ).run();

  return c.json({ success: true, message: 'Resposta registrada' });
});

// POST /compras/cotacoes/:id/selecionar/:fornecedor_id - Selecionar vencedor
compras.post('/cotacoes/:id/selecionar/:fornecedor_id', requirePermission('compras', 'aprovar'), async (c) => {
  const { id, fornecedor_id } = c.req.param();
  const usuario = c.get('usuario');

  const cotacao = await c.env.DB.prepare(`
    SELECT * FROM cotacoes WHERE id = ? AND empresa_id = ? AND status = 'ABERTA'
  `).bind(id, usuario.empresa_id).first();

  if (!cotacao) {
    return c.json({ success: false, error: 'Cotação não encontrada ou já finalizada' }, 404);
  }

  // Marcar como selecionado
  await c.env.DB.prepare(`
    UPDATE cotacoes_fornecedores SET selecionado = 0 WHERE cotacao_id = ?
  `).bind(id).run();

  await c.env.DB.prepare(`
    UPDATE cotacoes_fornecedores SET selecionado = 1, updated_at = CURRENT_TIMESTAMP
    WHERE cotacao_id = ? AND fornecedor_id = ?
  `).bind(id, fornecedor_id).run();

  await c.env.DB.prepare(`
    UPDATE cotacoes SET status = 'FINALIZADA', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true, message: 'Fornecedor selecionado' });
});

// ==========================================
// PEDIDOS DE COMPRA
// ==========================================

// GET /compras/pedidos - Listar
compras.get('/pedidos', requirePermission('compras', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { status, fornecedor_id, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      pc.*,
      f.razao_social as fornecedor_nome,
      u.nome as comprador_nome,
      (SELECT COUNT(*) FROM pedidos_compra_itens WHERE pedido_compra_id = pc.id) as total_itens
    FROM pedidos_compra pc
    JOIN fornecedores f ON pc.fornecedor_id = f.id
    JOIN usuarios u ON pc.comprador_id = u.id
    WHERE pc.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND pc.status = ?`;
    params.push(status);
  }

  if (fornecedor_id) {
    query += ` AND pc.fornecedor_id = ?`;
    params.push(fornecedor_id);
  }

  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY pc.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult?.total || 0,
      pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /compras/pedidos/:id - Buscar
compras.get('/pedidos/:id', requirePermission('compras', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const pedido = await c.env.DB.prepare(`
    SELECT 
      pc.*,
      f.razao_social as fornecedor_nome,
      f.cnpj as fornecedor_cnpj,
      u.nome as comprador_nome,
      le.nome as local_entrega_nome,
      cp.descricao as condicao_pagamento_descricao
    FROM pedidos_compra pc
    JOIN fornecedores f ON pc.fornecedor_id = f.id
    JOIN usuarios u ON pc.comprador_id = u.id
    LEFT JOIN locais_estoque le ON pc.local_entrega_id = le.id
    LEFT JOIN condicoes_pagamento cp ON pc.condicao_pagamento_id = cp.id
    WHERE pc.id = ? AND pc.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!pedido) {
    return c.json({ success: false, error: 'Pedido não encontrado' }, 404);
  }

  const itens = await c.env.DB.prepare(`
    SELECT 
      pci.*,
      p.codigo,
      p.descricao as produto_descricao,
      un.sigla as unidade_sigla
    FROM pedidos_compra_itens pci
    JOIN produtos p ON pci.produto_id = p.id
    LEFT JOIN unidades un ON p.unidade_id = un.id
    WHERE pci.pedido_compra_id = ?
  `).bind(id).all();

  return c.json({
    success: true,
    data: { ...pedido, itens: itens.results }
  });
});

// POST /compras/pedidos - Criar
compras.post('/pedidos', requirePermission('compras', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = pedidoCompraSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  const seq = await c.env.DB.prepare(`
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 as proximo
    FROM pedidos_compra WHERE empresa_id = ?
  `).bind(usuario.empresa_id).first<{ proximo: number }>();

  const numero = String(seq?.proximo || 1).padStart(6, '0');

  // Calcular totais
  const valorTotal = data.itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);

  await c.env.DB.prepare(`
    INSERT INTO pedidos_compra (
      id, empresa_id, numero, fornecedor_id, cotacao_id, comprador_id,
      data_entrega_prevista, condicao_pagamento_id, local_entrega_id,
      valor_total, observacoes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RASCUNHO')
  `).bind(
    id, usuario.empresa_id, numero, data.fornecedor_id, data.cotacao_id || null,
    usuario.id, data.data_entrega_prevista, data.condicao_pagamento_id || null,
    data.local_entrega_id || null, valorTotal, data.observacoes || null
  ).run();

  for (const item of data.itens) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO pedidos_compra_itens (
        id, pedido_compra_id, produto_id, quantidade, preco_unitario, valor_total
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      itemId, id, item.produto_id, item.quantidade, item.preco_unitario,
      item.quantidade * item.preco_unitario
    ).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'pedidos_compra',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id, numero } }, 201);
});

// POST /compras/pedidos/:id/enviar - Enviar para fornecedor
compras.post('/pedidos/:id/enviar', requirePermission('compras', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const pedido = await c.env.DB.prepare(`
    SELECT * FROM pedidos_compra WHERE id = ? AND empresa_id = ? AND status = 'RASCUNHO'
  `).bind(id, usuario.empresa_id).first();

  if (!pedido) {
    return c.json({ success: false, error: 'Pedido não encontrado ou já enviado' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE pedidos_compra SET 
      status = 'ENVIADO',
      data_envio = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true, message: 'Pedido enviado ao fornecedor' });
});

// POST /compras/pedidos/:id/confirmar - Confirmar recebimento
compras.post('/pedidos/:id/confirmar', requirePermission('compras', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const pedido = await c.env.DB.prepare(`
    SELECT * FROM pedidos_compra WHERE id = ? AND empresa_id = ? AND status = 'ENVIADO'
  `).bind(id, usuario.empresa_id).first();

  if (!pedido) {
    return c.json({ success: false, error: 'Pedido não encontrado ou status inválido' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE pedidos_compra SET status = 'CONFIRMADO', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true, message: 'Pedido confirmado pelo fornecedor' });
});

// POST /compras/pedidos/:id/receber - Receber mercadorias
compras.post('/pedidos/:id/receber', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const pedido = await c.env.DB.prepare(`
    SELECT * FROM pedidos_compra WHERE id = ? AND empresa_id = ? AND status IN ('ENVIADO', 'CONFIRMADO')
  `).bind(id, usuario.empresa_id).first<any>();

  if (!pedido) {
    return c.json({ success: false, error: 'Pedido não encontrado ou status inválido' }, 404);
  }

  const { nota_fiscal, local_estoque_id } = body;
  const localId = local_estoque_id || pedido.local_entrega_id;

  if (!localId) {
    return c.json({ success: false, error: 'Informe o local de estoque para recebimento' }, 400);
  }

  // Buscar itens
  const itens = await c.env.DB.prepare(`
    SELECT * FROM pedidos_compra_itens WHERE pedido_compra_id = ?
  `).bind(id).all();

  // Dar entrada no estoque
  for (const item of itens.results as any[]) {
    // Verificar se já existe estoque
    const estoqueExistente = await c.env.DB.prepare(`
      SELECT id, quantidade FROM estoque WHERE produto_id = ? AND local_estoque_id = ?
    `).bind(item.produto_id, localId).first<any>();

    if (estoqueExistente) {
      await c.env.DB.prepare(`
        UPDATE estoque SET 
          quantidade = quantidade + ?,
          custo_medio = ((custo_medio * quantidade) + (? * ?)) / (quantidade + ?),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(item.quantidade, item.preco_unitario, item.quantidade, item.quantidade, estoqueExistente.id).run();
    } else {
      const estoqueId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO estoque (id, empresa_id, produto_id, local_estoque_id, quantidade, custo_medio)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(estoqueId, usuario.empresa_id, item.produto_id, localId, item.quantidade, item.preco_unitario).run();
    }

    // Movimentação
    const movId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO estoque_movimentacoes (
        id, empresa_id, produto_id, local_estoque_id, tipo, quantidade,
        custo_unitario, motivo, referencia_tipo, referencia_id, usuario_id
      ) VALUES (?, ?, ?, ?, 'ENTRADA', ?, ?, 'COMPRA', 'PEDIDO_COMPRA', ?, ?)
    `).bind(
      movId, usuario.empresa_id, item.produto_id, localId, item.quantidade,
      item.preco_unitario, id, usuario.id
    ).run();

    // Atualizar quantidade recebida no item
    await c.env.DB.prepare(`
      UPDATE pedidos_compra_itens SET quantidade_recebida = ? WHERE id = ?
    `).bind(item.quantidade, item.id).run();
  }

  await c.env.DB.prepare(`
    UPDATE pedidos_compra SET 
      status = 'RECEBIDO',
      data_recebimento = CURRENT_TIMESTAMP,
      nota_fiscal = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(nota_fiscal || null, id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'RECEBER',
    entidade: 'pedidos_compra',
    entidade_id: id,
    dados_novos: { nota_fiscal, local_estoque_id: localId }
  });

  return c.json({ success: true, message: 'Mercadorias recebidas e estoque atualizado' });
});

// DELETE /compras/pedidos/:id - Cancelar
compras.delete('/pedidos/:id', requirePermission('compras', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const pedido = await c.env.DB.prepare(`
    SELECT * FROM pedidos_compra WHERE id = ? AND empresa_id = ? AND status IN ('RASCUNHO', 'ENVIADO')
  `).bind(id, usuario.empresa_id).first();

  if (!pedido) {
    return c.json({ success: false, error: 'Pedido não encontrado ou não pode ser cancelado' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE pedidos_compra SET status = 'CANCELADO', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true, message: 'Pedido cancelado' });
});

export default compras;
