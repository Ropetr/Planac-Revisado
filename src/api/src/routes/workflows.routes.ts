// ============================================
// PLANAC ERP - Rotas de Workflows/Automação
// Bloco 3 - Automação de Processos
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const workflows = new Hono<{ Bindings: Env }>();

// ============================================
// WORKFLOWS
// ============================================

// GET /api/workflows - Listar workflows
workflows.get('/', async (c) => {
  const empresaId = c.get('empresaId');
  const { ativo, entidade, trigger } = c.req.query();
  
  let query = `SELECT w.*, u.nome as criado_por_nome,
               (SELECT COUNT(*) FROM workflow_execucoes WHERE workflow_id = w.id) as total_execucoes,
               (SELECT COUNT(*) FROM workflow_execucoes WHERE workflow_id = w.id AND status = 'ERRO') as total_erros
               FROM workflows w
               LEFT JOIN usuarios u ON w.created_by = u.id
               WHERE w.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (ativo !== undefined) {
    query += ` AND w.ativo = ?`;
    params.push(ativo === 'true' ? 1 : 0);
  }
  
  if (entidade) {
    query += ` AND w.entidade = ?`;
    params.push(entidade);
  }
  
  if (trigger) {
    query += ` AND w.trigger_tipo = ?`;
    params.push(trigger);
  }
  
  query += ` ORDER BY w.nome`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/workflows/:id - Buscar workflow com ações
workflows.get('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const workflow = await c.env.DB.prepare(`
    SELECT * FROM workflows WHERE id = ? AND empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!workflow) {
    return c.json({ error: 'Workflow não encontrado' }, 404);
  }
  
  const acoes = await c.env.DB.prepare(`
    SELECT * FROM workflow_acoes WHERE workflow_id = ? ORDER BY ordem
  `).bind(id).all();
  
  return c.json({
    success: true,
    data: { ...workflow, acoes: acoes.results }
  });
});

// POST /api/workflows - Criar workflow
workflows.post('/', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    entidade: z.enum(['PEDIDO', 'ORCAMENTO', 'CLIENTE', 'PRODUTO', 'ESTOQUE', 'TICKET', 'NF']),
    trigger_tipo: z.enum(['CRIAR', 'ATUALIZAR', 'STATUS', 'AGENDADO', 'MANUAL']),
    trigger_condicao: z.record(z.any()).optional(),
    horario_execucao: z.string().regex(/^\d{2}:\d{2}$/).optional(), // Para agendados
    dias_execucao: z.array(z.number().int().min(0).max(6)).optional(), // Para agendados
    acoes: z.array(z.object({
      tipo: z.enum(['EMAIL', 'NOTIFICACAO', 'WEBHOOK', 'ATUALIZAR_CAMPO', 'CRIAR_TAREFA', 'CRIAR_TICKET']),
      configuracao: z.record(z.any()),
      ordem: z.number().int().min(1),
      condicao: z.record(z.any()).optional()
    }))
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO workflows (id, empresa_id, nome, descricao, entidade, trigger_tipo,
                           trigger_condicao, horario_execucao, dias_execucao, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(id, empresaId, data.nome, data.descricao || null, data.entidade, data.trigger_tipo,
          data.trigger_condicao ? JSON.stringify(data.trigger_condicao) : null,
          data.horario_execucao || null,
          data.dias_execucao ? JSON.stringify(data.dias_execucao) : null, usuarioId).run();
  
  // Inserir ações
  for (const acao of data.acoes) {
    const acaoId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO workflow_acoes (id, workflow_id, tipo, configuracao, ordem, condicao)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(acaoId, id, acao.tipo, JSON.stringify(acao.configuracao), acao.ordem,
            acao.condicao ? JSON.stringify(acao.condicao) : null).run();
  }
  
  return c.json({ id, message: 'Workflow criado' }, 201);
});

// PUT /api/workflows/:id - Atualizar workflow
workflows.put('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const campos: string[] = [];
  const valores: any[] = [];
  
  if (body.nome) { campos.push('nome = ?'); valores.push(body.nome); }
  if (body.descricao !== undefined) { campos.push('descricao = ?'); valores.push(body.descricao); }
  if (body.trigger_condicao) { campos.push('trigger_condicao = ?'); valores.push(JSON.stringify(body.trigger_condicao)); }
  if (body.horario_execucao !== undefined) { campos.push('horario_execucao = ?'); valores.push(body.horario_execucao); }
  if (body.ativo !== undefined) { campos.push('ativo = ?'); valores.push(body.ativo ? 1 : 0); }
  
  if (campos.length > 0) {
    await c.env.DB.prepare(`
      UPDATE workflows SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Workflow atualizado' });
});

// PUT /api/workflows/:id/acoes - Atualizar ações do workflow
workflows.put('/:id/acoes', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  // Excluir ações existentes
  await c.env.DB.prepare(`DELETE FROM workflow_acoes WHERE workflow_id = ?`).bind(id).run();
  
  // Inserir novas ações
  for (const acao of body.acoes) {
    const acaoId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO workflow_acoes (id, workflow_id, tipo, configuracao, ordem, condicao)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(acaoId, id, acao.tipo, JSON.stringify(acao.configuracao), acao.ordem,
            acao.condicao ? JSON.stringify(acao.condicao) : null).run();
  }
  
  return c.json({ message: 'Ações atualizadas' });
});

// DELETE /api/workflows/:id - Excluir workflow
workflows.delete('/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  await c.env.DB.prepare(`DELETE FROM workflow_acoes WHERE workflow_id = ?`).bind(id).run();
  await c.env.DB.prepare(`DELETE FROM workflows WHERE id = ? AND empresa_id = ?`).bind(id, empresaId).run();
  
  return c.json({ message: 'Workflow excluído' });
});

// ============================================
// EXECUÇÕES
// ============================================

// POST /api/workflows/:id/executar - Executar workflow manualmente
workflows.post('/:id/executar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const workflow = await c.env.DB.prepare(`
    SELECT * FROM workflows WHERE id = ? AND empresa_id = ? AND ativo = 1
  `).bind(id, empresaId).first();
  
  if (!workflow) {
    return c.json({ error: 'Workflow não encontrado ou inativo' }, 404);
  }
  
  // Criar execução
  const execucaoId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO workflow_execucoes (id, workflow_id, trigger_tipo, dados_entrada, status, iniciado_por)
    VALUES (?, ?, 'MANUAL', ?, 'EXECUTANDO', ?)
  `).bind(execucaoId, id, JSON.stringify(body.dados || {}), usuarioId).run();
  
  // Buscar ações
  const acoes = await c.env.DB.prepare(`
    SELECT * FROM workflow_acoes WHERE workflow_id = ? ORDER BY ordem
  `).bind(id).all();
  
  let sucesso = true;
  let erro: string | null = null;
  
  // Executar cada ação
  for (const acao of acoes.results as any[]) {
    const acaoExecId = crypto.randomUUID();
    
    try {
      // Registrar início da ação
      await c.env.DB.prepare(`
        INSERT INTO workflow_execucoes_acoes (id, execucao_id, acao_id, status, inicio)
        VALUES (?, ?, ?, 'EXECUTANDO', CURRENT_TIMESTAMP)
      `).bind(acaoExecId, execucaoId, acao.id).run();
      
      // Executar ação (simulado)
      const resultado = await executarAcao(c.env, acao, body.dados || {}, empresaId);
      
      // Registrar sucesso
      await c.env.DB.prepare(`
        UPDATE workflow_execucoes_acoes SET status = 'SUCESSO', fim = CURRENT_TIMESTAMP,
               resultado = ? WHERE id = ?
      `).bind(JSON.stringify(resultado), acaoExecId).run();
      
    } catch (e: any) {
      sucesso = false;
      erro = e.message;
      
      await c.env.DB.prepare(`
        UPDATE workflow_execucoes_acoes SET status = 'ERRO', fim = CURRENT_TIMESTAMP,
               erro = ? WHERE id = ?
      `).bind(e.message, acaoExecId).run();
      
      break;
    }
  }
  
  // Atualizar execução
  await c.env.DB.prepare(`
    UPDATE workflow_execucoes SET status = ?, data_conclusao = CURRENT_TIMESTAMP, erro = ?
    WHERE id = ?
  `).bind(sucesso ? 'SUCESSO' : 'ERRO', erro, execucaoId).run();
  
  return c.json({ 
    execucao_id: execucaoId, 
    status: sucesso ? 'SUCESSO' : 'ERRO',
    erro 
  });
});

// GET /api/workflows/:id/execucoes - Listar execuções de um workflow
workflows.get('/:id/execucoes', async (c) => {
  const { id } = c.req.param();
  const { status, limit = '20' } = c.req.query();
  
  let query = `SELECT * FROM workflow_execucoes WHERE workflow_id = ?`;
  const params: any[] = [id];
  
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(parseInt(limit));
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// GET /api/workflows/execucoes/:execucaoId - Detalhes de uma execução
workflows.get('/execucoes/:execucaoId', async (c) => {
  const { execucaoId } = c.req.param();
  
  const execucao = await c.env.DB.prepare(`
    SELECT we.*, w.nome as workflow_nome
    FROM workflow_execucoes we
    JOIN workflows w ON we.workflow_id = w.id
    WHERE we.id = ?
  `).bind(execucaoId).first();
  
  if (!execucao) {
    return c.json({ error: 'Execução não encontrada' }, 404);
  }
  
  const acoes = await c.env.DB.prepare(`
    SELECT wea.*, wa.tipo as acao_tipo, wa.ordem
    FROM workflow_execucoes_acoes wea
    JOIN workflow_acoes wa ON wea.acao_id = wa.id
    WHERE wea.execucao_id = ?
    ORDER BY wa.ordem
  `).bind(execucaoId).all();
  
  return c.json({
    success: true,
    data: { ...execucao, acoes: acoes.results }
  });
});

// ============================================
// TRIGGERS
// ============================================

// POST /api/workflows/trigger - Disparar workflows por evento
workflows.post('/trigger', async (c) => {
  const empresaId = c.get('empresaId');
  const body = await c.req.json();
  
  const schema = z.object({
    entidade: z.string(),
    evento: z.string(), // CRIAR, ATUALIZAR, STATUS
    dados: z.record(z.any())
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  // Buscar workflows que correspondem ao evento
  const workflowsAtivos = await c.env.DB.prepare(`
    SELECT * FROM workflows 
    WHERE empresa_id = ? AND entidade = ? AND trigger_tipo = ? AND ativo = 1
  `).bind(empresaId, validation.data.entidade, validation.data.evento).all();
  
  const execucoes: string[] = [];
  
  for (const workflow of workflowsAtivos.results as any[]) {
    // Verificar condição
    if (workflow.trigger_condicao) {
      const condicao = JSON.parse(workflow.trigger_condicao);
      if (!verificarCondicao(condicao, validation.data.dados)) {
        continue;
      }
    }
    
    // Criar execução
    const execucaoId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO workflow_execucoes (id, workflow_id, trigger_tipo, dados_entrada, status)
      VALUES (?, ?, ?, ?, 'PENDENTE')
    `).bind(execucaoId, workflow.id, validation.data.evento, JSON.stringify(validation.data.dados)).run();
    
    execucoes.push(execucaoId);
  }
  
  return c.json({ 
    message: `${execucoes.length} workflow(s) disparado(s)`,
    execucoes 
  });
});

// ============================================
// TEMPLATES DE WORKFLOWS
// ============================================

// GET /api/workflows/templates - Listar templates pré-definidos
workflows.get('/templates', async (c) => {
  const templates = [
    {
      id: 'template_pedido_criado',
      nome: 'Notificar novo pedido',
      entidade: 'PEDIDO',
      trigger_tipo: 'CRIAR',
      descricao: 'Envia notificação quando um novo pedido é criado',
      acoes: [
        { tipo: 'NOTIFICACAO', configuracao: { titulo: 'Novo pedido', mensagem: 'Pedido {{numero}} criado' } },
        { tipo: 'EMAIL', configuracao: { para: '{{vendedor_email}}', assunto: 'Novo pedido', template: 'novo_pedido' } }
      ]
    },
    {
      id: 'template_estoque_baixo',
      nome: 'Alerta de estoque baixo',
      entidade: 'ESTOQUE',
      trigger_tipo: 'ATUALIZAR',
      descricao: 'Alerta quando estoque fica abaixo do mínimo',
      acoes: [
        { tipo: 'NOTIFICACAO', configuracao: { titulo: 'Estoque baixo', mensagem: 'Produto {{codigo}} com estoque baixo' } },
        { tipo: 'CRIAR_TAREFA', configuracao: { titulo: 'Repor estoque', responsavel: 'compras' } }
      ]
    },
    {
      id: 'template_ticket_urgente',
      nome: 'Escalar ticket urgente',
      entidade: 'TICKET',
      trigger_tipo: 'STATUS',
      trigger_condicao: { prioridade: 'URGENTE' },
      descricao: 'Notifica gerente quando ticket urgente é criado',
      acoes: [
        { tipo: 'EMAIL', configuracao: { para: 'gerente@empresa.com', assunto: 'Ticket urgente', template: 'ticket_urgente' } }
      ]
    }
  ];
  
  return c.json({ success: true, data: templates });
});

// POST /api/workflows/templates/:templateId/usar - Criar workflow a partir de template
workflows.post('/templates/:templateId/usar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { templateId } = c.req.param();
  const body = await c.req.json();
  
  // Buscar template (em produção viria do banco)
  // Aqui usamos templates hardcoded como exemplo
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO workflows (id, empresa_id, nome, descricao, entidade, trigger_tipo, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(id, empresaId, body.nome || `Workflow ${templateId}`, body.descricao || null,
          body.entidade || 'PEDIDO', body.trigger_tipo || 'CRIAR', usuarioId).run();
  
  return c.json({ id, message: 'Workflow criado a partir do template' }, 201);
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function executarAcao(env: Env, acao: any, dados: any, empresaId: string): Promise<any> {
  const config = JSON.parse(acao.configuracao);
  
  switch (acao.tipo) {
    case 'EMAIL':
      // Simular envio de email
      return { enviado: true, para: config.para };
      
    case 'NOTIFICACAO':
      // Criar notificação
      const notifId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO notificacoes (id, empresa_id, tipo, titulo, mensagem)
        VALUES (?, ?, 'WORKFLOW', ?, ?)
      `).bind(notifId, empresaId, config.titulo, config.mensagem).run();
      return { notificacao_id: notifId };
      
    case 'WEBHOOK':
      // Chamar webhook externo
      return { status: 'chamado', url: config.url };
      
    case 'ATUALIZAR_CAMPO':
      // Atualizar campo de registro
      return { campo: config.campo, valor: config.valor };
      
    case 'CRIAR_TAREFA':
      const tarefaId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO tarefas (id, empresa_id, titulo, origem_tipo, origem_id)
        VALUES (?, ?, ?, 'WORKFLOW', ?)
      `).bind(tarefaId, empresaId, config.titulo, acao.id).run();
      return { tarefa_id: tarefaId };
      
    default:
      throw new Error(`Tipo de ação não suportado: ${acao.tipo}`);
  }
}

function verificarCondicao(condicao: any, dados: any): boolean {
  for (const [campo, valorEsperado] of Object.entries(condicao)) {
    if (dados[campo] !== valorEsperado) {
      return false;
    }
  }
  return true;
}

export default workflows;
