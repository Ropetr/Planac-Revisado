#!/usr/bin/env node
/**
 * measure-metrics.mjs
 * 
 * Script para medir métricas reais do repositório Planac-Revisado.
 * Gera docs/00-devcom/METRICS/metrics.json com contagens atualizadas.
 * 
 * Uso:
 *   node tools/measure-metrics.mjs
 * 
 * Requer: Node.js 18+
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração
const REPO_ROOT = join(__dirname, '..');
const DOCS_PATH = join(REPO_ROOT, 'docs');
const OUTPUT_PATH = join(REPO_ROOT, 'docs', '00-devcom', 'METRICS', 'metrics.json');

/**
 * Conta arquivos em um diretório (recursivo ou não)
 */
function countFiles(dirPath, options = {}) {
  const { extension = null, recursive = false } = options;
  
  if (!existsSync(dirPath)) {
    return { count: 0, files: [] };
  }
  
  let count = 0;
  let files = [];
  
  const items = readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);
    
    if (stat.isFile()) {
      if (!extension || item.endsWith(extension)) {
        count++;
        files.push(item);
      }
    } else if (stat.isDirectory() && recursive) {
      const subResult = countFiles(fullPath, options);
      count += subResult.count;
      files = files.concat(subResult.files.map(f => `${item}/${f}`));
    }
  }
  
  return { count, files };
}

/**
 * Conta linhas em arquivos
 */
function countLines(dirPath, extension = '.md') {
  let totalLines = 0;
  
  if (!existsSync(dirPath)) {
    return 0;
  }
  
  const items = readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);
    
    if (stat.isFile() && item.endsWith(extension)) {
      try {
        const output = execSync(`wc -l < "${fullPath}"`, { encoding: 'utf8' });
        totalLines += parseInt(output.trim(), 10) || 0;
      } catch {
        // Ignora erros
      }
    } else if (stat.isDirectory()) {
      totalLines += countLines(fullPath, extension);
    }
  }
  
  return totalLines;
}

/**
 * Obtém hash do último commit
 */
function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { 
      cwd: REPO_ROOT, 
      encoding: 'utf8' 
    }).trim();
    
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      cwd: REPO_ROOT, 
      encoding: 'utf8' 
    }).trim();
    
    return { hash, branch };
  } catch {
    return { hash: 'unknown', branch: 'unknown' };
  }
}

/**
 * Mede todas as métricas
 */
function measureMetrics() {
  console.log('📊 Medindo métricas do repositório...\n');
  
  const gitInfo = getGitInfo();
  const timestamp = new Date().toISOString();
  
  // Métricas de documentação
  const docs = {
    '01-sumario': countFiles(join(DOCS_PATH, '01-sumario'), { extension: '.md' }),
    '02-regras-negocio': countFiles(join(DOCS_PATH, '02-regras-negocio'), { extension: '.md' }),
    '03-casos-uso': countFiles(join(DOCS_PATH, '03-casos-uso'), { extension: '.md' }),
    '04-fluxogramas': countFiles(join(DOCS_PATH, '04-fluxogramas'), { extension: '.md' }),
    '05-modelo-dados': countFiles(join(DOCS_PATH, '05-modelo-dados'), { extension: '.md' }),
    '06-especificacao-telas': countFiles(join(DOCS_PATH, '06-especificacao-telas'), { extension: '.md' }),
    '07-apis': countFiles(join(DOCS_PATH, '07-apis'), { extension: '.md' }),
    '08-integracoes': countFiles(join(DOCS_PATH, '08-integracoes'), { recursive: true }),
    '09-manuais': countFiles(join(DOCS_PATH, '09-manuais'), { extension: '.md' }),
    '10-anexos': countFiles(join(DOCS_PATH, '10-anexos'), { extension: '.md', recursive: true })
  };
  
  // Métricas de código
  const srcApiRoutes = join(REPO_ROOT, 'src', 'api', 'src', 'routes');
  const srcApiMigrations = join(REPO_ROOT, 'src', 'api', 'migrations');
  
  const routes = countFiles(srcApiRoutes, { extension: '.ts' });
  const migrations = countFiles(srcApiMigrations, { extension: '.sql' });
  
  // Filtrar rotas reais (excluir index.ts, auth.ts duplicados, etc)
  const routeFiles = routes.files.filter(f => 
    f.endsWith('.routes.ts') && 
    !f.includes('index')
  );
  
  // Total de linhas de documentação
  const totalDocsLines = Object.keys(docs).reduce((acc, key) => {
    return acc + countLines(join(DOCS_PATH, key));
  }, 0);
  
  // Construir objeto de métricas
  const metrics = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    version: '1.0.0',
    generated_at: timestamp,
    git: gitInfo,
    
    summary: {
      total_docs_folders: Object.keys(docs).length,
      total_route_files: routeFiles.length,
      total_migrations: migrations.count,
      total_docs_lines: totalDocsLines
    },
    
    documentation: {
      folders: Object.fromEntries(
        Object.entries(docs).map(([key, value]) => [
          key,
          {
            file_count: value.count,
            files: value.files
          }
        ])
      ),
      total_files: Object.values(docs).reduce((acc, v) => acc + v.count, 0),
      estimated_lines: totalDocsLines
    },
    
    source_code: {
      api_routes: {
        total: routeFiles.length,
        files: routeFiles.sort()
      },
      migrations: {
        total: migrations.count,
        files: migrations.files.sort()
      }
    },
    
    declared_metrics: {
      note: 'Valores declarados no README (fonte de verdade para negócio)',
      regras_negocio: 313,
      casos_uso: 185,
      fluxogramas: 25,
      tabelas_modelo_dados: 207,
      telas_especificadas: 203,
      integracoes_externas: 10
    }
  };
  
  return metrics;
}

/**
 * Salva métricas em arquivo JSON
 */
function saveMetrics(metrics) {
  // Garantir que o diretório existe
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    execSync(`mkdir -p "${outputDir}"`);
  }
  
  writeFileSync(OUTPUT_PATH, JSON.stringify(metrics, null, 2), 'utf8');
  console.log(`✅ Métricas salvas em: ${OUTPUT_PATH}\n`);
}

/**
 * Imprime resumo no console
 */
function printSummary(metrics) {
  console.log('📋 RESUMO DAS MÉTRICAS');
  console.log('='.repeat(50));
  console.log(`📅 Gerado em: ${metrics.generated_at}`);
  console.log(`🔖 Commit: ${metrics.git.hash} (${metrics.git.branch})`);
  console.log('');
  console.log('📁 Documentação:');
  console.log(`   Pastas: ${metrics.summary.total_docs_folders}`);
  console.log(`   Arquivos: ${metrics.documentation.total_files}`);
  console.log(`   Linhas (estimado): ~${metrics.summary.total_docs_lines.toLocaleString()}`);
  console.log('');
  console.log('💻 Código:');
  console.log(`   Rotas API: ${metrics.summary.total_route_files}`);
  console.log(`   Migrations: ${metrics.summary.total_migrations}`);
  console.log('');
  console.log('📊 Métricas Declaradas (README):');
  console.log(`   Regras de Negócio: ${metrics.declared_metrics.regras_negocio}`);
  console.log(`   Casos de Uso: ${metrics.declared_metrics.casos_uso}`);
  console.log(`   Tabelas: ${metrics.declared_metrics.tabelas_modelo_dados}`);
  console.log(`   Telas: ${metrics.declared_metrics.telas_especificadas}`);
  console.log(`   Integrações: ${metrics.declared_metrics.integracoes_externas}`);
  console.log('='.repeat(50));
}

// Executar
try {
  const metrics = measureMetrics();
  saveMetrics(metrics);
  printSummary(metrics);
} catch (error) {
  console.error('❌ Erro ao medir métricas:', error.message);
  process.exit(1);
}
