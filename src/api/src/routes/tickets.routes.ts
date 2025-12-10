// ============================================
// PLANAC ERP - Rotas de Tickets/Suporte
// Bloco 3 - Suporte ao Cliente
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const tickets = new Hono<{ Bindings: Env }>();

// ============================================
// CATEGORIAS DE AJUDA
// ============================================

// GET /api/suporte/categorias - Listar categorias de ajuda
tickets.get('/categorias', async (c) => {
  const empresaId = c.get('empresaId');
  
  const result = await c.env.DB.prepare(`
    SELECT c.*, 
           (SELECT COUNT(*) FROM artigos_ajuda WHERE categoria_id = c.id AND ativo = 1) as total_artigos
    FROM categorias_ajuda c 
    WHERE c.empresa_id = ? AND c.ativo = 1
    ORDER BY c.ordem, c.nome
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: result.results });
});

// POST /api/suporte/categorias - Criar categoria
tickets.post('/categorias', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    icone: z.string().max(50).optional(),
    ordem: z.number().int().default(0)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO categorias_ajuda (id, empresa_id, nome, descricao, icone, ordem, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(id, empresaId, validation.data.nome, validation.data.descricao || null,
          validation.data.icone || null, validation.data.ordem, usuarioId).run();
  
  return c.json({ id, message: 'Categoria criada' }, 201);
});

// ============================================
// ARTIGOS DE AJUDA (BASE DE CONHECIMENTO)
// ============================================

// GET /api/suporte/artigos - Listar artigos
tickets.get('/artigos', async (c) => {
  const empresaId = c.get('empresaId');
  const { categoria_id, busca, publico } = c.req.query();
  
  let query = `SELECT a.*, c.nome as categoria_nome
               FROM artigos_ajuda a
               LEFT JOIN categorias_ajuda c ON a.categoria_id = c.id
               WHERE a.empresa_id = ? AND a.ativo = 1`;
  const params: any[] = [empresaId];
  
  if (categoria_id) {
    query += ` AND a.categoria_id = ?`;
    params.push(categoria_id);
  }
  
  if (busca) {
    query += ` AND (a.titulo LIKE ? OR a.conteudo LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`);
  }
  
  if (publico !== undefined) {
    query += ` AND a.publico = ?`;
    params.push(publico === 'true' ? 1 : 0);
  }
  
  query += ` ORDER BY a.visualizacoes DESC, a.titulo`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/suporte/artigos/:id - Buscar artigo (incrementa visualizações)
tickets.get('/artigos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const artigo = await c.env.DB.prepare(`
    SELECT a.*, c.nome as categoria_nome
    FROM artigos_ajuda a
    LEFT JOIN categorias_ajuda c ON a.categoria_id = c.id
    WHERE a.id = ? AND a.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!artigo) {
    return c.json({ error: 'Artigo não encontrado' }, 404);
  }
  
  // Incrementar visualizações
  await c.env.DB.prepare(`
    UPDATE artigos_ajuda SET visualizacoes = visualizacoes + 1 WHERE id = ?
  `).bind(id).run();
  
  return c.json({ success: true, data: artigo });
});

// POST /api/suporte/artigos - Criar artigo
tickets.post('/artigos', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    categoria_id: z.string().uuid(),
    titulo: z.string().min(1).max(200),
    conteudo: z.string().min(1),
    resumo: z.string().max(500).optional(),
    palavras_chave: z.array(z.string()).optional(),
    publico: z.boolean().default(true)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO artigos_ajuda (id, empresa_id, categoria_id, titulo, conteudo, resumo,
                               palavras_chave, publico, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(id, empresaId, data.categoria_id, data.titulo, data.conteudo, data.resumo || null,
          data.palavras_chave ? JSON.stringify(data.palavras_chave) : null,
          data.publico ? 1 : 0, usuarioId).run();
  
  return c.json({ id, message: 'Artigo criado' }, 201);
});

// POST /api/suporte/artigos/:id/feedback - Feedback do artigo
tickets.post('/artigos/:id/feedback', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const { util } = body; // true ou false
  
  if (util) {
    await c.env.DB.prepare(`
      UPDATE artigos_ajuda SET feedback_positivo = feedback_positivo + 1 WHERE id = ?
    `).bind(id).run();
  } else {
    await c.env.DB.prepare(`
      UPDATE artigos_ajuda SET feedback_negativo = feedback_negativo + 1 WHERE id = ?
    `).bind(id).run();
  }
  
  return c.json({ message: 'Feedback registrado' });
});

// ============================================
// TICKETS
// ============================================

// GET /api/suporte/tickets - Listar tickets
tickets.get('/tickets', async (c) => {
  const empresaId = c.get('empresaId');
  const { status, prioridade, cliente_id, atribuido_a, page = '1', limit = '20' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `SELECT t.*, cl.razao_social as cliente_nome, u.nome as atribuido_nome,
               (SELECT COUNT(*) FROM tickets_mensagens WHERE ticket_id = t.id) as total_mensagens
               FROM tickets t
               LEFT JOIN clientes cl ON t.cliente_id = cl.id
               LEFT JOIN usuarios u ON t.atribuido_a = u.id
               WHERE t.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (status) {
    query += ` AND t.status = ?`;
    params.push(status);
  }
  
  if (prioridade) {
    query += ` AND t.prioridade = ?`;
    params.push(prioridade);
  }
  
  if (cliente_id) {
    query += ` AND t.cliente_id = ?`;
    params.push(cliente_id);
  }
  
  if (atribuido_a) {
    query += ` AND t.atribuido_a = ?`;
    params.push(atribuido_a);
  }
  
  const countQuery = query.replace(/SELECT t\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
  
  query += ` ORDER BY 
             CASE t.prioridade WHEN 'URGENTE' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,
             t.created_at DESC
             LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({
    success: true,
    data: result.results,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult?.total || 0 }
  });
});

// GET /api/suporte/tickets/:id - Buscar ticket com mensagens
tickets.get('/tickets/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const ticket = await c.env.DB.prepare(`
    SELECT t.*, cl.razao_social as cliente_nome, cl.email as cliente_email,
           u.nome as atribuido_nome
    FROM tickets t
    LEFT JOIN clientes cl ON t.cliente_id = cl.id
    LEFT JOIN usuarios u ON t.atribuido_a = u.id
    WHERE t.id = ? AND t.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!ticket) {
    return c.json({ error: 'Ticket não encontrado' }, 404);
  }
  
  const mensagens = await c.env.DB.prepare(`
    SELECT tm.*, u.nome as autor_nome, u.avatar as autor_avatar
    FROM tickets_mensagens tm
    LEFT JOIN usuarios u ON tm.usuario_id = u.id
    WHERE tm.ticket_id = ?
    ORDER BY tm.created_at
  `).bind(id).all();
  
  const historico = await c.env.DB.prepare(`
    SELECT th.*, u.nome as usuario_nome
    FROM tickets_historico th
    LEFT JOIN usuarios u ON th.usuario_id = u.id
    WHERE th.ticket_id = ?
    ORDER BY th.created_at DESC
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: {
      ...ticket,
      mensagens: mensagens.results,
      historico: historico.results
    }
  });
});

// POST /api/suporte/tickets - Criar ticket
tickets.post('/tickets', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    cliente_id: z.string().uuid().optional(),
    assunto: z.string().min(1).max(200),
    descricao: z.string().min(1),
    prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
    categoria: z.string().max(50).optional(),
    canal_origem: z.enum(['EMAIL', 'TELEFONE', 'WHATSAPP', 'CHAT', 'PORTAL']).default('PORTAL')
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  // Gerar número do ticket
  const seq = await c.env.DB.prepare(`
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 as proximo 
    FROM tickets WHERE empresa_id = ?
  `).bind(empresaId).first();
  
  const numero = String(seq?.proximo || 1).padStart(6, '0');
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO tickets (id, empresa_id, numero, cliente_id, assunto, descricao, 
                         prioridade, categoria, canal_origem, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTO', ?)
  `).bind(id, empresaId, numero, data.cliente_id || null, data.assunto, data.descricao,
          data.prioridade, data.categoria || null, data.canal_origem, usuarioId).run();
  
  // Registrar histórico
  await registrarHistoricoTicket(c.env.DB, id, usuarioId, 'CRIACAO', 'Ticket criado');
  
  return c.json({ id, numero, message: 'Ticket criado' }, 201);
});

// POST /api/suporte/tickets/:id/mensagens - Adicionar mensagem
tickets.post('/tickets/:id/mensagens', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    mensagem: z.string().min(1),
    interno: z.boolean().default(false),
    anexos: z.array(z.string()).optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const mensagemId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO tickets_mensagens (id, ticket_id, usuario_id, mensagem, interno, anexos)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(mensagemId, id, usuarioId, validation.data.mensagem, validation.data.interno ? 1 : 0,
          validation.data.anexos ? JSON.stringify(validation.data.anexos) : null).run();
  
  // Atualizar ticket
  await c.env.DB.prepare(`
    UPDATE tickets SET ultima_resposta = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();
  
  return c.json({ id: mensagemId, message: 'Mensagem adicionada' }, 201);
});

// PUT /api/suporte/tickets/:id/atribuir - Atribuir ticket
tickets.put('/tickets/:id/atribuir', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const { atribuido_a } = body;
  
  await c.env.DB.prepare(`
    UPDATE tickets SET atribuido_a = ?, status = 'EM_ATENDIMENTO', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(atribuido_a, id, empresaId).run();
  
  await registrarHistoricoTicket(c.env.DB, id, usuarioId, 'ATRIBUICAO', `Ticket atribuído`);
  
  return c.json({ message: 'Ticket atribuído' });
});

// PUT /api/suporte/tickets/:id/status - Alterar status
tickets.put('/tickets/:id/status', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    status: z.enum(['ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE', 'AGUARDANDO_TERCEIRO', 'RESOLVIDO', 'FECHADO']),
    motivo: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const statusAnterior = await c.env.DB.prepare(`
    SELECT status FROM tickets WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  await c.env.DB.prepare(`
    UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(validation.data.status, id, empresaId).run();
  
  await registrarHistoricoTicket(c.env.DB, id, usuarioId, 'STATUS', 
    `Status alterado de ${statusAnterior?.status} para ${validation.data.status}`);
  
  return c.json({ message: 'Status atualizado' });
});

// PUT /api/suporte/tickets/:id/prioridade - Alterar prioridade
tickets.put('/tickets/:id/prioridade', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const { prioridade } = body;
  
  await c.env.DB.prepare(`
    UPDATE tickets SET prioridade = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(prioridade, id, empresaId).run();
  
  await registrarHistoricoTicket(c.env.DB, id, usuarioId, 'PRIORIDADE', `Prioridade alterada para ${prioridade}`);
  
  return c.json({ message: 'Prioridade atualizada' });
});

// GET /api/suporte/tickets/estatisticas - Estatísticas de tickets
tickets.get('/tickets/estatisticas', async (c) => {
  const empresaId = c.get('empresaId');
  const { periodo = '30' } = c.req.query();
  
  const stats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'ABERTO' THEN 1 ELSE 0 END) as abertos,
      SUM(CASE WHEN status = 'EM_ATENDIMENTO' THEN 1 ELSE 0 END) as em_atendimento,
      SUM(CASE WHEN status IN ('RESOLVIDO', 'FECHADO') THEN 1 ELSE 0 END) as resolvidos,
      SUM(CASE WHEN prioridade = 'URGENTE' AND status NOT IN ('RESOLVIDO', 'FECHADO') THEN 1 ELSE 0 END) as urgentes_abertos
    FROM tickets 
    WHERE empresa_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
  `).bind(empresaId, periodo).first();
  
  const porPrioridade = await c.env.DB.prepare(`
    SELECT prioridade, COUNT(*) as total
    FROM tickets 
    WHERE empresa_id = ? AND status NOT IN ('RESOLVIDO', 'FECHADO')
    GROUP BY prioridade
  `).bind(empresaId).all();
  
  const porCategoria = await c.env.DB.prepare(`
    SELECT categoria, COUNT(*) as total
    FROM tickets 
    WHERE empresa_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY categoria
    ORDER BY total DESC
    LIMIT 10
  `).bind(empresaId, periodo).all();
  
  return c.json({
    success: true,
    data: {
      resumo: stats,
      por_prioridade: porPrioridade.results,
      por_categoria: porCategoria.results
    }
  });
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function registrarHistoricoTicket(db: any, ticketId: string, usuarioId: string, tipo: string, descricao: string) {
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO tickets_historico (id, ticket_id, usuario_id, tipo, descricao)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, ticketId, usuarioId, tipo, descricao).run();
}

export default tickets;
