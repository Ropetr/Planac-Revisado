// ============================================
// PLANAC ERP - Rotas de BI / Dashboards
// Bloco 3 - Business Intelligence
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const bi = new Hono<{ Bindings: Env }>();

// ============================================
// DASHBOARDS
// ============================================

// GET /api/bi/dashboards - Listar dashboards
bi.get('/dashboards', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { publico } = c.req.query();
  
  let query = `SELECT d.*, u.nome as criado_por_nome,
               (SELECT COUNT(*) FROM dashboards_widgets WHERE dashboard_id = d.id) as total_widgets
               FROM dashboards d
               LEFT JOIN usuarios u ON d.created_by = u.id
               WHERE d.empresa_id = ? AND (d.publico = 1 OR d.created_by = ?)`;
  const params: any[] = [empresaId, usuarioId];
  
  if (publico === 'true') {
    query = query.replace('AND (d.publico = 1 OR d.created_by = ?)', 'AND d.publico = 1');
    params.pop();
  }
  
  query += ` ORDER BY d.ordem, d.nome`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/bi/dashboards/:id - Buscar dashboard com widgets
bi.get('/dashboards/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const dashboard = await c.env.DB.prepare(`
    SELECT * FROM dashboards WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!dashboard) {
    return c.json({ error: 'Dashboard não encontrado' }, 404);
  }
  
  const widgets = await c.env.DB.prepare(`
    SELECT * FROM dashboards_widgets WHERE dashboard_id = ? ORDER BY ordem
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: { ...dashboard, widgets: widgets.results }
  });
});

// POST /api/bi/dashboards - Criar dashboard
bi.post('/dashboards', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    publico: z.boolean().default(false),
    ordem: z.number().int().default(0)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO dashboards (id, empresa_id, nome, descricao, publico, ordem, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, validation.data.nome, validation.data.descricao || null,
          validation.data.publico ? 1 : 0, validation.data.ordem, usuarioId).run();
  
  return c.json({ id, message: 'Dashboard criado' }, 201);
});

// POST /api/bi/dashboards/:id/widgets - Adicionar widget
bi.post('/dashboards/:id/widgets', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    tipo: z.enum(['CARD_KPI', 'GRAFICO_LINHA', 'GRAFICO_BARRA', 'GRAFICO_PIZZA', 'TABELA', 'MAPA', 'GAUGE']),
    titulo: z.string().min(1).max(100),
    subtitulo: z.string().optional(),
    consulta_sql: z.string().optional(),
    fonte_dados: z.string().optional(),
    configuracao: z.record(z.any()).optional(),
    largura: z.number().int().min(1).max(12).default(4),
    altura: z.number().int().min(1).max(4).default(1),
    ordem: z.number().int().default(0)
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const widgetId = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO dashboards_widgets (id, dashboard_id, tipo, titulo, subtitulo, consulta_sql,
                                    fonte_dados, configuracao, largura, altura, ordem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(widgetId, id, data.tipo, data.titulo, data.subtitulo || null,
          data.consulta_sql || null, data.fonte_dados || null,
          data.configuracao ? JSON.stringify(data.configuracao) : null,
          data.largura, data.altura, data.ordem).run();
  
  return c.json({ id: widgetId, message: 'Widget adicionado' }, 201);
});

// PUT /api/bi/dashboards/:id/widgets/:widgetId - Atualizar widget
bi.put('/dashboards/:id/widgets/:widgetId', async (c) => {
  const { id, widgetId } = c.req.param();
  const body = await c.req.json();
  
  const campos: string[] = [];
  const valores: any[] = [];
  
  for (const [key, value] of Object.entries(body)) {
    if (key === 'configuracao') {
      campos.push(`${key} = ?`);
      valores.push(JSON.stringify(value));
    } else {
      campos.push(`${key} = ?`);
      valores.push(value);
    }
  }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE dashboards_widgets SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND dashboard_id = ?
    `).bind(...valores, widgetId, id).run();
  }
  
  return c.json({ message: 'Widget atualizado' });
});

// DELETE /api/bi/dashboards/:id/widgets/:widgetId - Remover widget
bi.delete('/dashboards/:id/widgets/:widgetId', async (c) => {
  const { id, widgetId } = c.req.param();
  
  await c.env.DB.prepare(`DELETE FROM dashboards_widgets WHERE id = ? AND dashboard_id = ?`).bind(widgetId, id).run();
  
  return c.json({ message: 'Widget removido' });
});

// ============================================
// RELATÓRIOS
// ============================================

// GET /api/bi/relatorios - Listar relatórios
bi.get('/relatorios', async (c) => {
  const empresaId = c.get('empresaId');
  const { categoria, favorito } = c.req.query();
  
  let query = `SELECT * FROM relatorios WHERE empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (categoria) {
    query += ` AND categoria = ?`;
    params.push(categoria);
  }
  
  if (favorito === 'true') {
    query += ` AND favorito = 1`;
  }
  
  query += ` ORDER BY categoria, nome`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/bi/relatorios/:id - Buscar relatório
bi.get('/relatorios/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const relatorio = await c.env.DB.prepare(`
    SELECT * FROM relatorios WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!relatorio) {
    return c.json({ error: 'Relatório não encontrado' }, 404);
  }
  
  return c.json({ success: true, data: relatorio });
});

// POST /api/bi/relatorios - Criar relatório
bi.post('/relatorios', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    categoria: z.string().max(50),
    consulta_sql: z.string(),
    parametros: z.array(z.object({
      nome: z.string(),
      tipo: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT']),
      label: z.string(),
      obrigatorio: z.boolean().default(false),
      opcoes: z.array(z.string()).optional()
    })).optional(),
    formato_padrao: z.enum(['PDF', 'EXCEL', 'CSV']).default('PDF')
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO relatorios (id, empresa_id, nome, descricao, categoria, consulta_sql, 
                            parametros, formato_padrao, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, data.nome, data.descricao || null, data.categoria,
          data.consulta_sql, data.parametros ? JSON.stringify(data.parametros) : null,
          data.formato_padrao, usuarioId).run();
  
  return c.json({ id, message: 'Relatório criado' }, 201);
});

// POST /api/bi/relatorios/:id/executar - Executar relatório
bi.post('/relatorios/:id/executar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const relatorio = await c.env.DB.prepare(`
    SELECT * FROM relatorios WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!relatorio) {
    return c.json({ error: 'Relatório não encontrado' }, 404);
  }
  
  // Registrar execução
  const execucaoId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO relatorios_execucoes (id, relatorio_id, usuario_id, parametros, status)
    VALUES (?, ?, ?, ?, 'PROCESSANDO')
  `).bind(execucaoId, id, usuarioId, JSON.stringify(body.parametros || {})).run();
  
  try {
    // Substituir parâmetros na consulta (simplificado)
    let consulta = relatorio.consulta_sql as string;
    consulta = consulta.replace(':empresa_id', `'${empresaId}'`);
    
    if (body.parametros) {
      for (const [key, value] of Object.entries(body.parametros)) {
        consulta = consulta.replace(`:${key}`, `'${value}'`);
      }
    }
    
    // Executar consulta
    const resultado = await c.env.DB.prepare(consulta).all();
    
    // Atualizar execução
    await c.env.DB.prepare(`
      UPDATE relatorios_execucoes SET status = 'CONCLUIDO', 
             total_registros = ?, data_conclusao = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(resultado.results.length, execucaoId).run();
    
    return c.json({
      success: true,
      execucao_id: execucaoId,
      total_registros: resultado.results.length,
      dados: resultado.results
    });
    
  } catch (error: any) {
    await c.env.DB.prepare(`
      UPDATE relatorios_execucoes SET status = 'ERRO', erro = ? WHERE id = ?
    `).bind(error.message, execucaoId).run();
    
    return c.json({ error: 'Erro ao executar relatório', details: error.message }, 500);
  }
});

// POST /api/bi/relatorios/:id/agendar - Agendar relatório
bi.post('/relatorios/:id/agendar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    frequencia: z.enum(['DIARIO', 'SEMANAL', 'MENSAL']),
    hora: z.string().regex(/^\d{2}:\d{2}$/),
    dia_semana: z.number().int().min(0).max(6).optional(),
    dia_mes: z.number().int().min(1).max(28).optional(),
    emails_destino: z.array(z.string().email()).min(1),
    formato: z.enum(['PDF', 'EXCEL', 'CSV']).default('PDF'),
    parametros: z.record(z.any()).optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const agendamentoId = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO relatorios_agendados (id, relatorio_id, frequencia, hora, dia_semana, dia_mes,
                                      emails_destino, formato, parametros, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(agendamentoId, id, data.frequencia, data.hora, data.dia_semana || null,
          data.dia_mes || null, JSON.stringify(data.emails_destino), data.formato,
          data.parametros ? JSON.stringify(data.parametros) : null, usuarioId).run();
  
  return c.json({ id: agendamentoId, message: 'Agendamento criado' }, 201);
});

// GET /api/bi/relatorios/:id/execucoes - Histórico de execuções
bi.get('/relatorios/:id/execucoes', async (c) => {
  const { id } = c.req.param();
  const { page = '1', limit = '20' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const result = await c.env.DB.prepare(`
    SELECT re.*, u.nome as usuario_nome
    FROM relatorios_execucoes re
    LEFT JOIN usuarios u ON re.usuario_id = u.id
    WHERE re.relatorio_id = ?
    ORDER BY re.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(id, parseInt(limit), offset).all();
  
  return c.json({ success: true, data: result.results });
});

// ============================================
// KPIs PRONTOS
// ============================================

// GET /api/bi/kpis/vendas - KPIs de vendas
bi.get('/kpis/vendas', async (c) => {
  const empresaId = c.get('empresaId');
  const { periodo = '30' } = c.req.query();
  
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
  
  // Total de vendas
  const vendas = await c.env.DB.prepare(`
    SELECT COUNT(*) as total_pedidos,
           SUM(valor_total) as valor_total,
           AVG(valor_total) as ticket_medio
    FROM pedidos
    WHERE empresa_id = ? AND status NOT IN ('CANCELADO') 
          AND data_emissao >= ?
  `).bind(empresaId, dataInicio.toISOString().split('T')[0]).first();
  
  // Vendas por status
  const porStatus = await c.env.DB.prepare(`
    SELECT status, COUNT(*) as quantidade, SUM(valor_total) as valor
    FROM pedidos WHERE empresa_id = ? AND data_emissao >= ?
    GROUP BY status
  `).bind(empresaId, dataInicio.toISOString().split('T')[0]).all();
  
  // Top vendedores
  const topVendedores = await c.env.DB.prepare(`
    SELECT v.nome, COUNT(p.id) as pedidos, SUM(p.valor_total) as valor
    FROM pedidos p
    JOIN vendedores v ON p.vendedor_id = v.id
    WHERE p.empresa_id = ? AND p.data_emissao >= ?
    GROUP BY p.vendedor_id
    ORDER BY valor DESC
    LIMIT 5
  `).bind(empresaId, dataInicio.toISOString().split('T')[0]).all();
  
  return c.json({
    success: true,
    data: {
      periodo_dias: parseInt(periodo),
      resumo: vendas,
      por_status: porStatus.results,
      top_vendedores: topVendedores.results
    }
  });
});

// GET /api/bi/kpis/estoque - KPIs de estoque
bi.get('/kpis/estoque', async (c) => {
  const empresaId = c.get('empresaId');
  
  // Totais
  const totais = await c.env.DB.prepare(`
    SELECT COUNT(DISTINCT produto_id) as total_produtos,
           SUM(quantidade) as quantidade_total
    FROM estoque WHERE empresa_id = ?
  `).bind(empresaId).first();
  
  // Produtos sem estoque
  const semEstoque = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM produtos p
    WHERE p.empresa_id = ? AND p.ativo = 1
          AND NOT EXISTS (SELECT 1 FROM estoque e WHERE e.produto_id = p.id AND e.quantidade > 0)
  `).bind(empresaId).first();
  
  // Produtos abaixo do mínimo
  const abaixoMinimo = await c.env.DB.prepare(`
    SELECT p.id, p.descricao, e.quantidade, p.estoque_minimo
    FROM produtos p
    JOIN estoque e ON p.id = e.produto_id
    WHERE p.empresa_id = ? AND p.estoque_minimo > 0 AND e.quantidade < p.estoque_minimo
    LIMIT 10
  `).bind(empresaId).all();
  
  return c.json({
    success: true,
    data: {
      totais,
      sem_estoque: semEstoque?.total || 0,
      abaixo_minimo: abaixoMinimo.results
    }
  });
});

// GET /api/bi/kpis/financeiro - KPIs financeiros
bi.get('/kpis/financeiro', async (c) => {
  const empresaId = c.get('empresaId');
  
  // Contas a receber
  const receber = await c.env.DB.prepare(`
    SELECT COUNT(*) as total, SUM(valor) as valor_total,
           SUM(CASE WHEN data_vencimento < date('now') AND status = 'ABERTO' THEN valor ELSE 0 END) as vencido
    FROM contas_receber WHERE empresa_id = ? AND status = 'ABERTO'
  `).bind(empresaId).first();
  
  // Contas a pagar
  const pagar = await c.env.DB.prepare(`
    SELECT COUNT(*) as total, SUM(valor) as valor_total,
           SUM(CASE WHEN data_vencimento < date('now') AND status = 'ABERTO' THEN valor ELSE 0 END) as vencido
    FROM contas_pagar WHERE empresa_id = ? AND status = 'ABERTO'
  `).bind(empresaId).first();
  
  return c.json({
    success: true,
    data: {
      contas_receber: receber,
      contas_pagar: pagar,
      saldo_previsto: ((receber?.valor_total as number) || 0) - ((pagar?.valor_total as number) || 0)
    }
  });
});

export default bi;
