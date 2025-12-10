// ============================================
// PLANAC ERP - Rotas de Veículos
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { requireAuth, requirePermission } from '../middleware/auth';
import { registrarAuditoria } from '../utils/auditoria';

const veiculos = new Hono<{ Bindings: Bindings; Variables: Variables }>();

veiculos.use('/*', requireAuth());

// Schemas
const veiculoSchema = z.object({
  placa: z.string().min(7).max(8),
  renavam: z.string().optional(),
  chassi: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  ano_fabricacao: z.number().int().optional(),
  ano_modelo: z.number().int().optional(),
  cor: z.string().optional(),
  tipo: z.enum(['PROPRIO', 'TERCEIRO', 'AGREGADO', 'LOCADO']).default('PROPRIO'),
  categoria: z.enum(['CARRO', 'MOTO', 'VAN', 'CAMINHAO', 'CARRETA']).default('CAMINHAO'),
  capacidade_kg: z.number().optional(),
  capacidade_m3: z.number().optional(),
  km_atual: z.number().int().optional(),
  data_aquisicao: z.string().optional(),
  valor_aquisicao: z.number().optional(),
  vencimento_ipva: z.string().optional(),
  vencimento_licenciamento: z.string().optional(),
  vencimento_seguro: z.string().optional(),
  transportadora_id: z.string().uuid().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true)
});

const manutencaoSchema = z.object({
  tipo: z.enum(['PREVENTIVA', 'CORRETIVA', 'REVISAO', 'TROCA_OLEO', 'PNEUS', 'OUTROS']),
  descricao: z.string(),
  data: z.string(),
  km: z.number().int().optional(),
  valor: z.number().optional(),
  fornecedor: z.string().optional(),
  proxima_manutencao_data: z.string().optional(),
  proxima_manutencao_km: z.number().int().optional(),
  observacoes: z.string().optional()
});

const abastecimentoSchema = z.object({
  data: z.string(),
  km: z.number().int(),
  combustivel: z.enum(['GASOLINA', 'ETANOL', 'DIESEL', 'GNV']),
  litros: z.number().positive(),
  valor_litro: z.number().positive(),
  valor_total: z.number().positive(),
  posto: z.string().optional(),
  motorista_id: z.string().uuid().optional()
});

// GET /veiculos - Listar
veiculos.get('/', requirePermission('logistica', 'listar'), async (c) => {
  const usuario = c.get('usuario');
  const { busca, tipo, categoria, ativo, page = '1', limit = '20' } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT 
      v.*,
      t.razao_social as transportadora_nome,
      m.nome as motorista_atual_nome,
      (SELECT COUNT(*) FROM entregas e WHERE e.veiculo_id = v.id) as total_entregas
    FROM veiculos v
    LEFT JOIN transportadoras t ON v.transportadora_id = t.id
    LEFT JOIN veiculos_motoristas vm ON v.id = vm.veiculo_id AND vm.ativo = 1
    LEFT JOIN motoristas m ON vm.motorista_id = m.id
    WHERE v.empresa_id = ?
  `;
  const params: any[] = [usuario.empresa_id];

  if (busca) {
    query += ` AND (v.placa LIKE ? OR v.modelo LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`);
  }

  if (tipo) {
    query += ` AND v.tipo = ?`;
    params.push(tipo);
  }

  if (categoria) {
    query += ` AND v.categoria = ?`;
    params.push(categoria);
  }

  if (ativo !== undefined) {
    query += ` AND v.ativo = ?`;
    params.push(ativo === 'true' ? 1 : 0);
  }

  // Count total
  const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
  const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ` ORDER BY v.placa LIMIT ? OFFSET ?`;
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

// GET /veiculos/alertas - Veículos com documentos vencendo
veiculos.get('/alertas', requirePermission('logistica', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  const diasAlerta = 30;

  const result = await c.env.DB.prepare(`
    SELECT 
      v.*,
      CASE 
        WHEN DATE(v.vencimento_ipva) <= DATE('now', '+' || ? || ' days') THEN 'IPVA'
        WHEN DATE(v.vencimento_licenciamento) <= DATE('now', '+' || ? || ' days') THEN 'LICENCIAMENTO'
        WHEN DATE(v.vencimento_seguro) <= DATE('now', '+' || ? || ' days') THEN 'SEGURO'
      END as documento_alerta,
      CASE 
        WHEN DATE(v.vencimento_ipva) <= DATE('now', '+' || ? || ' days') THEN v.vencimento_ipva
        WHEN DATE(v.vencimento_licenciamento) <= DATE('now', '+' || ? || ' days') THEN v.vencimento_licenciamento
        WHEN DATE(v.vencimento_seguro) <= DATE('now', '+' || ? || ' days') THEN v.vencimento_seguro
      END as data_vencimento
    FROM veiculos v
    WHERE v.empresa_id = ? 
      AND v.ativo = 1
      AND (
        DATE(v.vencimento_ipva) <= DATE('now', '+' || ? || ' days')
        OR DATE(v.vencimento_licenciamento) <= DATE('now', '+' || ? || ' days')
        OR DATE(v.vencimento_seguro) <= DATE('now', '+' || ? || ' days')
      )
    ORDER BY data_vencimento
  `).bind(
    diasAlerta, diasAlerta, diasAlerta, diasAlerta, diasAlerta, diasAlerta,
    usuario.empresa_id, diasAlerta, diasAlerta, diasAlerta
  ).all();

  // Manutenções pendentes
  const manutencoesPendentes = await c.env.DB.prepare(`
    SELECT 
      v.id,
      v.placa,
      v.modelo,
      vm.proxima_manutencao_data,
      vm.proxima_manutencao_km,
      v.km_atual
    FROM veiculos v
    JOIN veiculos_manutencoes vm ON v.id = vm.veiculo_id
    WHERE v.empresa_id = ? 
      AND v.ativo = 1
      AND (
        DATE(vm.proxima_manutencao_data) <= DATE('now', '+' || ? || ' days')
        OR (vm.proxima_manutencao_km IS NOT NULL AND v.km_atual >= vm.proxima_manutencao_km - 1000)
      )
    ORDER BY vm.proxima_manutencao_data
  `).bind(usuario.empresa_id, diasAlerta).all();

  return c.json({
    success: true,
    data: {
      documentos_vencendo: result.results,
      manutencoes_pendentes: manutencoesPendentes.results
    }
  });
});

// GET /veiculos/disponiveis - Disponíveis para entrega
veiculos.get('/disponiveis', requirePermission('logistica', 'listar'), async (c) => {
  const usuario = c.get('usuario');

  const result = await c.env.DB.prepare(`
    SELECT 
      v.*,
      m.nome as motorista_atual_nome,
      m.id as motorista_atual_id
    FROM veiculos v
    LEFT JOIN veiculos_motoristas vm ON v.id = vm.veiculo_id AND vm.ativo = 1
    LEFT JOIN motoristas m ON vm.motorista_id = m.id
    WHERE v.empresa_id = ? 
      AND v.ativo = 1
      AND v.id NOT IN (
        SELECT DISTINCT veiculo_id FROM entregas 
        WHERE empresa_id = ? 
          AND DATE(data_entrega) = DATE('now')
          AND status IN ('EM_TRANSITO', 'EM_SEPARACAO')
          AND veiculo_id IS NOT NULL
      )
    ORDER BY v.placa
  `).bind(usuario.empresa_id, usuario.empresa_id).all();

  return c.json({ success: true, data: result.results });
});

// GET /veiculos/:id - Buscar
veiculos.get('/:id', requirePermission('logistica', 'visualizar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const veiculo = await c.env.DB.prepare(`
    SELECT 
      v.*,
      t.razao_social as transportadora_nome
    FROM veiculos v
    LEFT JOIN transportadoras t ON v.transportadora_id = t.id
    WHERE v.id = ? AND v.empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!veiculo) {
    return c.json({ success: false, error: 'Veículo não encontrado' }, 404);
  }

  // Motorista atual
  const motoristaAtual = await c.env.DB.prepare(`
    SELECT m.* FROM motoristas m
    JOIN veiculos_motoristas vm ON m.id = vm.motorista_id
    WHERE vm.veiculo_id = ? AND vm.ativo = 1
  `).bind(id).first();

  // Histórico de motoristas
  const historicoMotoristas = await c.env.DB.prepare(`
    SELECT 
      m.nome,
      m.cpf,
      vm.data_inicio,
      vm.data_fim,
      vm.ativo
    FROM motoristas m
    JOIN veiculos_motoristas vm ON m.id = vm.motorista_id
    WHERE vm.veiculo_id = ?
    ORDER BY vm.data_inicio DESC
    LIMIT 10
  `).bind(id).all();

  // Manutenções
  const manutencoes = await c.env.DB.prepare(`
    SELECT * FROM veiculos_manutencoes
    WHERE veiculo_id = ?
    ORDER BY data DESC
    LIMIT 10
  `).bind(id).all();

  // Abastecimentos
  const abastecimentos = await c.env.DB.prepare(`
    SELECT va.*, m.nome as motorista_nome
    FROM veiculos_abastecimentos va
    LEFT JOIN motoristas m ON va.motorista_id = m.id
    WHERE va.veiculo_id = ?
    ORDER BY va.data DESC
    LIMIT 10
  `).bind(id).all();

  // Estatísticas
  const estatisticas = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_entregas,
      SUM(CASE WHEN status = 'ENTREGUE' THEN 1 ELSE 0 END) as entregas_sucesso
    FROM entregas
    WHERE veiculo_id = ?
  `).bind(id).first();

  // Consumo médio
  const consumo = await c.env.DB.prepare(`
    SELECT 
      AVG(km / litros) as km_por_litro,
      SUM(valor_total) as custo_total_combustivel,
      SUM(litros) as litros_total
    FROM veiculos_abastecimentos
    WHERE veiculo_id = ?
  `).bind(id).first();

  return c.json({
    success: true,
    data: {
      ...veiculo,
      motorista_atual: motoristaAtual,
      historico_motoristas: historicoMotoristas.results,
      manutencoes: manutencoes.results,
      abastecimentos: abastecimentos.results,
      estatisticas,
      consumo
    }
  });
});

// POST /veiculos - Criar
veiculos.post('/', requirePermission('logistica', 'criar'), async (c) => {
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const validation = veiculoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar placa duplicada
  const existe = await c.env.DB.prepare(`
    SELECT id FROM veiculos WHERE empresa_id = ? AND placa = ?
  `).bind(usuario.empresa_id, data.placa.toUpperCase()).first();

  if (existe) {
    return c.json({ success: false, error: 'Placa já cadastrada' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO veiculos (
      id, empresa_id, placa, renavam, chassi, marca, modelo,
      ano_fabricacao, ano_modelo, cor, tipo, categoria,
      capacidade_kg, capacidade_m3, km_atual, data_aquisicao, valor_aquisicao,
      vencimento_ipva, vencimento_licenciamento, vencimento_seguro,
      transportadora_id, observacoes, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, usuario.empresa_id, data.placa.toUpperCase(), data.renavam || null,
    data.chassi || null, data.marca || null, data.modelo || null,
    data.ano_fabricacao || null, data.ano_modelo || null, data.cor || null,
    data.tipo, data.categoria, data.capacidade_kg || null, data.capacidade_m3 || null,
    data.km_atual || 0, data.data_aquisicao || null, data.valor_aquisicao || null,
    data.vencimento_ipva || null, data.vencimento_licenciamento || null, data.vencimento_seguro || null,
    data.transportadora_id || null, data.observacoes || null, data.ativo ? 1 : 0
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'CRIAR',
    entidade: 'veiculos',
    entidade_id: id,
    dados_novos: data
  });

  return c.json({ success: true, data: { id } }, 201);
});

// PUT /veiculos/:id - Atualizar
veiculos.put('/:id', requirePermission('logistica', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const veiculoAtual = await c.env.DB.prepare(`
    SELECT * FROM veiculos WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!veiculoAtual) {
    return c.json({ success: false, error: 'Veículo não encontrado' }, 404);
  }

  const validation = veiculoSchema.partial().safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;

  // Verificar placa duplicada
  if (data.placa) {
    const existe = await c.env.DB.prepare(`
      SELECT id FROM veiculos WHERE empresa_id = ? AND placa = ? AND id != ?
    `).bind(usuario.empresa_id, data.placa.toUpperCase(), id).first();

    if (existe) {
      return c.json({ success: false, error: 'Placa já cadastrada para outro veículo' }, 400);
    }
  }

  await c.env.DB.prepare(`
    UPDATE veiculos SET
      placa = COALESCE(?, placa),
      renavam = COALESCE(?, renavam),
      chassi = COALESCE(?, chassi),
      marca = COALESCE(?, marca),
      modelo = COALESCE(?, modelo),
      ano_fabricacao = COALESCE(?, ano_fabricacao),
      ano_modelo = COALESCE(?, ano_modelo),
      cor = COALESCE(?, cor),
      tipo = COALESCE(?, tipo),
      categoria = COALESCE(?, categoria),
      capacidade_kg = COALESCE(?, capacidade_kg),
      capacidade_m3 = COALESCE(?, capacidade_m3),
      km_atual = COALESCE(?, km_atual),
      data_aquisicao = COALESCE(?, data_aquisicao),
      valor_aquisicao = COALESCE(?, valor_aquisicao),
      vencimento_ipva = COALESCE(?, vencimento_ipva),
      vencimento_licenciamento = COALESCE(?, vencimento_licenciamento),
      vencimento_seguro = COALESCE(?, vencimento_seguro),
      transportadora_id = COALESCE(?, transportadora_id),
      observacoes = COALESCE(?, observacoes),
      ativo = COALESCE(?, ativo),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(
    data.placa?.toUpperCase(), data.renavam, data.chassi, data.marca, data.modelo,
    data.ano_fabricacao, data.ano_modelo, data.cor, data.tipo, data.categoria,
    data.capacidade_kg, data.capacidade_m3, data.km_atual, data.data_aquisicao,
    data.valor_aquisicao, data.vencimento_ipva, data.vencimento_licenciamento, data.vencimento_seguro,
    data.transportadora_id, data.observacoes, data.ativo !== undefined ? (data.ativo ? 1 : 0) : null,
    id, usuario.empresa_id
  ).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'ATUALIZAR',
    entidade: 'veiculos',
    entidade_id: id,
    dados_anteriores: veiculoAtual,
    dados_novos: data
  });

  return c.json({ success: true, message: 'Veículo atualizado' });
});

// POST /veiculos/:id/manutencao - Registrar manutenção
veiculos.post('/:id/manutencao', requirePermission('logistica', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const veiculo = await c.env.DB.prepare(`
    SELECT id FROM veiculos WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!veiculo) {
    return c.json({ success: false, error: 'Veículo não encontrado' }, 404);
  }

  const validation = manutencaoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const manutencaoId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO veiculos_manutencoes (
      id, veiculo_id, tipo, descricao, data, km, valor, fornecedor,
      proxima_manutencao_data, proxima_manutencao_km, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    manutencaoId, id, data.tipo, data.descricao, data.data, data.km || null,
    data.valor || null, data.fornecedor || null, data.proxima_manutencao_data || null,
    data.proxima_manutencao_km || null, data.observacoes || null
  ).run();

  // Atualizar km se informado
  if (data.km) {
    await c.env.DB.prepare(`
      UPDATE veiculos SET km_atual = ? WHERE id = ? AND km_atual < ?
    `).bind(data.km, id, data.km).run();
  }

  return c.json({ success: true, data: { id: manutencaoId } }, 201);
});

// POST /veiculos/:id/abastecimento - Registrar abastecimento
veiculos.post('/:id/abastecimento', requirePermission('logistica', 'editar'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');
  const body = await c.req.json();

  const veiculo = await c.env.DB.prepare(`
    SELECT id FROM veiculos WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!veiculo) {
    return c.json({ success: false, error: 'Veículo não encontrado' }, 404);
  }

  const validation = abastecimentoSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Dados inválidos', details: validation.error.errors }, 400);
  }

  const data = validation.data;
  const abastecimentoId = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO veiculos_abastecimentos (
      id, veiculo_id, data, km, combustivel, litros, valor_litro, valor_total, posto, motorista_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    abastecimentoId, id, data.data, data.km, data.combustivel,
    data.litros, data.valor_litro, data.valor_total, data.posto || null, data.motorista_id || null
  ).run();

  // Atualizar km
  await c.env.DB.prepare(`
    UPDATE veiculos SET km_atual = ? WHERE id = ? AND km_atual < ?
  `).bind(data.km, id, data.km).run();

  return c.json({ success: true, data: { id: abastecimentoId } }, 201);
});

// DELETE /veiculos/:id - Inativar
veiculos.delete('/:id', requirePermission('logistica', 'excluir'), async (c) => {
  const { id } = c.req.param();
  const usuario = c.get('usuario');

  const veiculo = await c.env.DB.prepare(`
    SELECT * FROM veiculos WHERE id = ? AND empresa_id = ?
  `).bind(id, usuario.empresa_id).first();

  if (!veiculo) {
    return c.json({ success: false, error: 'Veículo não encontrado' }, 404);
  }

  // Verificar entregas pendentes
  const entregasPendentes = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM entregas 
    WHERE veiculo_id = ? AND status IN ('PENDENTE', 'EM_SEPARACAO', 'EM_TRANSITO')
  `).bind(id).first<{ total: number }>();

  if (entregasPendentes && entregasPendentes.total > 0) {
    return c.json({ success: false, error: 'Veículo possui entregas pendentes' }, 400);
  }

  // Inativar
  await c.env.DB.prepare(`
    UPDATE veiculos SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(id).run();

  // Desvincular motorista
  await c.env.DB.prepare(`
    UPDATE veiculos_motoristas SET ativo = 0, data_fim = DATE('now')
    WHERE veiculo_id = ? AND ativo = 1
  `).bind(id).run();

  await registrarAuditoria(c.env.DB, {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    acao: 'INATIVAR',
    entidade: 'veiculos',
    entidade_id: id
  });

  return c.json({ success: true, message: 'Veículo inativado' });
});

export default veiculos;
