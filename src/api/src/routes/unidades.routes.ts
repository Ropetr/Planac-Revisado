// ============================================
// PLANAC ERP - Rotas de Unidades de Medida
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const unidades = new Hono<{ Bindings: Bindings; Variables: Variables }>();

unidades.use('/*', requireAuth());

// Schemas
const unidadeSchema = z.object({
  sigla: z.string().min(1).max(10),
  nome: z.string().min(2).max(50),
  permite_fracionamento: z.boolean().default(false),
  casas_decimais: z.number().int().min(0).max(6).default(0),
  ativa: z.boolean().default(true)
});

const conversaoSchema = z.object({
  unidade_origem_id: z.string().uuid(),
  unidade_destino_id: z.string().uuid(),
  fator_conversao: z.number().positive()
});

// GET /unidades - Listar
unidades.get('/', requirePermission('produtos', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { busca, ativa } = c.req.query();

  let query = `SELECT * FROM unidades WHERE empresa_id = ?`;
  const params: any[] = [usuario.empresa_id];

  if (busca) {
    query += ` AND (sigla LIKE ? OR nome LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`);
  }

  if (ativa !== undefined) {
    query += ` AND ativa = ?`;
    params.push(ativa === 'true' ? 1 : 0);
  }

  query += ` ORDER BY sigla`;

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ success: true, data: result.results });
});

// GET /unidades/conversoes - Listar conversões
unidades.get('/conversoes', requirePermission('produtos', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  const result = await c.env.DB.prepare(`
    SELECT 
      uc.*,
      uo.sigla as unidade_origem_sigla,
      uo.nome as unidade_origem_nome,
      ud.sigla as unidade_destino_sigla,
      ud.nome as unidade_destino_nome
    FROM unidades_conversao uc
    JOIN unidades uo ON uc.unidade_origem_id = uo.id
    JOIN unidades ud ON uc.unidade_destino_id = ud.id
    WHERE uc.empresa_id = ?
    ORDER BY uo.sigla, ud.sigla
  `).bind(usuario.empresa_id).all();

  return c.json({ success: true, data: result.results });
});

// GET /unidades/:id - Buscar
unidades.get('/:id', requirePermission('produtos', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const unidade = await c.env.DB.prepare(`
    SELECT * FROM unidades WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!unidade) {
    return c.json({ success: false, error: 'Unidade não encontrada' }, 404);
  }

  // Quantidade de produtos
  const qtdProdutos = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM produtos WHERE unidade_id = ?
  `).bind(id).first<{ total: number }>();

  // Conversões
  const conversoes = await c.env.DB.prepare(`
    SELECT 
      uc.*,
      u.sigla as unidade_destino_sigla,
      u.nome as unidade_destino_nome
    FROM unidades_conversao uc
    JOIN unidades u ON uc.unidade_destino_id = u.id
    WHERE uc.unidade_origem_id = ?
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...unidade,
      quantidade_produtos: qtdProdutos?.total || 0,
      conversoes: conversoes.results
    }
  });
});

// POST /unidades - Criar
unidades.post('/', requirePermission('produtos', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = unidadeSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar sigla duplicada
  const existe = await c.env.DB.prepare(`
    SELECT id FROM unidades WHERE empresa_id = ? AND UPPER(sigla) = UPPER(?)
  `).bind(usuario.empresa_id, data.sigla).first();

  if (existe) {
    return c.json({ success: false, error: 'Sigla já cadastrada' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO unidades (id, empresa_id, sigla, nome, permite_fracionamento, casas_decimais, ativa)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, usuario.empresa_id, data.sigla.toUpperCase(), data.nome,
    data.permite_fracionamento ? 1 : 0, data.casas_decimais, data.ativa ? 1 : 0
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'unidades',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id } }, 201);
});

// POST /unidades/conversoes - Criar conversão
unidades.post('/conversoes', requirePermission('produtos', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = conversaoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar se unidades existem
  const unidadeOrigem = await c.env.DB.prepare(`
    SELECT id FROM unidades WHERE id = ? AND empresa_id = ?
  `).bind(data.unidade_origem_id, usuario.empresa_id).first();

  const unidadeDestino = await c.env.DB.prepare(`
    SELECT id FROM unidades WHERE id = ? AND empresa_id = ?
  `).bind(data.unidade_destino_id, usuario.empresa_id).first();

  if (!unidadeOrigem || !unidadeDestino) {
    return c.json({ success: false, error: 'Unidade não encontrada' }, 404);
  }

  // Verificar conversão duplicada
  const existe = await c.env.DB.prepare(`
    SELECT id FROM unidades_conversao 
    WHERE empresa_id = ? AND unidade_origem_id = ? AND unidade_destino_id = ?
  `).bind(usuario.empresa_id, data.unidade_origem_id, data.unidade_destino_id).first();

  if (existe) {
    return c.json({ success: false, error: 'Conversão já cadastrada' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO unidades_conversao (id, empresa_id, unidade_origem_id, unidade_destino_id, fator_conversao)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, usuario.empresa_id, data.unidade_origem_id, data.unidade_destino_id, data.fator_conversao).run();

  // Criar conversão reversa automaticamente
  const idReverso = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO unidades_conversao (id, empresa_id, unidade_origem_id, unidade_destino_id, fator_conversao)
    VALUES (?, ?, ?, ?, ?)
  `).bind(idReverso, usuario.empresa_id, data.unidade_destino_id, data.unidade_origem_id, 1 / data.fator_conversao).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'unidades_conversao',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id, id_reverso: idReverso } }, 201);
});

// PUT /unidades/:id - Atualizar
unidades.put('/:id', requirePermission('produtos', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const unidadeAtual = await c.env.DB.prepare(`
    SELECT * FROM unidades WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!unidadeAtual) {
    return c.json({ success: false, error: 'Unidade não encontrada' }, 404);
  }

  const validation = unidadeSchema.partial().safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar sigla duplicada
  if (data.sigla) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM unidades WHERE empresa_id = ? AND UPPER(sigla) = UPPER(?) AND id != ?
    `).bind(usuario.empresa_id, data.sigla, id).first();

    if (existe) {
      return c.json({ success: false, error: 'Sigla já cadastrada' }, 400);
    }
  }

  await c.env.DB.prepare(`
    UPDATE unidades SET
      sigla = COALESCE(?, sigla),
      nome = COALESCE(?, nome),
      permite_fracionamento = COALESCE(?, permite_fracionamento),
      casas_decimais = COALESCE(?, casas_decimais),
      ativa = COALESCE(?, ativa),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(
    data.sigla?.toUpperCase(), data.nome,
    data.permite_fracionamento !== undefined ? (data.permite_fracionamento ? 1 : 0) : null,
    data.casas_decimais,
    data.ativa !== undefined ? (data.ativa ? 1 : 0) : null,
    id, usuario.empresa_id
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ATUALIZAR',
    entidade: 'unidades',
    entidade_id: id,
    dados_anteriores: unidadeAtual,
    dados_novos: data
  });

  return c.json({ success: true, message: 'Unidade atualizada' });
});

// DELETE /unidades/:id - Excluir
unidades.delete('/:id', requirePermission('produtos', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const unidade = await c.env.DB.prepare(`
    SELECT * FROM unidades WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!unidade) {
    return c.json({ success: false, error: 'Unidade não encontrada' }, 404);
  }

  // Verificar produtos vinculados
  const produtos = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM produtos WHERE unidade_id = ?
  `).bind(id).first<{ total: number }>();

  if (produtos && produtos.total > 0) {
    return c.json({ success: false, error: 'Unidade possui produtos vinculados' }, 400);
  }

  // Excluir conversões
  await c.env.DB.prepare(`
    DELETE FROM unidades_conversao WHERE unidade_origem_id = ? OR unidade_destino_id = ?
  `).bind(id, id).run();

  await c.env.DB.prepare(`DELETE FROM unidades WHERE id = ?`).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'EXCLUIR',
    entidade: 'unidades',
    entidade_id: id,
    dados_anteriores: unidade
  });

  return c.json({ success: true, message: 'Unidade excluída' });
});

// DELETE /unidades/conversoes/:id - Excluir conversão
unidades.delete('/conversoes/:id', requirePermission('produtos', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const conversao = await c.env.DB.prepare(`
    SELECT * FROM unidades_conversao WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!conversao) {
    return c.json({ success: false, error: 'Conversão não encontrada' }, 404);
  }

  // Excluir conversão e sua reversa
  await c.env.DB.prepare(`
    DELETE FROM unidades_conversao 
    WHERE empresa_id = ? AND (
      (unidade_origem_id = ? AND unidade_destino_id = ?) OR
      (unidade_origem_id = ? AND unidade_destino_id = ?)
    )
  `).bind(
    usuario.empresa_id,
    conversao.unidade_origem_id, conversao.unidade_destino_id,
    conversao.unidade_destino_id, conversao.unidade_origem_id
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'EXCLUIR',
    entidade: 'unidades_conversao',
    entidade_id: id,
    dados_anteriores: conversao
  });

  return c.json({ success: true, message: 'Conversão excluída' });
});

// POST /unidades/converter - Converter quantidade entre unidades
unidades.post('/converter', requirePermission('produtos', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const { unidade_origem_id, unidade_destino_id, quantidade } = body;

  if (!unidade_origem_id || !unidade_destino_id || quantidade === undefined) {
    return c.json({ success: false, error: 'Parâmetros obrigatórios: unidade_origem_id, unidade_destino_id, quantidade' }, 400);
  }

  // Mesma unidade
  if (unidade_origem_id === unidade_destino_id) {
    return c.json({
      success: true,
      data: {
        quantidade_origem: quantidade,
        quantidade_destino: quantidade,
        fator_conversao: 1
      }
    });
  }

  // Buscar conversão
  const conversao = await c.env.DB.prepare(`
    SELECT fator_conversao FROM unidades_conversao
    WHERE empresa_id = ? AND unidade_origem_id = ? AND unidade_destino_id = ?
  `).bind(usuario.empresa_id, unidade_origem_id, unidade_destino_id).first<{ fator_conversao: number }>();

  if (!conversao) {
    return c.json({ success: false, error: 'Conversão não cadastrada entre essas unidades' }, 400);
  }

  return c.json({
    success: true,
    data: {
      quantidade_origem: quantidade,
      quantidade_destino: quantidade * conversao.fator_conversao,
      fator_conversao: conversao.fator_conversao
    }
  });
});

export default unidades;
