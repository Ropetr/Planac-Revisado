// ============================================
// PLANAC ERP - Rotas de RH / Funcionários
// Bloco 3 - RH
// ============================================

import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';

const rh = new Hono<{ Bindings: Env }>();

// ============================================
// FUNCIONÁRIOS
// ============================================

const funcionarioSchema = z.object({
  nome: z.string().min(1).max(200),
  cpf: z.string().length(11),
  rg: z.string().optional(),
  data_nascimento: z.string(),
  sexo: z.enum(['M', 'F', 'O']).optional(),
  estado_civil: z.enum(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'OUTROS']).optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().length(2).optional(),
  cep: z.string().optional(),
  cargo_id: z.string().uuid().optional(),
  departamento_id: z.string().uuid().optional(),
  data_admissao: z.string(),
  salario: z.number().min(0),
  tipo_contrato: z.enum(['CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'AUTONOMO']),
  carga_horaria: z.number().int().min(1).max(44).default(44),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  pix: z.string().optional(),
  observacoes: z.string().optional()
});

// GET /api/rh/funcionarios - Listar funcionários
rh.get('/funcionarios', async (c) => {
  const empresaId = c.get('empresaId');
  const { departamento_id, cargo_id, ativo, busca, page = '1', limit = '20' } = c.req.query();
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `SELECT f.*, c.nome as cargo_nome, d.nome as departamento_nome
               FROM funcionarios f
               LEFT JOIN cargos c ON f.cargo_id = c.id
               LEFT JOIN departamentos d ON f.departamento_id = d.id
               WHERE f.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (departamento_id) {
    query += ` AND f.departamento_id = ?`;
    params.push(departamento_id);
  }
  
  if (cargo_id) {
    query += ` AND f.cargo_id = ?`;
    params.push(cargo_id);
  }
  
  if (ativo !== undefined) {
    query += ` AND f.ativo = ?`;
    params.push(ativo === 'true' ? 1 : 0);
  }
  
  if (busca) {
    query += ` AND (f.nome LIKE ? OR f.cpf LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`);
  }
  
  const countQuery = query.replace(/SELECT f\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
  
  query += ` ORDER BY f.nome LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({
    success: true,
    data: result.results,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult?.total || 0 }
  });
});

// GET /api/rh/funcionarios/:id
rh.get('/funcionarios/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const funcionario = await c.env.DB.prepare(`
    SELECT f.*, c.nome as cargo_nome, d.nome as departamento_nome
    FROM funcionarios f
    LEFT JOIN cargos c ON f.cargo_id = c.id
    LEFT JOIN departamentos d ON f.departamento_id = d.id
    WHERE f.id = ? AND f.empresa_id = ?
  `).bind(id, empresaId).first();
  
  if (!funcionario) {
    return c.json({ error: 'Funcionário não encontrado' }, 404);
  }
  
  return c.json({ success: true, data: funcionario });
});

// POST /api/rh/funcionarios
rh.post('/funcionarios', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const validation = funcionarioSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  // Verificar CPF duplicado
  const existente = await c.env.DB.prepare(`
    SELECT id FROM funcionarios WHERE cpf = ? AND empresa_id = ?
  `).bind(validation.data.cpf, empresaId).first();
  
  if (existente) {
    return c.json({ error: 'CPF já cadastrado' }, 409);
  }
  
  // Gerar matrícula
  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM funcionarios WHERE empresa_id = ?
  `).bind(empresaId).first();
  const matricula = `MAT${String(((countResult?.total as number) || 0) + 1).padStart(5, '0')}`;
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO funcionarios (id, empresa_id, matricula, nome, cpf, rg, data_nascimento, sexo, estado_civil,
                              email, telefone, celular, endereco, cidade, uf, cep, cargo_id, departamento_id,
                              data_admissao, salario, tipo_contrato, carga_horaria, banco, agencia, conta, pix,
                              observacoes, ativo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).bind(id, empresaId, matricula, data.nome, data.cpf, data.rg || null, data.data_nascimento,
          data.sexo || null, data.estado_civil || null, data.email || null, data.telefone || null,
          data.celular || null, data.endereco || null, data.cidade || null, data.uf || null, data.cep || null,
          data.cargo_id || null, data.departamento_id || null, data.data_admissao, data.salario,
          data.tipo_contrato, data.carga_horaria, data.banco || null, data.agencia || null,
          data.conta || null, data.pix || null, data.observacoes || null, usuarioId).run();
  
  return c.json({ id, matricula, message: 'Funcionário cadastrado com sucesso' }, 201);
});

// PUT /api/rh/funcionarios/:id
rh.put('/funcionarios/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const validation = funcionarioSchema.partial().safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const campos = Object.keys(validation.data);
  const valores = Object.values(validation.data);
  
  if (campos.length > 0) {
    const setClause = campos.map(c => `${c} = ?`).join(', ');
    await c.env.DB.prepare(`
      UPDATE funcionarios SET ${setClause}, updated_at = CURRENT_TIMESTAMP, updated_by = ?
      WHERE id = ? AND empresa_id = ?
    `).bind(...valores, usuarioId, id, empresaId).run();
  }
  
  return c.json({ message: 'Funcionário atualizado' });
});

// POST /api/rh/funcionarios/:id/demitir - Demitir funcionário
rh.post('/funcionarios/:id/demitir', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const schema = z.object({
    data_demissao: z.string(),
    motivo: z.string().min(1),
    tipo_demissao: z.enum(['PEDIDO', 'SEM_JUSTA_CAUSA', 'COM_JUSTA_CAUSA', 'ACORDO'])
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE funcionarios SET ativo = 0, data_demissao = ?, motivo_demissao = ?,
                           tipo_demissao = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(validation.data.data_demissao, validation.data.motivo, validation.data.tipo_demissao, id, empresaId).run();
  
  return c.json({ message: 'Funcionário demitido' });
});

// ============================================
// CARGOS
// ============================================

// GET /api/rh/cargos
rh.get('/cargos', async (c) => {
  const empresaId = c.get('empresaId');
  
  const cargos = await c.env.DB.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM funcionarios WHERE cargo_id = c.id AND ativo = 1) as total_funcionarios
    FROM cargos c WHERE c.empresa_id = ? ORDER BY c.nome
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: cargos.results });
});

// POST /api/rh/cargos
rh.post('/cargos', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    salario_base: z.number().min(0).optional(),
    nivel: z.enum(['JUNIOR', 'PLENO', 'SENIOR', 'GERENTE', 'DIRETOR']).optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO cargos (id, empresa_id, nome, descricao, salario_base, nivel, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, validation.data.nome, validation.data.descricao || null,
          validation.data.salario_base || null, validation.data.nivel || null, usuarioId).run();
  
  return c.json({ id, message: 'Cargo criado' }, 201);
});

// PUT /api/rh/cargos/:id
rh.put('/cargos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const campos = Object.keys(body);
  const valores = Object.values(body);
  
  if (campos.length > 0) {
    const setClause = campos.map(c => `${c} = ?`).join(', ');
    await c.env.DB.prepare(`
      UPDATE cargos SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND empresa_id = ?
    `).bind(...valores, id, empresaId).run();
  }
  
  return c.json({ message: 'Cargo atualizado' });
});

// DELETE /api/rh/cargos/:id
rh.delete('/cargos/:id', async (c) => {
  const empresaId = c.get('empresaId');
  const { id } = c.req.param();
  
  const funcionarios = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM funcionarios WHERE cargo_id = ? AND ativo = 1
  `).bind(id).first();
  
  if (funcionarios && (funcionarios.total as number) > 0) {
    return c.json({ error: 'Cargo possui funcionários vinculados' }, 400);
  }
  
  await c.env.DB.prepare(`DELETE FROM cargos WHERE id = ? AND empresa_id = ?`).bind(id, empresaId).run();
  
  return c.json({ message: 'Cargo excluído' });
});

// ============================================
// DEPARTAMENTOS
// ============================================

// GET /api/rh/departamentos
rh.get('/departamentos', async (c) => {
  const empresaId = c.get('empresaId');
  
  const departamentos = await c.env.DB.prepare(`
    SELECT d.*, (SELECT COUNT(*) FROM funcionarios WHERE departamento_id = d.id AND ativo = 1) as total_funcionarios,
           g.nome as gestor_nome
    FROM departamentos d
    LEFT JOIN funcionarios g ON d.gestor_id = g.id
    WHERE d.empresa_id = ? ORDER BY d.nome
  `).bind(empresaId).all();
  
  return c.json({ success: true, data: departamentos.results });
});

// POST /api/rh/departamentos
rh.post('/departamentos', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    nome: z.string().min(1).max(100),
    descricao: z.string().optional(),
    gestor_id: z.string().uuid().optional(),
    centro_custo: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO departamentos (id, empresa_id, nome, descricao, gestor_id, centro_custo, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, empresaId, validation.data.nome, validation.data.descricao || null,
          validation.data.gestor_id || null, validation.data.centro_custo || null, usuarioId).run();
  
  return c.json({ id, message: 'Departamento criado' }, 201);
});

// ============================================
// FÉRIAS
// ============================================

// GET /api/rh/ferias
rh.get('/ferias', async (c) => {
  const empresaId = c.get('empresaId');
  const { funcionario_id, status, ano } = c.req.query();
  
  let query = `SELECT fer.*, f.nome as funcionario_nome
               FROM ferias fer
               JOIN funcionarios f ON fer.funcionario_id = f.id
               WHERE fer.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (funcionario_id) {
    query += ` AND fer.funcionario_id = ?`;
    params.push(funcionario_id);
  }
  
  if (status) {
    query += ` AND fer.status = ?`;
    params.push(status);
  }
  
  if (ano) {
    query += ` AND strftime('%Y', fer.data_inicio) = ?`;
    params.push(ano);
  }
  
  query += ` ORDER BY fer.data_inicio DESC`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// POST /api/rh/ferias
rh.post('/ferias', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    funcionario_id: z.string().uuid(),
    data_inicio: z.string(),
    data_fim: z.string(),
    dias: z.number().int().min(1).max(30),
    abono_pecuniario: z.boolean().default(false),
    dias_abono: z.number().int().min(0).max(10).optional(),
    observacoes: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.errors }, 400);
  }
  
  const id = crypto.randomUUID();
  const data = validation.data;
  
  await c.env.DB.prepare(`
    INSERT INTO ferias (id, empresa_id, funcionario_id, data_inicio, data_fim, dias,
                        abono_pecuniario, dias_abono, observacoes, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SOLICITADA', ?)
  `).bind(id, empresaId, data.funcionario_id, data.data_inicio, data.data_fim, data.dias,
          data.abono_pecuniario ? 1 : 0, data.dias_abono || 0, data.observacoes || null, usuarioId).run();
  
  return c.json({ id, message: 'Férias solicitadas' }, 201);
});

// POST /api/rh/ferias/:id/aprovar
rh.post('/ferias/:id/aprovar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const { id } = c.req.param();
  
  await c.env.DB.prepare(`
    UPDATE ferias SET status = 'APROVADA', aprovado_por = ?, data_aprovacao = CURRENT_TIMESTAMP
    WHERE id = ? AND empresa_id = ?
  `).bind(usuarioId, id, empresaId).run();
  
  return c.json({ message: 'Férias aprovadas' });
});

// ============================================
// PONTO
// ============================================

// GET /api/rh/ponto
rh.get('/ponto', async (c) => {
  const empresaId = c.get('empresaId');
  const { funcionario_id, data_inicio, data_fim } = c.req.query();
  
  let query = `SELECT p.*, f.nome as funcionario_nome
               FROM ponto p
               JOIN funcionarios f ON p.funcionario_id = f.id
               WHERE p.empresa_id = ?`;
  const params: any[] = [empresaId];
  
  if (funcionario_id) {
    query += ` AND p.funcionario_id = ?`;
    params.push(funcionario_id);
  }
  
  if (data_inicio) {
    query += ` AND p.data >= ?`;
    params.push(data_inicio);
  }
  
  if (data_fim) {
    query += ` AND p.data <= ?`;
    params.push(data_fim);
  }
  
  query += ` ORDER BY p.data DESC, p.hora_entrada DESC`;
  
  const result = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ success: true, data: result.results });
});

// POST /api/rh/ponto/registrar - Registrar ponto
rh.post('/ponto/registrar', async (c) => {
  const empresaId = c.get('empresaId');
  const usuarioId = c.get('usuarioId');
  const body = await c.req.json();
  
  const schema = z.object({
    funcionario_id: z.string().uuid(),
    tipo: z.enum(['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA']),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    observacao: z.string().optional()
  });
  
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos' }, 400);
  }
  
  const hoje = new Date().toISOString().split('T')[0];
  const agora = new Date().toTimeString().split(' ')[0];
  
  // Buscar registro do dia
  let ponto = await c.env.DB.prepare(`
    SELECT id, hora_entrada, hora_saida_almoco, hora_retorno_almoco, hora_saida
    FROM ponto WHERE funcionario_id = ? AND data = ?
  `).bind(validation.data.funcionario_id, hoje).first();
  
  if (!ponto && validation.data.tipo === 'ENTRADA') {
    // Criar novo registro
    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO ponto (id, empresa_id, funcionario_id, data, hora_entrada, latitude_entrada, longitude_entrada)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, empresaId, validation.data.funcionario_id, hoje, agora,
            validation.data.latitude || null, validation.data.longitude || null).run();
    
    return c.json({ id, tipo: 'ENTRADA', hora: agora, message: 'Entrada registrada' }, 201);
  }
  
  if (!ponto) {
    return c.json({ error: 'Nenhum registro de entrada encontrado para hoje' }, 400);
  }
  
  // Atualizar registro existente
  const campo = {
    'SAIDA_ALMOCO': 'hora_saida_almoco',
    'RETORNO_ALMOCO': 'hora_retorno_almoco',
    'SAIDA': 'hora_saida'
  }[validation.data.tipo];
  
  if (campo) {
    await c.env.DB.prepare(`
      UPDATE ponto SET ${campo} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(agora, ponto.id).run();
  }
  
  return c.json({ tipo: validation.data.tipo, hora: agora, message: `${validation.data.tipo} registrado` });
});

// GET /api/rh/ponto/resumo/:funcionarioId - Resumo mensal de ponto
rh.get('/ponto/resumo/:funcionarioId', async (c) => {
  const empresaId = c.get('empresaId');
  const { funcionarioId } = c.req.param();
  const { mes, ano } = c.req.query();
  
  const mesAtual = mes || String(new Date().getMonth() + 1).padStart(2, '0');
  const anoAtual = ano || String(new Date().getFullYear());
  
  const registros = await c.env.DB.prepare(`
    SELECT * FROM ponto 
    WHERE funcionario_id = ? AND strftime('%m', data) = ? AND strftime('%Y', data) = ?
    ORDER BY data
  `).bind(funcionarioId, mesAtual, anoAtual).all();
  
  // Calcular horas trabalhadas
  let totalMinutos = 0;
  for (const reg of registros.results as any[]) {
    if (reg.hora_entrada && reg.hora_saida) {
      const entrada = reg.hora_entrada.split(':').map(Number);
      const saida = reg.hora_saida.split(':').map(Number);
      let minutos = (saida[0] * 60 + saida[1]) - (entrada[0] * 60 + entrada[1]);
      
      // Descontar almoço
      if (reg.hora_saida_almoco && reg.hora_retorno_almoco) {
        const saidaAlmoco = reg.hora_saida_almoco.split(':').map(Number);
        const retornoAlmoco = reg.hora_retorno_almoco.split(':').map(Number);
        minutos -= (retornoAlmoco[0] * 60 + retornoAlmoco[1]) - (saidaAlmoco[0] * 60 + saidaAlmoco[1]);
      }
      
      totalMinutos += minutos;
    }
  }
  
  return c.json({
    success: true,
    data: {
      registros: registros.results,
      resumo: {
        dias_trabalhados: registros.results.length,
        horas_trabalhadas: Math.floor(totalMinutos / 60),
        minutos_trabalhados: totalMinutos % 60,
        total_minutos: totalMinutos
      }
    }
  });
});

export default rh;
