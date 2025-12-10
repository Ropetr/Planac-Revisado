// ============================================
// PLANAC ERP - Rotas de Inventários
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const inventarios = new Hono<{ Bindings: Bindings; Variables: Variables }>();

inventarios.use('/*', requireAuth());

// Schemas
const inventarioSchema = z.object({
  local_estoque_id: z.string().uuid(),
  data_inicio: z.string(),
  responsavel_id: z.string().uuid(),
  tipo: z.enum(['TOTAL', 'PARCIAL', 'ROTATIVO']),
  observacoes: z.string().optional()
});

const contagemSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade_contada: z.number().min(0),
  lote: z.string().optional(),
  validade: z.string().optional(),
  observacao: z.string().optional()
});

// GET /inventarios - Listar
inventarios.get('/', requirePermission('estoque', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { status, local_estoque_id, tipo, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      i.*,
      le.nome as local_estoque_nome,
      u.nome as responsavel_nome,
      (SELECT COUNT(*) FROM inventarios_itens WHERE inventario_id = i.id) as total_itens,
      (SELECT COUNT(*) FROM inventarios_itens WHERE inventario_id = i.id AND quantidade_contada IS NOT NULL) as itens_contados
    FROM inventarios i
    JOIN locais_estoque le ON i.local_estoque_id = le.id
    JOIN usuarios u ON i.responsavel_id = u.id
    WHERE i.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (status) {
    query += ` AND i.status = ?`;
    params.push(status);
  }

  if (local_estoque_id) {
    query += ` AND i.local_estoque_id = ?`;
    params.push(local_estoque_id);
  }

  if (tipo) {
    query += ` AND i.tipo = ?`;
    params.push(tipo);
  }

  // Count total
  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult?.total || 0,
      pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
    }
  });
});

// GET /inventarios/resumo - Dashboard
inventarios.get('/resumo', requirePermission('estoque', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  // Inventários por status
  const porStatus = await c.env.DB.prepare(`
    SELECT status, COUNT(*) as total
    FROM inventarios
    WHERE empresa_id = ?
    GROUP BY status
  `).bind(usuario.empresa_id).all();

  // Inventários em andamento
  const emAndamento = await c.env.DB.prepare(`
    SELECT 
      i.*,
      le.nome as local_estoque_nome,
      (SELECT COUNT(*) FROM inventarios_itens WHERE inventario_id = i.id) as total_itens,
      (SELECT COUNT(*) FROM inventarios_itens WHERE inventario_id = i.id AND quantidade_contada IS NOT NULL) as itens_contados
    FROM inventarios i
    JOIN locais_estoque le ON i.local_estoque_id = le.id
    WHERE i.empresa_id = ? AND i.status = 'EM_ANDAMENTO'
    ORDER BY i.created_at DESC
    LIMIT 5
  `).bind(usuario.empresa_id).all();

  // Divergências pendentes
  const divergencias = await c.env.DB.prepare(`
    SELECT COUNT(*) as total
    FROM inventarios_itens ii
    JOIN inventarios i ON ii.inventario_id = i.id
    WHERE i.empresa_id = ? AND i.status = 'FINALIZADO'
      AND ii.quantidade_contada != ii.quantidade_sistema
      AND ii.ajuste_realizado = 0
  `).bind(usuario.empresa_id).first<{ total: number }>();

  return c.json({
    success: true,
    data: {
      por_status: porStatus.results,
      em_andamento: emAndamento.results,
      divergencias_pendentes: divergencias?.total || 0
    }
  });
});

// GET /inventarios/:id - Buscar
inventarios.get('/:id', requirePermission('estoque', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const inventario = await c.env.DB.prepare(`
    SELECT 
      i.*,
      le.nome as local_estoque_nome,
      u.nome as responsavel_nome
    FROM inventarios i
    JOIN locais_estoque le ON i.local_estoque_id = le.id
    JOIN usuarios u ON i.responsavel_id = u.id
    WHERE i.id = ? AND i.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado' }, 404);
  }

  // Itens do inventário
  const itens = await c.env.DB.prepare(`
    SELECT 
      ii.*,
      p.codigo,
      p.descricao as produto_descricao,
      p.unidade_id,
      u.sigla as unidade_sigla
    FROM inventarios_itens ii
    JOIN produtos p ON ii.produto_id = p.id
    LEFT JOIN unidades u ON p.unidade_id = u.id
    WHERE ii.inventario_id = ?
    ORDER BY p.descricao
  `).bind(id).all();

  // Estatísticas
  const stats = {
    total_itens: itens.results?.length || 0,
    itens_contados: itens.results?.filter((i: any) => i.quantidade_contada !== null).length || 0,
    itens_divergentes: itens.results?.filter((i: any) => 
      i.quantidade_contada !== null && i.quantidade_contada !== i.quantidade_sistema
    ).length || 0,
    valor_divergencia: itens.results?.reduce((acc: number, i: any) => {
      if (i.quantidade_contada !== null && i.quantidade_contada !== i.quantidade_sistema) {
        return acc + ((i.quantidade_contada - i.quantidade_sistema) * (i.custo_medio || 0));
      }
      return acc;
    }, 0) || 0
  };

  return c.json({
    success: true,
    data: { ...inventario, itens: itens.results, estatisticas: stats }
  });
});

// POST /inventarios - Criar
inventarios.post('/', requirePermission('estoque', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = inventarioSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar local de estoque
  const local = await c.env.DB.prepare(`
    SELECT id FROM locais_estoque WHERE id = ? AND empresa_id = ?
  `).bind(data.local_estoque_id, usuario.empresa_id).first();

  if (!local) {
    return c.json({ success: false, error: 'Local de estoque não encontrado' }, 404);
  }

  // Verificar se existe inventário em andamento para o mesmo local
  const emAndamento = await c.env.DB.prepare(`
    SELECT id FROM inventarios 
    WHERE empresa_id = ? AND local_estoque_id = ? AND status IN ('RASCUNHO', 'EM_ANDAMENTO')
  `).bind(usuario.empresa_id, data.local_estoque_id).first();

  if (emAndamento) {
    return c.json({ success: false, error: 'Já existe inventário em andamento para este local' }, 400);
  }

  const id = crypto.randomUUID();

  // Gerar número sequencial
  const seq = await c.env.DB.prepare(`
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 as proximo
    FROM inventarios WHERE empresa_id = ?
  `).bind(usuario.empresa_id).first<{ proximo: number }>();

  const numero = String(seq?.proximo || 1).padStart(6, '0');

  await c.env.DB.prepare(`
    INSERT INTO inventarios (
      id, empresa_id, numero, local_estoque_id, data_inicio,
      responsavel_id, tipo, observacoes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RASCUNHO')
  `).bind(
    id, usuario.empresa_id, numero, data.local_estoque_id, data.data_inicio,
    data.responsavel_id, data.tipo, data.observacoes || null
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'inventarios',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id, numero } }, 201);
});

// POST /inventarios/:id/gerar-itens - Gerar itens para contagem
inventarios.post('/:id/gerar-itens', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'RASCUNHO'
  `).bind(id, usuario.empresa_id).first<any>();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não está em rascunho' }, 404);
  }

  // Filtros opcionais
  const { categoria_id, marca_id, apenas_com_estoque } = body;

  let queryProdutos = `
    SELECT 
      p.id as produto_id,
      COALESCE(e.quantidade, 0) as quantidade_sistema,
      COALESCE(e.custo_medio, p.preco_custo) as custo_medio
    FROM produtos p
    LEFT JOIN estoque e ON p.id = e.produto_id AND e.local_estoque_id = ?
    WHERE p.empresa_id = ? AND p.ativo = 1
  `;
  const params: any[] = [inventario.local_estoque_id, usuario.empresa_id];

  if (categoria_id) {
    queryProdutos += ` AND p.categoria_id = ?`;
    params.push(categoria_id);
  }

  if (marca_id) {
    queryProdutos += ` AND p.marca_id = ?`;
    params.push(marca_id);
  }

  if (apenas_com_estoque) {
    queryProdutos += ` AND COALESCE(e.quantidade, 0) > 0`;
  }

  const produtos = await c.env.DB.prepare(queryProdutos).bind(...params).all();

  // Limpar itens existentes
  await c.env.DB.prepare(`DELETE FROM inventarios_itens WHERE inventario_id = ?`).bind(id).run();

  // Inserir novos itens
  for (const prod of produtos.results as any[]) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO inventarios_itens (
        id, inventario_id, produto_id, quantidade_sistema, custo_medio
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(itemId, id, prod.produto_id, prod.quantidade_sistema, prod.custo_medio).run();
  }

  return c.json({
    success: true,
    message: `${produtos.results?.length || 0} produtos adicionados ao inventário`
  });
});

// POST /inventarios/:id/iniciar - Iniciar contagem
inventarios.post('/:id/iniciar', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'RASCUNHO'
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou já iniciado' }, 404);
  }

  // Verificar se há itens
  const itens = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM inventarios_itens WHERE inventario_id = ?
  `).bind(id).first<{ total: number }>();

  if (!itens || itens.total === 0) {
    return c.json({ success: false, error: 'Inventário sem itens. Gere os itens primeiro.' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE inventarios SET status = 'EM_ANDAMENTO', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ATUALIZAR',
    entidade: 'inventarios',
    entidade_id: id,
    dados_novos: { status: 'EM_ANDAMENTO' }
  });

  return c.json({ success: true, message: 'Inventário iniciado' });
});

// POST /inventarios/:id/contagem - Registrar contagem
inventarios.post('/:id/contagem', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'EM_ANDAMENTO'
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não está em andamento' }, 404);
  }

  const validation = contagemSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar se o item existe no inventário
  const item = await c.env.DB.prepare(`
    SELECT id FROM inventarios_itens WHERE inventario_id = ? AND produto_id = ?
  `).bind(id, data.produto_id).first();

  if (!item) {
    return c.json({ success: false, error: 'Produto não encontrado neste inventário' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE inventarios_itens SET
      quantidade_contada = ?,
      lote = ?,
      validade = ?,
      observacao = ?,
      usuario_contagem_id = ?,
      data_contagem = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE inventario_id = ? AND produto_id = ?
  `).bind(
    data.quantidade_contada, data.lote || null, data.validade || null,
    data.observacao || null, usuario.id, id, data.produto_id
  ).run();

  return c.json({ success: true, message: 'Contagem registrada' });
});

// POST /inventarios/:id/contagem-lote - Registrar múltiplas contagens
inventarios.post('/:id/contagem-lote', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'EM_ANDAMENTO'
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não está em andamento' }, 404);
  }

  const { contagens } = body;
  if (!Array.isArray(contagens) || contagens.length === 0) {
    return c.json({ success: false, error: 'Informe as contagens' }, 400);
  }

  let processados = 0;
  for (const contagem of contagens) {
    const validation = contagemSchema.safeParse(contagem);
    if (validation.success) {
      const data = validation.data;
      await c.env.DB.prepare(`
        UPDATE inventarios_itens SET
          quantidade_contada = ?,
          lote = ?,
          validade = ?,
          observacao = ?,
          usuario_contagem_id = ?,
          data_contagem = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE inventario_id = ? AND produto_id = ?
      `).bind(
        data.quantidade_contada, data.lote || null, data.validade || null,
        data.observacao || null, usuario.id, id, data.produto_id
      ).run();
      processados++;
    }
  }

  return c.json({ success: true, message: `${processados} contagens registradas` });
});

// POST /inventarios/:id/finalizar - Finalizar inventário
inventarios.post('/:id/finalizar', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'EM_ANDAMENTO'
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não está em andamento' }, 404);
  }

  // Verificar se todas as contagens foram feitas
  const pendentes = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM inventarios_itens 
    WHERE inventario_id = ? AND quantidade_contada IS NULL
  `).bind(id).first<{ total: number }>();

  if (pendentes && pendentes.total > 0) {
    return c.json({ 
      success: false, 
      error: `Existem ${pendentes.total} itens sem contagem` 
    }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE inventarios SET 
      status = 'FINALIZADO', 
      data_fim = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ATUALIZAR',
    entidade: 'inventarios',
    entidade_id: id,
    dados_novos: { status: 'FINALIZADO' }
  });

  return c.json({ success: true, message: 'Inventário finalizado' });
});

// POST /inventarios/:id/ajustar-estoque - Ajustar divergências
inventarios.post('/:id/ajustar-estoque', requirePermission('estoque', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status = 'FINALIZADO'
  `).bind(id, usuario.empresa_id).first<any>();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não finalizado' }, 404);
  }

  // Buscar divergências não ajustadas
  const divergencias = await c.env.DB.prepare(`
    SELECT * FROM inventarios_itens
    WHERE inventario_id = ? 
      AND quantidade_contada IS NOT NULL
      AND quantidade_contada != quantidade_sistema
      AND ajuste_realizado = 0
  `).bind(id).all();

  if (!divergencias.results || divergencias.results.length === 0) {
    return c.json({ success: false, error: 'Não há divergências para ajustar' }, 400);
  }

  let ajustes = 0;
  for (const item of divergencias.results as any[]) {
    const diferenca = item.quantidade_contada - item.quantidade_sistema;
    const tipo = diferenca > 0 ? 'ENTRADA' : 'SAIDA';

    // Criar movimentação de ajuste
    const movId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO estoque_movimentacoes (
        id, empresa_id, produto_id, local_estoque_id, tipo, quantidade,
        motivo, referencia_tipo, referencia_id, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'AJUSTE_INVENTARIO', 'INVENTARIO', ?, ?)
    `).bind(
      movId, usuario.empresa_id, item.produto_id, inventario.local_estoque_id,
      tipo, Math.abs(diferenca), id, usuario.id
    ).run();

    // Atualizar estoque
    await c.env.DB.prepare(`
      UPDATE estoque SET 
        quantidade = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE produto_id = ? AND local_estoque_id = ?
    `).bind(item.quantidade_contada, item.produto_id, inventario.local_estoque_id).run();

    // Marcar como ajustado
    await c.env.DB.prepare(`
      UPDATE inventarios_itens SET 
        ajuste_realizado = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(item.id).run();

    ajustes++;
  }

  // Atualizar status do inventário
  await c.env.DB.prepare(`
    UPDATE inventarios SET status = 'AJUSTADO', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ATUALIZAR',
    entidade: 'inventarios',
    entidade_id: id,
    dados_novos: { status: 'AJUSTADO', ajustes_realizados: ajustes }
  });

  return c.json({ success: true, message: `${ajustes} ajustes realizados no estoque` });
});

// DELETE /inventarios/:id - Cancelar
inventarios.delete('/:id', requirePermission('estoque', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const inventario = await c.env.DB.prepare(`
    SELECT * FROM inventarios WHERE id = ? AND empresa_id = ? AND status IN ('RASCUNHO', 'EM_ANDAMENTO')
  `).bind(id, usuario.empresa_id).first();

  if (!inventario) {
    return c.json({ success: false, error: 'Inventário não encontrado ou não pode ser cancelado' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE inventarios SET status = 'CANCELADO', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CANCELAR',
    entidade: 'inventarios',
    entidade_id: id
  });

  return c.json({ success: true, message: 'Inventário cancelado' });
});

export default inventarios;
