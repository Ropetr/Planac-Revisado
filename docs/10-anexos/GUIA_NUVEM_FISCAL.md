# 🧾 Guia de Configuração - Nuvem Fiscal

## 1. Dados de Acesso

| Campo | Valor |
|-------|-------|
| **Client ID** | `AJReDlHes8aBNlTzTF9X` |
| **Client Secret** | `3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL` |
| **Painel** | https://app.nuvemfiscal.com.br |
| **Documentação** | https://dev.nuvemfiscal.com.br/docs |

---

## 2. Ambientes

| Ambiente | URL da API | Uso |
|----------|------------|-----|
| **Sandbox** | `https://api.sandbox.nuvemfiscal.com.br` | Testes e desenvolvimento |
| **Produção** | `https://api.nuvemfiscal.com.br` | Sistema em produção |

---

## 3. Configuração no Cloudflare Workers

### 3.1 Configurar Secrets (via CLI)

```bash
# Entrar na pasta do projeto
cd src

# Configurar Client ID
wrangler secret put NUVEM_FISCAL_CLIENT_ID
# Quando solicitado, cole: AJReDlHes8aBNlTzTF9X

# Configurar Client Secret
wrangler secret put NUVEM_FISCAL_CLIENT_SECRET
# Quando solicitado, cole: 3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL
```

### 3.2 Para Desenvolvimento Local

Crie o arquivo `.dev.vars` na raiz do projeto:

```env
NUVEM_FISCAL_CLIENT_ID=AJReDlHes8aBNlTzTF9X
NUVEM_FISCAL_CLIENT_SECRET=3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL
NUVEM_FISCAL_URL=https://api.sandbox.nuvemfiscal.com.br
```

---

## 4. Serviços Disponíveis

| Serviço | Descrição | Documentação |
|---------|-----------|--------------|
| **NF-e** | Nota Fiscal Eletrônica | [Link](https://dev.nuvemfiscal.com.br/docs/nfe) |
| **NFC-e** | Nota Fiscal de Consumidor | [Link](https://dev.nuvemfiscal.com.br/docs/nfce) |
| **NFS-e** | Nota Fiscal de Serviço | [Link](https://dev.nuvemfiscal.com.br/docs/nfse) |
| **CT-e** | Conhecimento de Transporte | [Link](https://dev.nuvemfiscal.com.br/docs/cte) |
| **MDF-e** | Manifesto de Documentos | [Link](https://dev.nuvemfiscal.com.br/docs/mdfe) |
| **CNPJ** | Consulta CNPJ | [Link](https://dev.nuvemfiscal.com.br/docs/cnpj) |
| **CEP** | Consulta CEP | [Link](https://dev.nuvemfiscal.com.br/docs/cep) |

---

## 5. Fluxo de Autenticação

```
1. POST /oauth/token
   - grant_type: client_credentials
   - client_id: AJReDlHes8aBNlTzTF9X
   - client_secret: 3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL
   - scope: cep cnpj nfse nfe nfce mdfe cte empresa

2. Recebe: access_token (válido por 1 hora)

3. Usar token em todas as requisições:
   Authorization: Bearer {access_token}
```

---

## 6. Webhook de Notificações

Configurar no painel do Nuvem Fiscal:

| Campo | Valor |
|-------|-------|
| **URL** | `https://api.planac.com.br/webhooks/nuvemfiscal` |
| **Eventos** | nfe.autorizada, nfe.rejeitada, nfe.cancelada, etc. |

---

## 7. Certificado Digital

Para emissão de NF-e em produção, é necessário:

1. **Certificado A1** (arquivo .pfx)
2. Upload no painel do Nuvem Fiscal
3. Configurar senha no Cloudflare:
   ```bash
   wrangler secret put CERTIFICADO_DIGITAL_SENHA
   ```

---

## 8. Limites e Cotas

Consultar plano contratado em: https://app.nuvemfiscal.com.br

---

**Documento criado em:** 06/12/2025  
**Responsável:** 🧾 Especialista Tributário / DEV.com
