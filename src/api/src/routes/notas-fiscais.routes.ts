// ============================================
// PLANAC ERP - Rotas de Notas Fiscais (NF-e)
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const notasFiscais = new Hono<{ Bindings: Bindings; Variables: Variables }>();

notasFiscais.use('/*', requireAuth());

// Schemas
const nfeSchema = z.object({
  filial_id: z.string().uuid(),
  pedido_id: z.string().uuid().optional(),
  cliente_id: z.string().uuid(),
  tipo: z.enum(['NFE', 'NFCE', 'NFSE']).default('NFE'),
  finalidade: z.enum(['NORMAL', 'COMPLEMENTAR', 'AJUSTE', 'DEVOLUCAO']).default('NORMAL'),
  natureza_operacao: z.string().max(60),
  tipo_operacao: z.enum(['ENTRADA', 'SAIDA']).default('SAIDA'),
  consumidor_final: z.boolean().default(false),
  presenca_comprador: z.enum(['NAO_SE_APLICA', 'PRESENCIAL', 'INTERNET', 'TELEATENDIMENTO', 'DELIVERY', 'OUTROS']).default('NAO_SE_APLICA'),
  data_emissao: z.string(),
  data_saida: z.string().optional(),
  hora_saida: z.string().optional(),
  // Endereço entrega (se diferente)
  endereco_entrega_cep: z.string().optional(),
  endereco_entrega_logradouro: z.string().optional(),
  endereco_entrega_numero: z.string().optional(),
  endereco_entrega_complemento: z.string().optional(),
  endereco_entrega_bairro: z.string().optional(),
  endereco_entrega_cidade: z.string().optional(),
  endereco_entrega_uf: z.string().optional(),
  // Transporte
  modalidade_frete: z.enum(['CIF', 'FOB', 'TERCEIROS', 'PROPRIO_REMETENTE', 'PROPRIO_DESTINATARIO', 'SEM_FRETE']).default('SEM_FRETE'),
  transportadora_id: z.string().uuid().optional(),
  veiculo_placa: z.string().optional(),
  veiculo_uf: z.string().optional(),
  // Valores
  valor_produtos: z.number().min(0),
  valor_frete: z.number().min(0).default(0),
  valor_seguro: z.number().min(0).default(0),
  valor_desconto: z.number().min(0).default(0),
  valor_outras_despesas: z.number().min(0).default(0),
  // Informações adicionais
  info_complementar: z.string().optional(),
  info_fisco: z.string().optional(),
  observacao: z.string().optional(),
  // Itens
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    pedido_item_id: z.string().uuid().optional(),
    cfop: z.string().length(4),
    quantidade: z.number().min(0.001),
    valor_unitario: z.number().min(0),
    valor_desconto: z.number().min(0).default(0),
    // Impostos
    ncm: z.string().max(8),
    cest: z.string().max(7).optional(),
    origem: z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '8']).default('0'),
    // ICMS
    cst_icms: z.string().max(3),
    aliquota_icms: z.number().min(0).default(0),
    base_icms: z.number().min(0).default(0),
    valor_icms: z.number().min(0).default(0),
    // ICMS ST
    aliquota_icms_st: z.number().min(0).default(0),
    base_icms_st: z.number().min(0).default(0),
    valor_icms_st: z.number().min(0).default(0),
    mva_st: z.number().min(0).default(0),
    // PIS
    cst_pis: z.string().max(2),
    aliquota_pis: z.number().min(0).default(0),
    base_pis: z.number().min(0).default(0),
    valor_pis: z.number().min(0).default(0),
    // COFINS
    cst_cofins: z.string().max(2),
    aliquota_cofins: z.number().min(0).default(0),
    base_cofins: z.number().min(0).default(0),
    valor_cofins: z.number().min(0).default(0),
    // IPI
    cst_ipi: z.string().max(2).optional(),
    aliquota_ipi: z.number().min(0).default(0),
    base_ipi: z.number().min(0).default(0),
    valor_ipi: z.number().min(0).default(0),
    // Info adicional
    info_adicional: z.string().optional()
  })),
  // Pagamentos
  pagamentos: z.array(z.object({
    forma_pagamento_id: z.string().uuid(),
    meio_pagamento: z.enum(['DINHEIRO', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CREDITO_LOJA', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'VALE_PRESENTE', 'VALE_COMBUSTIVEL', 'BOLETO', 'PIX', 'OUTROS']),
    valor: z.number().min(0.01),
    data_vencimento: z.string().optional(),
    cnpj_credenciadora: z.string().optional(),
    bandeira_cartao: z.string().optional(),
    autorizacao_cartao: z.string().optional()
  })).optional()
});

// GET /fiscal/notas - Listar
notasFiscais.get('/', requirePermission('fiscal', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { 
    page = '1', limit = '20', tipo, status, cliente_id, 
    data_inicio, data_fim, filial_id, numero
  } = c.req.query();

  let query = `
    SELECT nf.*, 
           c.razao_social as cliente_nome, c.cpf_cnpj as cliente_documento,
           f.nome as filial_nome,
           p.numero as pedido_numero
    FROM notas_fiscais nf
    JOIN clientes c ON nf.cliente_id = c.id
    JOIN filiais f ON nf.filial_id = f.id
    LEFT JOIN pedidos p ON nf.pedido_id = p.id
    WHERE nf.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (tipo) {
    query += ` AND nf.tipo = ?`;
    params.push(tipo);
  }

  if (status) {
    query += ` AND nf.status = ?`;
    params.push(status);
  }

  if (cliente_id) {
    query += ` AND nf.cliente_id = ?`;
    params.push(cliente_id);
  }

  if (data_inicio) {
    query += ` AND nf.data_emissao >= ?`;
    params.push(data_inicio);
  }

  if (data_fim) {
    query += ` AND nf.data_emissao <= ?`;
    params.push(data_fim);
  }

  if (filial_id) {
    query += ` AND nf.filial_id = ?`;
    params.push(filial_id);
  }

  if (numero) {
    query += ` AND nf.numero = ?`;
    params.push(numero);
  }

  // Contagem
  const countQuery = query.replace(/SELECT nf\.\*, [\s\S]*? FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  // Paginação
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  query += ` ORDER BY nf.created_at DESC LIMIT ? OFFSET ?`;
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

// GET /fiscal/notas/resumo - Dashboard
notasFiscais.get('/resumo', requirePermission('fiscal', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  // Totais do mês
  const totaisMes = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_notas,
      SUM(CASE WHEN status = 'AUTORIZADA' THEN 1 ELSE 0 END) as autorizadas,
      SUM(CASE WHEN status = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas,
      SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
      SUM(CASE WHEN status = 'REJEITADA' THEN 1 ELSE 0 END) as rejeitadas,
      SUM(CASE WHEN status = 'AUTORIZADA' THEN valor_total ELSE 0 END) as valor_total
    FROM notas_fiscais 
    WHERE empresa_id = ? AND strftime('%Y-%m', data_emissao) = strftime('%Y-%m', 'now')
  `).bind(usuario.empresa_id).first();

  // Por tipo
  const porTipo = await c.env.DB.prepare(`
    SELECT tipo, COUNT(*) as quantidade, SUM(valor_total) as valor
    FROM notas_fiscais
    WHERE empresa_id = ? AND strftime('%Y-%m', data_emissao) = strftime('%Y-%m', 'now')
    GROUP BY tipo
  `).bind(usuario.empresa_id).all();

  // Últimas notas
  const ultimasNotas = await c.env.DB.prepare(`
    SELECT nf.*, c.razao_social as cliente_nome
    FROM notas_fiscais nf
    JOIN clientes c ON nf.cliente_id = c.id
    WHERE nf.empresa_id = ?
    ORDER BY nf.created_at DESC
    LIMIT 10
  `).bind(usuario.empresa_id).all();

  return c.json({
    success: true,
    data: {
      totais_mes: totaisMes,
      por_tipo: porTipo.results,
      ultimas_notas: ultimasNotas.results
    }
  });
});

// GET /fiscal/notas/:id - Buscar
notasFiscais.get('/:id', requirePermission('fiscal', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const nota = await c.env.DB.prepare(`
    SELECT nf.*, 
           c.razao_social as cliente_nome, c.cpf_cnpj as cliente_documento,
           c.inscricao_estadual as cliente_ie, c.email as cliente_email,
           f.nome as filial_nome, f.cnpj as filial_cnpj,
           p.numero as pedido_numero,
           t.razao_social as transportadora_nome
    FROM notas_fiscais nf
    JOIN clientes c ON nf.cliente_id = c.id
    JOIN filiais f ON nf.filial_id = f.id
    LEFT JOIN pedidos p ON nf.pedido_id = p.id
    LEFT JOIN transportadoras t ON nf.transportadora_id = t.id
    WHERE nf.id = ? AND nf.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!nota) {
    return c.json({ success: false, error: 'Nota fiscal não encontrada' }, 404);
  }

  // Itens
  const itens = await c.env.DB.prepare(`
    SELECT ni.*, p.codigo as produto_codigo, p.descricao as produto_descricao, p.unidade
    FROM nfe_itens ni
    JOIN produtos p ON ni.produto_id = p.id
    WHERE ni.nfe_id = ?
    ORDER BY ni.numero_item
  `).bind(id).all();

  // Pagamentos
  const pagamentos = await c.env.DB.prepare(`
    SELECT np.*, fp.nome as forma_nome
    FROM nfe_pagamentos np
    JOIN formas_pagamento fp ON np.forma_pagamento_id = fp.id
    WHERE np.nfe_id = ?
  `).bind(id).all();

  // Duplicatas
  const duplicatas = await c.env.DB.prepare(`
    SELECT * FROM nfe_duplicatas WHERE nfe_id = ? ORDER BY numero
  `).bind(id).all();

  // Volumes
  const volumes = await c.env.DB.prepare(`
    SELECT * FROM nfe_volumes WHERE nfe_id = ?
  `).bind(id).all();

  // Eventos
  const eventos = await c.env.DB.prepare(`
    SELECT * FROM nfe_eventos WHERE nfe_id = ? ORDER BY created_at DESC
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...nota,
      itens: itens.results,
      pagamentos: pagamentos.results,
      duplicatas: duplicatas.results,
      volumes: volumes.results,
      eventos: eventos.results
    }
  });
});

// POST /fiscal/notas - Criar nota (rascunho)
notasFiscais.post('/', requirePermission('fiscal', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = nfeSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const id = crypto.randomUUID();

  // Calcular totais
  let valorProdutos = 0;
  let valorICMS = 0;
  let valorICMSST = 0;
  let valorPIS = 0;
  let valorCOFINS = 0;
  let valorIPI = 0;
  let valorDesconto = 0;

  for (const item of data.itens) {
    valorProdutos += item.quantidade * item.valor_unitario;
    valorICMS += item.valor_icms || 0;
    valorICMSST += item.valor_icms_st || 0;
    valorPIS += item.valor_pis || 0;
    valorCOFINS += item.valor_cofins || 0;
    valorIPI += item.valor_ipi || 0;
    valorDesconto += item.valor_desconto || 0;
  }

  const valorTotal = valorProdutos + (data.valor_frete || 0) + (data.valor_seguro || 0) 
                   + (data.valor_outras_despesas || 0) + valorICMSST + valorIPI 
                   - valorDesconto - (data.valor_desconto || 0);

  await c.env.DB.prepare(`
    INSERT INTO notas_fiscais (
      id, empresa_id, filial_id, pedido_id, cliente_id, tipo, finalidade,
      natureza_operacao, tipo_operacao, consumidor_final, presenca_comprador,
      data_emissao, data_saida, hora_saida,
      endereco_entrega_cep, endereco_entrega_logradouro, endereco_entrega_numero,
      endereco_entrega_complemento, endereco_entrega_bairro, endereco_entrega_cidade,
      endereco_entrega_uf, modalidade_frete, transportadora_id, veiculo_placa, veiculo_uf,
      valor_produtos, valor_frete, valor_seguro, valor_desconto, valor_outras_despesas,
      valor_icms, valor_icms_st, valor_pis, valor_cofins, valor_ipi, valor_total,
      info_complementar, info_fisco, observacao, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RASCUNHO')
  `).bind(
    id, usuario.empresa_id, data.filial_id, data.pedido_id || null, data.cliente_id,
    data.tipo, data.finalidade, data.natureza_operacao, data.tipo_operacao,
    data.consumidor_final ? 1 : 0, data.presenca_comprador, data.data_emissao,
    data.data_saida || null, data.hora_saida || null,
    data.endereco_entrega_cep || null, data.endereco_entrega_logradouro || null,
    data.endereco_entrega_numero || null, data.endereco_entrega_complemento || null,
    data.endereco_entrega_bairro || null, data.endereco_entrega_cidade || null,
    data.endereco_entrega_uf || null, data.modalidade_frete, data.transportadora_id || null,
    data.veiculo_placa || null, data.veiculo_uf || null,
    valorProdutos, data.valor_frete || 0, data.valor_seguro || 0, valorDesconto + (data.valor_desconto || 0),
    data.valor_outras_despesas || 0, valorICMS, valorICMSST, valorPIS, valorCOFINS, valorIPI, valorTotal,
    data.info_complementar || null, data.info_fisco || null, data.observacao || null
  ).run();

  // Inserir itens
  let numeroItem = 1;
  for (const item of data.itens) {
    const itemId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO nfe_itens (
        id, nfe_id, produto_id, pedido_item_id, numero_item, cfop, quantidade,
        valor_unitario, valor_total, valor_desconto, ncm, cest, origem,
        cst_icms, aliquota_icms, base_icms, valor_icms,
        aliquota_icms_st, base_icms_st, valor_icms_st, mva_st,
        cst_pis, aliquota_pis, base_pis, valor_pis,
        cst_cofins, aliquota_cofins, base_cofins, valor_cofins,
        cst_ipi, aliquota_ipi, base_ipi, valor_ipi, info_adicional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      itemId, id, item.produto_id, item.pedido_item_id || null, numeroItem++, item.cfop,
      item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario, item.valor_desconto || 0,
      item.ncm, item.cest || null, item.origem,
      item.cst_icms, item.aliquota_icms || 0, item.base_icms || 0, item.valor_icms || 0,
      item.aliquota_icms_st || 0, item.base_icms_st || 0, item.valor_icms_st || 0, item.mva_st || 0,
      item.cst_pis, item.aliquota_pis || 0, item.base_pis || 0, item.valor_pis || 0,
      item.cst_cofins, item.aliquota_cofins || 0, item.base_cofins || 0, item.valor_cofins || 0,
      item.cst_ipi || null, item.aliquota_ipi || 0, item.base_ipi || 0, item.valor_ipi || 0,
      item.info_adicional || null
    ).run();
  }

  // Inserir pagamentos
  if (data.pagamentos && data.pagamentos.length > 0) {
    for (const pag of data.pagamentos) {
      const pagId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO nfe_pagamentos (
          id, nfe_id, forma_pagamento_id, meio_pagamento, valor, data_vencimento,
          cnpj_credenciadora, bandeira_cartao, autorizacao_cartao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        pagId, id, pag.forma_pagamento_id, pag.meio_pagamento, pag.valor,
        pag.data_vencimento || null, pag.cnpj_credenciadora || null,
        pag.bandeira_cartao || null, pag.autorizacao_cartao || null
      ).run();
    }
  }

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'notas_fiscais',
    entidade_id: id,
    dados_novos: { tipo: data.tipo, cliente_id: data.cliente_id, valor_total: valorTotal }
  });

  return c.json({ success: true, data: { id, valor_total: valorTotal } }, 201);
});

// POST /fiscal/notas/:id/transmitir - Transmitir para SEFAZ
notasFiscais.post('/:id/transmitir', requirePermission('fiscal', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const nota = await c.env.DB.prepare(`
    SELECT * FROM notas_fiscais WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!nota) {
    return c.json({ success: false, error: 'Nota fiscal não encontrada' }, 404);
  }

  if (nota.status !== 'RASCUNHO' && nota.status !== 'REJEITADA') {
    return c.json({ success: false, error: 'Nota já foi transmitida ou está em processamento' }, 400);
  }

  // Atualizar status para pendente
  await c.env.DB.prepare(`
    UPDATE notas_fiscais SET status = 'PENDENTE', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();

  // TODO: Integração com Nuvem Fiscal
  // Por enquanto, simular transmissão bem-sucedida
  const numero = await gerarNumeroNFe(c.env.DB, usuario.empresa_id, nota.filial_id, nota.tipo);
  const chaveAcesso = gerarChaveAcesso(nota);

  await c.env.DB.prepare(`
    UPDATE notas_fiscais SET 
      status = 'AUTORIZADA',
      numero = ?,
      serie = '1',
      chave_acesso = ?,
      protocolo_autorizacao = ?,
      data_autorizacao = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(numero, chaveAcesso, `${Date.now()}`, id).run();

  // Registrar evento
  const eventoId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO nfe_eventos (id, nfe_id, tipo, descricao, protocolo)
    VALUES (?, ?, 'AUTORIZACAO', 'Nota fiscal autorizada', ?)
  `).bind(eventoId, id, `${Date.now()}`).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'TRANSMITIR',
    entidade: 'notas_fiscais',
    entidade_id: id,
    dados_novos: { status: 'AUTORIZADA', numero, chave_acesso: chaveAcesso }
  });

  return c.json({ 
    success: true, 
    data: { numero, chave_acesso: chaveAcesso, status: 'AUTORIZADA' } 
  });
});

// POST /fiscal/notas/:id/cancelar - Cancelar NF-e
notasFiscais.post('/:id/cancelar', requirePermission('fiscal', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { justificativa } = await c.req.json();

  if (!justificativa || justificativa.length < 15) {
    return c.json({ success: false, error: 'Justificativa deve ter no mínimo 15 caracteres' }, 400);
  }

  const nota = await c.env.DB.prepare(`
    SELECT * FROM notas_fiscais WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!nota) {
    return c.json({ success: false, error: 'Nota fiscal não encontrada' }, 404);
  }

  if (nota.status !== 'AUTORIZADA') {
    return c.json({ success: false, error: 'Apenas notas autorizadas podem ser canceladas' }, 400);
  }

  // TODO: Integração com Nuvem Fiscal para cancelamento
  
  await c.env.DB.prepare(`
    UPDATE notas_fiscais SET 
      status = 'CANCELADA',
      protocolo_cancelamento = ?,
      data_cancelamento = CURRENT_TIMESTAMP,
      justificativa_cancelamento = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(`${Date.now()}`, justificativa, id).run();

  // Registrar evento
  const eventoId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO nfe_eventos (id, nfe_id, tipo, descricao, protocolo, justificativa)
    VALUES (?, ?, 'CANCELAMENTO', 'Nota fiscal cancelada', ?, ?)
  `).bind(eventoId, id, `${Date.now()}`, justificativa).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CANCELAR',
    entidade: 'notas_fiscais',
    entidade_id: id,
    dados_anteriores: { status: nota.status },
    dados_novos: { status: 'CANCELADA', justificativa }
  });

  return c.json({ success: true, message: 'Nota fiscal cancelada' });
});

// POST /fiscal/notas/:id/carta-correcao - Carta de Correção
notasFiscais.post('/:id/carta-correcao', requirePermission('fiscal', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const { correcao } = await c.req.json();

  if (!correcao || correcao.length < 15 || correcao.length > 1000) {
    return c.json({ success: false, error: 'Correção deve ter entre 15 e 1000 caracteres' }, 400);
  }

  const nota = await c.env.DB.prepare(`
    SELECT * FROM notas_fiscais WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first<any>();

  if (!nota) {
    return c.json({ success: false, error: 'Nota fiscal não encontrada' }, 404);
  }

  if (nota.status !== 'AUTORIZADA') {
    return c.json({ success: false, error: 'Apenas notas autorizadas podem receber carta de correção' }, 400);
  }

  // Contar cartas de correção existentes
  const cartasExistentes = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM nfe_eventos WHERE nfe_id = ? AND tipo = 'CARTA_CORRECAO'
  `).bind(id).first<{ total: number }>();

  const sequencia = (cartasExistentes?.total || 0) + 1;

  // TODO: Integração com Nuvem Fiscal

  // Registrar evento
  const eventoId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO nfe_eventos (id, nfe_id, tipo, descricao, protocolo, sequencia, correcao)
    VALUES (?, ?, 'CARTA_CORRECAO', 'Carta de correção registrada', ?, ?, ?)
  `).bind(eventoId, id, `${Date.now()}`, sequencia, correcao).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CARTA_CORRECAO',
    entidade: 'notas_fiscais',
    entidade_id: id,
    dados_novos: { sequencia, correcao }
  });

  return c.json({ success: true, data: { sequencia }, message: 'Carta de correção registrada' });
});

// GET /fiscal/notas/:id/danfe - Gerar DANFE (PDF)
notasFiscais.get('/:id/danfe', requirePermission('fiscal', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const nota = await c.env.DB.prepare(`
    SELECT * FROM notas_fiscais WHERE id = ? AND empresa_id = ? AND status = 'AUTORIZADA'
  `).bind(id, usuario.empresa_id).first();

  if (!nota) {
    return c.json({ success: false, error: 'Nota não encontrada ou não autorizada' }, 404);
  }

  // TODO: Integração com Nuvem Fiscal para gerar PDF do DANFE
  // Por enquanto, retorna URL simulada
  return c.json({ 
    success: true, 
    data: { 
      url: `https://api.nuvemfiscal.com.br/nfe/${(nota as any).chave_acesso}/pdf` 
    } 
  });
});

// GET /fiscal/notas/:id/xml - Baixar XML
notasFiscais.get('/:id/xml', requirePermission('fiscal', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const nota = await c.env.DB.prepare(`
    SELECT * FROM notas_fiscais WHERE id = ? AND empresa_id = ? AND status = 'AUTORIZADA'
  `).bind(id, usuario.empresa_id).first();

  if (!nota) {
    return c.json({ success: false, error: 'Nota não encontrada ou não autorizada' }, 404);
  }

  // TODO: Retornar XML armazenado ou buscar da Nuvem Fiscal
  return c.json({ 
    success: true, 
    data: { 
      url: `https://api.nuvemfiscal.com.br/nfe/${(nota as any).chave_acesso}/xml` 
    } 
  });
});

// Funções auxiliares
async function gerarNumeroNFe(db: any, empresaId: string, filialId: string, tipo: string): Promise<string> {
  const resultado = await db.prepare(`
    SELECT MAX(CAST(numero AS INTEGER)) as ultimo FROM notas_fiscais 
    WHERE empresa_id = ? AND filial_id = ? AND tipo = ?
  `).bind(empresaId, filialId, tipo).first<{ ultimo: number }>();
  
  return ((resultado?.ultimo || 0) + 1).toString();
}

function gerarChaveAcesso(nota: any): string {
  // Simplificação - em produção usar algoritmo correto
  const parte1 = '41'; // UF PR
  const parte2 = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7); // AAMM
  const parte3 = '00000000000000'.slice(0, 14); // CNPJ
  const parte4 = '55'; // Modelo
  const parte5 = '001'; // Série
  const parte6 = '000000001'; // Número
  const parte7 = '1'; // Forma emissão
  const parte8 = '00000001'; // Código numérico
  const digitoVerificador = '0'; // DV
  
  return `${parte1}${parte2}${parte3}${parte4}${parte5}${parte6}${parte7}${parte8}${digitoVerificador}`;
}

export default notasFiscais;
