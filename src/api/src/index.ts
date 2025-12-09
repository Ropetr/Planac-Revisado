/**
 * 🚀 PLANAC ERP - API Principal
 * Cloudflare Workers com Hono Framework
 * 
 * Módulos implementados:
 * - Auth: Login, Logout, Refresh, Me
 * - Users: CRUD de usuários
 * - Profiles: CRUD de perfis e permissões
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimitMiddleware, Env } from './middleware/auth';

// Importar rotas
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import profilesRoutes from './routes/profiles';

// ============================================
// Criar aplicação Hono
// ============================================

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Middlewares Globais
// ============================================

// CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://planac.com.br'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400
}));

// Logger (em desenvolvimento)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    return logger()(c, next);
  }
  await next();
});

// Headers de segurança
app.use('*', secureHeaders());

// Rate limiting global (100 req/min)
app.use('*', rateLimitMiddleware(100, 60, 'global'));

// ============================================
// Health Check
// ============================================

app.get('/', (c) => {
  return c.json({
    name: 'Planac ERP API',
    version: '1.0.0',
    status: 'online',
    environment: c.env.ENVIRONMENT || 'production',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (c) => {
  const checks: Record<string, string> = {
    api: 'ok',
    database: 'checking',
    cache: 'checking'
  };
  
  try {
    // Verificar D1
    await c.env.DB.prepare('SELECT 1').first();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }
  
  try {
    // Verificar KV
    await c.env.CACHE.get('health-check');
    checks.cache = 'ok';
  } catch {
    checks.cache = 'error';
  }
  
  const allOk = Object.values(checks).every(v => v === 'ok');
  
  return c.json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }, allOk ? 200 : 503);
});

// ============================================
// Montar Rotas
// ============================================

// Auth: /api/auth/*
app.route('/api/auth', authRoutes);

// Users: /api/users/*
app.route('/api/users', usersRoutes);

// Profiles: /api/profiles/*
app.route('/api/profiles', profilesRoutes);

// ============================================
// Rotas Futuras (placeholders)
// ============================================

// Empresas
app.get('/api/empresas', (c) => {
  return c.json({ message: 'Módulo de empresas em desenvolvimento' }, 501);
});

// Clientes
app.get('/api/clientes', (c) => {
  return c.json({ message: 'Módulo de clientes em desenvolvimento' }, 501);
});

// Produtos
app.get('/api/produtos', (c) => {
  return c.json({ message: 'Módulo de produtos em desenvolvimento' }, 501);
});

// Orçamentos
app.get('/api/orcamentos', (c) => {
  return c.json({ message: 'Módulo de orçamentos em desenvolvimento' }, 501);
});

// Pedidos
app.get('/api/pedidos', (c) => {
  return c.json({ message: 'Módulo de pedidos em desenvolvimento' }, 501);
});

// ============================================
// Error Handler Global
// ============================================

app.onError((err, c) => {
  console.error('Erro não tratado:', err);
  
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'Erro interno do servidor'
    }
  }, 500);
});

// ============================================
// 404 Handler
// ============================================

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint não encontrado',
      path: c.req.path
    }
  }, 404);
});

// ============================================
// Export
// ============================================

export default app;
