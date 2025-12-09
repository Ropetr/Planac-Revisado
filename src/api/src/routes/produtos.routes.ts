// =============================================
// 🏢 PLANAC ERP - Rotas de Produtos
// =============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const produtos = new Hono<{ Bindings: Bindings; Variables: Variables }>();

produtos.use('*', authMiddleware());

// Schemas
const criarProdutoSchema = z.object({
  codigo: z.string().min(1),
  codigo_barras: z.string().optional(),
  nome: z.string().min(2),
  descricao: z.string().optional(),
  categoria_id: z.string().uuid().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  unidade_medida_id: z.string().uuid(),
  peso_liquido: z.number().optional(),
  peso_bruto: z.number().optional(),
  largura: z.number().optional(),
  altura: z.number().optional(),
  profundidade: z.number().optional(),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  origem: z.number().min(0).max(8).default(0),
  cfop_venda: z.string().optional(),
  cst_icms: z.string().optional(),
  aliquota_icms: z.number().optional(),
  aliquota_pis: z.number().optional(),
  aliquota_cofins: z.number().optional(),
  aliquota_ipi: z.number().optional(),
  preco_custo: z.number().min(0).default(0),
  margem_lucro: z.number().min(0).default(0),
  preco_venda: z.number().min(0).default(0),
  estoque_minimo: z.number().min(0).default(0),
  estoque_maximo: z.number().min(0).default(0),
  ponto_pedido: z.number().min(0).default(0),
  disponivel_ecommerce: z.boolean().default(false),
  destaque: z.boolean().default(false)
});

// GET /produtos - Listar
produtos.get('/', requirePermission('produtos', 'visualizar'), async (c) => {
  const user = c.get('user');
  const { page = '1', limit = '20', busca, categoria_id, ativo, estoque_baixo } = c.req.query();
  
  let where = 'WHERE p.empresa_id = ?';
  const params: any[] = [user.empresa_id];
  
  if (busca) {
    where += ' AND (p.codigo LIKE ? OR p.nome LIKE ? OR p.codigo_barras LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }
  
  if (categoria_id) {
    where += ' AND p.categoria_id = ?';
    params.push(categoria_id);
  }
  
  if (ativo !== undefined) {
    where += ' AND p.ativo = ?';
    params.push(ativo === 'true' ? 1 : 0);
  }
  
  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM produtos p ${where}`
  ).bind(...params).first<{ total: number }>();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const data = await c.env.DB.prepare(`
    SELECT 
      p.*,
      c.nome as categoria_nome,
      um.sigla as unidade_sigla,
      COALESCE(e.quantidade, 0) as estoque_atual
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    LEFT JOIN unidades_medida um ON p.unidade_medida_id = um.id
    LEFT JOIN (
      SELECT produto_id, SUM(quantidade) as quantidade 
      FROM estoque 
      WHERE empresa_id = ?
      GROUP BY produto_id
    ) e ON p.id = e.produto_id
    ${where}
    ${estoque_baixo === 'true' ? 'HAVING estoque_atual < p.estoque_minimo' : ''}
    ORDER BY p.nome
    LIMIT ? OFFSET ?
  `).bind(user.empresa_id, ...params, parseInt(limit), offset).all();
  
  return c.json({
    success: true,
    data: data.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult?.total || 0,
      pages: Math.ceil((countResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /produtos/:id - Buscar por ID
produtos.get('/:id', requirePermission('produtos', 'visualizar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const produto = await c.env.DB.prepare(`
    SELECT 
      p.*,
      c.nome as categoria_nome,
      um.sigla as unidade_sigla, um.descricao as unidade_nome
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    LEFT JOIN unidades_medida um ON p.unidade_medida_id = um.id
    WHERE p.id = ? AND p.empresa_id = ?
  `).bind(id, user.empresa_id).first();
  
  if (!produto) {
    return c.json({ success: false, error: 'Produto não encontrado' }, 404);
  }
  
  // Buscar imagens
  const imagens = await c.env.DB.prepare(`
    SELECT * FROM produtos_imagens WHERE produto_id = ? ORDER BY ordem
  `).bind(id).all();
  
  // Buscar fornecedores
  const fornecedores = await c.env.DB.prepare(`
    SELECT pf.*, f.razao_social, f.nome_fantasia
    FROM produtos_fornecedores pf
    JOIN fornecedores f ON pf.fornecedor_id = f.id
    WHERE pf.produto_id = ?
  `).bind(id).all();
  
  // Buscar estoque por local
  const estoque = await c.env.DB.prepare(`
    SELECT e.*, le.nome as local_nome, f.nome as filial_nome
    FROM estoque e
    JOIN locais_estoque le ON e.local_id = le.id
    JOIN filiais f ON e.filial_id = f.id
    WHERE e.produto_id = ? AND e.empresa_id = ?
  `).bind(id, user.empresa_id).all();
  
  return c.json({
    success: true,
    data: {
      ...produto,
      imagens: imagens.results,
      fornecedores: fornecedores.results,
      estoque: estoque.results
    }
  });
});

// POST /produtos - Criar
produtos.post('/', requirePermission('produtos', 'criar'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const validacao = criarProdutoSchema.safeParse(body);
  if (!validacao.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validacao.error.errors }, 400);
  }
  
  const dados = validacao.data;
  
  // Verifica código único
  const codigoExiste = await c.env.DB.prepare(
    'SELECT id FROM produtos WHERE codigo = ? AND empresa_id = ?'
  ).bind(dados.codigo, user.empresa_id).first();
  
  if (codigoExiste) {
    return c.json({ success: false, error: 'Código já cadastrado' }, 400);
  }
  
  const id = crypto.randomUUID();
  const slug = dados.nome.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  await c.env.DB.prepare(`
    INSERT INTO produtos (
      id, empresa_id, codigo, codigo_barras, nome, descricao, slug,
      categoria_id, marca, modelo, unidade_medida_id,
      peso_liquido, peso_bruto, largura, altura, profundidade,
      ncm, cest, origem, cfop_venda, cst_icms,
      aliquota_icms, aliquota_pis, aliquota_cofins, aliquota_ipi,
      preco_custo, preco_custo_medio, margem_lucro, preco_venda,
      estoque_minimo, estoque_maximo, ponto_pedido,
      disponivel_ecommerce, destaque, ativo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    id, user.empresa_id, dados.codigo, dados.codigo_barras || null,
    dados.nome, dados.descricao || null, slug,
    dados.categoria_id || null, dados.marca || null, dados.modelo || null,
    dados.unidade_medida_id,
    dados.peso_liquido || null, dados.peso_bruto || null,
    dados.largura || null, dados.altura || null, dados.profundidade || null,
    dados.ncm || null, dados.cest || null, dados.origem,
    dados.cfop_venda || null, dados.cst_icms || null,
    dados.aliquota_icms || null, dados.aliquota_pis || null,
    dados.aliquota_cofins || null, dados.aliquota_ipi || null,
    dados.preco_custo, dados.preco_custo, dados.margem_lucro, dados.preco_venda,
    dados.estoque_minimo, dados.estoque_maximo, dados.ponto_pedido,
    dados.disponivel_ecommerce ? 1 : 0, dados.destaque ? 1 : 0,
    new Date().toISOString(), new Date().toISOString()
  ).run();
  
  await registrarAuditoria(c.env.DB, {
    empresa_id: user.empresa_id,
    usuario_id: user.id,
    acao: 'criar',
    tabela: 'produtos',
    registro_id: id,
    dados_novos: { codigo: dados.codigo, nome: dados.nome }
  });
  
  return c.json({ success: true, data: { id }, message: 'Produto criado com sucesso' }, 201);
});

// PUT /produtos/:id - Editar
produtos.put('/:id', requirePermission('produtos', 'editar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const produtoExiste = await c.env.DB.prepare(
    'SELECT id FROM produtos WHERE id = ? AND empresa_id = ?'
  ).bind(id, user.empresa_id).first();
  
  if (!produtoExiste) {
    return c.json({ success: false, error: 'Produto não encontrado' }, 404);
  }
  
  // Verifica código único se alterado
  if (body.codigo) {
    const codigoExiste = await c.env.DB.prepare(
      'SELECT id FROM produtos WHERE codigo = ? AND empresa_id = ? AND id != ?'
    ).bind(body.codigo, user.empresa_id, id).first();
    
    if (codigoExiste) {
      return c.json({ success: false, error: 'Código já cadastrado por outro produto' }, 400);
    }
  }
  
  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [new Date().toISOString()];
  
  const campos = [
    'codigo', 'codigo_barras', 'nome', 'descricao', 'categoria_id', 'marca', 'modelo',
    'unidade_medida_id', 'peso_liquido', 'peso_bruto', 'largura', 'altura', 'profundidade',
    'ncm', 'cest', 'origem', 'cfop_venda', 'cst_icms', 'aliquota_icms', 'aliquota_pis',
    'aliquota_cofins', 'aliquota_ipi', 'preco_custo', 'margem_lucro', 'preco_venda',
    'estoque_minimo', 'estoque_maximo', 'ponto_pedido', 'ativo'
  ];
  
  for (const campo of campos) {
    if (body[campo] !== undefined) {
      updates.push(`${campo} = ?`);
      params.push(body[campo]);
    }
  }
  
  if (body.disponivel_ecommerce !== undefined) {
    updates.push('disponivel_ecommerce = ?');
    params.push(body.disponivel_ecommerce ? 1 : 0);
  }
  
  if (body.destaque !== undefined) {
    updates.push('destaque = ?');
    params.push(body.destaque ? 1 : 0);
  }
  
  // Atualiza slug se nome mudou
  if (body.nome) {
    const slug = body.nome.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updates.push('slug = ?');
    params.push(slug);
  }
  
  params.push(id);
  
  await c.env.DB.prepare(`
    UPDATE produtos SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();
  
  await registrarAuditoria(c.env.DB, {
    empresa_id: user.empresa_id,
    usuario_id: user.id,
    acao: 'editar',
    tabela: 'produtos',
    registro_id: id,
    dados_novos: body
  });
  
  return c.json({ success: true, message: 'Produto atualizado com sucesso' });
});

// DELETE /produtos/:id - Desativar
produtos.delete('/:id', requirePermission('produtos', 'excluir'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  
  const produto = await c.env.DB.prepare(
    'SELECT id FROM produtos WHERE id = ? AND empresa_id = ?'
  ).bind(id, user.empresa_id).first();
  
  if (!produto) {
    return c.json({ success: false, error: 'Produto não encontrado' }, 404);
  }
  
  // Verifica estoque
  const temEstoque = await c.env.DB.prepare(
    'SELECT SUM(quantidade) as total FROM estoque WHERE produto_id = ? AND empresa_id = ?'
  ).bind(id, user.empresa_id).first<{ total: number }>();
  
  if (temEstoque && temEstoque.total > 0) {
    return c.json({ success: false, error: 'Produto possui estoque. Zere o estoque antes de desativar.' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE produtos SET ativo = 0, updated_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), id).run();
  
  await registrarAuditoria(c.env.DB, {
    empresa_id: user.empresa_id,
    usuario_id: user.id,
    acao: 'excluir',
    tabela: 'produtos',
    registro_id: id
  });
  
  return c.json({ success: true, message: 'Produto desativado com sucesso' });
});

// POST /produtos/:id/fornecedores - Vincular fornecedor
produtos.post('/:id/fornecedores', requirePermission('produtos', 'editar'), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const vinculoId = crypto.randomUUID();
  
  // Upsert - atualiza se já existe
  await c.env.DB.prepare(`
    INSERT INTO produtos_fornecedores (
      id, produto_id, fornecedor_id, codigo_fornecedor, preco_custo,
      prazo_entrega, quantidade_minima, principal, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(produto_id, fornecedor_id) DO UPDATE SET
      codigo_fornecedor = excluded.codigo_fornecedor,
      preco_custo = excluded.preco_custo,
      prazo_entrega = excluded.prazo_entrega,
      quantidade_minima = excluded.quantidade_minima,
      principal = excluded.principal,
      updated_at = excluded.updated_at
  `).bind(
    vinculoId, id, body.fornecedor_id, body.codigo_fornecedor || null,
    body.preco_custo || 0, body.prazo_entrega || null,
    body.quantidade_minima || 1, body.principal ? 1 : 0,
    new Date().toISOString(), new Date().toISOString()
  ).run();
  
  return c.json({ success: true, message: 'Fornecedor vinculado com sucesso' }, 201);
});

// GET /produtos/aux/categorias - Listar categorias
produtos.get('/aux/categorias', requirePermission('produtos', 'visualizar'), async (c) => {
  const user = c.get('user');
  
  const data = await c.env.DB.prepare(`
    SELECT * FROM categorias_produtos WHERE empresa_id = ? AND ativo = 1 ORDER BY nome
  `).bind(user.empresa_id).all();
  
  return c.json({ success: true, data: data.results });
});

// GET /produtos/aux/unidades - Listar unidades de medida
produtos.get('/aux/unidades', requirePermission('produtos', 'visualizar'), async (c) => {
  const user = c.get('user');
  
  const data = await c.env.DB.prepare(`
    SELECT * FROM unidades_medida WHERE empresa_id = ? AND ativo = 1 ORDER BY sigla
  `).bind(user.empresa_id).all();
  
  return c.json({ success: true, data: data.results });
});

// POST /produtos/aux/categorias - Criar categoria
produtos.post('/aux/categorias', requirePermission('produtos', 'criar'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const id = crypto.randomUUID();
  const slug = body.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  await c.env.DB.prepare(`
    INSERT INTO categorias_produtos (id, empresa_id, nome, categoria_pai_id, slug, ativo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    id, user.empresa_id, body.nome, body.categoria_pai_id || null, slug,
    new Date().toISOString(), new Date().toISOString()
  ).run();
  
  return c.json({ success: true, data: { id }, message: 'Categoria criada' }, 201);
});

// POST /produtos/aux/unidades - Criar unidade
produtos.post('/aux/unidades', requirePermission('produtos', 'criar'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO unidades_medida (id, empresa_id, sigla, descricao, fator_conversao, ativo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    id, user.empresa_id, body.sigla, body.descricao, body.fator_conversao || 1,
    new Date().toISOString(), new Date().toISOString()
  ).run();
  
  return c.json({ success: true, data: { id }, message: 'Unidade criada' }, 201);
});

export default produtos;
