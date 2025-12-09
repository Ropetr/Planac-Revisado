// ============================================
// PLANAC ERP - Rotas de Perfis e Permissões
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const perfis = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware de autenticação
perfis.use('/*', requireAuth());

// Schemas de validação
const criarPerfilSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  codigo: z.string().min(2, 'Código deve ter no mínimo 2 caracteres').regex(/^[a-z_]+$/, 'Código deve conter apenas letras minúsculas e underscore'),
  descricao: z.string().optional(),
  permissoes: z.array(z.string().uuid()).optional()
});

const editarPerfilSchema = z.object({
  nome: z.string().min(3).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  permissoes: z.array(z.string().uuid()).optional()
});

// GET /perfis - Listar perfis
perfis.get('/', requirePermission('perfis', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { ativo } = c.req.query();

  let query = `
    SELECT 
      p.id, p.nome, p.codigo, p.descricao, p.sistema, p.ativo, p.created_at,
      (SELECT COUNT(*) FROM usuarios_perfis WHERE perfil_id = p.id) as total_usuarios,
      (SELECT COUNT(*) FROM perfis_permissoes WHERE perfil_id = p.id) as total_permissoes
    FROM perfis p
    WHERE p.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (ativo !== undefined) {
    query += ` AND p.ativo = ?`;
    params.push(ativo === 'true' ? 1 : 0);
  }

  query += ` ORDER BY p.nome`;

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results
  });
});

// GET /perfis/:id - Buscar perfil
perfis.get('/:id', requirePermission('perfis', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const perfil = await c.env.DB.prepare(`
    SELECT * FROM perfis WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!perfil) {
    return c.json({ success: false, error: 'Perfil não encontrado' }, 404);
  }

  // Buscar permissões
  const permissoes = await c.env.DB.prepare(`
    SELECT pm.id, pm.modulo, pm.acao, pm.codigo, pm.descricao
    FROM perfis_permissoes pp
    JOIN permissoes pm ON pp.permissao_id = pm.id
    WHERE pp.perfil_id = ?
    ORDER BY pm.modulo, pm.acao
  `).bind(id).all();

  // Buscar usuários
  const usuarios = await c.env.DB.prepare(`
    SELECT u.id, u.nome, u.email
    FROM usuarios_perfis up
    JOIN usuarios u ON up.usuario_id = u.id
    WHERE up.perfil_id = ?
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...perfil,
      permissoes: permissoes.results,
      usuarios: usuarios.results
    }
  });
});

// POST /perfis - Criar perfil
perfis.post('/', requirePermission('perfis', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validacao = criarPerfilSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ 
      success: false, 
      error: 'Dados inválidos', 
      details: validacao.error.errors 
    }, 400);
  }

  const dados = validacao.data;

  // Verificar código único
  const codigoExiste = await c.env.DB.prepare(`
    SELECT id FROM perfis WHERE codigo = ? AND empresa_id = ?
  `).bind(dados.codigo, usuario.empresa_id).first();

  if (codigoExiste) {
    return c.json({ success: false, error: 'Código já existe' }, 400);
  }

  // Criar perfil
  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO perfis (id, empresa_id, nome, codigo, descricao, sistema, ativo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
  `).bind(
    id,
    usuario.empresa_id,
    dados.nome,
    dados.codigo,
    dados.descricao || null,
    new Date().toISOString(),
    new Date().toISOString()
  ).run();

  // Vincular permissões
  if (dados.permissoes && dados.permissoes.length > 0) {
    for (const permissaoId of dados.permissoes) {
      await c.env.DB.prepare(`
        INSERT INTO perfis_permissoes (id, perfil_id, permissao_id, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), id, permissaoId, new Date().toISOString()).run();
    }
  }

  // Auditoria
  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'criar',
    tabela: 'perfis',
    registro_id: id,
    dados_novos: dados
  });

  return c.json({
    success: true,
    data: { id },
    message: 'Perfil criado com sucesso'
  }, 201);
});

// PUT /perfis/:id - Editar perfil
perfis.put('/:id', requirePermission('perfis', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validacao = editarPerfilSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ 
      success: false, 
      error: 'Dados inválidos', 
      details: validacao.error.errors 
    }, 400);
  }

  const dados = validacao.data;

  // Verificar se perfil existe
  const perfil = await c.env.DB.prepare(`
    SELECT * FROM perfis WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!perfil) {
    return c.json({ success: false, error: 'Perfil não encontrado' }, 404);
  }

  // Perfis do sistema não podem ser editados
  if (perfil.sistema) {
    return c.json({ success: false, error: 'Perfis do sistema não podem ser editados' }, 400);
  }

  // Montar update
  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [new Date().toISOString()];

  if (dados.nome !== undefined) {
    updates.push('nome = ?');
    params.push(dados.nome);
  }

  if (dados.descricao !== undefined) {
    updates.push('descricao = ?');
    params.push(dados.descricao);
  }

  if (dados.ativo !== undefined) {
    updates.push('ativo = ?');
    params.push(dados.ativo ? 1 : 0);
  }

  params.push(id);

  await c.env.DB.prepare(`
    UPDATE perfis SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();

  // Atualizar permissões se informadas
  if (dados.permissoes !== undefined) {
    // Remover permissões atuais
    await c.env.DB.prepare(`
      DELETE FROM perfis_permissoes WHERE perfil_id = ?
    `).bind(id).run();

    // Adicionar novas permissões
    for (const permissaoId of dados.permissoes) {
      await c.env.DB.prepare(`
        INSERT INTO perfis_permissoes (id, perfil_id, permissao_id, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), id, permissaoId, new Date().toISOString()).run();
    }
  }

  // Auditoria
  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'editar',
    tabela: 'perfis',
    registro_id: id,
    dados_anteriores: perfil,
    dados_novos: dados
  });

  return c.json({ success: true, message: 'Perfil atualizado com sucesso' });
});

// DELETE /perfis/:id - Desativar perfil
perfis.delete('/:id', requirePermission('perfis', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const perfil = await c.env.DB.prepare(`
    SELECT * FROM perfis WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!perfil) {
    return c.json({ success: false, error: 'Perfil não encontrado' }, 404);
  }

  if (perfil.sistema) {
    return c.json({ success: false, error: 'Perfis do sistema não podem ser excluídos' }, 400);
  }

  // Verificar se há usuários vinculados
  const usuariosVinculados = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM usuarios_perfis WHERE perfil_id = ?
  `).bind(id).first<{ total: number }>();

  if (usuariosVinculados && usuariosVinculados.total > 0) {
    return c.json({ 
      success: false, 
      error: `Existem ${usuariosVinculados.total} usuários vinculados a este perfil` 
    }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE perfis SET ativo = 0, updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();

  // Auditoria
  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'desativar',
    tabela: 'perfis',
    registro_id: id
  });

  return c.json({ success: true, message: 'Perfil desativado com sucesso' });
});

// GET /permissoes - Listar todas as permissões disponíveis
perfis.get('/permissoes/todas', requirePermission('perfis', 'visualizar'), async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT id, modulo, acao, codigo, descricao
    FROM permissoes
    WHERE ativo = 1
    ORDER BY modulo, acao
  `).all();

  // Agrupar por módulo
  const agrupado: Record<string, any[]> = {};
  for (const p of result.results as any[]) {
    if (!agrupado[p.modulo]) {
      agrupado[p.modulo] = [];
    }
    agrupado[p.modulo].push(p);
  }

  return c.json({
    success: true,
    data: agrupado
  });
});

export default perfis;
