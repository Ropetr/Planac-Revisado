// ============================================
// PLANAC ERP - Rotas de Roteirização
// Bloco 3 - Logística Complementar
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const rotas = new Hono<{ Bindings: Env }>();

// Schemas
const rotaSchema = z.object({
  nome: z.string().min(1).max(100),
  descricao: z.string().optional(),
  data_rota: z.string(), // YYYY-MM-DD
  motorista_id: z.string().uuid().optional(),
  veiculo_id: z.string().uuid().optional(),
  km_estimado: z.number().min(0).optional(),
  tempo_estimado_minutos: z.number().min(0).optional(),
  observacoes: z.string().optional()
});

const rotaEntregaSchema = z.object({
  entrega_id: z.string().uuid(),
  ordem: z.number().int().min(1),
  hora_prevista: z.string().optional(),
  observacoes: z.string().optional()
});

// GET /api/rotas - Listar rotas
rotas.get('/', async (c) => {
  const empresaId = c.get('empresaId');
  const { data_inicio, data_fim, motorista_id, status, page = '1', limit = '20' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `SELECT r.*, m.nome as motorista_nome, v.placa as veiculo_placa,
               (SELECT COUNT(*) FROM rotas_entregas WHERE rota_id = r.id) as total_entregas
               FROM rotas r
               LEFT JOIN motoristas m ON r.motorista_id = m.id
               LEFT JOIN veiculos v ON r.veiculo_id = v.id
               WHERE r.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (data_inicio) {
    query += ` AND r.data_rota >= ?`;
    params.push(data_inicio);
  }
  
  if (data_fim) {
    query += ` AND r.data_rota <= ?`;
    params.push(data_fim);
  }
  
  if (motorista_id) {
    query += ` AND r.motorista_id = ?`;
    params.push(motorista_id);
  }
  
  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }
  
  // Contagem
  const countQuery = query.replace(/SELECT r\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
  
  query += ` ORDER BY r.data_rota DESC, r.created_at DESC LIMIT ? OFFSET ?`;
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

// GET /api/rotas/:id - Buscar rota com entregas
rotas.get('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const rota = await c.env.DB.prepare(`
    SELECT r.*, m.nome as motorista_nome, m.telefone as motorista_telefone,
           v.placa as veiculo_placa, v.modelo as veiculo_modelo
    FROM rotas r
    LEFT JOIN motoristas m ON r.motorista_id = m.id
    LEFT JOIN veiculos v ON r.veiculo_id = v.id
    WHERE r.id = ? AND r.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  // Buscar entregas da rota
  const entregas = await c.env.DB.prepare(`
    SELECT re.*, e.numero as entrega_numero, e.status as entrega_status,
           c.razao_social as cliente_nome, c.telefone as cliente_telefone,
           ce.logradouro, ce.numero, ce.bairro, ce.cidade, ce.uf, ce.cep
    FROM rotas_entregas re
    JOIN entregas e ON re.entrega_id = e.id
    JOIN clientes c ON e.cliente_id = c.id
    LEFT JOIN clientes_enderecos ce ON e.endereco_entrega_id = ce.id
    WHERE re.rota_id = ?
    ORDER BY re.ordem
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: {
      ...rota,
      entregas: entregas.results
    }
  });
});

// POST /api/rotas - Criar rota
rotas.post('/', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const validation = rotaSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const { nome, descricao, data_rota, motorista_id, veiculo_id, km_estimado, tempo_estimado_minutos, observacoes } = validation.data;
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO rotas (id, empresa_id, nome, descricao, data_rota, motorista_id, veiculo_id,
                       km_estimado, tempo_estimado_minutos, observacoes, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLANEJADA', ?)
  `).bind(id, empresaId, nome, descricao || null, data_rota, motorista_id || null, veiculo_id || null,
          km_estimado || null, tempo_estimado_minutos || null, observacoes || null, usuarioId).run();
  
  return c.json({ id, message: 'Rota criada com sucesso' }, 201);
});

// PUT /api/rotas/:id - Atualizar rota
rotas.put('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const validation = rotaSchema.partial().safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  // Verificar se existe e se pode editar
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status === 'FINALIZADA') {
    return c.json({ error: 'Rota finalizada não pode ser alterada' }, 400);
  }
  
  const campos = Object.keys(validation.data);
  const valores = Object.values(validation.data);
  
  if (campos.length > 0) {
    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    await c.env.DB.prepare(`
      UPDATE rotas SET ${setClause}, updated_at = CURRENT_TIMESTAMP, updated_by = ?
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, usuarioId, id, empresaId).run();
  }
  
  return c.json({ message: 'Rota atualizada com sucesso' });
});

// POST /api/rotas/:id/entregas - Adicionar entrega à rota
rotas.post('/:id/entregas', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const validation = rotaEntregaSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  // Verificar se rota existe e está aberta
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status === 'FINALIZADA') {
    return c.json({ error: 'Rota finalizada não aceita novas entregas' }, 400);
  }
  
  // Verificar se entrega existe
  const entrega = await c.env.DB.prepare(`
    SELECT id FROM entregas WHERE id = ? AND empresa_id = ?
  `).bind(validation.data.entrega_id, empresaId).first();
  
  if (!entrega) {
    return c.json({ error: 'Entrega não encontrada' }, 404);
  }
  
  const rotaEntregaId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO rotas_entregas (id, rota_id, entrega_id, ordem, hora_prevista, observacoes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(rotaEntregaId, id, validation.data.entrega_id, validation.data.ordem,
          validation.data.hora_prevista || null, validation.data.observacoes || null, usuarioId).run();
  
  return c.json({ id: rotaEntregaId, message: 'Entrega adicionada à rota' }, 201);
});

// DELETE /api/rotas/:id/entregas/:entregaId - Remover entrega da rota
rotas.delete('/:id/entregas/:entregaId', async (c) => {
  const empresaId = c.get('empresaId');
  const { id, entregaId } = c.req.param();
  
  // Verificar se rota existe e está aberta
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status !== 'PLANEJADA') {
    return c.json({ error: 'Só é possível remover entregas de rotas planejadas' }, 400);
  }
  
  const result = await c.env.DB.prepare(`
    DELETE FROM rotas_entregas WHERE rota_id = ? AND entrega_id = ?
  `).bind(id, entregaId).run();
  
  if (result.meta.changes === 0) {
    return c.json({ error: 'Entrega não encontrada na rota' }, 404);
  }
  
  return c.json({ message: 'Entrega removida da rota' });
});

// PUT /api/rotas/:id/reordenar - Reordenar entregas
rotas.put('/:id/reordenar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    entregas: z.array(z.object({
      entrega_id: z.string().uuid(),
      ordem: z.number().int().min(1)
    }))
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  // Verificar se rota existe
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status === 'FINALIZADA') {
    return c.json({ error: 'Rota finalizada não pode ser reordenada' }, 400);
  }
  
  // Atualizar ordem de cada entrega
  for (const item of validation.data.entregas) {
    await c.env.DB.prepare(`
      UPDATE rotas_entregas SET ordem = ?, updated_at = CURRENT_TIMESTAMP
      WHERE rota_id = ? AND entrega_id = ?
    `).bind(item.ordem, id, item.entrega_id).run();
  }
  
  return c.json({ message: 'Ordem das entregas atualizada' });
});

// POST /api/rotas/:id/iniciar - Iniciar rota
rotas.post('/:id/iniciar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  
  const rota = await c.env.DB.prepare(`
    SELECT status, motorista_id, veiculo_id FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status !== 'PLANEJADA') {
    return c.json({ error: 'Só é possível iniciar rotas planejadas' }, 400);
  }
  
  if (!rota.motorista_id || !rota.veiculo_id) {
    return c.json({ error: 'Rota precisa ter motorista e veículo definidos' }, 400);
  }
  
  // Verificar se tem entregas
  const entregas = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM rotas_entregas WHERE rota_id = ?
  `).bind(id).first();
  
  if (!entregas || (entregas.total as number) === 0) {
    return c.json({ error: 'Rota precisa ter pelo menos uma entrega' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE rotas SET status = 'EM_ANDAMENTO', hora_inicio = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP, updated_by = ?
    WHERE id = ?
  `).bind(usuarioId, id).run();
  
  return c.json({ message: 'Rota iniciada com sucesso' });
});

// POST /api/rotas/:id/finalizar - Finalizar rota
rotas.post('/:id/finalizar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    km_final: z.number().min(0).optional(),
    observacoes_finalizacao: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status !== 'EM_ANDAMENTO') {
    return c.json({ error: 'Só é possível finalizar rotas em andamento' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE rotas SET status = 'FINALIZADA', hora_fim = CURRENT_TIMESTAMP,
                     km_real = ?, observacoes_finalizacao = ?,
                     updated_at = CURRENT_TIMESTAMP, updated_by = ?
    WHERE id = ?
  `).bind(validation.data?.km_final || null, validation.data?.observacoes_finalizacao || null, usuarioId, id).run();
  
  return c.json({ message: 'Rota finalizada com sucesso' });
});

// GET /api/rotas/otimizar - Sugerir otimização de rota
rotas.get('/otimizar', async (c) => {
  const empresaId = c.get('empresaId');
  const { entregas_ids } = c.req.query();
  
  if (!entregas_ids) {
    return c.json({ error: 'Informe as entregas para otimizar' }, 400);
  }
  
  const ids = entregas_ids.split(',');
  
  // Buscar endereços das entregas
  const placeholders = ids.map(() => '?').join(',');
  const entregas = await c.env.DB.prepare(`
    SELECT e.id, e.numero, c.razao_social,
           ce.logradouro, ce.numero as endereco_numero, ce.bairro, ce.cidade, ce.uf, ce.cep,
           ce.latitude, ce.longitude
    FROM entregas e
    JOIN clientes c ON e.cliente_id = c.id
    LEFT JOIN clientes_enderecos ce ON e.endereco_entrega_id = ce.id
    WHERE e.id IN (${placeholders}) AND e.empresa_id = ?
  `).bind(...ids, empresaId).all();
  
  // Ordenar por proximidade (simplificado - por CEP/bairro)
  // Em produção, usar API de geocoding/routing
  const entregasOrdenadas = entregas.results.sort((a: any, b: any) => {
    if (a.cep && b.cep) {
      return a.cep.localeCompare(b.cep);
    }
    if (a.bairro && b.bairro) {
      return a.bairro.localeCompare(b.bairro);
    }
    return 0;
  });
  
  return c.json({
    success: true,
    data: {
      entregas_otimizadas: entregasOrdenadas.map((e: any, index: number) => ({
        ...e,
        ordem_sugerida: index + 1
      })),
      observacao: 'Ordenação simplificada por CEP/bairro. Para otimização real, integrar com API de routing.'
    }
  });
});

// DELETE /api/rotas/:id - Excluir rota
rotas.delete('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const rota = await c.env.DB.prepare(`
    SELECT status FROM rotas WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!rota) {
    return c.json({ error: 'Rota não encontrada' }, 404);
  }
  
  if (rota.status !== 'PLANEJADA') {
    return c.json({ error: 'Só é possível excluir rotas planejadas' }, 400);
  }
  
  // Remover entregas da rota
  await c.env.DB.prepare(`DELETE FROM rotas_entregas WHERE rota_id = ?`).bind(id).run();
  
  // Remover rota
  await c.env.DB.prepare(`DELETE FROM rotas WHERE id = ?`).bind(id).run();
  
  return c.json({ message: 'Rota excluída com sucesso' });
});

export default rotas;
