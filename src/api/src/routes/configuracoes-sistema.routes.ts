// ============================================
// PLANAC ERP - Rotas de Configurações
// Bloco 3 - Parâmetros do Sistema
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const configuracoes = new Hono<{ Bindings: Env }>();

// ============================================
// CONFIGURAÇÕES GERAIS
// ============================================

// GET /api/configuracoes - Listar configurações
configuracoes.get('/', async (c) => {
  const empresaId = c.get('empresaId');
  const { grupo, filial_id } = c.req.query();
  
  let query = `SELECT * FROM configuracoes WHERE empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (grupo) {
    query += ` AND grupo = ?`;
    params.push(grupo);
  }
  
  if (filial_id) {
    query += ` AND (filial_id = ? OR filial_id IS NULL)`;
    params.push(filial_id);
  }
  
  query += ` ORDER BY grupo, chave`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  // Agrupar por grupo
  const agrupado: Record<string, any[]> = {};
  for (const config of result.results as any[]) {
    if (!agrupado[config.grupo]) agrupado[config.grupo] = [];
    agrupado[config.grupo].push(config);
  }
  
  return c.json({ success: true, data: agrupado });
});

// GET /api/configuracoes/:chave - Buscar configuração específica
configuracoes.get('/:chave', async (c) => {
  const empresaId = c.get('empresaId');
  const { chave } = c.req.param();
  const { filial_id } = c.req.query();
  
  let query = `SELECT * FROM configuracoes WHERE empresa_id = ? AND chave = ?`;
  const params: any[] = [empresaId, chave];
  
  if (filial_id) {
    query += ` AND (filial_id = ? OR filial_id IS NULL) ORDER BY filial_id DESC NULLS LAST LIMIT 1`;
    params.push(filial_id);
  } else {
    query += ` AND filial_id IS NULL`;
  }
  
  const config = await c.env.DB.prepare(query).bind(...params).first();
  
  if (!config) {
    return c.json({ error: 'Configuração não encontrada' }, 404);
  }
  
  return c.json({ success: true, data: config });
});

// PUT /api/configuracoes/:chave - Atualizar configuração
configuracoes.put('/:chave', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { chave } = c.req.param();
  const body = await c.req.json();
  
  const { valor, filial_id } = body;
  
  // Verificar se existe
  const existe = await c.env.DB.prepare(`
    SELECT id FROM configuracoes WHERE empresa_id = ? AND chave = ? AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
  `).bind(empresaId, chave, filial_id || null, filial_id || null).first();
  
  if (existe) {
    await c.env.DB.prepare(`
      UPDATE configuracoes SET valor = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(valor, usuarioId, existe.id).run();
  } else {
    await c.env.DB.prepare(`
      INSERT INTO configuracoes (id, empresa_id, filial_id, grupo, chave, valor, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), empresaId, filial_id || null, body.grupo || 'GERAL', chave, valor, usuarioId).run();
  }
  
  return c.json({ message: 'Configuração salva' });
});

// POST /api/configuracoes/lote - Salvar várias configurações
configuracoes.post('/lote', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const { configuracoes: configs, filial_id } = body;
  
  for (const config of configs) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM configuracoes WHERE empresa_id = ? AND chave = ? 
      AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
    `).bind(empresaId, config.chave, filial_id || null, filial_id || null).first();
    
    if (existe) {
      await c.env.DB.prepare(`
        UPDATE configuracoes SET valor = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(config.valor, usuarioId, existe.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO configuracoes (id, empresa_id, filial_id, grupo, chave, valor, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), empresaId, filial_id || null, config.grupo || 'GERAL', 
              config.chave, config.valor, usuarioId).run();
    }
  }
  
  return c.json({ message: `${configs.length} configurações salvas` });
});

// ============================================
// SEQUÊNCIAS (NUMERAÇÃO AUTOMÁTICA)
// ============================================

// GET /api/configuracoes/sequencias - Listar sequências
configuracoes.get('/sequencias', async (c) => {
  const empresaId = c.get('empresaId');
  const { filial_id } = c.req.query();
  
  let query = `SELECT * FROM sequencias WHERE empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (filial_id) {
    query += ` AND filial_id = ?`;
    params.push(filial_id);
  }
  
  query += ` ORDER BY tipo`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/configuracoes/sequencias/proximo/:tipo - Obter próximo número
configuracoes.get('/sequencias/proximo/:tipo', async (c) => {
  const empresaId = c.get('empresaId');
  const { tipo } = c.req.param();
  const { filial_id } = c.req.query();
  
  let query = `SELECT * FROM sequencias WHERE empresa_id = ? AND tipo = ?`;
  const params: any[] = [empresaId, tipo];
  
  if (filial_id) {
    query += ` AND filial_id = ?`;
    params.push(filial_id);
  } else {
    query += ` AND filial_id IS NULL`;
  }
  
  const sequencia = await c.env.DB.prepare(query).bind(...params).first();
  
  if (!sequencia) {
    return c.json({ error: 'Sequência não configurada' }, 404);
  }
  
  const proximo = (sequencia.ultimo_numero as number) + 1;
  const numero = `${sequencia.prefixo || ''}${String(proximo).padStart(sequencia.tamanho as number || 6, '0')}${sequencia.sufixo || ''}`;
  
  return c.json({ success: true, data: { numero, valor: proximo } });
});

// POST /api/configuracoes/sequencias/consumir/:tipo - Consumir próximo número
configuracoes.post('/sequencias/consumir/:tipo', async (c) => {
  const empresaId = c.get('empresaId');
  const { tipo } = c.req.param();
  const { filial_id } = c.req.query();
  
  let query = `SELECT * FROM sequencias WHERE empresa_id = ? AND tipo = ?`;
  const params: any[] = [empresaId, tipo];
  
  if (filial_id) {
    query += ` AND filial_id = ?`;
    params.push(filial_id);
  } else {
    query += ` AND filial_id IS NULL`;
  }
  
  const sequencia = await c.env.DB.prepare(query).bind(...params).first();
  
  if (!sequencia) {
    return c.json({ error: 'Sequência não configurada' }, 404);
  }
  
  const proximo = (sequencia.ultimo_numero as number) + 1;
  const numero = `${sequencia.prefixo || ''}${String(proximo).padStart(sequencia.tamanho as number || 6, '0')}${sequencia.sufixo || ''}`;
  
  // Atualizar último número
  await c.env.DB.prepare(`
    UPDATE sequencias SET ultimo_numero = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(proximo, sequencia.id).run();
  
  return c.json({ success: true, data: { numero, valor: proximo } });
});

// PUT /api/configuracoes/sequencias/:tipo - Configurar sequência
configuracoes.put('/sequencias/:tipo', async (c) => {
  const empresaId = c.get('empresaId');
  const { tipo } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    filial_id: z.string().uuid().optional(),
    prefixo: z.string().max(10).optional(),
    sufixo: z.string().max(10).optional(),
    tamanho: z.number().int().min(1).max(20).default(6),
    ultimo_numero: z.number().int().min(0).optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const data = validation.data;
  
  // Verificar se existe
  const existe = await c.env.DB.prepare(`
    SELECT id FROM sequencias WHERE empresa_id = ? AND tipo = ? 
    AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
  `).bind(empresaId, tipo, data.filial_id || null, data.filial_id || null).first();
  
  if (existe) {
    const campos: string[] = [];
    const valores: any[] = [];
    
    if (data.prefixo !== undefined) { campos.push('prefixo = ?'); valores.push(data.prefixo); }
    if (data.sufixo !== undefined) { campos.push('sufixo = ?'); valores.push(data.sufixo); }
    if (data.tamanho !== undefined) { campos.push('tamanho = ?'); valores.push(data.tamanho); }
    if (data.ultimo_numero !== undefined) { campos.push('ultimo_numero = ?'); valores.push(data.ultimo_numero); }
    
    if (campos.length > 0) {
      await c.env.DB.prepare(`
        UPDATE sequencias SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(...valores, existe.id).run();
    }
  } else {
    await c.env.DB.prepare(`
      INSERT INTO sequencias (id, empresa_id, filial_id, tipo, prefixo, sufixo, tamanho, ultimo_numero)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), empresaId, data.filial_id || null, tipo,
            data.prefixo || null, data.sufixo || null, data.tamanho, data.ultimo_numero || 0).run();
  }
  
  return c.json({ message: 'Sequência configurada' });
});

// ============================================
// PARÂMETROS FISCAIS
// ============================================

// GET /api/configuracoes/fiscal - Parâmetros fiscais
configuracoes.get('/fiscal', async (c) => {
  const empresaId = c.get('empresaId');
  const { filial_id } = c.req.query();
  
  const result = await c.env.DB.prepare(`
    SELECT * FROM configuracoes WHERE empresa_id = ? AND grupo = 'FISCAL'
    AND (filial_id = ? OR filial_id IS NULL)
    ORDER BY chave
  `).bind(empresaId, filial_id || null).all();
  
  // Transformar em objeto
  const fiscal: Record<string, any> = {};
  for (const config of result.results as any[]) {
    fiscal[config.chave] = config.valor;
  }
  
  return c.json({ success: true, data: fiscal });
});

// PUT /api/configuracoes/fiscal - Salvar parâmetros fiscais
configuracoes.put('/fiscal', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const { filial_id, ...params } = body;
  
  for (const [chave, valor] of Object.entries(params)) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM configuracoes WHERE empresa_id = ? AND chave = ? AND grupo = 'FISCAL'
      AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
    `).bind(empresaId, chave, filial_id || null, filial_id || null).first();
    
    if (existe) {
      await c.env.DB.prepare(`
        UPDATE configuracoes SET valor = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(String(valor), usuarioId, existe.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO configuracoes (id, empresa_id, filial_id, grupo, chave, valor, created_by)
        VALUES (?, ?, ?, 'FISCAL', ?, ?, ?)
      `).bind(crypto.randomUUID(), empresaId, filial_id || null, chave, String(valor), usuarioId).run();
    }
  }
  
  return c.json({ message: 'Parâmetros fiscais salvos' });
});

// ============================================
// TEMPLATES DE EMAIL
// ============================================

// GET /api/configuracoes/emails - Listar templates de email
configuracoes.get('/emails', async (c) => {
  const empresaId = c.get('empresaId');
  
  const result = await c.env.DB.prepare(`
    SELECT * FROM configuracoes WHERE empresa_id = ? AND grupo = 'EMAIL_TEMPLATE'
    ORDER BY chave
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: result.results });
});

// PUT /api/configuracoes/emails/:tipo - Salvar template de email
configuracoes.put('/emails/:tipo', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { tipo } = c.req.param();
  const body = await c.req.json();
  
  const { assunto, corpo, variaveis } = body;
  
  const template = JSON.stringify({ assunto, corpo, variaveis });
  
  const existe = await c.env.DB.prepare(`
    SELECT id FROM configuracoes WHERE empresa_id = ? AND chave = ? AND grupo = 'EMAIL_TEMPLATE'
  `).bind(empresaId, tipo).first();
  
  if (existe) {
    await c.env.DB.prepare(`
      UPDATE configuracoes SET valor = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(template, usuarioId, existe.id).run();
  } else {
    await c.env.DB.prepare(`
      INSERT INTO configuracoes (id, empresa_id, grupo, chave, valor, created_by)
      VALUES (?, ?, 'EMAIL_TEMPLATE', ?, ?, ?)
    `).bind(crypto.randomUUID(), empresaId, tipo, template, usuarioId).run();
  }
  
  return c.json({ message: 'Template salvo' });
});

// ============================================
// CONFIGURAÇÕES DE INTEGRAÇÃO
// ============================================

// GET /api/configuracoes/integracoes - Configurações de integrações
configuracoes.get('/integracoes', async (c) => {
  const empresaId = c.get('empresaId');
  
  const result = await c.env.DB.prepare(`
    SELECT id, nome, tipo, ativo, ultimo_sync, created_at 
    FROM integracoes WHERE empresa_id = ?
    ORDER BY nome
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: result.results });
});

// PUT /api/configuracoes/integracoes/:id - Atualizar integração
configuracoes.put('/integracoes/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const campos: string[] = [];
  const valores: any[] = [];
  
  if (body.credenciais) { campos.push('credenciais = ?'); valores.push(JSON.stringify(body.credenciais)); }
  if (body.configuracao) { campos.push('configuracao = ?'); valores.push(JSON.stringify(body.configuracao)); }
  if (body.ativo !== undefined) { campos.push('ativo = ?'); valores.push(body.ativo ? 1 : 0); }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE integracoes SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Integração atualizada' });
});

// ============================================
// BACKUP E RESTAURAÇÃO
// ============================================

// POST /api/configuracoes/backup - Gerar backup das configurações
configuracoes.post('/backup', async (c) => {
  const empresaId = c.get('empresaId');
  
  const configs = await c.env.DB.prepare(`
    SELECT * FROM configuracoes WHERE empresa_id = ?
  `).bind(empresaId).all();
  
  const sequencias = await c.env.DB.prepare(`
    SELECT * FROM sequencias WHERE empresa_id = ?
  `).bind(empresaId).all();
  
  const backup = {
    versao: '1.0',
    data: new Date().toISOString(),
    empresa_id: empresaId,
    configuracoes: configs.results,
    sequencias: sequencias.results
  };
  
  return c.json({ success: true, data: backup });
});

// POST /api/configuracoes/restaurar - Restaurar backup
configuracoes.post('/restaurar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const { configuracoes: configs, sequencias: seqs } = body;
  
  // Restaurar configurações
  for (const config of configs || []) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM configuracoes WHERE empresa_id = ? AND chave = ? 
      AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
    `).bind(empresaId, config.chave, config.filial_id, config.filial_id).first();
    
    if (existe) {
      await c.env.DB.prepare(`
        UPDATE configuracoes SET valor = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(config.valor, usuarioId, existe.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO configuracoes (id, empresa_id, filial_id, grupo, chave, valor, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), empresaId, config.filial_id, config.grupo, config.chave, config.valor, usuarioId).run();
    }
  }
  
  // Restaurar sequências
  for (const seq of seqs || []) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM sequencias WHERE empresa_id = ? AND tipo = ?
      AND (filial_id = ? OR (filial_id IS NULL AND ? IS NULL))
    `).bind(empresaId, seq.tipo, seq.filial_id, seq.filial_id).first();
    
    if (existe) {
      await c.env.DB.prepare(`
        UPDATE sequencias SET prefixo = ?, sufixo = ?, tamanho = ?, ultimo_numero = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(seq.prefixo, seq.sufixo, seq.tamanho, seq.ultimo_numero, existe.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO sequencias (id, empresa_id, filial_id, tipo, prefixo, sufixo, tamanho, ultimo_numero)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), empresaId, seq.filial_id, seq.tipo, seq.prefixo, seq.sufixo, seq.tamanho, seq.ultimo_numero).run();
    }
  }
  
  return c.json({ message: 'Backup restaurado' });
});

export default configuracoes;
