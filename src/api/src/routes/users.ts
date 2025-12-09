/**
 * 👥 PLANAC ERP - Users Routes
 * CRUD de usuários
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { hashPassword } from '../lib/password';
import { authMiddleware, requirePermission, Env } from '../middleware/auth';

const users = new Hono<{ Bindings: Env }>();

// Aplicar autenticação em todas as rotas
users.use('*', authMiddleware());

// ============================================
// Schemas de Validação
// ============================================

const createUserSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  perfis: z.array(z.string()).min(1, 'Selecione ao menos um perfil')
});

const updateUserSchema = z.object({
  nome: z.string().min(3).optional(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  ativo: z.boolean().optional(),
  perfis: z.array(z.string()).optional()
});

const changePasswordSchema = z.object({
  senha_atual: z.string().min(1, 'Senha atual obrigatória'),
  senha_nova: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres')
});

const resetPasswordSchema = z.object({
  nova_senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
});

// ============================================
// GET /users - Listar usuários
// ============================================

users.get('/', requirePermission('usuarios', 'ver'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  
  // Query params para filtros e paginação
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  const search = c.req.query('search') || '';
  const ativo = c.req.query('ativo'); // '1', '0', ou undefined (todos)
  
  try {
    // Construir query com filtros
    let whereClause = 'WHERE u.empresa_id = ?';
    const params: (string | number)[] = [empresaId];
    
    if (search) {
      whereClause += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (ativo !== undefined) {
      whereClause += ' AND u.ativo = ?';
      params.push(parseInt(ativo));
    }
    
    // Total de registros
    const countResult = await db.prepare(`
      SELECT COUNT(*) as total FROM usuarios u ${whereClause}
    `).bind(...params).first<{ total: number }>();
    
    const total = countResult?.total || 0;
    
    // Buscar usuários
    const usersResult = await db.prepare(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        u.cargo,
        u.avatar_url,
        u.ativo,
        u.bloqueado,
        u.ultimo_login,
        u.created_at,
        GROUP_CONCAT(p.nome) as perfis
      FROM usuarios u
      LEFT JOIN usuarios_perfis up ON up.usuario_id = u.id
      LEFT JOIN perfis p ON p.id = up.perfil_id AND p.ativo = 1
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.nome ASC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all<{
      id: string;
      nome: string;
      email: string;
      telefone: string | null;
      cargo: string | null;
      avatar_url: string | null;
      ativo: number;
      bloqueado: number;
      ultimo_login: string | null;
      created_at: string;
      perfis: string | null;
    }>();
    
    const usuarios = (usersResult.results || []).map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      telefone: u.telefone,
      cargo: u.cargo,
      avatar_url: u.avatar_url,
      ativo: Boolean(u.ativo),
      bloqueado: Boolean(u.bloqueado),
      ultimo_login: u.ultimo_login,
      created_at: u.created_at,
      perfis: u.perfis ? u.perfis.split(',') : []
    }));
    
    return c.json({
      success: true,
      data: usuarios,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar usuários' }
    }, 500);
  }
});

// ============================================
// GET /users/:id - Buscar usuário
// ============================================

users.get('/:id', requirePermission('usuarios', 'ver'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const userId = c.req.param('id');
  
  try {
    const usuario = await db.prepare(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        u.cargo,
        u.avatar_url,
        u.ativo,
        u.bloqueado,
        u.two_factor_ativo,
        u.ultimo_login,
        u.created_at,
        u.updated_at
      FROM usuarios u
      WHERE u.id = ? AND u.empresa_id = ?
    `).bind(userId, empresaId).first<{
      id: string;
      nome: string;
      email: string;
      telefone: string | null;
      cargo: string | null;
      avatar_url: string | null;
      ativo: number;
      bloqueado: number;
      two_factor_ativo: number;
      ultimo_login: string | null;
      created_at: string;
      updated_at: string;
    }>();
    
    if (!usuario) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' }
      }, 404);
    }
    
    // Buscar perfis do usuário
    const perfisResult = await db.prepare(`
      SELECT p.id, p.nome, up.filial_id
      FROM perfis p
      INNER JOIN usuarios_perfis up ON up.perfil_id = p.id
      WHERE up.usuario_id = ?
    `).bind(userId).all<{ id: string; nome: string; filial_id: string | null }>();
    
    return c.json({
      success: true,
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cargo: usuario.cargo,
        avatar_url: usuario.avatar_url,
        ativo: Boolean(usuario.ativo),
        bloqueado: Boolean(usuario.bloqueado),
        two_factor_ativo: Boolean(usuario.two_factor_ativo),
        ultimo_login: usuario.ultimo_login,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
        perfis: (perfisResult.results || []).map(p => ({
          id: p.id,
          nome: p.nome,
          filial_id: p.filial_id
        }))
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar usuário' }
    }, 500);
  }
});

// ============================================
// POST /users - Criar usuário
// ============================================

users.post('/', requirePermission('usuarios', 'criar'), zValidator('json', createUserSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const body = c.req.valid('json');
  
  try {
    // Verificar se email já existe
    const existing = await db.prepare(`
      SELECT id FROM usuarios WHERE email = ?
    `).bind(body.email.toLowerCase()).first();
    
    if (existing) {
      return c.json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'E-mail já cadastrado' }
      }, 400);
    }
    
    // Verificar se perfis existem e pertencem à empresa
    const perfisPlaceholders = body.perfis.map(() => '?').join(',');
    const perfisValidos = await db.prepare(`
      SELECT id FROM perfis WHERE id IN (${perfisPlaceholders}) AND empresa_id = ?
    `).bind(...body.perfis, empresaId).all<{ id: string }>();
    
    if ((perfisValidos.results || []).length !== body.perfis.length) {
      return c.json({
        success: false,
        error: { code: 'INVALID_PROFILE', message: 'Um ou mais perfis inválidos' }
      }, 400);
    }
    
    // Gerar hash da senha
    const senhaHash = await hashPassword(body.senha);
    
    // Gerar ID
    const id = crypto.randomUUID();
    
    // Criar usuário
    await db.prepare(`
      INSERT INTO usuarios (id, empresa_id, nome, email, senha_hash, telefone, cargo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      empresaId,
      body.nome,
      body.email.toLowerCase(),
      senhaHash,
      body.telefone || null,
      body.cargo || null
    ).run();
    
    // Vincular perfis
    for (const perfilId of body.perfis) {
      await db.prepare(`
        INSERT INTO usuarios_perfis (usuario_id, perfil_id)
        VALUES (?, ?)
      `).bind(id, perfilId).run();
    }
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_depois, ip_address)
      VALUES (?, ?, 'criar', 'usuarios', 'usuarios', ?, ?, ?)
    `).bind(
      empresaId,
      user.sub,
      id,
      JSON.stringify({ nome: body.nome, email: body.email, perfis: body.perfis }),
      ip
    ).run();
    
    return c.json({
      success: true,
      data: {
        id,
        nome: body.nome,
        email: body.email.toLowerCase(),
        telefone: body.telefone || null,
        cargo: body.cargo || null,
        perfis: body.perfis
      },
      message: 'Usuário criado com sucesso'
    }, 201);
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar usuário' }
    }, 500);
  }
});

// ============================================
// PUT /users/:id - Atualizar usuário
// ============================================

users.put('/:id', requirePermission('usuarios', 'editar'), zValidator('json', updateUserSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const userId = c.req.param('id');
  const body = c.req.valid('json');
  
  try {
    // Verificar se usuário existe
    const existing = await db.prepare(`
      SELECT id, nome, telefone, cargo, ativo FROM usuarios WHERE id = ? AND empresa_id = ?
    `).bind(userId, empresaId).first<{
      id: string;
      nome: string;
      telefone: string | null;
      cargo: string | null;
      ativo: number;
    }>();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' }
      }, 404);
    }
    
    // Construir update
    const updates: string[] = ['updated_at = datetime(\'now\')'];
    const params: (string | number | null)[] = [];
    
    if (body.nome !== undefined) {
      updates.push('nome = ?');
      params.push(body.nome);
    }
    if (body.telefone !== undefined) {
      updates.push('telefone = ?');
      params.push(body.telefone || null);
    }
    if (body.cargo !== undefined) {
      updates.push('cargo = ?');
      params.push(body.cargo || null);
    }
    if (body.ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(body.ativo ? 1 : 0);
    }
    
    params.push(userId);
    
    await db.prepare(`
      UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();
    
    // Atualizar perfis se fornecidos
    if (body.perfis !== undefined) {
      // Remover perfis antigos
      await db.prepare(`
        DELETE FROM usuarios_perfis WHERE usuario_id = ?
      `).bind(userId).run();
      
      // Adicionar novos perfis
      for (const perfilId of body.perfis) {
        await db.prepare(`
          INSERT INTO usuarios_perfis (usuario_id, perfil_id)
          VALUES (?, ?)
        `).bind(userId, perfilId).run();
      }
    }
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, dados_antes, dados_depois, ip_address)
      VALUES (?, ?, 'editar', 'usuarios', 'usuarios', ?, ?, ?, ?)
    `).bind(
      empresaId,
      user.sub,
      userId,
      JSON.stringify(existing),
      JSON.stringify(body),
      ip
    ).run();
    
    return c.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar usuário' }
    }, 500);
  }
});

// ============================================
// DELETE /users/:id - Desativar usuário
// ============================================

users.delete('/:id', requirePermission('usuarios', 'excluir'), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const userId = c.req.param('id');
  
  try {
    // Verificar se usuário existe
    const existing = await db.prepare(`
      SELECT id, nome FROM usuarios WHERE id = ? AND empresa_id = ?
    `).bind(userId, empresaId).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' }
      }, 404);
    }
    
    // Não permitir desativar a si mesmo
    if (userId === user.sub) {
      return c.json({
        success: false,
        error: { code: 'CANNOT_DELETE_SELF', message: 'Você não pode desativar sua própria conta' }
      }, 400);
    }
    
    // Desativar (soft delete)
    await db.prepare(`
      UPDATE usuarios SET ativo = 0, updated_at = datetime('now') WHERE id = ?
    `).bind(userId).run();
    
    // Revogar todas as sessões
    await db.prepare(`
      UPDATE usuarios_sessoes SET revogado = 1 WHERE usuario_id = ?
    `).bind(userId).run();
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, descricao, ip_address)
      VALUES (?, ?, 'excluir', 'usuarios', 'usuarios', ?, 'Usuário desativado', ?)
    `).bind(empresaId, user.sub, userId, ip).run();
    
    return c.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao desativar usuário' }
    }, 500);
  }
});

// ============================================
// POST /users/:id/reset-password - Reset de senha (admin)
// ============================================

users.post('/:id/reset-password', requirePermission('usuarios', 'resetar'), zValidator('json', resetPasswordSchema), async (c) => {
  const db = c.env.DB;
  const empresaId = c.get('empresa_id');
  const user = c.get('user');
  const userId = c.req.param('id');
  const { nova_senha } = c.req.valid('json');
  
  try {
    // Verificar se usuário existe
    const existing = await db.prepare(`
      SELECT id FROM usuarios WHERE id = ? AND empresa_id = ?
    `).bind(userId, empresaId).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' }
      }, 404);
    }
    
    // Gerar novo hash
    const senhaHash = await hashPassword(nova_senha);
    
    // Atualizar senha
    await db.prepare(`
      UPDATE usuarios SET senha_hash = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(senhaHash, userId).run();
    
    // Revogar todas as sessões
    await db.prepare(`
      UPDATE usuarios_sessoes SET revogado = 1 WHERE usuario_id = ?
    `).bind(userId).run();
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, tabela, registro_id, descricao, ip_address)
      VALUES (?, ?, 'resetar', 'usuarios', 'usuarios', ?, 'Senha resetada por administrador', ?)
    `).bind(empresaId, user.sub, userId, ip).run();
    
    return c.json({
      success: true,
      message: 'Senha resetada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao resetar senha' }
    }, 500);
  }
});

// ============================================
// POST /users/me/change-password - Trocar própria senha
// ============================================

users.post('/me/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const { senha_atual, senha_nova } = c.req.valid('json');
  
  try {
    // Buscar senha atual
    const usuario = await db.prepare(`
      SELECT senha_hash FROM usuarios WHERE id = ?
    `).bind(user.sub).first<{ senha_hash: string }>();
    
    if (!usuario) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' }
      }, 404);
    }
    
    // Verificar senha atual
    const { verifyPassword } = await import('../lib/password');
    const senhaValida = await verifyPassword(senha_atual, usuario.senha_hash);
    
    if (!senhaValida) {
      return c.json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Senha atual incorreta' }
      }, 400);
    }
    
    // Gerar novo hash
    const senhaHash = await hashPassword(senha_nova);
    
    // Atualizar senha
    await db.prepare(`
      UPDATE usuarios SET senha_hash = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(senhaHash, user.sub).run();
    
    // Audit log
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    await db.prepare(`
      INSERT INTO audit_logs (empresa_id, usuario_id, acao, modulo, descricao, ip_address)
      VALUES (?, ?, 'editar', 'usuarios', 'Senha alterada pelo próprio usuário', ?)
    `).bind(user.empresa_id, user.sub, ip).run();
    
    return c.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao alterar senha' }
    }, 500);
  }
});

export default users;
