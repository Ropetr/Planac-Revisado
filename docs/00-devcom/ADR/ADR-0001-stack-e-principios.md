# ADR-0001: Stack Tecnológico e Princípios Arquiteturais

**Status:** Aceito  
**Data:** 2025-12-12  
**Decisores:** CTO DEV.com, Rodrigo (PLANAC)

---

## Contexto

O ERP PLANAC precisa de uma arquitetura que suporte:
- Multi-tenancy (múltiplas empresas isoladas)
- Escalabilidade global (edge computing)
- Baixo custo operacional inicial
- Facilidade de deploy e manutenção
- Integrações com sistemas brasileiros (fiscal, bancário)

## Decisão

Adotar **Cloudflare como plataforma principal** com a seguinte stack:

### Backend
| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Runtime | Cloudflare Workers | Edge computing, cold start ~0ms |
| Framework | Hono | Leve, TypeScript nativo, similar Express |
| Linguagem | TypeScript | Tipagem forte, DX melhor |
| Validação | Zod | Runtime validation + tipos |

### Banco de Dados
| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Relacional | Cloudflare D1 (SQLite) | Serverless, edge-ready, SQL padrão |
| Cache | Cloudflare KV | Key-value distribuído, TTL nativo |
| Sessões | Cloudflare KV | Sessões distribuídas |
| Arquivos | Cloudflare R2 | S3-compatible, sem egress fee |

### Frontend
| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Framework | React 18 | Ecossistema maduro |
| Build | Vite | Fast HMR, ESM nativo |
| Styling | Tailwind CSS | Utility-first, tree-shaking |
| State | Zustand | Leve, sem boilerplate |

### Infraestrutura
| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Hosting | Cloudflare Pages | Deploy automático |
| CDN | Cloudflare | Global, DDoS protection |
| DNS | Cloudflare | Integrado |
| CI/CD | GitHub Actions | Integração nativa |

## Alternativas Consideradas

### AWS Lambda + RDS
- ❌ Cold start maior (~100-500ms)
- ❌ Custo de RDS contínuo
- ❌ Complexidade de VPC

### Vercel + PlanetScale
- ❌ Custo maior em escala
- ❌ Limitações de edge functions
- ✅ DX excelente (mas não justifica custo)

### Self-hosted (VPS)
- ❌ Gerenciamento de infra
- ❌ Sem edge computing
- ❌ Scaling manual

## Consequências

### Positivas
- ✅ Latência baixa globalmente (edge)
- ✅ Custo previsível (pay-per-request)
- ✅ Zero DevOps para scaling
- ✅ Deploy em segundos
- ✅ DDoS protection incluído

### Negativas
- ⚠️ Limitação de 128MB por Worker
- ⚠️ D1 ainda em beta (mas estável)
- ⚠️ Vendor lock-in moderado
- ⚠️ Queries complexas podem ser lentas

### Mitigações
- Usar KV para cache agressivo
- Otimizar queries com índices
- Modularizar Workers se necessário

## Recursos Cloudflare Criados

| Recurso | ID | Status |
|---------|-----|--------|
| D1 Database | `12f9a7d5-fe09-4b09-bf72-59bae24d65b2` | ✅ |
| KV Cache | `d053dab81a554dc6961884eae41f75f7` | ✅ |
| KV Sessions | `80c6322699844ba1bb99e841f0c84306` | ✅ |
| KV Rate Limit | `f9991a8379d74873a8030e42dad416bd` | ✅ |
| R2 Storage | `planac-erp-storage` | ✅ |

---

## Referências

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [D1 Database](https://developers.cloudflare.com/d1/)
