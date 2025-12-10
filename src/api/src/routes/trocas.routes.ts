// ============================================
// PLANAC ERP - Rotas de Trocas
// Bloco 3 - Pós-venda
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const trocas = new Hono<{ Bindings: Env }>();

// Schemas
const trocaSchema = z.object({
  cliente_id: z.string().uuid(),
  pedido_original_id: z.string().uuid().optional(),
  motivo: z.enum(['DEFEITO', 'TAMANHO_INCORRETO', 'COR_INCORRETA', 'ARREPENDIMENTO', 'AVARIA', 'OUTROS']),
  descricao: z.string().min(1),
  itens_devolvidos: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().int().min(1),
    valor_unitario: z.number().min(0),
    motivo: z.string().optional()
  })).min(1),
  itens_novos: z.array(z.object({
    produto_id: z.string().uuid(),
    quantidade: z.number().int().min(1),
    valor_unitario: z.number().min(0)
  })).optional()
});

// GET /api/trocas - Listar trocas
trocas.get('/', async (c) => {
  const empresaId = c.get('empresaId');
  const { cliente_id, status, motivo, page = '1', limit = '20' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `SELECT t.*, c.razao_social as cliente_nome, p.numero as pedido_numero
               FROM trocas t
               JOIN clientes c ON t.cliente_id = c.id
               LEFT JOIN pedidos p ON t.pedido_original_id = p.id
               WHERE t.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (cliente_id) {
    query += ` AND t.cliente_id = ?`;
    params.push(cliente_id);
  }
  
  if (status) {
    query += ` AND t.status = ?`;
    params.push(status);
  }
  
  if (motivo) {
    query += ` AND t.motivo = ?`;
    params.push(motivo);
  }
  
  // Contagem
  const countQuery = query.replace(/SELECT t\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
  
  query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult?.total || 0
    }
  });
});

// GET /api/trocas/:id - Buscar troca com itens
trocas.get('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const troca = await c.env.DB.prepare(`
    SELECT t.*, c.razao_social as cliente_nome, c.telefone as cliente_telefone,
           p.numero as pedido_numero
    FROM trocas t
    JOIN clientes c ON t.cliente_id = c.id
    LEFT JOIN pedidos p ON t.pedido_original_id = p.id
    WHERE t.id = ? AND t.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!troca) {
    return c.json({ error: 'Troca não encontrada' }, 404);
  }
  
  // Buscar itens devolvidos
  const itensDevolvidos = await c.env.DB.prepare(`
    SELECT tid.*, pr.descricao as produto_descricao, pr.codigo as produto_codigo
    FROM trocas_itens_devolvidos tid
    JOIN produtos pr ON tid.produto_id = pr.id
    WHERE tid.troca_id = ?
  `).bind(id).all();
  
  // Buscar itens novos
  const itensNovos = await c.env.DB.prepare(`
    SELECT tin.*, pr.descricao as produto_descricao, pr.codigo as produto_codigo
    FROM trocas_itens_novos tin
    JOIN produtos pr ON tin.produto_id = pr.id
    WHERE tin.troca_id = ?
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: {
      ...troca,
      itens_devolvidos: itensDevolvidos.results,
      itens_novos: itensNovos.results
    }
  });
});

// POST /api/trocas - Criar solicitação de troca
trocas.post('/', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const validation = trocaSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const { cliente_id, pedido_original_id, motivo, descricao, itens_devolvidos, itens_novos } = validation.data;
  
  // Calcular valores
  const valorDevolvido = itens_devolvidos.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);
  const valorNovo = (itens_novos || []).reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);
  const diferenca = valorNovo - valorDevolvido;
  
  // Gerar número
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM trocas WHERE empresa_id = ?
  `).bind(empresaId).first();
  const numero = `TRO${String(((countResult?.total as number) || 0) + 1).padStart(6, '0')}`;
  
  const id = crypto.randomUUID();
  
  // Criar troca
  await c.env.DB.prepare(`
    INSERT INTO trocas (id, empresa_id, numero, cliente_id, pedido_original_id, motivo, descricao,
                        valor_devolvido, valor_novo, diferenca, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SOLICITADA', ?)
  `).bind(id, empresaId, numero, cliente_id, pedido_original_id || null, motivo, descricao,
          valorDevolvido, valorNovo, diferenca, usuarioId).run();
  
  // Criar itens devolvidos
  for (const item of itens_devolvidos) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO trocas_itens_devolvidos (id, troca_id, produto_id, quantidade, valor_unitario, motivo)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(itemId, id, item.produto_id, item.quantidade, item.valor_unitario, item.motivo || null).run();
  }
  
  // Criar itens novos (se houver)
  if (itens_novos && itens_novos.length > 0) {
    for (const item of itens_novos) {
      const itemId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO trocas_itens_novos (id, troca_id, produto_id, quantidade, valor_unitario)
        VALUES (?, ?, ?, ?, ?)
      `).bind(itemId, id, item.produto_id, item.quantidade, item.valor_unitario).run();
    }
  }
  
  return c.json({ 
    id, 
    numero, 
    valor_devolvido: valorDevolvido,
    valor_novo: valorNovo,
    diferenca,
    message: 'Troca solicitada com sucesso' 
  }, 201);
});

// POST /api/trocas/:id/aprovar - Aprovar troca
trocas.post('/:id/aprovar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    observacoes: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  
  const troca = await c.env.DB.prepare(`
    SELECT id, status FROM trocas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!troca) {
    return c.json({ error: 'Troca não encontrada' }, 404);
  }
  
  if (troca.status !== 'SOLICITADA') {
    return c.json({ error: 'Troca não está em solicitação' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE trocas SET status = 'APROVADA', aprovada_por = ?, data_aprovacao = CURRENT_TIMESTAMP,
                     observacoes_aprovacao = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(usuarioId, validation.data?.observacoes || null, id).run();
  
  return c.json({ message: 'Troca aprovada. Aguardando recebimento dos produtos.' });
});

// POST /api/trocas/:id/receber - Confirmar recebimento dos produtos devolvidos
trocas.post('/:id/receber', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    itens_recebidos: z.array(z.object({
      troca_item_id: z.string().uuid(),
      quantidade_recebida: z.number().int().min(0),
      condicao: z.enum(['BOM', 'AVARIADO', 'DEFEITUOSO']),
      observacao: z.string().optional()
    })),
    observacoes: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const troca = await c.env.DB.prepare(`
    SELECT id, status FROM trocas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!troca) {
    return c.json({ error: 'Troca não encontrada' }, 404);
  }
  
  if (troca.status !== 'APROVADA') {
    return c.json({ error: 'Troca precisa estar aprovada para receber produtos' }, 400);
  }
  
  // Processar recebimento de cada item
  for (const item of validation.data.itens_recebidos) {
    const itemDevolvido = await c.env.DB.prepare(`
      SELECT produto_id, quantidade FROM trocas_itens_devolvidos WHERE id = ? AND troca_id = ?
    `).bind(item.troca_item_id, id).first();
    
    if (!itemDevolvido) {
      return c.json({ error: `Item ${item.troca_item_id} não encontrado` }, 404);
    }
    
    // Atualizar item
    await c.env.DB.prepare(`
      UPDATE trocas_itens_devolvidos SET quantidade_recebida = ?, condicao = ?, observacao_recebimento = ?
      WHERE id = ?
    `).bind(item.quantidade_recebida, item.condicao, item.observacao || null, item.troca_item_id).run();
    
    // Devolver ao estoque se em bom estado
    if (item.condicao === 'BOM' && item.quantidade_recebida > 0) {
      const movId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO estoque_movimentacoes (id, empresa_id, produto_id, tipo, quantidade,
                                           motivo, documento_tipo, documento_id, created_by)
        VALUES (?, ?, ?, 'ENTRADA', ?, 'TROCA', 'TROCA', ?, ?)
      `).bind(movId, empresaId, itemDevolvido.produto_id, item.quantidade_recebida, id, usuarioId).run();
    }
  }
  
  await c.env.DB.prepare(`
    UPDATE trocas SET status = 'PRODUTOS_RECEBIDOS', data_recebimento = CURRENT_TIMESTAMP,
                     recebido_por = ?, observacoes_recebimento = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(usuarioId, validation.data.observacoes || null, id).run();
  
  return c.json({ message: 'Produtos recebidos. Troca pronta para finalização.' });
});

// POST /api/trocas/:id/finalizar - Finalizar troca (entregar produtos novos)
trocas.post('/:id/finalizar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  
  const troca = await c.env.DB.prepare(`
    SELECT id, status, diferenca FROM trocas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!troca) {
    return c.json({ error: 'Troca não encontrada' }, 404);
  }
  
  if (troca.status !== 'PRODUTOS_RECEBIDOS') {
    return c.json({ error: 'Produtos precisam ser recebidos antes de finalizar' }, 400);
  }
  
  // Baixar estoque dos itens novos
  const itensNovos = await c.env.DB.prepare(`
    SELECT produto_id, quantidade FROM trocas_itens_novos WHERE troca_id = ?
  `).bind(id).all();
  
  for (const item of itensNovos.results as any[]) {
    const movId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO estoque_movimentacoes (id, empresa_id, produto_id, tipo, quantidade,
                                         motivo, documento_tipo, documento_id, created_by)
      VALUES (?, ?, ?, 'SAIDA', ?, 'TROCA', 'TROCA', ?, ?)
    `).bind(movId, empresaId, item.produto_id, item.quantidade, id, usuarioId).run();
  }
  
  await c.env.DB.prepare(`
    UPDATE trocas SET status = 'FINALIZADA', data_finalizacao = CURRENT_TIMESTAMP,
                     finalizado_por = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(usuarioId, id).run();
  
  return c.json({ 
    message: 'Troca finalizada com sucesso',
    diferenca: troca.diferenca
  });
});

// POST /api/trocas/:id/cancelar - Cancelar troca
trocas.post('/:id/cancelar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    motivo: z.string().min(1)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Informe o motivo do cancelamento' }, 400);
  }
  
  const troca = await c.env.DB.prepare(`
    SELECT id, status FROM trocas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!troca) {
    return c.json({ error: 'Troca não encontrada' }, 404);
  }
  
  if (troca.status === 'FINALIZADA') {
    return c.json({ error: 'Troca já finalizada não pode ser cancelada' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE trocas SET status = 'CANCELADA', motivo_cancelamento = ?,
                     cancelado_por = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(validation.data.motivo, usuarioId, id).run();
  
  return c.json({ message: 'Troca cancelada' });
});

// GET /api/trocas/estatisticas - Estatísticas de trocas
trocas.get('/estatisticas', async (c) => {
  const empresaId = c.get('empresaId');
  const { data_inicio, data_fim } = c.req.query();
  
  let whereClause = `WHERE empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (data_inicio) {
    whereClause += ` AND created_at >= ?`;
    params.push(data_inicio);
  }
  
  if (data_fim) {
    whereClause += ` AND created_at <= ?`;
    params.push(data_fim);
  }
  
  const porMotivo = await c.env.DB.prepare(`
    SELECT motivo, COUNT(*) as total
    FROM trocas ${whereClause}
    GROUP BY motivo ORDER BY total DESC
  `).bind(...params).all();
  
  const porStatus = await c.env.DB.prepare(`
    SELECT status, COUNT(*) as total
    FROM trocas ${whereClause}
    GROUP BY status
  `).bind(...params).all();
  
  const valores = await c.env.DB.prepare(`
    SELECT SUM(valor_devolvido) as total_devolvido,
           SUM(valor_novo) as total_novo,
           SUM(diferenca) as total_diferenca,
           COUNT(*) as total_trocas
    FROM trocas ${whereClause}
  `).bind(...params).first();
  
  return c.json({
    success: true,
    data: {
      por_motivo: porMotivo.results,
      por_status: porStatus.results,
      valores
    }
  });
});

export default trocas;
