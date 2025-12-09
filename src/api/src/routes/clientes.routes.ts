// ============================================
// PLANAC ERP - Rotas de Clientes
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';
import { validarCpfCnpj } from '../utils/helpers';

const clientes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

clientes.use('/*', requireAuth());

// Schemas
const clienteSchema = z.object({
  tipo: z.enum(['PF', 'PJ']),
  razao_social: z.string().min(3),
  nome_fantasia: z.string().optional(),
  cpf_cnpj: z.string().min(11),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  vendedor_id: z.string().uuid().optional(),
  tabela_preco_id: z.string().uuid().optional(),
  condicao_pagamento_id: z.string().uuid().optional(),
  limite_credito: z.number().min(0).default(0),
  segmento: z.string().optional(),
  origem: z.string().optional(),
  observacao: z.string().optional(),
  endereco: z.object({
    cep: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string().length(2),
    codigo_ibge: z.string().optional()
  }).optional(),
  contato: z.object({
    nome: z.string(),
    cargo: z.string().optional(),
    email: z.string().email().optional(),
    telefone: z.string().optional(),
    celular: z.string().optional()
  }).optional()
});

// GET /clientes - Listar
clientes.get('/', requirePermission('clientes', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { page = '1', limit = '20', busca, segmento, ativo, vendedor_id } = c.req.query();

  let query = `SELECT * FROM clientes WHERE empresa_id = ?`;
  const params: any[] = [usuario.empresa_id];

  if (busca) {
    query += ` AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?)`;
    const termo = `%${busca}%`;
    params.push(termo, termo, termo, termo);
  }

  if (segmento) {
    query += ` AND segmento = ?`;
    params.push(segmento);
  }

  if (ativo !== undefined) {
    query += ` AND ativo = ?`;
    params.push(ativo === 'true' ? 1 : 0);
  }

  if (vendedor_id) {
    query += ` AND vendedor_id = ?`;
    params.push(vendedor_id);
  }

  // Contagem
  const countResult = await c.env.DB.prepare(
    query.replace('SELECT *', 'SELECT COUNT(*) as total')
  ).bind(...params).first<{ total: number }>();

  // Paginação
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  query += ` ORDER BY razao_social LIMIT ? OFFSET ?`;
  params.push(limitNum, (pageNum - 1) * limitNum);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: countResult?.total || 0,
      pages: Math.ceil((countResult?.total || 0) / limitNum)
    }
  });
});

// GET /clientes/:id - Buscar
clientes.get('/:id', requirePermission('clientes', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const cliente = await c.env.DB.prepare(`
    SELECT * FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  // Endereços
  const enderecos = await c.env.DB.prepare(`
    SELECT * FROM clientes_enderecos WHERE cliente_id = ? ORDER BY padrao DESC
  `).bind(id).all();

  // Contatos
  const contatos = await c.env.DB.prepare(`
    SELECT * FROM clientes_contatos WHERE cliente_id = ? ORDER BY principal DESC
  `).bind(id).all();

  // Histórico de crédito
  const historicoCredito = await c.env.DB.prepare(`
    SELECT * FROM clientes_historico_credito WHERE cliente_id = ? ORDER BY created_at DESC LIMIT 10
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...cliente,
      enderecos: enderecos.results,
      contatos: contatos.results,
      historico_credito: historicoCredito.results
    }
  });
});

// POST /clientes - Criar
clientes.post('/', requirePermission('clientes', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validacao = clienteSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validacao.error.errors }, 400);
  }

  const dados = validacao.data;

  // Validar CPF/CNPJ
  if (!validarCpfCnpj(dados.cpf_cnpj)) {
    return c.json({ success: false, error: 'CPF/CNPJ inválido' }, 400);
  }

  // Verificar duplicidade
  const existe = await c.env.DB.prepare(`
    SELECT id FROM clientes WHERE cpf_cnpj = ? AND empresa_id = ?
  `).bind(dados.cpf_cnpj.replace(/\D/g, ''), usuario.empresa_id).first();

  if (existe) {
    return c.json({ success: false, error: 'CPF/CNPJ já cadastrado' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO clientes (
      id, empresa_id, tipo, razao_social, nome_fantasia, cpf_cnpj,
      inscricao_estadual, inscricao_municipal, email, telefone, celular,
      vendedor_id, tabela_preco_id, condicao_pagamento_id, limite_credito,
      segmento, origem, observacao, ativo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    id, usuario.empresa_id, dados.tipo, dados.razao_social, dados.nome_fantasia || null,
    dados.cpf_cnpj.replace(/\D/g, ''), dados.inscricao_estadual || null,
    dados.inscricao_municipal || null, dados.email || null, dados.telefone || null,
    dados.celular || null, dados.vendedor_id || null, dados.tabela_preco_id || null,
    dados.condicao_pagamento_id || null, dados.limite_credito,
    dados.segmento || null, dados.origem || null, dados.observacao || null,
    new Date().toISOString(), new Date().toISOString()
  ).run();

  // Criar endereço principal
  if (dados.endereco) {
    await c.env.DB.prepare(`
      INSERT INTO clientes_enderecos (
        id, cliente_id, tipo, cep, logradouro, numero, complemento,
        bairro, cidade, uf, codigo_ibge, padrao, created_at
      ) VALUES (?, ?, 'principal', ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(
      crypto.randomUUID(), id, dados.endereco.cep, dados.endereco.logradouro,
      dados.endereco.numero, dados.endereco.complemento || null,
      dados.endereco.bairro, dados.endereco.cidade, dados.endereco.uf,
      dados.endereco.codigo_ibge || null, new Date().toISOString()
    ).run();
  }

  // Criar contato principal
  if (dados.contato) {
    await c.env.DB.prepare(`
      INSERT INTO clientes_contatos (
        id, cliente_id, nome, cargo, email, telefone, celular, principal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(
      crypto.randomUUID(), id, dados.contato.nome, dados.contato.cargo || null,
      dados.contato.email || null, dados.contato.telefone || null,
      dados.contato.celular || null, new Date().toISOString()
    ).run();
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'criar',
    tabela: 'clientes',
    registro_id: id,
    dados_novos: { razao_social: dados.razao_social, cpf_cnpj: dados.cpf_cnpj }
  });

  return c.json({ success: true, data: { id }, message: 'Cliente criado com sucesso' }, 201);
});

// PUT /clientes/:id - Editar
clientes.put('/:id', requirePermission('clientes', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const cliente = await c.env.DB.prepare(`
    SELECT * FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  // Verificar CPF/CNPJ duplicado se alterado
  if (body.cpf_cnpj && body.cpf_cnpj !== cliente.cpf_cnpj) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM clientes WHERE cpf_cnpj = ? AND empresa_id = ? AND id != ?
    `).bind(body.cpf_cnpj.replace(/\D/g, ''), usuario.empresa_id, id).first();

    if (existe) {
      return c.json({ success: false, error: 'CPF/CNPJ já cadastrado' }, 400);
    }
  }

  const campos = ['tipo', 'razao_social', 'nome_fantasia', 'cpf_cnpj', 'inscricao_estadual',
    'inscricao_municipal', 'email', 'telefone', 'celular', 'vendedor_id', 'tabela_preco_id',
    'condicao_pagamento_id', 'limite_credito', 'segmento', 'origem', 'observacao', 'ativo'];

  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [new Date().toISOString()];

  for (const campo of campos) {
    if (body[campo] !== undefined) {
      updates.push(`${campo} = ?`);
      params.push(campo === 'cpf_cnpj' ? body[campo].replace(/\D/g, '') : body[campo]);
    }
  }

  params.push(id);

  await c.env.DB.prepare(`
    UPDATE clientes SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'editar',
    tabela: 'clientes',
    registro_id: id,
    dados_anteriores: cliente,
    dados_novos: body
  });

  return c.json({ success: true, message: 'Cliente atualizado com sucesso' });
});

// DELETE /clientes/:id - Desativar
clientes.delete('/:id', requirePermission('clientes', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const cliente = await c.env.DB.prepare(`
    SELECT * FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  // Verificar pedidos em aberto
  const pedidosAbertos = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM pedidos_venda 
    WHERE cliente_id = ? AND status NOT IN ('entregue', 'cancelado')
  `).bind(id).first<{ total: number }>();

  if (pedidosAbertos && pedidosAbertos.total > 0) {
    return c.json({ 
      success: false, 
      error: `Cliente possui ${pedidosAbertos.total} pedidos em aberto` 
    }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE clientes SET ativo = 0, updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'desativar',
    tabela: 'clientes',
    registro_id: id
  });

  return c.json({ success: true, message: 'Cliente desativado com sucesso' });
});

// POST /clientes/:id/enderecos - Adicionar endereço
clientes.post('/:id/enderecos', requirePermission('clientes', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const cliente = await c.env.DB.prepare(`
    SELECT id FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  const enderecoId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO clientes_enderecos (
      id, cliente_id, tipo, cep, logradouro, numero, complemento,
      bairro, cidade, uf, codigo_ibge, responsavel, telefone, padrao, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    enderecoId, id, body.tipo || 'entrega', body.cep, body.logradouro,
    body.numero, body.complemento || null, body.bairro, body.cidade,
    body.uf, body.codigo_ibge || null, body.responsavel || null,
    body.telefone || null, body.padrao ? 1 : 0, new Date().toISOString()
  ).run();

  return c.json({ success: true, data: { id: enderecoId }, message: 'Endereço adicionado' }, 201);
});

// POST /clientes/:id/contatos - Adicionar contato
clientes.post('/:id/contatos', requirePermission('clientes', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const cliente = await c.env.DB.prepare(`
    SELECT id FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  const contatoId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO clientes_contatos (
      id, cliente_id, nome, cargo, email, telefone, celular, whatsapp,
      departamento, decisor, principal, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    contatoId, id, body.nome, body.cargo || null, body.email || null,
    body.telefone || null, body.celular || null, body.whatsapp || null,
    body.departamento || null, body.decisor ? 1 : 0, body.principal ? 1 : 0,
    new Date().toISOString()
  ).run();

  return c.json({ success: true, data: { id: contatoId }, message: 'Contato adicionado' }, 201);
});

// POST /clientes/:id/bloquear - Bloquear/Desbloquear
clientes.post('/:id/bloquear', requirePermission('clientes', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { bloquear, motivo } = await c.req.json();

  const cliente = await c.env.DB.prepare(`
    SELECT * FROM clientes WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!cliente) {
    return c.json({ success: false, error: 'Cliente não encontrado' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE clientes SET bloqueado = ?, motivo_bloqueio = ?, updated_at = ? WHERE id = ?
  `).bind(bloquear ? 1 : 0, bloquear ? motivo : null, new Date().toISOString(), id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: bloquear ? 'bloquear' : 'desbloquear',
    tabela: 'clientes',
    registro_id: id,
    dados_novos: { bloqueado: bloquear, motivo }
  });

  return c.json({ 
    success: true, 
    message: bloquear ? 'Cliente bloqueado' : 'Cliente desbloqueado' 
  });
});

export default clientes;
