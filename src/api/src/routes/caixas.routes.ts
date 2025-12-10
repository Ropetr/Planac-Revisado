// ============================================
// PLANAC ERP - Rotas de Caixas (PDV/Tesouraria)
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const caixas = new Hono<{ Bindings: Bindings; Variables: Variables }>();

caixas.use('/*', requireAuth());

// Schemas
const caixaSchema = z.object({
  nome: z.string().min(2).max(50),
  filial_id: z.string().uuid().optional(),
  conta_bancaria_id: z.string().uuid().optional(),
  limite_sangria: z.number().default(0),
  ativo: z.boolean().default(true)
});

const aberturaSchema = z.object({
  caixa_id: z.string().uuid(),
  valor_abertura: z.number().min(0),
  observacoes: z.string().optional()
});

const movimentacaoSchema = z.object({
  tipo: z.enum(['SUPRIMENTO', 'SANGRIA']),
  valor: z.number().positive(),
  motivo: z.string(),
  conta_bancaria_destino_id: z.string().uuid().optional()
});

const fechamentoSchema = z.object({
  valor_dinheiro: z.number().min(0).default(0),
  valor_pix: z.number().min(0).default(0),
  valor_cartao_debito: z.number().min(0).default(0),
  valor_cartao_credito: z.number().min(0).default(0),
  valor_cheque: z.number().min(0).default(0),
  valor_outros: z.number().min(0).default(0),
  observacoes: z.string().optional()
});

// ==========================================
// CAIXAS
// ==========================================

// GET /caixas - Listar caixas
caixas.get('/', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  const result = await c.env.DB.prepare(`
    SELECT 
      c.*,
      f.nome as filial_nome,
      cb.banco_nome,
      (
        SELECT s.id FROM caixas_sessoes s 
        WHERE s.caixa_id = c.id AND s.status = 'ABERTO' 
        LIMIT 1
      ) as sessao_aberta_id,
      (
        SELECT u.nome FROM caixas_sessoes s 
        JOIN usuarios u ON s.usuario_id = u.id
        WHERE s.caixa_id = c.id AND s.status = 'ABERTO' 
        LIMIT 1
      ) as operador_atual
    FROM caixas c
    LEFT JOIN filiais f ON c.filial_id = f.id
    LEFT JOIN contas_bancarias cb ON c.conta_bancaria_id = cb.id
    WHERE c.empresa_id = ?
    ORDER BY c.nome
  `).bind(usuario.empresa_id).all();

  return c.json({ success: true, data: result.results });
});

// GET /caixas/meu-caixa - Caixa do usuário atual
caixas.get('/meu-caixa', requirePermission('pdv', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  const sessaoAberta = await c.env.DB.prepare(`
    SELECT 
      s.*,
      c.nome as caixa_nome,
      c.limite_sangria
    FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    WHERE s.usuario_id = ? AND s.status = 'ABERTO'
  `).bind(usuario.id).first();

  if (!sessaoAberta) {
    return c.json({ success: true, data: null, message: 'Nenhum caixa aberto' });
  }

  // Movimentações da sessão
  const movimentacoes = await c.env.DB.prepare(`
    SELECT * FROM caixas_movimentacoes
    WHERE sessao_id = ?
    ORDER BY created_at DESC
  `).bind((sessaoAberta as any).id).all();

  // Resumo por forma de pagamento
  const resumo = await c.env.DB.prepare(`
    SELECT 
      forma_pagamento,
      SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'SAIDA' THEN valor ELSE 0 END) as saidas
    FROM caixas_movimentacoes
    WHERE sessao_id = ?
    GROUP BY forma_pagamento
  `).bind((sessaoAberta as any).id).all();

  // Calcular saldo atual
  const saldoCalc = await c.env.DB.prepare(`
    SELECT 
      SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END) as saldo
    FROM caixas_movimentacoes
    WHERE sessao_id = ?
  `).bind((sessaoAberta as any).id).first<{ saldo: number }>();

  const saldoAtual = (sessaoAberta as any).valor_abertura + (saldoCalc?.saldo || 0);

  return c.json({
    success: true,
    data: {
      sessao: sessaoAberta,
      saldo_atual: saldoAtual,
      movimentacoes: movimentacoes.results,
      resumo_formas: resumo.results
    }
  });
});

// GET /caixas/:id - Buscar caixa
caixas.get('/:id', requirePermission('financeiro', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const caixa = await c.env.DB.prepare(`
    SELECT 
      c.*,
      f.nome as filial_nome,
      cb.banco_nome,
      cb.agencia,
      cb.conta
    FROM caixas c
    LEFT JOIN filiais f ON c.filial_id = f.id
    LEFT JOIN contas_bancarias cb ON c.conta_bancaria_id = cb.id
    WHERE c.id = ? AND c.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!caixa) {
    return c.json({ success: false, error: 'Caixa não encontrado' }, 404);
  }

  // Sessão atual
  const sessaoAtual = await c.env.DB.prepare(`
    SELECT s.*, u.nome as operador_nome
    FROM caixas_sessoes s
    JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.caixa_id = ? AND s.status = 'ABERTO'
  `).bind(id).first();

  // Últimas sessões
  const ultimasSessoes = await c.env.DB.prepare(`
    SELECT s.*, u.nome as operador_nome
    FROM caixas_sessoes s
    JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.caixa_id = ?
    ORDER BY s.created_at DESC
    LIMIT 10
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...caixa,
      sessao_atual: sessaoAtual,
      ultimas_sessoes: ultimasSessoes.results
    }
  });
});

// POST /caixas - Criar caixa
caixas.post('/', requirePermission('financeiro', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = caixaSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO caixas (
      id, empresa_id, nome, filial_id, conta_bancaria_id, limite_sangria, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, usuario.empresa_id, data.nome, data.filial_id || null,
    data.conta_bancaria_id || null, data.limite_sangria, data.ativo ? 1 : 0
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'caixas',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id } }, 201);
});

// PUT /caixas/:id - Atualizar caixa
caixas.put('/:id', requirePermission('financeiro', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const caixaAtual = await c.env.DB.prepare(`
    SELECT * FROM caixas WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!caixaAtual) {
    return c.json({ success: false, error: 'Caixa não encontrado' }, 404);
  }

  const validation = caixaSchema.partial().safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  await c.env.DB.prepare(`
    UPDATE caixas SET
      nome = COALESCE(?, nome),
      filial_id = COALESCE(?, filial_id),
      conta_bancaria_id = COALESCE(?, conta_bancaria_id),
      limite_sangria = COALESCE(?, limite_sangria),
      ativo = COALESCE(?, ativo),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(
    data.nome, data.filial_id, data.conta_bancaria_id, data.limite_sangria,
    data.ativo !== undefined ? (data.ativo ? 1 : 0) : null,
    id, usuario.empresa_id
  ).run();

  return c.json({ success: true, message: 'Caixa atualizado' });
});

// ==========================================
// SESSÕES DE CAIXA
// ==========================================

// POST /caixas/abrir - Abrir caixa
caixas.post('/abrir', requirePermission('pdv', 'abrir_caixa'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = aberturaSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar se caixa existe
  const caixa = await c.env.DB.prepare(`
    SELECT * FROM caixas WHERE id = ? AND empresa_id = ? AND ativo = 1
  `).bind(data.caixa_id, usuario.empresa_id).first();

  if (!caixa) {
    return c.json({ success: false, error: 'Caixa não encontrado ou inativo' }, 404);
  }

  // Verificar se já está aberto
  const sessaoExistente = await c.env.DB.prepare(`
    SELECT id, usuario_id FROM caixas_sessoes WHERE caixa_id = ? AND status = 'ABERTO'
  `).bind(data.caixa_id).first<any>();

  if (sessaoExistente) {
    return c.json({ 
      success: false, 
      error: 'Caixa já está aberto por outro usuário'
    }, 400);
  }

  // Verificar se usuário já tem caixa aberto
  const usuarioComCaixa = await c.env.DB.prepare(`
    SELECT s.id, c.nome FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    WHERE s.usuario_id = ? AND s.status = 'ABERTO'
  `).bind(usuario.id).first<any>();

  if (usuarioComCaixa) {
    return c.json({ 
      success: false, 
      error: `Você já possui o caixa "${usuarioComCaixa.nome}" aberto`
    }, 400);
  }

  const sessaoId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO caixas_sessoes (
      id, caixa_id, usuario_id, data_abertura, valor_abertura, observacoes_abertura, status
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'ABERTO')
  `).bind(sessaoId, data.caixa_id, usuario.id, data.valor_abertura, data.observacoes || null).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ABRIR_CAIXA',
    entidade: 'caixas_sessoes',
    entidade_id: sessaoId,
    dados_novos: data
  });

  return c.json({ 
    success: true, 
    data: { sessao_id: sessaoId },
    message: 'Caixa aberto com sucesso'
  }, 201);
});

// POST /caixas/fechar - Fechar caixa
caixas.post('/fechar', requirePermission('pdv', 'fechar_caixa'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = fechamentoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Buscar sessão aberta do usuário
  const sessao = await c.env.DB.prepare(`
    SELECT s.*, c.nome as caixa_nome, c.conta_bancaria_id
    FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    WHERE s.usuario_id = ? AND s.status = 'ABERTO'
  `).bind(usuario.id).first<any>();

  if (!sessao) {
    return c.json({ success: false, error: 'Nenhum caixa aberto para este usuário' }, 400);
  }

  // Calcular valores do sistema
  const sistema = await c.env.DB.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN forma_pagamento = 'DINHEIRO' AND tipo = 'ENTRADA' THEN valor 
                        WHEN forma_pagamento = 'DINHEIRO' AND tipo = 'SAIDA' THEN -valor ELSE 0 END), 0) as dinheiro,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'PIX' AND tipo = 'ENTRADA' THEN valor 
                        WHEN forma_pagamento = 'PIX' AND tipo = 'SAIDA' THEN -valor ELSE 0 END), 0) as pix,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'CARTAO_DEBITO' AND tipo = 'ENTRADA' THEN valor 
                        WHEN forma_pagamento = 'CARTAO_DEBITO' AND tipo = 'SAIDA' THEN -valor ELSE 0 END), 0) as cartao_debito,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'CARTAO_CREDITO' AND tipo = 'ENTRADA' THEN valor 
                        WHEN forma_pagamento = 'CARTAO_CREDITO' AND tipo = 'SAIDA' THEN -valor ELSE 0 END), 0) as cartao_credito,
      COALESCE(SUM(CASE WHEN forma_pagamento = 'CHEQUE' AND tipo = 'ENTRADA' THEN valor 
                        WHEN forma_pagamento = 'CHEQUE' AND tipo = 'SAIDA' THEN -valor ELSE 0 END), 0) as cheque,
      COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END), 0) as total
    FROM caixas_movimentacoes
    WHERE sessao_id = ?
  `).bind(sessao.id).first<any>();

  const valorInformado = data.valor_dinheiro + data.valor_pix + data.valor_cartao_debito + 
                         data.valor_cartao_credito + data.valor_cheque + data.valor_outros;

  const valorSistema = sessao.valor_abertura + (sistema?.total || 0);
  const diferenca = valorInformado - valorSistema;

  await c.env.DB.prepare(`
    UPDATE caixas_sessoes SET
      data_fechamento = CURRENT_TIMESTAMP,
      valor_fechamento_informado = ?,
      valor_fechamento_sistema = ?,
      diferenca = ?,
      valor_dinheiro = ?,
      valor_pix = ?,
      valor_cartao_debito = ?,
      valor_cartao_credito = ?,
      valor_cheque = ?,
      valor_outros = ?,
      observacoes_fechamento = ?,
      status = 'FECHADO',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    valorInformado, valorSistema, diferenca,
    data.valor_dinheiro, data.valor_pix, data.valor_cartao_debito,
    data.valor_cartao_credito, data.valor_cheque, data.valor_outros,
    data.observacoes || null, sessao.id
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'FECHAR_CAIXA',
    entidade: 'caixas_sessoes',
    entidade_id: sessao.id,
    dados_novos: { ...data, valor_sistema: valorSistema, diferenca }
  });

  return c.json({ 
    success: true, 
    data: {
      valor_informado: valorInformado,
      valor_sistema: valorSistema,
      diferenca
    },
    message: diferenca === 0 ? 'Caixa fechado sem diferença' : 
             `Caixa fechado com diferença de R$ ${diferenca.toFixed(2)}`
  });
});

// POST /caixas/suprimento - Suprimento
caixas.post('/suprimento', requirePermission('pdv', 'suprimento'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const { valor, motivo } = body;
  if (!valor || valor <= 0) {
    return c.json({ success: false, error: 'Informe um valor válido' }, 400);
  }

  // Buscar sessão aberta
  const sessao = await c.env.DB.prepare(`
    SELECT * FROM caixas_sessoes WHERE usuario_id = ? AND status = 'ABERTO'
  `).bind(usuario.id).first<any>();

  if (!sessao) {
    return c.json({ success: false, error: 'Nenhum caixa aberto' }, 400);
  }

  const movId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO caixas_movimentacoes (
      id, sessao_id, tipo, forma_pagamento, valor, descricao, usuario_id
    ) VALUES (?, ?, 'ENTRADA', 'DINHEIRO', ?, ?, ?)
  `).bind(movId, sessao.id, valor, motivo || 'Suprimento de caixa', usuario.id).run();

  return c.json({ success: true, message: 'Suprimento registrado' });
});

// POST /caixas/sangria - Sangria
caixas.post('/sangria', requirePermission('pdv', 'sangria'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const { valor, motivo, conta_bancaria_destino_id } = body;
  if (!valor || valor <= 0) {
    return c.json({ success: false, error: 'Informe um valor válido' }, 400);
  }

  // Buscar sessão aberta
  const sessao = await c.env.DB.prepare(`
    SELECT s.*, c.limite_sangria, c.conta_bancaria_id
    FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    WHERE s.usuario_id = ? AND s.status = 'ABERTO'
  `).bind(usuario.id).first<any>();

  if (!sessao) {
    return c.json({ success: false, error: 'Nenhum caixa aberto' }, 400);
  }

  // Verificar saldo
  const saldoAtual = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END), 0) as saldo
    FROM caixas_movimentacoes
    WHERE sessao_id = ? AND forma_pagamento = 'DINHEIRO'
  `).bind(sessao.id).first<{ saldo: number }>();

  const saldoDinheiro = sessao.valor_abertura + (saldoAtual?.saldo || 0);

  if (valor > saldoDinheiro) {
    return c.json({ success: false, error: 'Valor maior que o saldo em dinheiro' }, 400);
  }

  const movId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO caixas_movimentacoes (
      id, sessao_id, tipo, forma_pagamento, valor, descricao, usuario_id
    ) VALUES (?, ?, 'SAIDA', 'DINHEIRO', ?, ?, ?)
  `).bind(movId, sessao.id, valor, motivo || 'Sangria de caixa', usuario.id).run();

  // Se tiver conta bancária de destino, criar movimentação bancária
  const contaDestino = conta_bancaria_destino_id || sessao.conta_bancaria_id;
  if (contaDestino) {
    const movBancoId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO movimentacoes_bancarias (
        id, conta_bancaria_id, tipo, valor, data, descricao, categoria, compensado
      ) VALUES (?, ?, 'CREDITO', ?, DATE('now'), ?, 'SANGRIA_CAIXA', 0)
    `).bind(movBancoId, contaDestino, valor, `Sangria do caixa - ${sessao.id}`).run();
  }

  return c.json({ success: true, message: 'Sangria registrada' });
});

// GET /caixas/sessoes - Histórico de sessões
caixas.get('/sessoes', requirePermission('financeiro', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { caixa_id, data_inicio, data_fim, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      s.*,
      c.nome as caixa_nome,
      u.nome as operador_nome
    FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    JOIN usuarios u ON s.usuario_id = u.id
    WHERE c.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (caixa_id) {
    query += ` AND s.caixa_id = ?`;
    params.push(caixa_id);
  }

  if (data_inicio) {
    query += ` AND DATE(s.data_abertura) >= ?`;
    params.push(data_inicio);
  }

  if (data_fim) {
    query += ` AND DATE(s.data_abertura) <= ?`;
    params.push(data_fim);
  }

  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY s.data_abertura DESC LIMIT ? OFFSET ?`;
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

// GET /caixas/sessoes/:id - Detalhes da sessão
caixas.get('/sessoes/:id', requirePermission('financeiro', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const sessao = await c.env.DB.prepare(`
    SELECT 
      s.*,
      c.nome as caixa_nome,
      u.nome as operador_nome
    FROM caixas_sessoes s
    JOIN caixas c ON s.caixa_id = c.id
    JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.id = ? AND c.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!sessao) {
    return c.json({ success: false, error: 'Sessão não encontrada' }, 404);
  }

  const movimentacoes = await c.env.DB.prepare(`
    SELECT m.*, u.nome as usuario_nome
    FROM caixas_movimentacoes m
    LEFT JOIN usuarios u ON m.usuario_id = u.id
    WHERE m.sessao_id = ?
    ORDER BY m.created_at
  `).bind(id).all();

  const resumo = await c.env.DB.prepare(`
    SELECT 
      forma_pagamento,
      SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'SAIDA' THEN valor ELSE 0 END) as saidas,
      COUNT(*) as quantidade
    FROM caixas_movimentacoes
    WHERE sessao_id = ?
    GROUP BY forma_pagamento
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...sessao,
      movimentacoes: movimentacoes.results,
      resumo: resumo.results
    }
  });
});

export default caixas;
