// =============================================
// 🚀 PLANAC ERP - API Principal
// =============================================
// Arquivo: src/api/src/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';

// Rotas
import auth from './routes/auth.routes';
import usuarios from './routes/usuarios.routes';
import perfis from './routes/perfis.routes';

// Tipos
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  RATE_LIMIT: KVNamespace;
  FILES: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  NUVEM_FISCAL_URL: string;
  NUVEM_FISCAL_CLIENT_ID: string;
  NUVEM_FISCAL_CLIENT_SECRET: string;
}

// Criar aplicação
const app = new Hono<{ Bindings: Env }>();

// =============================================
// MIDDLEWARES GLOBAIS
// =============================================

// CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://planac.com.br', 'https://*.planac.com.br'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400
}));

// Logger (apenas em dev)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    return logger()(c, next);
  }
  await next();
});

// Headers de Segurança
app.use('*', secureHeaders());

// =============================================
// ROTAS DE SAÚDE
// =============================================

// Health check simples
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown'
  });
});

// Health check detalhado
app.get('/health/detailed', async (c) => {
  const checks: Record<string, any> = {
    api: { status: 'ok' },
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown'
  };

  // Verificar D1
  try {
    await c.env.DB.prepare('SELECT 1').run();
    checks.database = { status: 'ok' };
  } catch (error) {
    checks.database = { status: 'error', message: 'Conexão falhou' };
  }

  // Verificar KV
  try {
    await c.env.CACHE.put('health_check', 'ok', { expirationTtl: 60 });
    const value = await c.env.CACHE.get('health_check');
    checks.cache = { status: value === 'ok' ? 'ok' : 'error' };
  } catch (error) {
    checks.cache = { status: 'error', message: 'Conexão falhou' };
  }

  // Verificar R2
  try {
    checks.storage = { status: c.env.FILES ? 'ok' : 'not_configured' };
  } catch (error) {
    checks.storage = { status: 'error' };
  }

  const allOk = Object.values(checks).every(
    (check) => typeof check === 'object' && 'status' in check ? check.status === 'ok' : true
  );

  return c.json(checks, allOk ? 200 : 503);
});

// =============================================
// ROTAS DA API
// =============================================

// Autenticação (público)
app.route('/api/auth', auth);

// Usuários (autenticado)
app.route('/api/usuarios', usuarios);

// Perfis (autenticado)
app.route('/api/perfis', perfis);

// =============================================
// ROTAS FUTURAS (comentadas)
// =============================================
// app.route('/api/empresas', empresas);
// app.route('/api/filiais', filiais);
// app.route('/api/clientes', clientes);
// app.route('/api/fornecedores', fornecedores);
// app.route('/api/produtos', produtos);
// app.route('/api/estoque', estoque);
// app.route('/api/orcamentos', orcamentos);
// app.route('/api/pedidos', pedidos);
// app.route('/api/compras', compras);
// app.route('/api/financeiro', financeiro);
// app.route('/api/fiscal', fiscal);
// app.route('/api/expedicao', expedicao);
// app.route('/api/relatorios', relatorios);
// app.route('/api/configuracoes', configuracoes);

// =============================================
// ROTA 404
// =============================================
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Rota não encontrada',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// =============================================
// ERROR HANDLER GLOBAL
// =============================================
app.onError((err, c) => {
  console.error('Erro na API:', err);

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: err.message
    }, err.status);
  }

  // Erro de validação Zod
  if (err.name === 'ZodError') {
    return c.json({
      success: false,
      error: 'Dados inválidos',
      details: (err as any).errors
    }, 400);
  }

  return c.json({
    success: false,
    error: c.env.ENVIRONMENT === 'development' 
      ? err.message 
      : 'Erro interno do servidor'
  }, 500);
});

// =============================================
// EXPORTAR
// =============================================
export default app;
