// =============================================
// 🏢 PLANAC ERP - Utilitário de Auditoria
// =============================================

import type { AuditoriaParams } from '../types';

/**
 * Registra uma ação de auditoria no banco de dados
 */
export async function registrarAuditoria(
  db: D1Database,
  params: AuditoriaParams
): Promise<void> {
  try {
    const id = crypto.randomUUID();
    
    await db.prepare(`
      INSERT INTO audit_logs (
        id,
        empresa_id,
        usuario_id,
        acao,
        tabela,
        registro_id,
        dados_anteriores,
        dados_novos,
        ip,
        user_agent,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      params.empresa_id,
      params.usuario_id,
      params.acao,
      params.tabela,
      params.registro_id || null,
      params.dados_anteriores ? JSON.stringify(params.dados_anteriores) : null,
      params.dados_novos ? JSON.stringify(params.dados_novos) : null,
      params.ip || null,
      params.user_agent || null,
      new Date().toISOString()
    ).run();
  } catch (error) {
    // Log do erro mas não interrompe a operação principal
    console.error('Erro ao registrar auditoria:', error);
  }
}

/**
 * Busca logs de auditoria com filtros
 */
export async function buscarAuditoria(
  db: D1Database,
  empresa_id: string,
  filtros: {
    usuario_id?: string;
    tabela?: string;
    registro_id?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ logs: any[]; total: number }> {
  const {
    usuario_id,
    tabela,
    registro_id,
    acao,
    data_inicio,
    data_fim,
    page = 1,
    limit = 50
  } = filtros;

  let where = 'WHERE empresa_id = ?';
  const params: any[] = [empresa_id];

  if (usuario_id) {
    where += ' AND usuario_id = ?';
    params.push(usuario_id);
  }

  if (tabela) {
    where += ' AND tabela = ?';
    params.push(tabela);
  }

  if (registro_id) {
    where += ' AND registro_id = ?';
    params.push(registro_id);
  }

  if (acao) {
    where += ' AND acao = ?';
    params.push(acao);
  }

  if (data_inicio) {
    where += ' AND created_at >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    where += ' AND created_at <= ?';
    params.push(data_fim);
  }

  // Contagem total
  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM audit_logs ${where}`
  ).bind(...params).first<{ total: number }>();

  // Busca paginada
  const offset = (page - 1) * limit;
  const logsResult = await db.prepare(`
    SELECT 
      al.*,
      u.nome as usuario_nome
    FROM audit_logs al
    LEFT JOIN usuarios u ON al.usuario_id = u.id
    ${where}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return {
    logs: logsResult.results || [],
    total: countResult?.total || 0
  };
}

/**
 * Gera hash para comparação de dados
 */
export function hashDados(dados: any): string {
  return JSON.stringify(dados);
}

/**
 * Detecta campos alterados entre dois objetos
 */
export function detectarAlteracoes(
  anterior: Record<string, any>,
  novo: Record<string, any>
): { campo: string; de: any; para: any }[] {
  const alteracoes: { campo: string; de: any; para: any }[] = [];
  
  const todasChaves = new Set([
    ...Object.keys(anterior || {}),
    ...Object.keys(novo || {})
  ]);

  for (const chave of todasChaves) {
    // Ignora campos de controle
    if (['updated_at', 'created_at', 'id'].includes(chave)) continue;

    const valorAnterior = anterior?.[chave];
    const valorNovo = novo?.[chave];

    if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNovo)) {
      alteracoes.push({
        campo: chave,
        de: valorAnterior,
        para: valorNovo
      });
    }
  }

  return alteracoes;
}
