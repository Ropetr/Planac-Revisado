// ============================================
// PLANAC ERP - Rotas de Agenda/Calendário
// Bloco 3 - Agenda Corporativa
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const agenda = new Hono<{ Bindings: Env }>();

// ============================================
// EVENTOS
// ============================================

// GET /api/agenda/eventos - Listar eventos
agenda.get('/eventos', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { data_inicio, data_fim, tipo, cliente_id, meus } = c.req.query();
  
  let query = `SELECT e.*, 
               u.nome as criado_por_nome,
               (SELECT COUNT(*) FROM eventos_participantes WHERE evento_id = e.id) as total_participantes
               FROM eventos e
               LEFT JOIN usuarios u ON e.created_by = u.id
               WHERE e.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  // Filtrar eventos onde o usuário é criador ou participante
  if (meus === 'true') {
    query += ` AND (e.created_by = ? OR EXISTS (SELECT 1 FROM eventos_participantes WHERE evento_id = e.id AND usuario_id = ?))`;
    params.push(usuarioId, usuarioId);
  }
  
  if (data_inicio) {
    query += ` AND e.data_fim >= ?`;
    params.push(data_inicio);
  }
  
  if (data_fim) {
    query += ` AND e.data_inicio <= ?`;
    params.push(data_fim);
  }
  
  if (tipo) {
    query += ` AND e.tipo = ?`;
    params.push(tipo);
  }
  
  if (cliente_id) {
    query += ` AND e.cliente_id = ?`;
    params.push(cliente_id);
  }
  
  query += ` ORDER BY e.data_inicio`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/agenda/eventos/:id - Buscar evento com participantes
agenda.get('/eventos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const evento = await c.env.DB.prepare(`
    SELECT e.*, cl.razao_social as cliente_nome
    FROM eventos e
    LEFT JOIN clientes cl ON e.cliente_id = cl.id
    WHERE e.id = ? AND e.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!evento) {
    return c.json({ error: 'Evento não encontrado' }, 404);
  }
  
  const participantes = await c.env.DB.prepare(`
    SELECT ep.*, u.nome as usuario_nome, u.email as usuario_email
    FROM eventos_participantes ep
    JOIN usuarios u ON ep.usuario_id = u.id
    WHERE ep.evento_id = ?
  `).bind(id).all();
  
  const lembretes = await c.env.DB.prepare(`
    SELECT * FROM lembretes WHERE evento_id = ? ORDER BY minutos_antes
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: {
      ...evento,
      participantes: participantes.results,
      lembretes: lembretes.results
    }
  });
});

// POST /api/agenda/eventos - Criar evento
agenda.post('/eventos', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    titulo: z.string().min(1).max(200),
    descricao: z.string().optional(),
    tipo: z.enum(['REUNIAO', 'VISITA', 'LIGACAO', 'TAREFA', 'LEMBRETE', 'ENTREGA', 'OUTROS']),
    data_inicio: z.string(),
    data_fim: z.string(),
    dia_inteiro: z.boolean().default(false),
    local: z.string().optional(),
    cliente_id: z.string().uuid().optional(),
    oportunidade_id: z.string().uuid().optional(),
    cor: z.string().max(7).optional(),
    recorrencia: z.object({
      tipo: z.enum(['DIARIA', 'SEMANAL', 'MENSAL', 'ANUAL']),
      intervalo: z.number().int().min(1).default(1),
      dias_semana: z.array(z.number().int().min(0).max(6)).optional(),
      dia_mes: z.number().int().min(1).max(31).optional(),
      fim: z.string().optional()
    }).optional(),
    participantes_ids: z.array(z.string().uuid()).optional(),
    lembretes: z.array(z.number().int()).optional() // minutos antes
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO eventos (id, empresa_id, titulo, descricao, tipo, data_inicio, data_fim,
                         dia_inteiro, local, cliente_id, oportunidade_id, cor, recorrencia, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, data.titulo, data.descricao || null, data.tipo,
          data.data_inicio, data.data_fim, data.dia_inteiro ? 1 : 0,
          data.local || null, data.cliente_id || null, data.oportunidade_id || null,
          data.cor || null, data.recorrencia ? JSON.stringify(data.recorrencia) : null, usuarioId).run();
  
  // Adicionar criador como participante
  const participanteId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO eventos_participantes (id, evento_id, usuario_id, status, obrigatorio)
    VALUES (?, ?, ?, 'CONFIRMADO', 1)
  `).bind(participanteId, id, usuarioId).run();
  
  // Adicionar outros participantes
  if (data.participantes_ids) {
    for (const participanteUserId of data.participantes_ids) {
      if (participanteUserId !== usuarioId) {
        const pId = crypto.randomUUID();
        await c.env.DB.prepare(`
          INSERT INTO eventos_participantes (id, evento_id, usuario_id, status)
          VALUES (?, ?, ?, 'PENDENTE')
        `).bind(pId, id, participanteUserId).run();
      }
    }
  }
  
  // Adicionar lembretes
  if (data.lembretes) {
    for (const minutos of data.lembretes) {
      const lembreteId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO lembretes (id, evento_id, minutos_antes, tipo)
        VALUES (?, ?, ?, 'NOTIFICACAO')
      `).bind(lembreteId, id, minutos).run();
    }
  }
  
  return c.json({ id, message: 'Evento criado' }, 201);
});

// PUT /api/agenda/eventos/:id - Atualizar evento
agenda.put('/eventos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const campos: string[] = [];
  const valores: any[] = [];
  
  if (body.titulo) { campos.push('titulo = ?'); valores.push(body.titulo); }
  if (body.descricao !== undefined) { campos.push('descricao = ?'); valores.push(body.descricao); }
  if (body.tipo) { campos.push('tipo = ?'); valores.push(body.tipo); }
  if (body.data_inicio) { campos.push('data_inicio = ?'); valores.push(body.data_inicio); }
  if (body.data_fim) { campos.push('data_fim = ?'); valores.push(body.data_fim); }
  if (body.dia_inteiro !== undefined) { campos.push('dia_inteiro = ?'); valores.push(body.dia_inteiro ? 1 : 0); }
  if (body.local !== undefined) { campos.push('local = ?'); valores.push(body.local); }
  if (body.cor !== undefined) { campos.push('cor = ?'); valores.push(body.cor); }
  if (body.status) { campos.push('status = ?'); valores.push(body.status); }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE eventos SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Evento atualizado' });
});

// DELETE /api/agenda/eventos/:id - Excluir evento
agenda.delete('/eventos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  // Excluir participantes
  await c.env.DB.prepare(`DELETE FROM eventos_participantes WHERE evento_id = ?`).bind(id).run();
  
  // Excluir lembretes
  await c.env.DB.prepare(`DELETE FROM lembretes WHERE evento_id = ?`).bind(id).run();
  
  // Excluir evento
  await c.env.DB.prepare(`DELETE FROM eventos WHERE id = ? AND empresa_id = ?`).bind(id, empresaId).run();
  
  return c.json({ message: 'Evento excluído' });
});

// POST /api/agenda/eventos/:id/participantes - Adicionar participante
agenda.post('/eventos/:id/participantes', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    usuario_id: z.string().uuid(),
    obrigatorio: z.boolean().default(false)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const participanteId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO eventos_participantes (id, evento_id, usuario_id, status, obrigatorio)
    VALUES (?, ?, ?, 'PENDENTE', ?)
  `).bind(participanteId, id, validation.data.usuario_id, validation.data.obrigatorio ? 1 : 0).run();
  
  return c.json({ id: participanteId, message: 'Participante adicionado' }, 201);
});

// PUT /api/agenda/eventos/:id/participantes/:participanteId/resposta - Responder convite
agenda.put('/eventos/:id/participantes/:participanteId/resposta', async (c) => {
  const { id, participanteId } = c.req.param();
  const body = await c.req.json();
  
  const { status } = body; // CONFIRMADO, RECUSADO, TALVEZ
  
  await c.env.DB.prepare(`
    UPDATE eventos_participantes SET status = ?, respondido_em = CURRENT_TIMESTAMP
    WHERE id = ? AND evento_id = ?
  `).bind(status, participanteId, id).run();
  
  return c.json({ message: 'Resposta registrada' });
});

// ============================================
// VISÃO DO CALENDÁRIO
// ============================================

// GET /api/agenda/calendario/mes - Visão mensal
agenda.get('/calendario/mes', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { ano, mes } = c.req.query();
  
  if (!ano || !mes) {
    return c.json({ error: 'Ano e mês são obrigatórios' }, 400);
  }
  
  const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const dataFim = new Date(parseInt(ano), parseInt(mes), 0).toISOString().split('T')[0];
  
  const eventos = await c.env.DB.prepare(`
    SELECT e.id, e.titulo, e.tipo, e.data_inicio, e.data_fim, e.dia_inteiro, e.cor, e.status
    FROM eventos e
    WHERE e.empresa_id = ?
      AND e.data_fim >= ?
      AND e.data_inicio <= ?
      AND (e.created_by = ? OR EXISTS (SELECT 1 FROM eventos_participantes WHERE evento_id = e.id AND usuario_id = ?))
    ORDER BY e.data_inicio
  `).bind(empresaId, dataInicio, dataFim, usuarioId, usuarioId).all();
  
  return c.json({ success: true, data: eventos.results });
});

// GET /api/agenda/calendario/semana - Visão semanal
agenda.get('/calendario/semana', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { data } = c.req.query();
  
  if (!data) {
    return c.json({ error: 'Data é obrigatória' }, 400);
  }
  
  // Calcular início e fim da semana
  const dt = new Date(data);
  const diaSemana = dt.getDay();
  const inicio = new Date(dt);
  inicio.setDate(dt.getDate() - diaSemana);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  
  const eventos = await c.env.DB.prepare(`
    SELECT e.*
    FROM eventos e
    WHERE e.empresa_id = ?
      AND e.data_fim >= ?
      AND e.data_inicio <= ?
      AND (e.created_by = ? OR EXISTS (SELECT 1 FROM eventos_participantes WHERE evento_id = e.id AND usuario_id = ?))
    ORDER BY e.data_inicio
  `).bind(empresaId, inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0], usuarioId, usuarioId).all();
  
  return c.json({ 
    success: true, 
    data: {
      semana: { inicio: inicio.toISOString().split('T')[0], fim: fim.toISOString().split('T')[0] },
      eventos: eventos.results 
    }
  });
});

// GET /api/agenda/calendario/dia - Visão diária
agenda.get('/calendario/dia', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { data } = c.req.query();
  
  if (!data) {
    return c.json({ error: 'Data é obrigatória' }, 400);
  }
  
  const eventos = await c.env.DB.prepare(`
    SELECT e.*, 
           (SELECT GROUP_CONCAT(u.nome) FROM eventos_participantes ep 
            JOIN usuarios u ON ep.usuario_id = u.id 
            WHERE ep.evento_id = e.id) as participantes_nomes
    FROM eventos e
    WHERE e.empresa_id = ?
      AND date(e.data_inicio) <= ?
      AND date(e.data_fim) >= ?
      AND (e.created_by = ? OR EXISTS (SELECT 1 FROM eventos_participantes WHERE evento_id = e.id AND usuario_id = ?))
    ORDER BY e.dia_inteiro DESC, time(e.data_inicio)
  `).bind(empresaId, data, data, usuarioId, usuarioId).all();
  
  return c.json({ success: true, data: eventos.results });
});

// ============================================
// DISPONIBILIDADE
// ============================================

// GET /api/agenda/disponibilidade - Verificar disponibilidade de usuários
agenda.get('/disponibilidade', async (c) => {
  const empresaId = c.get('empresaId');
  const { usuarios_ids, data_inicio, data_fim } = c.req.query();
  
  if (!usuarios_ids || !data_inicio || !data_fim) {
    return c.json({ error: 'Parâmetros obrigatórios: usuarios_ids, data_inicio, data_fim' }, 400);
  }
  
  const ids = usuarios_ids.split(',');
  const resultado: Record<string, any[]> = {};
  
  for (const userId of ids) {
    const conflitos = await c.env.DB.prepare(`
      SELECT e.id, e.titulo, e.data_inicio, e.data_fim
      FROM eventos e
      JOIN eventos_participantes ep ON e.id = ep.evento_id
      WHERE e.empresa_id = ?
        AND ep.usuario_id = ?
        AND ep.status != 'RECUSADO'
        AND e.data_inicio < ?
        AND e.data_fim > ?
    `).bind(empresaId, userId, data_fim, data_inicio).all();
    
    resultado[userId] = conflitos.results as any[];
  }
  
  return c.json({ success: true, data: resultado });
});

// ============================================
// LEMBRETES PENDENTES
// ============================================

// GET /api/agenda/lembretes/pendentes - Lembretes a enviar
agenda.get('/lembretes/pendentes', async (c) => {
  const empresaId = c.get('empresaId');
  
  const lembretes = await c.env.DB.prepare(`
    SELECT l.*, e.titulo as evento_titulo, e.data_inicio as evento_data_inicio,
           e.created_by as evento_criador_id
    FROM lembretes l
    JOIN eventos e ON l.evento_id = e.id
    WHERE e.empresa_id = ?
      AND l.enviado = 0
      AND datetime(e.data_inicio, '-' || l.minutos_antes || ' minutes') <= datetime('now')
      AND e.data_inicio > datetime('now')
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: lembretes.results });
});

// PUT /api/agenda/lembretes/:id/enviado - Marcar como enviado
agenda.put('/lembretes/:id/enviado', async (c) => {
  const { id } = c.req.param();
  
  await c.env.DB.prepare(`
    UPDATE lembretes SET enviado = 1, enviado_em = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();
  
  return c.json({ message: 'Lembrete marcado como enviado' });
});

export default agenda;
