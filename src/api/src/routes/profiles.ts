/**
 * 🎭 PLANAC ERP - Profiles Routes
 * CRUD de perfis e gestão de permissões
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, requirePermission, Env } from '../middleware/auth';

const profiles = new Hono<{ Bindings: Env }>();

// Aplicar autenticação em todas as rotas
profiles.use('*', authMiddleware());

// ============================================
// Schemas de Validação
// ============================================

const createProfileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional(),
  nivel: z.number().min(1).max(10).default(5),
  padrao: z.boolean().default(false),
  permissoes: z.array(z.string()).optional()
});

const updateProfileSchema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  nivel: z.number().min(1).max(10).optional(),
  padrao: z.boolean().optional(),
  ativo: z.boolean().optional()
});

const updatePermissionsSchema = z.object({
  permissoes: z.array(z.string())
});

// ============================================
// GET /profiles - Listar perfis
// ============================================

profiles.get('/', requirePermission('perfis', 'ver'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const incluirInativos = c.req.query('incluir_inativos') === '1';
  
  try {
    let whereClause = 'WHERE empresa_id = ?';
    if (!incluirInativos) {
      whereClause += ' AND ativo = 1';
    }
    
    const perfisResult = await db.prepare(`
      SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.nivel,
        p.padrao,
        p.ativo,
        p.created_at,
        (SELECT COUNT(*) FROM usuarios_perfis WHERE perfil_id = p.id) as qtd_usuarios
      FROM perfis p
      ${whereClause}
      ORDER BY p.nivel ASC, p.nome ASC
    `).bind(empresaId).all<{
      id: string;
      nome: string;
      descricao: string | null;
      nivel: number;
      padrao: number;
      ativo: number;
      created_at: string;
      qtd_usuarios: number;
    }>();
    
    return c.json({
      success: true,
      data: (perfisResult.results || []).map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        nivel: p.nivel,
        padrao: Boolean(p.padrao),
        ativo: Boolean(p.ativo),
        created_at: p.created_at,
        qtd_usuarios: p.qtd_usuarios
      }))
    });
    
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar perfis' }
    }, 500);
  }
});

// ============================================
// GET /profiles/permissions - Listar todas permissões
// ============================================

profiles.get('/permissions', requirePermission('perfis', 'ver'), async (c) => {
  const db = c.env.DB;
  
  try {
    const permissoesResult = await db.prepare(`
      SELECT id, modulo, acao, descricao
      FROM permissoes
      ORDER BY modulo ASC, acao ASC
    `).all<{
      id: string;
      modulo: string;
      acao: string;
      descricao: string | null;
    }>();
    
    // Agrupar por módulo
    const agrupado: Record<string, Array<{
      id: string;
      acao: string;
      descricao: string | null;
    }>> = {};
    
    for (const p of permissoesResult.results || []) {
      if (!agrupado[p.modulo]) {
        agrupado[p.modulo] = [];
      }
      agrupado[p.modulo].push({
        id: p.id,
        acao: p.acao,
        descricao: p.descricao
      });
    }
    
    return c.json({
      success: true,
      data: {
        total: (permissoesResult.results || []).length,
        modulos: Object.keys(agrupado),
        permissoes: agrupado
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar permissões' }
    }, 500);
  }
});

// ============================================
// GET /profiles/:id - Buscar perfil com permissões
// ============================================

profiles.get('/:id', requirePermission('perfis', 'ver'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const perfilId = c.req.param('id');
  
  try {
    const perfil = await db.prepare(`
      SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.nivel,
        p.padrao,
        p.ativo,
        p.created_at,
        p.updated_at
      FROM perfis p
      WHERE p.id = ? AND p.empresa_id = ?
    `).bind(perfilId, empresaId).first<{
      id: string;
      nome: string;
      descricao: string | null;
      nivel: number;
      padrao: number;
      ativo: number;
      created_at: string;
      updated_at: string;
    }>();
    
    if (!perfil) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' }
      }, 404);
    }
    
    // Buscar permissões do perfil
    const permissoesResult = await db.prepare(`
      SELECT perm.id, perm.modulo, perm.acao
      FROM permissoes perm
      INNER JOIN perfis_permissoes pp ON pp.permissao_id = perm.id
      WHERE pp.perfil_id = ?
    `).bind(perfilId).all<{ id: string; modulo: string; acao: string }>();
    
    // Buscar usuários do perfil
    const usuariosResult = await db.prepare(`
      SELECT u.id, u.nome, u.email
      FROM usuarios u
      INNER JOIN usuarios_perfis up ON up.usuario_id = u.id
      WHERE up.perfil_id = ?
    `).bind(perfilId).all<{ id: string; nome: string; email: string }>();
    
    return c.json({
      success: true,
      data: {
        id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        nivel: perfil.nivel,
        padrao: Boolean(perfil.padrao),
        ativo: Boolean(perfil.ativo),
        created_at: perfil.created_at,
        updated_at: perfil.updated_at,
        permissoes: (permissoesResult.results || []).map(p => ({
          id: p.id,
          modulo: p.modulo,
          acao: p.acao,
          codigo: `${p.modulo}:${p.acao}`
        })),
        usuarios: usuariosResult.results || []
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar perfil' }
    }, 500);
  }
});

// ============================================
// GET /profiles/:id/matrix - Matriz de permissões
// ============================================

profiles.get('/:id/matrix', requirePermission('perfis', 'ver'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const perfilId = c.req.param('id');
  
  try {
    // Verificar se perfil existe
    const perfil = await db.prepare(`
      SELECT id, nome FROM perfis WHERE id = ? AND empresa_id = ?
    `).bind(perfilId, empresaId).first();
    
    if (!perfil) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' }
      }, 404);
    }
    
    // Buscar todas as permissões
    const todasPermissoes = await db.prepare(`
      SELECT id, modulo, acao FROM permissoes ORDER BY modulo, acao
    `).all<{ id: string; modulo: string; acao: string }>();
    
    // Buscar permissões do perfil
    const permissoesPerfil = await db.prepare(`
      SELECT permissao_id FROM perfis_permissoes WHERE perfil_id = ?
    `).bind(perfilId).all<{ permissao_id: string }>();
    
    const permissoesAtivas = new Set((permissoesPerfil.results || []).map(p => p.permissao_id));
    
    // Construir matriz
    const matriz: Record<string, Record<string, { id: string; ativo: boolean }>> = {};
    const acoes = new Set<string>();
    
    for (const p of todasPermissoes.results || []) {
      if (!matriz[p.modulo]) {
        matriz[p.modulo] = {};
      }
      matriz[p.modulo][p.acao] = {
        id: p.id,
        ativo: permissoesAtivas.has(p.id)
      };
      acoes.add(p.acao);
    }
    
    return c.json({
      success: true,
      data: {
        perfil: perfil,
        acoes: Array.from(acoes).sort(),
        modulos: Object.keys(matriz).sort(),
        matriz
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar matriz:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar matriz' }
    }, 500);
  }
});

// ============================================
// POST /profiles - Criar perfil
// ============================================

profiles.post('/', requirePermission('perfis', 'criar'), zValidator('json', createProfileSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const body = c.req.valid('json');
  
  try {
    // Verificar se nome já existe
    const existing = await db.prepare(`
      SELECT id FROM perfis WHERE nome = ? AND empresa_id = ?
    `).bind(body.nome, empresaId).first();
    
    if (existing) {
      return c.json({
        success: false,
        error: { code: 'NAME_EXISTS', message: 'Já existe um perfil com este nome' }
      }, 400);
    }
    
    // Se for padrão, desmarcar outros
    if (body.padrao) {
      await db.prepare(`
        UPDATE perfis SET padrao = 0 WHERE empresa_id = ?
      `).bind(empresaId).run();
    }
    
    // Gerar ID
    const id = crypto.randomUUID();
    
    // Criar perfil
    await db.prepare(`
      INSERT INTO perfis (id, empresa_id, nome, descricao, nivel, padrao)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      empresaId,
      body.nome,
      body.descricao || null,
      body.nivel,
      body.padrao ? 1 : 0
    ).run();
    
    // Adicionar permissões se fornecidas
    if (body.permissoes && body.permissoes.length > 0) {
      for (const permissaoId of body.permissoes) {
        await db.prepare(`
          INSERT INTO perfis_permissoes (perfil_id, permissao_id)
          VALUES (?, ?)
        `).bind(id, permissaoId).run();
      }
    }
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_depois, ip_address)
      VALUES (?, ?, 'criar', 'perfis', 'perfis', ?, ?, ?)
    `).bind(empresaId, user.sub, id, JSON.stringify(body), ip).run();
    
    return c.json({
      success: true,
      data: {
        id,
        nome: body.nome,
        descricao: body.descricao || null,
        nivel: body.nivel,
        padrao: body.padrao
      },
      message: 'Perfil criado com sucesso'
    }, 201);
    
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar perfil' }
    }, 500);
  }
});

// ============================================
// PUT /profiles/:id - Atualizar perfil
// ============================================

profiles.put('/:id', requirePermission('perfis', 'editar'), zValidator('json', updateProfileSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const perfilId = c.req.param('id');
  const body = c.req.valid('json');
  
  try {
    // Verificar se perfil existe
    const existing = await db.prepare(`
      SELECT * FROM perfis WHERE id = ? AND empresa_id = ?
    `).bind(perfilId, empresaId).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' }
      }, 404);
    }
    
    // Verificar nome duplicado
    if (body.nome) {
      const nameExists = await db.prepare(`
        SELECT id FROM perfis WHERE nome = ? AND empresa_id = ? AND id != ?
      `).bind(body.nome, empresaId, perfilId).first();
      
      if (nameExists) {
        return c.json({
          success: false,
          error: { code: 'NAME_EXISTS', message: 'Já existe um perfil com este nome' }
        }, 400);
      }
    }
    
    // Se for marcar como padrão, desmarcar outros
    if (body.padrao) {
      await db.prepare(`
        UPDATE perfis SET padrao = 0 WHERE empresa_id = ?
      `).bind(empresaId).run();
    }
    
    // Construir update
    const updates: string[] = ['updated_at = datetime(\'now\')'];
    const params: (string | number | null)[] = [];
    
    if (body.nome !== undefined) {
      updates.push('nome = ?');
      params.push(body.nome);
    }
    if (body.descricao !== undefined) {
      updates.push('descricao = ?');
      params.push(body.descricao || null);
    }
    if (body.nivel !== undefined) {
      updates.push('nivel = ?');
      params.push(body.nivel);
    }
    if (body.padrao !== undefined) {
      updates.push('padrao = ?');
      params.push(body.padrao ? 1 : 0);
    }
    if (body.ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(body.ativo ? 1 : 0);
    }
    
    params.push(perfilId);
    
    await db.prepare(`
      UPDATE perfis SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_antes, dados_depois, ip_address)
      VALUES (?, ?, 'editar', 'perfis', 'perfis', ?, ?, ?, ?)
    `).bind(empresaId, user.sub, perfilId, JSON.stringify(existing), JSON.stringify(body), ip).run();
    
    return c.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar perfil' }
    }, 500);
  }
});

// ============================================
// PUT /profiles/:id/permissions - Atualizar permissões
// ============================================

profiles.put('/:id/permissions', requirePermission('perfis', 'editar'), zValidator('json', updatePermissionsSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const perfilId = c.req.param('id');
  const { permissoes } = c.req.valid('json');
  
  try {
    // Verificar se perfil existe
    const existing = await db.prepare(`
      SELECT id FROM perfis WHERE id = ? AND empresa_id = ?
    `).bind(perfilId, empresaId).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' }
      }, 404);
    }
    
    // Buscar permissões anteriores
    const permissoesAnteriores = await db.prepare(`
      SELECT permissao_id FROM perfis_permissoes WHERE perfil_id = ?
    `).bind(perfilId).all<{ permissao_id: string }>();
    
    // Remover todas as permissões atuais
    await db.prepare(`
      DELETE FROM perfis_permissoes WHERE perfil_id = ?
    `).bind(perfilId).run();
    
    // Adicionar novas permissões
    for (const permissaoId of permissoes) {
      await db.prepare(`
        INSERT INTO perfis_permissoes (perfil_id, permissao_id)
        VALUES (?, ?)
      `).bind(perfilId, permissaoId).run();
    }
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_antes, dados_depois, ip_address)
      VALUES (?, ?, 'editar', 'perfis', 'perfis_permissoes', ?, ?, ?, ?)
    `).bind(
      empresaId,
      user.sub,
      perfilId,
      JSON.stringify((permissoesAnteriores.results || []).map(p => p.permissao_id)),
      JSON.stringify(permissoes),
      ip
    ).run();
    
    return c.json({
      success: true,
      message: 'Permissões atualizadas com sucesso',
      data: {
        total: permissoes.length
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar permissões' }
    }, 500);
  }
});

// ============================================
// DELETE /profiles/:id - Excluir perfil
// ============================================

profiles.delete('/:id', requirePermission('perfis', 'excluir'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const perfilId = c.req.param('id');
  
  try {
    // Verificar se perfil existe
    const existing = await db.prepare(`
      SELECT id, nome, padrao FROM perfis WHERE id = ? AND empresa_id = ?
    `).bind(perfilId, empresaId).first<{ id: string; nome: string; padrao: number }>();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' }
      }, 404);
    }
    
    // Não permitir excluir perfil padrão
    if (existing.padrao) {
      return c.json({
        success: false,
        error: { code: 'CANNOT_DELETE_DEFAULT', message: 'Não é possível excluir o perfil padrão' }
      }, 400);
    }
    
    // Verificar se há usuários vinculados
    const usuariosVinculados = await db.prepare(`
      SELECT COUNT(*) as total FROM usuarios_perfis WHERE perfil_id = ?
    `).bind(perfilId).first<{ total: number }>();
    
    if (usuariosVinculados && usuariosVinculados.total > 0) {
      return c.json({
        success: false,
        error: { 
          code: 'HAS_USERS', 
          message: `Este perfil possui ${usuariosVinculados.total} usuário(s) vinculado(s). Remova os usuários antes de excluir.` 
        }
      }, 400);
    }
    
    // Excluir permissões do perfil
    await db.prepare(`
      DELETE FROM perfis_permissoes WHERE perfil_id = ?
    `).bind(perfilId).run();
    
    // Excluir perfil
    await db.prepare(`
      DELETE FROM perfis WHERE id = ?
    `).bind(perfilId).run();
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_antes, ip_address)
      VALUES (?, ?, 'excluir', 'perfis', 'perfis', ?, ?, ?)
    `).bind(empresaId, user.sub, perfilId, JSON.stringify(existing), ip).run();
    
    return c.json({
      success: true,
      message: 'Perfil excluído com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao excluir perfil' }
    }, 500);
  }
});

export default profiles;
