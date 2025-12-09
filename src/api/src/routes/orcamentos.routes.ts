// =============================================
// 🏢 PLANAC ERP - Rotas de Orçamentos
// =============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const orcamentos = new Hono<{ Bindings: Bindings; Variables: Variables }>();

orcamentos.use('*', authMiddleware());

// Schemas
const criarOrcamentoSchema = z.object({
  filial_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  vendedor_id: z.string().uuid().optional(),
  tabela_preco_id: z.string().uuid().optional(),
  condicao_pagamento_id: z.string().uuid().optional(),
  validade_dias: z.number().min(1).default(30),
  observacao: z.string().optional(),
  observacao_interna: z.string().optional(),
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().positive(),
    preco_unitario: z.number().min(0),
    desconto_percentual: z.number().min(0).max(100).default(0),
    observacao: z.string().optional()
  })).min(1, 'Adicione pelo menos um item')
});

const itemSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().positive(),
  preco_unitario: z.number().min(0),
  desconto_percentual: z.number().min(0).max(100).default(0),
  observacao: z.string().optional()
});

// GET /orcamentos - Listar
orcamentos.get('/', requirePermission('orcamentos', 'visualizar'), async (c) => {
  const user = c.get('user');
  const { page = '1', limit = '20', status, cliente_id, vendedor_id, data_inicio, data_fim } = c.req.query();
  
  let where = 'WHERE o.empresa_id = ?';
  const params: any[] = [user.empresa_id];
  
  if (status) {
    where += ' AND o.status = ?';
    params.push(status);
  }
  
  if (cliente_id) {
    where += ' AND o.cliente_id = ?';
    params.push(cliente_id);
  }
  
  if (vendedor_id) {
    where += ' AND o.vendedor_id = ?';
    params.push(vendedor_id);
  }
  
  if (data_inicio) {
    where += ' AND DATE(o.data_emissao) >= ?';
    params.push(data_inicio);
  }
  
  if (data_fim) {
    where += ' AND DATE(o.data_emissao) <= ?';
    params.push(data_fim);
  }
  
  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM orcamentos o ${where}`
  ).bind(...params).first<{ total: number }>();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const data = await c.env.DB.prepare(`
    SELECT 
      o.*,
      f.nome as filial_nome,
      (SELECT COUNT(*) FROM orcamentos_itens WHERE orcamento_id = o.id) as total_itens
    FROM orcamentos o
    JOIN filiais f ON o.filial_id = f.id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, parseInt(limit), offset).all();
  
  return c.json({
    success: true,
    data: data.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult?.total || 0,
      pages: Math.ceil((countResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /orcamentos/:id - Buscar por ID
orcamentos.get('/:id', requirePermission('orcamentos', 'visualizar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT o.*, f.nome as filial_nome
    FROM orcamentos o
    JOIN filiais f ON o.filial_id = f.id
    WHERE o.id = ? AND o.empresa_id = ?
  `).bind(id, user.empresa_id).first();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  // Buscar itens
  const itens = await c.env.DB.prepare(`
    SELECT 
      oi.*,
      p.codigo as produto_codigo, p.nome as produto_nome,
      um.sigla as unidade_sigla
    FROM orcamentos_itens oi
    JOIN produtos p ON oi.produto_id = p.id
    LEFT JOIN unidades_medida um ON p.unidade_medida_id = um.id
    WHERE oi.orcamento_id = ?
    ORDER BY oi.sequencia
  `).bind(id).all();
  
  // Buscar histórico
  const historico = await c.env.DB.prepare(`
    SELECT oh.*, u.nome as usuario_nome
    FROM orcamentos_historico oh
    LEFT JOIN usuarios u ON oh.usuario_id = u.id
    WHERE oh.orcamento_id = ?
    ORDER BY oh.created_at DESC
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: {
      ...orcamento,
      itens: itens.results,
      historico: historico.results
    }
  });
});

// POST /orcamentos - Criar
orcamentos.post('/', requirePermission('orcamentos', 'criar'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const validacao = criarOrcamentoSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validacao.error.errors }, 400);
  }
  
  const dados = validacao.data;
  
  // Buscar dados do cliente para snapshot
  const cliente = await c.env.DB.prepare(`
    SELECT id, razao_social, nome_fantasia, cpf_cnpj, email, telefone
    FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(dados.cliente_id, user.empresa_id).first<any>();
  
  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }
  
  // Gerar número do orçamento
  const ultimoNumero = await c.env.DB.prepare(`
    SELECT MAX(CAST(numero AS INTEGER)) as ultimo
    FROM orcamentos WHERE empresa_id = ? AND filial_id = ?
  `).bind(user.empresa_id, dados.filial_id).first<{ ultimo: number }>();
  
  const numero = String((ultimoNumero?.ultimo || 0) + 1).padStart(6, '0');
  
  // Buscar dados do vendedor se informado
  let vendedorNome = null;
  if (dados.vendedor_id) {
    const vendedor = await c.env.DB.prepare('SELECT nome FROM usuarios WHERE id = ?')
      .bind(dados.vendedor_id).first<{ nome: string }>();
    vendedorNome = vendedor?.nome;
  }
  
  // Calcular valores
  let valorSubtotal = 0;
  let valorDesconto = 0;
  
  for (const item of dados.itens) {
    const subtotalItem = item.quantidade * item.preco_unitario;
    const descontoItem = subtotalItem * (item.desconto_percentual / 100);
    valorSubtotal += subtotalItem;
    valorDesconto += descontoItem;
  }
  
  const valorTotal = valorSubtotal - valorDesconto;
  
  const id = crypto.randomUUID();
  const dataEmissao = new Date().toISOString();
  const dataValidade = new Date(Date.now() + dados.validade_dias * 24 * 60 * 60 * 1000).toISOString();
  
  // Criar orçamento
  await c.env.DB.prepare(`
    INSERT INTO orcamentos (
      id, empresa_id, filial_id, numero, cliente_id, cliente_nome, cliente_cpf_cnpj,
      vendedor_id, vendedor_nome, tabela_preco_id, condicao_pagamento_id,
      status, data_emissao, validade_dias, data_validade,
      valor_subtotal, valor_desconto, valor_frete, valor_total,
      observacao, observacao_interna, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho', ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
  `).bind(
    id, user.empresa_id, dados.filial_id, numero,
    cliente.id, cliente.razao_social || cliente.nome_fantasia, cliente.cpf_cnpj,
    dados.vendedor_id || null, vendedorNome,
    dados.tabela_preco_id || null, dados.condicao_pagamento_id || null,
    dataEmissao, dados.validade_dias, dataValidade,
    valorSubtotal, valorDesconto, valorTotal,
    dados.observacao || null, dados.observacao_interna || null,
    dataEmissao, dataEmissao
  ).run();
  
  // Criar itens
  let sequencia = 1;
  for (const item of dados.itens) {
    const produto = await c.env.DB.prepare(`
      SELECT codigo, nome, ncm FROM produtos WHERE id = ?
    `).bind(item.produto_id).first<any>();
    
    const subtotalItem = item.quantidade * item.preco_unitario;
    const descontoItem = subtotalItem * (item.desconto_percentual / 100);
    
    await c.env.DB.prepare(`
      INSERT INTO orcamentos_itens (
        id, orcamento_id, sequencia, produto_id, produto_codigo, produto_nome,
        quantidade, preco_unitario, desconto_percentual, valor_desconto,
        valor_subtotal, valor_total, observacao, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), id, sequencia++,
      item.produto_id, produto.codigo, produto.nome,
      item.quantidade, item.preco_unitario, item.desconto_percentual,
      descontoItem, subtotalItem, subtotalItem - descontoItem,
      item.observacao || null, dataEmissao
    ).run();
  }
  
  // Registrar histórico
  await c.env.DB.prepare(`
    INSERT INTO orcamentos_historico (id, orcamento_id, status_anterior, status_novo, observacao, usuario_id, created_at)
    VALUES (?, ?, NULL, 'rascunho', 'Orçamento criado', ?, ?)
  `).bind(crypto.randomUUID(), id, user.id, dataEmissao).run();
  
  await registrarAuditoria(c.env.DB, {
    empresa_id: user.empresa_id,
    usuario_id: user.id,
    acao: 'criar',
    tabela: 'orcamentos',
    registro_id: id,
    dados_novos: { numero, cliente_nome: cliente.razao_social, valor_total: valorTotal }
  });
  
  return c.json({ success: true, data: { id, numero }, message: 'Orçamento criado com sucesso' }, 201);
});

// PUT /orcamentos/:id - Editar
orcamentos.put('/:id', requirePermission('orcamentos', 'editar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT * FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  if (!['rascunho', 'enviado'].includes(orcamento.status)) {
    return c.json({ success: false, error: 'Orçamento não pode ser editado neste status' }, 400);
  }
  
  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [new Date().toISOString()];
  
  const campos = ['vendedor_id', 'tabela_preco_id', 'condicao_pagamento_id', 
    'validade_dias', 'observacao', 'observacao_interna', 'valor_frete'];
  
  for (const campo of campos) {
    if (body[campo] !== undefined) {
      updates.push(`${campo} = ?`);
      params.push(body[campo]);
    }
  }
  
  // Recalcular data de validade se dias mudou
  if (body.validade_dias) {
    const novaValidade = new Date(
      new Date(orcamento.data_emissao).getTime() + body.validade_dias * 24 * 60 * 60 * 1000
    ).toISOString();
    updates.push('data_validade = ?');
    params.push(novaValidade);
  }
  
  params.push(id);
  
  await c.env.DB.prepare(`
    UPDATE orcamentos SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();
  
  // Recalcular totais
  await recalcularTotaisOrcamento(c.env.DB, id);
  
  return c.json({ success: true, message: 'Orçamento atualizado com sucesso' });
});

// POST /orcamentos/:id/itens - Adicionar item
orcamentos.post('/:id/itens', requirePermission('orcamentos', 'editar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const validacao = itemSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validacao.error.errors }, 400);
  }
  
  const orcamento = await c.env.DB.prepare(`
    SELECT status FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  if (!['rascunho', 'enviado'].includes(orcamento.status)) {
    return c.json({ success: false, error: 'Não é possível adicionar itens neste status' }, 400);
  }
  
  const item = validacao.data;
  
  // Buscar produto
  const produto = await c.env.DB.prepare(`
    SELECT codigo, nome FROM produtos WHERE id = ? AND empresa_id = ?
  `).bind(item.produto_id, user.empresa_id).first<any>();
  
  if (!produto) {
    return c.json({ success: false, error: 'Produto não encontrado' }, 404);
  }
  
  // Pegar próxima sequência
  const ultimaSeq = await c.env.DB.prepare(`
    SELECT MAX(sequencia) as ultima FROM orcamentos_itens WHERE orcamento_id = ?
  `).bind(id).first<{ ultima: number }>();
  
  const subtotalItem = item.quantidade * item.preco_unitario;
  const descontoItem = subtotalItem * (item.desconto_percentual / 100);
  
  const itemId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO orcamentos_itens (
      id, orcamento_id, sequencia, produto_id, produto_codigo, produto_nome,
      quantidade, preco_unitario, desconto_percentual, valor_desconto,
      valor_subtotal, valor_total, observacao, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    itemId, id, (ultimaSeq?.ultima || 0) + 1,
    item.produto_id, produto.codigo, produto.nome,
    item.quantidade, item.preco_unitario, item.desconto_percentual,
    descontoItem, subtotalItem, subtotalItem - descontoItem,
    item.observacao || null, new Date().toISOString()
  ).run();
  
  await recalcularTotaisOrcamento(c.env.DB, id);
  
  return c.json({ success: true, data: { id: itemId }, message: 'Item adicionado' }, 201);
});

// DELETE /orcamentos/:id/itens/:itemId - Remover item
orcamentos.delete('/:id/itens/:itemId', requirePermission('orcamentos', 'editar'), async (c) => {
  const user = c.get('user');
  const { id, itemId } = c.req.param();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT status FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento || !['rascunho', 'enviado'].includes(orcamento.status)) {
    return c.json({ success: false, error: 'Não é possível remover itens' }, 400);
  }
  
  await c.env.DB.prepare('DELETE FROM orcamentos_itens WHERE id = ? AND orcamento_id = ?')
    .bind(itemId, id).run();
  
  await recalcularTotaisOrcamento(c.env.DB, id);
  
  return c.json({ success: true, message: 'Item removido' });
});

// POST /orcamentos/:id/enviar - Enviar para cliente
orcamentos.post('/:id/enviar', requirePermission('orcamentos', 'enviar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT * FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  if (orcamento.status !== 'rascunho') {
    return c.json({ success: false, error: 'Apenas orçamentos em rascunho podem ser enviados' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE orcamentos SET status = 'enviado', updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  await c.env.DB.prepare(`
    INSERT INTO orcamentos_historico (id, orcamento_id, status_anterior, status_novo, observacao, usuario_id, created_at)
    VALUES (?, ?, 'rascunho', 'enviado', 'Orçamento enviado ao cliente', ?, ?)
  `).bind(crypto.randomUUID(), id, user.id, new Date().toISOString()).run();
  
  return c.json({ success: true, message: 'Orçamento enviado com sucesso' });
});

// POST /orcamentos/:id/aprovar - Aprovar orçamento
orcamentos.post('/:id/aprovar', requirePermission('orcamentos', 'aprovar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT * FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  if (orcamento.status !== 'enviado') {
    return c.json({ success: false, error: 'Apenas orçamentos enviados podem ser aprovados' }, 400);
  }
  
  // Verificar validade
  if (new Date(orcamento.data_validade) < new Date()) {
    return c.json({ success: false, error: 'Orçamento expirado' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE orcamentos SET status = 'aprovado', updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  await c.env.DB.prepare(`
    INSERT INTO orcamentos_historico (id, orcamento_id, status_anterior, status_novo, observacao, usuario_id, created_at)
    VALUES (?, ?, 'enviado', 'aprovado', 'Orçamento aprovado pelo cliente', ?, ?)
  `).bind(crypto.randomUUID(), id, user.id, new Date().toISOString()).run();
  
  return c.json({ success: true, message: 'Orçamento aprovado com sucesso' });
});

// POST /orcamentos/:id/converter - Converter em pedido
orcamentos.post('/:id/converter', requirePermission('orcamentos', 'converter'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const orcamento = await c.env.DB.prepare(`
    SELECT * FROM orcamentos WHERE id = ? AND empresa_id = ?
  `).bind(id, user.empresa_id).first<any>();
  
  if (!orcamento) {
    return c.json({ success: false, error: 'Orçamento não encontrado' }, 404);
  }
  
  if (orcamento.status !== 'aprovado') {
    return c.json({ success: false, error: 'Apenas orçamentos aprovados podem ser convertidos' }, 400);
  }
  
  // Gerar número do pedido
  const ultimoNumeroPedido = await c.env.DB.prepare(`
    SELECT MAX(CAST(numero AS INTEGER)) as ultimo
    FROM pedidos_venda WHERE empresa_id = ? AND filial_id = ?
  `).bind(user.empresa_id, orcamento.filial_id).first<{ ultimo: number }>();
  
  const numeroPedido = String((ultimoNumeroPedido?.ultimo || 0) + 1).padStart(6, '0');
  const pedidoId = crypto.randomUUID();
  const agora = new Date().toISOString();
  
  // Criar pedido
  await c.env.DB.prepare(`
    INSERT INTO pedidos_venda (
      id, empresa_id, filial_id, numero, orcamento_id, canal,
      cliente_id, cliente_nome, cliente_cpf_cnpj,
      vendedor_id, vendedor_nome, tabela_preco_id, condicao_pagamento_id,
      status, data_emissao,
      valor_subtotal, valor_desconto, valor_frete, valor_total,
      observacao, observacao_interna, created_at, updated_at
    ) SELECT 
      ?, empresa_id, filial_id, ?, id, 'interno',
      cliente_id, cliente_nome, cliente_cpf_cnpj,
      vendedor_id, vendedor_nome, tabela_preco_id, condicao_pagamento_id,
      'pendente', ?,
      valor_subtotal, valor_desconto, valor_frete, valor_total,
      observacao, observacao_interna, ?, ?
    FROM orcamentos WHERE id = ?
  `).bind(pedidoId, numeroPedido, agora, agora, agora, id).run();
  
  // Copiar itens
  const itens = await c.env.DB.prepare(
    'SELECT * FROM orcamentos_itens WHERE orcamento_id = ?'
  ).bind(id).all<any>();
  
  for (const item of itens.results || []) {
    await c.env.DB.prepare(`
      INSERT INTO pedidos_venda_itens (
        id, pedido_id, sequencia, produto_id, produto_codigo, produto_nome,
        quantidade, preco_unitario, desconto_percentual, valor_desconto,
        valor_subtotal, valor_total, observacao, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), pedidoId, item.sequencia,
      item.produto_id, item.produto_codigo, item.produto_nome,
      item.quantidade, item.preco_unitario, item.desconto_percentual,
      item.valor_desconto, item.valor_subtotal, item.valor_total,
      item.observacao, agora
    ).run();
  }
  
  // Atualizar orçamento
  await c.env.DB.prepare(`
    UPDATE orcamentos SET status = 'convertido', pedido_id = ?, updated_at = ? WHERE id = ?
  `).bind(pedidoId, agora, id).run();
  
  await c.env.DB.prepare(`
    INSERT INTO orcamentos_historico (id, orcamento_id, status_anterior, status_novo, observacao, usuario_id, created_at)
    VALUES (?, ?, 'aprovado', 'convertido', ?, ?, ?)
  `).bind(crypto.randomUUID(), id, `Convertido em pedido ${numeroPedido}`, user.id, agora).run();
  
  await registrarAuditoria(c.env.DB, {
    empresa_id: user.empresa_id,
    usuario_id: user.id,
    acao: 'converter',
    tabela: 'orcamentos',
    registro_id: id,
    dados_novos: { pedido_id: pedidoId, pedido_numero: numeroPedido }
  });
  
  return c.json({
    success: true,
    data: { pedido_id: pedidoId, pedido_numero: numeroPedido },
    message: 'Orçamento convertido em pedido com sucesso'
  });
});

// Função auxiliar para recalcular totais
async function recalcularTotaisOrcamento(db: D1Database, orcamentoId: string): Promise<void> {
  const totais = await db.prepare(`
    SELECT 
      SUM(valor_subtotal) as subtotal,
      SUM(valor_desconto) as desconto,
      SUM(valor_total) as total
    FROM orcamentos_itens WHERE orcamento_id = ?
  `).bind(orcamentoId).first<any>();
  
  const orcamento = await db.prepare('SELECT valor_frete FROM orcamentos WHERE id = ?')
    .bind(orcamentoId).first<any>();
  
  await db.prepare(`
    UPDATE orcamentos SET 
      valor_subtotal = ?,
      valor_desconto = ?,
      valor_total = ? + COALESCE(valor_frete, 0),
      updated_at = ?
    WHERE id = ?
  `).bind(
    totais?.subtotal || 0,
    totais?.desconto || 0,
    totais?.total || 0,
    new Date().toISOString(),
    orcamentoId
  ).run();
}

export default orcamentos;
