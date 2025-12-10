// ============================================
// PLANAC ERP - Rotas de Patrimônio
// Bloco 3 - Gestão de Ativos
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const patrimonio = new Hono<{ Bindings: Env }>();

// ============================================
// CATEGORIAS DE PATRIMÔNIO
// ============================================

// GET /api/patrimonio/categorias - Listar categorias
patrimonio.get('/categorias', async (c) => {
  const empresaId = c.get('empresaId');
  
  const result = await c.env.DB.prepare(`
    SELECT cp.*, 
           (SELECT COUNT(*) FROM bens WHERE categoria_id = cp.id) as total_bens,
           pc.codigo as conta_contabil_codigo, pc.nome as conta_contabil_nome
    FROM categorias_patrimonio cp
    LEFT JOIN plano_contas pc ON cp.conta_contabil_id = pc.id
    WHERE cp.empresa_id = ?
    ORDER BY cp.nome
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: result.results });
});

// POST /api/patrimonio/categorias - Criar categoria
patrimonio.post('/categorias', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    vida_util_meses: z.number().int().min(12).default(60),
    taxa_depreciacao_anual: z.number().min(0).max(100),
    conta_contabil_id: z.string().uuid().optional(),
    conta_depreciacao_id: z.string().uuid().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO categorias_patrimonio (id, empresa_id, nome, descricao, vida_util_meses,
                                       taxa_depreciacao_anual, conta_contabil_id, conta_depreciacao_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, data.nome, data.descricao || null, data.vida_util_meses,
          data.taxa_depreciacao_anual, data.conta_contabil_id || null,
          data.conta_depreciacao_id || null, usuarioId).run();
  
  return c.json({ id, message: 'Categoria criada' }, 201);
});

// PUT /api/patrimonio/categorias/:id - Atualizar categoria
patrimonio.put('/categorias/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const campos: string[] = [];
  const valores: any[] = [];
  
  for (const [key, value] of Object.entries(body)) {
    campos.push(`${key} = ?`);
    valores.push(value);
  }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE categorias_patrimonio SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Categoria atualizada' });
});

// ============================================
// BENS
// ============================================

// GET /api/patrimonio/bens - Listar bens
patrimonio.get('/bens', async (c) => {
  const empresaId = c.get('empresaId');
  const { categoria_id, status, local, page = '1', limit = '50' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `SELECT b.*, cp.nome as categoria_nome, cp.taxa_depreciacao_anual,
               (SELECT SUM(valor) FROM depreciacoes WHERE bem_id = b.id) as depreciacao_acumulada
               FROM bens b
               LEFT JOIN categorias_patrimonio cp ON b.categoria_id = cp.id
               WHERE b.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (categoria_id) {
    query += ` AND b.categoria_id = ?`;
    params.push(categoria_id);
  }
  
  if (status) {
    query += ` AND b.status = ?`;
    params.push(status);
  }
  
  if (local) {
    query += ` AND b.localizacao LIKE ?`;
    params.push(`%${local}%`);
  }
  
  const countQuery = query.replace(/SELECT b\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
  
  query += ` ORDER BY b.plaqueta LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  // Calcular valor residual
  const bens = (result.results as any[]).map(bem => {
    const depAcumulada = (bem.depreciacao_acumulada as number) || 0;
    return {
      ...bem,
      valor_residual: (bem.valor_aquisicao as number) - depAcumulada
    };
  });
  
  return c.json({
    success: true,
    data: bens,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult?.total || 0 }
  });
});

// GET /api/patrimonio/bens/:id - Buscar bem
patrimonio.get('/bens/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const bem = await c.env.DB.prepare(`
    SELECT b.*, cp.nome as categoria_nome, cp.taxa_depreciacao_anual
    FROM bens b
    LEFT JOIN categorias_patrimonio cp ON b.categoria_id = cp.id
    WHERE b.id = ? AND b.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!bem) {
    return c.json({ error: 'Bem não encontrado' }, 404);
  }
  
  // Buscar depreciações
  const depreciacoes = await c.env.DB.prepare(`
    SELECT * FROM depreciacoes WHERE bem_id = ? ORDER BY competencia DESC
  `).bind(id).all();
  
  // Buscar movimentações
  const movimentacoes = await c.env.DB.prepare(`
    SELECT * FROM patrimonio_movimentacoes WHERE bem_id = ? ORDER BY data DESC
  `).bind(id).all();
  
  // Buscar manutenções
  const manutencoes = await c.env.DB.prepare(`
    SELECT * FROM patrimonio_manutencoes WHERE bem_id = ? ORDER BY data DESC
  `).bind(id).all();
  
  const depAcumulada = (depreciacoes.results as any[]).reduce((sum, d) => sum + d.valor, 0);
  
  return c.json({
    success: true,
    data: {
      ...bem,
      depreciacao_acumulada: depAcumulada,
      valor_residual: (bem.valor_aquisicao as number) - depAcumulada,
      depreciacoes: depreciacoes.results,
      movimentacoes: movimentacoes.results,
      manutencoes: manutencoes.results
    }
  });
});

// POST /api/patrimonio/bens - Criar bem
patrimonio.post('/bens', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    plaqueta: z.string().min(1).max(20),
    descricao: z.string().min(1).max(200),
    categoria_id: z.string().uuid(),
    data_aquisicao: z.string(),
    valor_aquisicao: z.number().min(0),
    fornecedor_id: z.string().uuid().optional(),
    nota_fiscal: z.string().optional(),
    numero_serie: z.string().optional(),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    localizacao: z.string().optional(),
    responsavel_id: z.string().uuid().optional(),
    observacoes: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  // Verificar plaqueta duplicada
  const existente = await c.env.DB.prepare(`
    SELECT id FROM bens WHERE plaqueta = ? AND empresa_id = ?
  `).bind(validation.data.plaqueta, empresaId).first();
  
  if (existente) {
    return c.json({ error: 'Plaqueta já existe' }, 409);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO bens (id, empresa_id, plaqueta, descricao, categoria_id, data_aquisicao,
                      valor_aquisicao, fornecedor_id, nota_fiscal, numero_serie, marca,
                      modelo, localizacao, responsavel_id, observacoes, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO', ?)
  `).bind(id, empresaId, data.plaqueta, data.descricao, data.categoria_id, data.data_aquisicao,
          data.valor_aquisicao, data.fornecedor_id || null, data.nota_fiscal || null,
          data.numero_serie || null, data.marca || null, data.modelo || null,
          data.localizacao || null, data.responsavel_id || null, data.observacoes || null,
          usuarioId).run();
  
  return c.json({ id, message: 'Bem cadastrado com sucesso' }, 201);
});

// PUT /api/patrimonio/bens/:id - Atualizar bem
patrimonio.put('/bens/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const camposPermitidos = ['descricao', 'localizacao', 'responsavel_id', 'observacoes', 'marca', 'modelo'];
  const campos: string[] = [];
  const valores: any[] = [];
  
  for (const [key, value] of Object.entries(body)) {
    if (camposPermitidos.includes(key)) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }
  }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE bens SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Bem atualizado' });
});

// POST /api/patrimonio/bens/:id/baixar - Baixar bem
patrimonio.post('/bens/:id/baixar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    motivo: z.enum(['VENDA', 'DOACAO', 'PERDA', 'OBSOLESCENCIA', 'FURTO', 'SINISTRO']),
    data_baixa: z.string(),
    valor_baixa: z.number().min(0).optional(),
    observacao: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE bens SET status = 'BAIXADO', data_baixa = ?, motivo_baixa = ?,
                    valor_baixa = ?, observacoes = COALESCE(observacoes || ' | ', '') || ?,
                    updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(validation.data.data_baixa, validation.data.motivo,
          validation.data.valor_baixa || 0, validation.data.observacao || '', id, empresaId).run();
  
  // Registrar movimentação
  const movId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO patrimonio_movimentacoes (id, bem_id, tipo, data, observacao, created_by)
    VALUES (?, ?, 'BAIXA', ?, ?, ?)
  `).bind(movId, id, validation.data.data_baixa, 
          `Baixa: ${validation.data.motivo}. ${validation.data.observacao || ''}`, usuarioId).run();
  
  return c.json({ message: 'Bem baixado com sucesso' });
});

// POST /api/patrimonio/bens/:id/transferir - Transferir bem
patrimonio.post('/bens/:id/transferir', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    nova_localizacao: z.string().min(1),
    novo_responsavel_id: z.string().uuid().optional(),
    data: z.string(),
    observacao: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const bem = await c.env.DB.prepare(`
    SELECT localizacao, responsavel_id FROM bens WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!bem) {
    return c.json({ error: 'Bem não encontrado' }, 404);
  }
  
  // Registrar movimentação
  const movId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO patrimonio_movimentacoes (id, bem_id, tipo, data, local_origem, local_destino, 
                                          responsavel_anterior_id, responsavel_novo_id, observacao, created_by)
    VALUES (?, ?, 'TRANSFERENCIA', ?, ?, ?, ?, ?, ?, ?)
  `).bind(movId, id, validation.data.data, bem.localizacao, validation.data.nova_localizacao,
          bem.responsavel_id, validation.data.novo_responsavel_id || null,
          validation.data.observacao || null, usuarioId).run();
  
  // Atualizar bem
  await c.env.DB.prepare(`
    UPDATE bens SET localizacao = ?, responsavel_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(validation.data.nova_localizacao, validation.data.novo_responsavel_id || null, id).run();
  
  return c.json({ message: 'Bem transferido' });
});

// ============================================
// DEPRECIAÇÃO
// ============================================

// POST /api/patrimonio/depreciacao/calcular - Calcular depreciação mensal
patrimonio.post('/depreciacao/calcular', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    ano: z.number().int(),
    mes: z.number().int().min(1).max(12)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const competencia = `${validation.data.ano}-${String(validation.data.mes).padStart(2, '0')}`;
  
  // Verificar se já calculou
  const jaCalculado = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM depreciacoes d
    JOIN bens b ON d.bem_id = b.id
    WHERE b.empresa_id = ? AND d.competencia = ?
  `).bind(empresaId, competencia).first();
  
  if ((jaCalculado?.total as number) > 0) {
    return c.json({ error: 'Depreciação já calculada para este período' }, 409);
  }
  
  // Buscar bens ativos que aceitam depreciação
  const bens = await c.env.DB.prepare(`
    SELECT b.id, b.valor_aquisicao, b.data_aquisicao, cp.taxa_depreciacao_anual,
           (SELECT COALESCE(SUM(valor), 0) FROM depreciacoes WHERE bem_id = b.id) as depreciado
    FROM bens b
    JOIN categorias_patrimonio cp ON b.categoria_id = cp.id
    WHERE b.empresa_id = ? AND b.status = 'ATIVO' AND cp.taxa_depreciacao_anual > 0
  `).bind(empresaId).all();
  
  let totalDepreciado = 0;
  let bensDepreciados = 0;
  
  for (const bem of bens.results as any[]) {
    const valorOriginal = bem.valor_aquisicao as number;
    const depreciado = bem.depreciado as number;
    const valorResidual = valorOriginal - depreciado;
    
    // Se já depreciou tudo, pular
    if (valorResidual <= 0) continue;
    
    // Calcular depreciação mensal
    const taxaMensal = (bem.taxa_depreciacao_anual as number) / 12 / 100;
    let valorDepreciacao = valorOriginal * taxaMensal;
    
    // Não depreciar mais que o valor residual
    if (valorDepreciacao > valorResidual) {
      valorDepreciacao = valorResidual;
    }
    
    if (valorDepreciacao > 0) {
      const depId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO depreciacoes (id, bem_id, competencia, valor, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).bind(depId, bem.id, competencia, valorDepreciacao, usuarioId).run();
      
      totalDepreciado += valorDepreciacao;
      bensDepreciados++;
    }
  }
  
  return c.json({
    message: 'Depreciação calculada',
    resumo: {
      competencia,
      bens_depreciados: bensDepreciados,
      valor_total: totalDepreciado
    }
  });
});

// GET /api/patrimonio/depreciacao - Listar depreciações
patrimonio.get('/depreciacao', async (c) => {
  const empresaId = c.get('empresaId');
  const { competencia, bem_id } = c.req.query();
  
  let query = `SELECT d.*, b.plaqueta, b.descricao as bem_descricao
               FROM depreciacoes d
               JOIN bens b ON d.bem_id = b.id
               WHERE b.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (competencia) {
    query += ` AND d.competencia = ?`;
    params.push(competencia);
  }
  
  if (bem_id) {
    query += ` AND d.bem_id = ?`;
    params.push(bem_id);
  }
  
  query += ` ORDER BY d.competencia DESC, b.plaqueta`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// ============================================
// MANUTENÇÕES
// ============================================

// POST /api/patrimonio/bens/:id/manutencoes - Registrar manutenção
patrimonio.post('/bens/:id/manutencoes', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    tipo: z.enum(['PREVENTIVA', 'CORRETIVA', 'PREDITIVA']),
    data: z.string(),
    descricao: z.string().min(1),
    fornecedor: z.string().optional(),
    valor: z.number().min(0).optional(),
    proxima_manutencao: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const manutId = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO patrimonio_manutencoes (id, bem_id, tipo, data, descricao, fornecedor,
                                        valor, proxima_manutencao, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(manutId, id, data.tipo, data.data, data.descricao, data.fornecedor || null,
          data.valor || 0, data.proxima_manutencao || null, usuarioId).run();
  
  return c.json({ id: manutId, message: 'Manutenção registrada' }, 201);
});

// GET /api/patrimonio/manutencoes/pendentes - Manutenções pendentes
patrimonio.get('/manutencoes/pendentes', async (c) => {
  const empresaId = c.get('empresaId');
  
  const result = await c.env.DB.prepare(`
    SELECT pm.*, b.plaqueta, b.descricao as bem_descricao
    FROM patrimonio_manutencoes pm
    JOIN bens b ON pm.bem_id = b.id
    WHERE b.empresa_id = ? AND pm.proxima_manutencao IS NOT NULL
          AND pm.proxima_manutencao <= date('now', '+30 days')
    ORDER BY pm.proxima_manutencao
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: result.results });
});

// ============================================
// RELATÓRIOS
// ============================================

// GET /api/patrimonio/relatorio/inventario - Inventário de bens
patrimonio.get('/relatorio/inventario', async (c) => {
  const empresaId = c.get('empresaId');
  const { categoria_id, localizacao } = c.req.query();
  
  let query = `SELECT b.*, cp.nome as categoria_nome,
               (SELECT COALESCE(SUM(valor), 0) FROM depreciacoes WHERE bem_id = b.id) as depreciacao_acumulada
               FROM bens b
               LEFT JOIN categorias_patrimonio cp ON b.categoria_id = cp.id
               WHERE b.empresa_id = ? AND b.status = 'ATIVO'`;
  const params: any[] = [empresaId];
  
  if (categoria_id) {
    query += ` AND b.categoria_id = ?`;
    params.push(categoria_id);
  }
  
  if (localizacao) {
    query += ` AND b.localizacao LIKE ?`;
    params.push(`%${localizacao}%`);
  }
  
  query += ` ORDER BY b.plaqueta`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  let valorTotal = 0;
  let depreciacaoTotal = 0;
  
  const bens = (result.results as any[]).map(bem => {
    const depAcumulada = bem.depreciacao_acumulada as number;
    valorTotal += bem.valor_aquisicao;
    depreciacaoTotal += depAcumulada;
    
    return {
      ...bem,
      valor_residual: (bem.valor_aquisicao as number) - depAcumulada
    };
  });
  
  return c.json({
    success: true,
    data: {
      bens,
      totais: {
        quantidade: bens.length,
        valor_aquisicao: valorTotal,
        depreciacao_acumulada: depreciacaoTotal,
        valor_residual: valorTotal - depreciacaoTotal
      }
    }
  });
});

export default patrimonio;
