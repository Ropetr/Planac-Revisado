# 🔗 Integrações Externas - ERP PLANAC

Documentação completa das integrações externas do sistema.

**Status: ✅ Completo**  
**Última Atualização:** 07/12/2025  
**Total de Integrações:** 11

---

## Índice

| # | Integração | Tipo | Status | Prioridade |
|---|------------|------|--------|------------|
| 1 | [Nuvem Fiscal](#1-nuvem-fiscal) | Fiscal | ✅ Configurado | Alta |
| 2 | [Baselinker](#2-baselinker) | Hub e-Commerce | ✅ Documentado | Alta |
| 3 | [CPF.CNPJ](#3-cpfcnpj) | Validação Docs | ✅ Documentado | Alta |
| 4 | [CNPJá](#4-cnpjá) | Consulta CNPJ | ✅ Documentado | Média |
| 5 | [SERPRO Integra Contador](#5-serpro-integra-contador) | Dados Fiscais | ✅ Documentado | Média |
| 6 | [SERPRO Consulta Renda](#6-serpro-consulta-renda) | Análise Crédito | ✅ Documentado | Baixa |
| 7 | [SERPRO Consulta Faturamento](#7-serpro-consulta-faturamento) | Análise Crédito | ✅ Documentado | Baixa |
| 8 | [IBPT - De Olho no Imposto](#8-ibpt---de-olho-no-imposto) | Tributário | ✅ Documentado | Alta |
| 9 | [Bluesoft Cosmos](#9-bluesoft-cosmos) | Catálogo Produtos | ✅ Documentado | Alta |
| 11 | [API Brasil](#10-api-brasil) | Análise Crédito + WhatsApp | ✅ Documentado | Alta |

---

# 1. NUVEM FISCAL

## 1.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | Nuvem Fiscal |
| **Site** | https://www.nuvemfiscal.com.br |
| **Documentação** | https://dev.nuvemfiscal.com.br/docs |
| **Tipo** | API REST |
| **Autenticação** | OAuth 2.0 (Client Credentials) |

## 1.2 Credenciais de Acesso

| Ambiente | Client ID | Client Secret |
|----------|-----------|---------------|
| **Produção** | `AJReDlHes8aBNlTzTF9X` | `3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL` |

> ⚠️ **IMPORTANTE:** As credenciais acima são sensíveis. Em produção, devem ser armazenadas como secrets no Cloudflare Workers.

## 1.3 Endpoints Base

| Ambiente | URL |
|----------|-----|
| Produção | `https://api.nuvemfiscal.com.br` |
| Sandbox | `https://api.sandbox.nuvemfiscal.com.br` |

## 1.4 Serviços Utilizados

| Serviço | Descrição | Uso no Planac |
|---------|-----------|---------------|
| **NF-e** | Nota Fiscal Eletrônica | Vendas B2B |
| **NFC-e** | Nota Fiscal Consumidor | PDV / Varejo |
| **NFS-e** | Nota Fiscal de Serviço | Serviços |
| **CT-e** | Conhecimento de Transporte | Frete próprio |
| **MDF-e** | Manifesto de Documentos | Expedição |

## 1.5 Fluxo de Autenticação

```bash
# Obter token de acesso
curl -X POST "https://api.nuvemfiscal.com.br/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=AJReDlHes8aBNlTzTF9X" \
  -d "client_secret=3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL"
```

## 1.6 Módulos do Planac que Utilizam

- **Faturamento** - Emissão de NF-e e NFC-e
- **PDV** - Emissão de NFC-e
- **Serviços** - Emissão de NFS-e
- **Expedição** - Emissão de CT-e e MDF-e

---

# 2. BASELINKER

## 2.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | Baselinker (BASE.COM) |
| **Site** | https://baselinker.com |
| **Documentação** | https://api.baselinker.com |
| **Tipo** | API REST |
| **Autenticação** | Token Bearer |

## 2.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Token** | `8003146-8033898-532H6155RLJVRTS9GX0RKTKI8IO74JQ9PPAL391UOJZ9VGTP8QAT5N42HZMPC5IQ` |

## 2.3 Endpoint Base

```
https://api.baselinker.com/connector.php
```

## 2.4 Funcionalidades Principais

| Método | Descrição | Uso no Planac |
|--------|-----------|---------------|
| `getOrders` | Lista pedidos de marketplaces | Importação de vendas |
| `getOrderStatusList` | Status disponíveis | Sincronização |
| `setOrderStatus` | Atualiza status | Atualização de status |
| `getInventoryProductsList` | Lista produtos | Sincronização de catálogo |
| `updateInventoryProductsStock` | Atualiza estoque | Sincronização de estoque |
| `getInventoryProductsPrices` | Lista preços | Sincronização de preços |

## 2.5 Marketplaces Suportados

| Marketplace | Código |
|-------------|--------|
| Mercado Livre | `ml` |
| Amazon | `amazon` |
| Shopee | `shopee` |
| Magazine Luiza | `magalu` |
| Americanas | `americanas` |
| Via Varejo | `viavarejo` |
| B2W | `b2w` |

## 2.6 Exemplo de Requisição

```bash
curl -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: 8003146-8033898-532H6155RLJVRTS9GX0RKTKI8IO74JQ9PPAL391UOJZ9VGTP8QAT5N42HZMPC5IQ" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "method=getOrders" \
  -d "parameters={\"date_from\": 1700000000}"
```

## 2.7 Módulos do Planac que Utilizam

- **E-commerce** - Importação de pedidos
- **Estoque** - Sincronização de quantidades
- **Produtos** - Sincronização de catálogo
- **Preços** - Sincronização de tabelas

---

# 3. CPF.CNPJ

## 3.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | CPF.CNPJ |
| **Site** | https://www.cpfcnpj.com.br |
| **Documentação** | https://www.cpfcnpj.com.br/dev/ |
| **Tipo** | API REST |
| **Autenticação** | ID + Token |

## 3.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **ID** | `JWXN` |
| **Token** | `fb2868083821ff14de07e91ebac9e959` |

## 3.3 Endpoints Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `/cpf/{cpf}` | Consulta dados de CPF |
| `/cnpj/{cnpj}` | Consulta dados de CNPJ |
| `/cep/{cep}` | Consulta endereço por CEP |

## 3.4 Exemplo de Requisição

```bash
# Consulta CNPJ
curl "https://www.cpfcnpj.com.br/api/cnpj/12345678000190" \
  -H "Authorization: Basic SldYTjpmYjI4NjgwODM4MjFmZjE0ZGUwN2U5MWViYWM5ZTk1OQ=="
```

## 3.5 Campos Retornados (CNPJ)

| Campo | Descrição |
|-------|-----------|
| `razao_social` | Razão social |
| `nome_fantasia` | Nome fantasia |
| `cnpj` | CNPJ formatado |
| `situacao` | Situação cadastral |
| `data_abertura` | Data de abertura |
| `endereco` | Endereço completo |
| `telefone` | Telefone |
| `email` | E-mail |
| `atividade_principal` | CNAE principal |

## 3.6 Módulos do Planac que Utilizam

- **Clientes** - Validação e preenchimento automático de cadastro PJ
- **Fornecedores** - Validação de CNPJ
- **Fiscal** - Validação antes de emissão de NF-e

---

# 4. CNPJá

## 4.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | CNPJá |
| **Site** | https://cnpja.com |
| **Documentação** | https://cnpja.com/docs |
| **Tipo** | API REST |
| **Autenticação** | API Key |

## 4.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **API Key** | `35f092ea-0922-4231-bc05-181aa4062731-11a1649b-2933-44ca-9d30-9c862a03ebb3` |

## 4.3 Endpoint Base

```
https://api.cnpja.com
```

## 4.4 Endpoints Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `GET /office/{cnpj}` | Consulta completa de CNPJ |
| `GET /office/{cnpj}/simples` | Consulta Simples Nacional |
| `GET /office/{cnpj}/sintegra/{uf}` | Consulta SINTEGRA |
| `GET /office/{cnpj}/suframa` | Consulta SUFRAMA |

## 4.5 Exemplo de Requisição

```bash
curl "https://api.cnpja.com/office/12345678000190" \
  -H "Authorization: 35f092ea-0922-4231-bc05-181aa4062731-11a1649b-2933-44ca-9d30-9c862a03ebb3"
```

## 4.6 Dados Enriquecidos Disponíveis

| Categoria | Campos |
|-----------|--------|
| **Básico** | Razão social, fantasia, CNPJ, situação |
| **Endereço** | Logradouro, número, bairro, cidade, UF, CEP |
| **Contato** | Telefones, e-mails |
| **Fiscal** | Simples Nacional, MEI, IE, IM |
| **Sócios** | Nome, CPF, qualificação, participação |
| **CNAE** | Principal e secundárias |
| **Capital** | Capital social |

## 4.7 Módulos do Planac que Utilizam

- **Clientes** - Cadastro enriquecido de PJ
- **Crédito** - Análise de cliente
- **Fiscal** - Validação de IE e regime tributário

---

# 5. SERPRO INTEGRA CONTADOR

## 5.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | SERPRO |
| **Site** | https://servicos.serpro.gov.br |
| **Documentação** | https://apicenter.estaleiro.serpro.gov.br |
| **Tipo** | API REST |
| **Autenticação** | OAuth 2.0 (Client Credentials) |

## 5.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Consumer Key** | `xulEzvzZKabUXeTQXNYPu9OZwkEa` |
| **Consumer Secret** | `tbquSwPldBI4A5fCv0ftqFmo_3Ma` |
| **Contrato** | `229986` |

## 5.3 Obter Token de Acesso

```bash
curl -X POST "https://gateway.apiserpro.serpro.gov.br/token" \
  -H "Authorization: Basic eHVsRXp2elpLYWJVWGVUUVhOWVB1OU9ad2tFYTp0YnF1U3dQbGRCSTRBNWZDdjBmdHFGbW9fM01h" \
  -d "grant_type=client_credentials"
```

## 5.4 Funcionalidades

| Serviço | Descrição |
|---------|-----------|
| **Consulta CNPJ** | Dados cadastrais da empresa |
| **Consulta CPF** | Validação de pessoa física |
| **Consulta INSS** | Situação previdenciária |
| **Consulta FGTS** | Regularidade do FGTS |

## 5.5 Módulos do Planac que Utilizam

- **Fornecedores** - Validação fiscal
- **Contabilidade** - Consultas para contador

---

# 6. SERPRO CONSULTA RENDA

## 6.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | SERPRO |
| **Tipo** | API REST |
| **Autenticação** | OAuth 2.0 |
| **Finalidade** | Análise de crédito pessoa física |

## 6.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Consumer Key** | `xulEzvzZKabUXeTQXNYPu9OZwkEa` |
| **Consumer Secret** | `tbquSwPldBI4A5fCv0ftqFmo_3Ma` |
| **Contrato** | `261076` |

## 6.3 Obter Token de Acesso

```bash
curl -X POST "https://gateway.apiserpro.serpro.gov.br/token" \
  -H "Authorization: Basic eHVsRXp2elpLYWJVWGVUUVhOWVB1OU9ad2tFYTp0YnF1U3dQbGRCSTRBNWZDdjBmdHFGbW9fM01h" \
  -d "grant_type=client_credentials"
```

## 6.4 Dados Disponíveis

| Dado | Descrição |
|------|-----------|
| **Renda declarada** | Valor declarado no IR |
| **Faixa de renda** | Classificação por faixa |
| **Ano base** | Exercício fiscal |

## 6.5 Módulos do Planac que Utilizam

- **Crédito** - Análise de limite para pessoa física
- **Financeiro** - Score de risco

---

# 7. SERPRO CONSULTA FATURAMENTO

## 7.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | SERPRO |
| **Tipo** | API REST |
| **Autenticação** | OAuth 2.0 |
| **Finalidade** | Análise de crédito pessoa jurídica |

## 7.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Consumer Key** | `xulEzvzZKabUXeTQXNYPu9OZwkEa` |
| **Consumer Secret** | `tbquSwPldBI4A5fCv0ftqFmo_3Ma` |
| **Contrato** | `261077` |

## 7.3 Obter Token de Acesso

```bash
curl -X POST "https://gateway.apiserpro.serpro.gov.br/token" \
  -H "Authorization: Basic eHVsRXp2elpLYWJVWGVUUVhOWVB1OU9ad2tFYTp0YnF1U3dQbGRCSTRBNWZDdjBmdHFGbW9fM01h" \
  -d "grant_type=client_credentials"
```

## 7.4 Dados Disponíveis

| Dado | Descrição |
|------|-----------|
| **Faturamento presumido** | Valor estimado de faturamento |
| **Porte da empresa** | MEI, ME, EPP, Normal |
| **Ano base** | Exercício fiscal |

## 7.5 Módulos do Planac que Utilizam

- **Crédito** - Análise de limite para pessoa jurídica
- **Comercial** - Classificação de clientes

---

# 8. IBPT - DE OLHO NO IMPOSTO

## 8.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | IBPT - Instituto Brasileiro de Planejamento Tributário |
| **Site** | https://deolhonoimposto.ibpt.org.br |
| **Documentação API Produtos** | https://deolhonoimposto.ibpt.org.br/Site/API#!//Produtos_Get |
| **Documentação API Serviços** | https://deolhonoimposto.ibpt.org.br/Site/API#!//Servicos_Get |
| **Tipo** | API REST |
| **Autenticação** | Token |

## 8.2 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Token** | `ePNBuMey5VZ0OCw3ihiQQUAc9EQkKAbN9-TlaoLqAf9rpQVQbgoTMuawhjF_pn_o` |

> ⚠️ **IMPORTANTE:** Este token deve ser configurado como secret no Cloudflare Workers para automatizar a atualização das tabelas.

## 8.3 Base Legal

| Lei | Descrição |
|-----|-----------|
| **Lei 12.741/2012** | Lei da Transparência Fiscal |
| **Decreto 8.264/2014** | Regulamentação da Lei |
| **Portaria 85/2014** | Disposições complementares |

**Obrigatoriedade:** Vendas ao **consumidor final** (pessoa física ou jurídica para consumo próprio).

**Penalidades:** Multas de R$ 400,00 até R$ 7 milhões por descumprimento (Código de Defesa do Consumidor).

## 8.4 Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/Produtos` | GET | Consulta alíquotas por NCM |
| `/api/v1/Servicos` | GET | Consulta alíquotas por NBS |

## 8.5 Parâmetros da Consulta (Produtos)

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `token` | string | Sim | Token de autenticação |
| `cnpj` | string | Sim | CNPJ da empresa (apenas números) |
| `codigo` | string | Sim | Código NCM (8 dígitos) |
| `uf` | string | Sim | UF de destino (2 caracteres) |
| `ex` | string | Não | Exceção TIPI (quando aplicável) |

## 8.6 Exemplo de Requisição

```bash
# Consulta alíquota para produto NCM 6809.11.00 no PR
curl "https://api.deolhonoimposto.ibpt.org.br/api/v1/Produtos?token=ePNBuMey5VZ0OCw3ihiQQUAc9EQkKAbN9-TlaoLqAf9rpQVQbgoTMuawhjF_pn_o&cnpj=12345678000190&codigo=68091100&uf=PR"
```

## 8.7 Resposta da API

```json
{
  "Codigo": "68091100",
  "UF": "PR",
  "EX": 0,
  "Descricao": "Chapas, placas, painéis, ladrilhos e semelhantes, de gesso",
  "Nacional": 15.28,
  "Estadual": 18.00,
  "Importado": 23.14,
  "Municipal": 0.00,
  "Tipo": "0",
  "VigenciaInicio": "01/01/2025",
  "VigenciaFim": "30/06/2025",
  "Chave": "ABC123",
  "Versao": "25.1.A",
  "Fonte": "IBPT/empresometro.com.br"
}
```

## 8.8 Campos Retornados

| Campo | Descrição | Uso |
|-------|-----------|-----|
| `Nacional` | % tributos federais (produtos nacionais) | CST origem 0, 3, 4, 5 |
| `Importado` | % tributos federais (produtos importados) | CST origem 1, 2, 6, 7 |
| `Estadual` | % tributos estaduais (ICMS) | Todos os produtos |
| `Municipal` | % tributos municipais | Serviços |
| `VigenciaInicio` | Início da vigência da tabela | Controle de atualização |
| `VigenciaFim` | Fim da vigência da tabela | Alerta de atualização |

## 8.9 Fórmula de Cálculo

```
Valor IBPT por item = Valor do Produto × (Alíquota Federal + Alíquota Estadual + Alíquota Municipal) / 100

Exemplo:
- Produto: R$ 100,00
- Alíquota Federal (Nacional): 15,28%
- Alíquota Estadual: 18,00%
- Alíquota Municipal: 0,00%
- TOTAL: 33,28%

Valor Aproximado dos Tributos = R$ 100,00 × 33,28% = R$ 33,28
```

## 8.10 Integração com Nuvem Fiscal

A Nuvem Fiscal **não calcula automaticamente** o IBPT. O Planac deve:

1. Consultar a API do IBPT para cada NCM do item
2. Calcular o valor aproximado dos tributos
3. Enviar o campo `vTotTrib` preenchido na NF-e/NFC-e

```json
// Exemplo de envio para Nuvem Fiscal
{
  "infNFe": {
    "det": [
      {
        "prod": {
          "NCM": "68091100",
          "vProd": "100.00"
        },
        "imposto": {
          "vTotTrib": "33.28"
        }
      }
    ],
    "total": {
      "ICMSTot": {
        "vTotTrib": "33.28"
      }
    },
    "infAdic": {
      "infCpl": "Valor aproximado dos tributos R$ 33,28 (33,28%) - Fonte: IBPT"
    }
  }
}
```

## 8.11 Estratégia de Cache e Atualização

| Estratégia | Descrição |
|------------|-----------|
| **Cache Local** | Armazenar tabela em KV (Cloudflare) por 30 dias |
| **Atualização** | Job semanal para verificar nova versão |
| **Fallback** | Se API indisponível, usar cache local |
| **Alerta** | Notificar quando `VigenciaFim` estiver próxima |

```typescript
// Estrutura de cache no KV
interface IBPTCache {
  ncm: string;
  uf: string;
  nacional: number;
  estadual: number;
  importado: number;
  municipal: number;
  vigenciaFim: string;
  atualizadoEm: string;
}
```

## 8.12 Módulos do Planac que Utilizam

| Módulo | Uso |
|--------|-----|
| **Faturamento** | Cálculo automático ao emitir NF-e/NFC-e |
| **PDV** | Exibição no cupom fiscal |
| **Produtos** | Armazenamento de alíquotas por NCM |
| **Configurações** | Gestão do token e atualização de tabelas |

## 8.13 Fluxo de Implementação

```mermaid
graph TD
    A[Emissão de NF-e/NFC-e] --> B{Venda p/ Consumidor Final?}
    B -->|Não| C[Não calcula IBPT]
    B -->|Sim| D[Para cada item]
    D --> E{NCM em cache?}
    E -->|Sim| F{Cache válido?}
    E -->|Não| G[Consulta API IBPT]
    F -->|Sim| H[Usa alíquota do cache]
    F -->|Não| G
    G --> I[Armazena no cache]
    I --> H
    H --> J[Calcula valor por item]
    J --> K[Soma vTotTrib total]
    K --> L[Envia para Nuvem Fiscal]
```

## 8.14 Quando NÃO Calcular

| Situação | Motivo |
|----------|--------|
| Venda B2B (revenda) | Não é consumidor final |
| Remessa para industrialização | Não é venda |
| Amostra grátis | Não é venda |
| Transferência entre filiais | Não é venda |
| Devolução | Não é venda |
| MEI (opcional) | Decreto 8.264/2014 torna facultativo |

## 8.15 Texto Padrão na Nota Fiscal

```
Valor aproximado dos tributos R$ {vTotTrib} ({percentual}%) - Fonte: IBPT
```

Onde:
- `{vTotTrib}` = soma dos valores de tributos de todos os itens
- `{percentual}` = média ponderada das alíquotas

---

# 9. BLUESOFT COSMOS

## 9.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | Bluesoft |
| **Site** | https://cosmos.bluesoft.com.br |
| **Documentação** | https://cosmos.bluesoft.com.br/api |
| **Tipo** | API REST |
| **Autenticação** | Token no Header |
| **Base de Dados** | +26 milhões de produtos cadastrados |

## 9.2 O que é o Cosmos

O **Bluesoft Cosmos** é o maior catálogo de produtos online do Brasil. Permite que sistemas ERP realizem o **cadastro automático de produtos** através de múltiplas formas de busca.

**Benefício para a Planac:** Ao cadastrar um novo produto, o usuário pode buscar por código de barras, descrição, NCM ou categoria → Sistema preenche automaticamente descrição, NCM, CEST, marca, peso, foto → Elimina erros de digitação e acelera o cadastro.

## 9.3 Credenciais de Acesso

| Item | Valor |
|------|-------|
| **Token** | `mK7UKgCycAPW1Nr_7QDkdw` |
| **Header** | `X-Cosmos-Token` |
| **User-Agent** | Obrigatório (ex: `Planac ERP (planac@email.com)`) |

> ⚠️ **IMPORTANTE:** A API exige que o header `User-Agent` contenha informações de contato do desenvolvedor.

## 9.4 Endpoint Base

```
https://api.cosmos.bluesoft.com.br
```

## 9.5 Endpoints Disponíveis - TODAS AS FORMAS DE BUSCA

| Endpoint | Método | Descrição | Uso no Planac |
|----------|--------|-----------|---------------|
| `/gtins/{gtin}` | GET | Busca por código de barras (GTIN/EAN) | Leitor de código de barras ou digitação |
| `/gtins/{gtin}.json` | GET | Busca por GTIN (resposta JSON) | Alternativa com formato explícito |
| `/products?query={termo}` | GET | Busca por descrição ou GTIN | Busca textual livre |
| `/ncms/{ncm}` | GET | Detalhes de um NCM específico | Validar NCM existente |
| `/ncms/{ncm}/products` | GET | Lista produtos de um NCM | Buscar por classificação fiscal |
| `/gpcs/{gpc}` | GET | Detalhes de categoria GPC | Buscar por categoria |
| `/gpcs/{gpc}/products` | GET | Lista produtos de uma categoria | Navegar por categorias |

### 9.5.1 Busca por Código de Barras (GTIN/EAN)

```bash
# Busca direta pelo código de barras
curl "https://api.cosmos.bluesoft.com.br/gtins/7891000315507.json" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

**Uso:** Leitor de código de barras no cadastro ou digitação manual do código.

### 9.5.2 Busca por Descrição (Texto Livre)

```bash
# Busca por termo (descrição ou parte do nome)
curl "https://api.cosmos.bluesoft.com.br/products?query=placa%20de%20gesso" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

**Uso:** Quando o usuário não tem o código de barras e quer buscar pelo nome do produto.

**Resposta:** Lista paginada de produtos que correspondem ao termo buscado.

### 9.5.3 Busca por NCM (Classificação Fiscal)

```bash
# Lista produtos de um NCM específico (ex: chapas de gesso)
curl "https://api.cosmos.bluesoft.com.br/ncms/68091100/products" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

**Uso:** Quando o usuário sabe o NCM do produto que quer cadastrar (comum para materiais de construção).

**NCMs comuns para Planac:**
- `6809.11.00` - Chapas, placas e painéis de gesso
- `6809.19.00` - Outras obras de gesso
- `7308.90.90` - Perfis metálicos
- `3214.10.10` - Massas para acabamento

### 9.5.4 Busca por Categoria (GPC)

```bash
# Lista produtos de uma categoria mercadológica
curl "https://api.cosmos.bluesoft.com.br/gpcs/10000043/products" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

**Uso:** Navegar por categorias de produtos para encontrar itens similares.

## 9.6 Parâmetros de Paginação

| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `page` | Número da página | 1 |
| `per_page` | Itens por página (máx 90) | 30 |

```bash
# Busca paginada
curl "https://api.cosmos.bluesoft.com.br/products?query=drywall&page=2&per_page=50" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

## 9.7 Resposta da API

```json
{
  "gtin": 7891000315507,
  "description": "LEITE CONDENSADO MOÇA LATA 395G",
  "brand": {
    "name": "MOÇA",
    "picture": "https://cdn.cosmos..."
  },
  "gpc": {
    "code": "10000043",
    "description": "Leite Condensado/Evaporado (Perecível)"
  },
  "ncm": {
    "code": "04029900",
    "description": "Outros",
    "full_description": "Leite e creme de leite, concentrados..."
  },
  "cest": {
    "code": "1700700",
    "description": "Leite condensado..."
  },
  "gross_weight": 0.41,
  "net_weight": 0.395,
  "avg_price": 8.99,
  "max_price": 12.99,
  "min_price": 6.49,
  "thumbnail": "https://cdn.cosmos.bluesoft.com.br/products/...",
  "created_at": "2015-01-15T10:30:00-03:00",
  "updated_at": "2025-11-20T14:22:00-03:00"
}
```

## 9.8 Dados Retornados e Uso no Planac

| Campo API | Descrição | Campo no Planac |
|-----------|-----------|-----------------|
| `gtin` | Código de barras EAN/GTIN | `produto.codigo_barras` |
| `description` | Nome/descrição do produto | `produto.descricao` |
| `brand.name` | Marca/fabricante | `produto.marca` |
| `ncm.code` | Código NCM (8 dígitos) | `produto.ncm` |
| `ncm.description` | Descrição do NCM | `produto.ncm_descricao` |
| `cest.code` | Código CEST | `produto.cest` |
| `gross_weight` | Peso bruto (kg) | `produto.peso_bruto` |
| `net_weight` | Peso líquido (kg) | `produto.peso_liquido` |
| `avg_price` | Preço médio de mercado | Referência para precificação |
| `thumbnail` | URL da foto do produto | `produto.foto_url` |
| `gpc.description` | Categoria mercadológica | `produto.categoria` |

## 9.9 Busca por Descrição

```bash
# Busca produtos por termo
curl "https://api.cosmos.bluesoft.com.br/products?query=drywall" \
  -H "X-Cosmos-Token: mK7UKgCycAPW1Nr_7QDkdw" \
  -H "User-Agent: Planac ERP (contato@planac.com.br)"
```

## 9.10 Fluxo de Cadastro de Produto com Cosmos

```mermaid
graph TD
    A[Usuário clica em Novo Produto] --> B[Tela de Busca no Cosmos]
    B --> C{Escolhe forma de busca}
    C -->|Código de Barras| D[Digita/escaneia GTIN]
    C -->|Descrição| E[Digita nome/termo]
    C -->|NCM| F[Digita código NCM]
    C -->|Categoria| G[Navega por categorias]
    D --> H[GET /gtins/codigo]
    E --> I[GET /products?query=termo]
    F --> J[GET /ncms/codigo/products]
    G --> K[GET /gpcs/codigo/products]
    H --> L{Encontrou?}
    I --> M[Lista de resultados]
    J --> M
    K --> M
    M --> N[Usuário seleciona produto]
    N --> L
    L -->|Sim| O[Preenche campos automaticamente]
    L -->|Não| P[Formulário em branco]
    O --> Q[Usuário complementa dados]
    P --> Q
    Q --> R[Preço de venda, estoque, localização...]
    R --> S[Salva produto]
```

### 9.10.1 Tela de Busca - Mockup Funcional

```
┌─────────────────────────────────────────────────────────────────┐
│                    CADASTRO DE PRODUTO                          │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Buscar no Cosmos (escolha uma opção):                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ○ Código de Barras (GTIN/EAN)                            │   │
│  │   [____________________] [📷 Escanear]                   │   │
│  │                                                           │   │
│  │ ○ Busca por Descrição                                    │   │
│  │   [placa de gesso__________] [🔍 Buscar]                 │   │
│  │                                                           │   │
│  │ ○ Busca por NCM                                          │   │
│  │   [68091100________________] [🔍 Buscar]                 │   │
│  │                                                           │   │
│  │ ○ Navegar por Categoria                                  │   │
│  │   [Materiais de Construção ▼] [📂 Ver Produtos]          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ─────────────── ou ───────────────                             │
│                                                                  │
│  [📝 Cadastrar Manualmente]                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.10.2 Resultado da Busca - Lista de Produtos

```
┌─────────────────────────────────────────────────────────────────┐
│  Resultados para: "placa de gesso" (47 produtos)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────┐ PLACA DE GESSO STANDARD 1200X1800X12,5MM              │
│  │ 📦  │ Marca: PLACO | NCM: 68091100 | GTIN: 7891234567890    │
│  └─────┘ [Usar este produto]                                    │
│  ─────────────────────────────────────────────────────────────  │
│  ┌─────┐ PLACA DE GESSO RESISTENTE UMIDADE 1200X1800X12,5MM    │
│  │ 📦  │ Marca: KNAUF | NCM: 68091100 | GTIN: 7891234567891    │
│  └─────┘ [Usar este produto]                                    │
│  ─────────────────────────────────────────────────────────────  │
│  ┌─────┐ PLACA DE GESSO FORRO 600X600X8MM                      │
│  │ 📦  │ Marca: GYPSUM | NCM: 68091100 | GTIN: 7891234567892   │
│  └─────┘ [Usar este produto]                                    │
├─────────────────────────────────────────────────────────────────┤
│  [◀ Anterior]  Página 1 de 5  [Próximo ▶]                       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.10.3 Formulário Preenchido Automaticamente

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ Dados importados do Cosmos                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Código de Barras: [7891234567890_____] (automático)            │
│  Descrição:        [PLACA DE GESSO STANDARD 1200X1800X12,5MM]   │
│  Marca:            [PLACO_______________] (automático)          │
│  NCM:              [68091100____________] (automático)          │
│  CEST:             [1000100_____________] (automático)          │
│  Peso Bruto (kg):  [25,00_______________] (automático)          │
│  Peso Líquido (kg):[24,50_______________] (automático)          │
│  Foto:             [🖼️ Imagem carregada] (automático)           │
│                                                                  │
│  ─────────── DADOS COMPLEMENTARES (preencher) ───────────────   │
│                                                                  │
│  Preço de Venda:   [R$ _______________] (obrigatório)           │
│  Preço de Custo:   [R$ _______________]                         │
│  Estoque Mínimo:   [__________________ unid.]                   │
│  Estoque Máximo:   [__________________ unid.]                   │
│  Localização:      [Corredor __ Prateleira __]                  │
│  Fornecedor:       [Selecione... ▼__________]                   │
│  Unidade:          [UN ▼_________________]                      │
│                                                                  │
│               [Cancelar]  [💾 Salvar Produto]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 9.11 Limites do Plano

| Plano | Consultas/mês | Custo |
|-------|---------------|-------|
| **Gratuito** | 10 | R$ 0 |
| **Básico** | 500 | R$ 49/mês |
| **Profissional** | 5.000 | R$ 149/mês |
| **Enterprise** | Ilimitado | Sob consulta |

> 💡 **Recomendação:** Implementar cache local (Cloudflare KV) para evitar consultas repetidas do mesmo GTIN.

## 9.12 Estratégia de Cache

```typescript
// Estrutura de cache no KV
interface CosmosCache {
  gtin: string;
  description: string;
  brand: string;
  ncm: string;
  cest: string;
  grossWeight: number;
  netWeight: number;
  thumbnail: string;
  avgPrice: number;
  cachedAt: string;
  expiresAt: string; // 30 dias após cache
}
```

## 9.13 Tratamento de Erros

| Código HTTP | Significado | Ação |
|-------------|-------------|------|
| `200` | Sucesso | Usar dados retornados |
| `401` | Token inválido | Verificar token |
| `404` | Produto não encontrado | Permitir cadastro manual |
| `429` | Limite de requisições | Aguardar ou upgrade de plano |
| `500` | Erro interno | Retry com backoff |

## 9.14 Módulos do Planac que Utilizam

| Módulo | Uso |
|--------|-----|
| **Produtos** | Auto cadastro por código de barras |
| **Compras** | Validação de produtos recebidos |
| **Inventário** | Conferência de mercadorias |
| **E-commerce** | Enriquecimento de catálogo com fotos |
| **Fiscal** | Obtenção automática de NCM e CEST |

## 9.15 Integração com IBPT

O Cosmos retorna o NCM do produto, que pode ser usado para consultar o IBPT:

```
Cosmos (GTIN) → NCM → IBPT (NCM + UF) → Alíquotas de tributos
```

Isso permite que ao cadastrar um produto, o sistema já obtenha automaticamente:
- Dados do produto (Cosmos)
- Alíquotas tributárias (IBPT)

## 9.16 Produtos de Drywall/Construção

O Cosmos possui boa cobertura de materiais de construção. NCMs comuns para produtos da Planac:

| NCM | Descrição |
|-----|-----------|
| `6809.11.00` | Chapas, placas e painéis de gesso |
| `6809.19.00` | Outras obras de gesso |
| `7308.90.90` | Outras construções e partes de ferro/aço (perfis) |
| `7216.61.00` | Perfis em U de ferro/aço |
| `7019.90.00` | Fibra de vidro (fitas, mantas) |
| `3214.10.10` | Massas para acabamento |
| `6806.10.00` | Lã de rocha/vidro (isolamento) |

---

# 10. CONFIGURAÇÃO NO CLOUDFLARE

## 10.1 Variáveis de Ambiente (.env)

```bash
# NUVEM FISCAL
NUVEM_FISCAL_CLIENT_ID=AJReDlHes8aBNlTzTF9X
NUVEM_FISCAL_CLIENT_SECRET=3yMYNk2hzBLQihujZf0jfFyAKDRc403v4D1SBDFL
NUVEM_FISCAL_URL=https://api.nuvemfiscal.com.br

# BASELINKER
BASELINKER_TOKEN=8003146-8033898-532H6155RLJVRTS9GX0RKTKI8IO74JQ9PPAL391UOJZ9VGTP8QAT5N42HZMPC5IQ

# CPF.CNPJ
CPFCNPJ_ID=JWXN
CPFCNPJ_TOKEN=fb2868083821ff14de07e91ebac9e959

# CNPJá
CNPJA_API_KEY=35f092ea-0922-4231-bc05-181aa4062731-11a1649b-2933-44ca-9d30-9c862a03ebb3

# SERPRO
SERPRO_CONSUMER_KEY=xulEzvzZKabUXeTQXNYPu9OZwkEa
SERPRO_CONSUMER_SECRET=tbquSwPldBI4A5fCv0ftqFmo_3Ma
SERPRO_CONTRATO_INTEGRA=229986
SERPRO_CONTRATO_RENDA=261076
SERPRO_CONTRATO_FATURAMENTO=261077

# IBPT
IBPT_TOKEN=ePNBuMey5VZ0OCw3ihiQQUAc9EQkKAbN9-TlaoLqAf9rpQVQbgoTMuawhjF_pn_o

# BLUESOFT COSMOS
COSMOS_TOKEN=mK7UKgCycAPW1Nr_7QDkdw
```

## 10.2 Configurar Secrets no Cloudflare

```bash
# Nuvem Fiscal
wrangler secret put NUVEM_FISCAL_CLIENT_ID
wrangler secret put NUVEM_FISCAL_CLIENT_SECRET

# Baselinker
wrangler secret put BASELINKER_TOKEN

# CPF.CNPJ
wrangler secret put CPFCNPJ_ID
wrangler secret put CPFCNPJ_TOKEN

# CNPJá
wrangler secret put CNPJA_API_KEY

# SERPRO
wrangler secret put SERPRO_CONSUMER_KEY
wrangler secret put SERPRO_CONSUMER_SECRET

# IBPT
wrangler secret put IBPT_TOKEN

# Bluesoft Cosmos
wrangler secret put COSMOS_TOKEN

# API Brasil
wrangler secret put APIBRASIL_BEARER
wrangler secret put APIBRASIL_DEVICE_TOKEN
```

---

# 11. API BRASIL

## 10.1 Visão Geral

| Item | Descrição |
|------|-----------|
| **Fornecedor** | APIBrasil Processamento de Dados LTDA |
| **Site** | https://apibrasil.com.br |
| **Documentação** | https://doc.apibrasil.io |
| **GitHub** | https://github.com/APIBrasil |
| **Tipo** | API REST |
| **Autenticação** | Bearer Token + Device Token |
| **Total de APIs** | +50 serviços disponíveis |

## 10.2 O que é a API Brasil

A **API Brasil** é uma plataforma que centraliza dezenas de APIs brasileiras em um único ambiente. Para o ERP Planac, utilizaremos principalmente:

| Categoria | Serviços | Uso no Planac |
|-----------|----------|---------------|
| **Análise de Crédito** | SPC Boa Vista, SCR Bacen, Protesto Nacional, Define Limite | Aprovação de vendas a prazo |
| **WhatsApp** | API Baileys | Comunicação com clientes, pedidos, notificações |

**Benefício para a Planac:** Análise de crédito automatizada antes de aprovar vendas a prazo + Canal de comunicação via WhatsApp para pedidos, orçamentos e notificações.

## 10.3 Credenciais de Acesso

> ⚠️ **IMPORTANTE:** As credenciais devem ser obtidas na plataforma API Brasil após cadastro.

| Item | Descrição |
|------|-----------|
| **Bearer Token** | Token JWT para autenticação (obtido no painel) |
| **Device Token** | Identificador do dispositivo/conexão |
| **User-Agent** | `Planac ERP (contato@planac.com.br)` |

## 10.4 Endpoint Base

```
https://gateway.apibrasil.io/api/v2
```

---

## 10.5 APIs de Análise de Crédito

### 10.5.1 SPC Boa Vista - R$ 5,00/requisição

Consulta no bureau **Boa Vista SCPC** (Serviço Central de Proteção ao Crédito).

| Informação Retornada | Descrição |
|---------------------|-----------|
| **Restrições financeiras** | Dívidas registradas no SPC |
| **Cheques devolvidos** | Histórico de cheques sem fundo |
| **Protestos** | Títulos protestados em cartório |
| **Pendências bancárias** | Pendências com instituições financeiras |

**Quando usar:** Antes de aprovar vendas a prazo para clientes PF ou PJ.

```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/spc/boavista" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_cnpj": "12345678901"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "documento": "12345678901",
    "nome": "JOÃO DA SILVA",
    "situacao": "REGULAR",
    "restricoes": [],
    "cheques_devolvidos": 0,
    "protestos": 0,
    "pendencias_bancarias": []
  }
}
```

---

### 10.5.2 SCR Bacen + Score - R$ 6,19/requisição

Consulta ao **Sistema de Informações de Crédito do Banco Central**.

| Informação Retornada | Descrição |
|---------------------|-----------|
| **Exposição total de crédito** | Quanto o CPF/CNPJ já deve no sistema financeiro |
| **Empréstimos ativos** | Empréstimos em bancos |
| **Financiamentos** | Financiamentos em andamento |
| **Score de risco** | Pontuação de risco baseada no histórico |

**Quando usar:** Análise mais profunda para vendas de alto valor ou crediário.

```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/credito/scr-bacen" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_cnpj": "12345678901"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "documento": "12345678901",
    "exposicao_total": 45000.00,
    "emprestimos_ativos": 2,
    "financiamentos": 1,
    "score": 720,
    "rating": "B",
    "detalhamento": {
      "credito_pessoal": 15000.00,
      "financiamento_veiculo": 30000.00
    }
  }
}
```

---

### 10.5.3 Protesto Nacional - R$ 1,72/requisição

Consulta de **protestos em cartórios de todo Brasil**.

| Informação Retornada | Descrição |
|---------------------|-----------|
| **Títulos protestados** | Lista de títulos em protesto |
| **Valores** | Valor de cada título |
| **Cartórios** | Cartório onde foi protestado |
| **Data do protesto** | Quando ocorreu o protesto |

**Quando usar:** Verificação rápida e barata de protestos antes de qualquer venda a prazo.

```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/credito/protestos" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_cnpj": "12345678901"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "documento": "12345678901",
    "total_protestos": 0,
    "valor_total": 0.00,
    "protestos": []
  }
}
```

---

### 10.5.4 Define Limite PJ Plus - R$ 12,39/requisição

Versão expandida para **análise de crédito de empresas (PJ)**.

| Informação Retornada | Descrição |
|---------------------|-----------|
| **Limite sugerido** | Valor máximo recomendado para crédito |
| **Análise profunda** | Múltiplas variáveis consideradas |
| **Rating** | Classificação de risco |
| **Faturamento estimado** | Estimativa de faturamento da empresa |

**Quando usar:** Análise completa para vendas B2B de alto valor ou abertura de crediário para empresas.

```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/credito/define-limite-pj-plus" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12345678000199"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "cnpj": "12345678000199",
    "razao_social": "EMPRESA EXEMPLO LTDA",
    "limite_sugerido": 50000.00,
    "rating": "A",
    "faturamento_estimado": 500000.00,
    "tempo_atividade_anos": 8,
    "score": 850,
    "analise": {
      "situacao_cadastral": "ATIVA",
      "protestos": 0,
      "acoes_judiciais": 0,
      "socios_restricao": false
    }
  }
}
```

---

## 10.6 API WhatsApp Baileys - R$ 9,90/conexão

### 10.6.1 O que é o Baileys

O **Baileys** é uma biblioteca que conecta ao WhatsApp Web diretamente via WebSocket, sem precisar de navegador ou Selenium. Indicado para:

| Característica | Descrição |
|---------------|-----------|
| **Conexões de longo prazo** | Mantém conexão estável por longos períodos |
| **Automações 24/7** | Ideal para bots que precisam ficar sempre online |
| **Menor custo** | R$ 9,90/conexão (mais barato que outras soluções) |
| **Mais leve** | Não usa navegador, consome menos recursos |

### 10.6.2 Funcionalidades Disponíveis

| Função | Descrição | Uso no Planac |
|--------|-----------|---------------|
| `sendText` | Enviar mensagem de texto | Notificações, confirmações |
| `sendImage` | Enviar imagem | Fotos de produtos, comprovantes |
| `sendDocument` | Enviar documento | PDFs de orçamentos, NF-e |
| `sendAudio` | Enviar áudio | Mensagens de voz |
| `sendVideo` | Enviar vídeo | Tutoriais, demonstrações |
| `sendContact` | Enviar contato | Compartilhar contatos |
| `sendLocation` | Enviar localização | Endereço de entrega |
| `getChats` | Listar conversas | Histórico de atendimentos |
| `getMessages` | Buscar mensagens | Buscar pedidos anteriores |

### 10.6.3 Endpoints WhatsApp Baileys

**Enviar mensagem de texto:**
```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/whatsapp/sendText" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5541999999999",
    "text": "Olá! Seu pedido #12345 foi confirmado. Previsão de entrega: 10/12/2025."
  }'
```

**Enviar documento (PDF do orçamento):**
```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/whatsapp/sendDocument" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5541999999999",
    "document": "https://planac.com.br/orcamentos/12345.pdf",
    "fileName": "Orcamento_12345.pdf",
    "caption": "Segue o orçamento solicitado. Válido por 7 dias."
  }'
```

**Enviar imagem (foto de produto):**
```bash
curl -X POST "https://gateway.apibrasil.io/api/v2/whatsapp/sendImage" \
  -H "Authorization: Bearer {BEARER_TOKEN}" \
  -H "DeviceToken: {DEVICE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5541999999999",
    "image": "https://planac.com.br/produtos/placa-gesso.jpg",
    "caption": "Placa de Gesso Standard 1200x1800x12,5mm - R$ 45,90"
  }'
```

---

## 10.7 Tabela de Preços - Análise de Crédito

| API | Preço/Requisição | Uso Recomendado |
|-----|------------------|-----------------|
| **Protesto Nacional** | R$ 1,72 | Verificação rápida (sempre usar) |
| **SPC Boa Vista** | R$ 5,00 | Vendas a prazo PF/PJ |
| **SCR Bacen + Score** | R$ 6,19 | Vendas de alto valor |
| **Define Limite PJ Plus** | R$ 12,39 | Abertura de crediário B2B |

### 10.7.1 Estratégia de Consulta Recomendada

```mermaid
graph TD
    A[Cliente solicita venda a prazo] --> B{Valor da venda}
    B -->|Até R$ 500| C[Consulta Protesto Nacional - R$ 1,72]
    B -->|R$ 500 a R$ 5.000| D[Protesto + SPC Boa Vista - R$ 6,72]
    B -->|Acima de R$ 5.000| E[Protesto + SPC + SCR Bacen - R$ 12,91]
    B -->|Crediário PJ| F[Define Limite PJ Plus - R$ 12,39]
    C --> G{Tem protesto?}
    D --> H{Tem restrição?}
    E --> I{Score aceitável?}
    F --> J{Limite OK?}
    G -->|Não| K[✅ Aprovar]
    G -->|Sim| L[❌ Negar ou solicitar garantia]
    H -->|Não| K
    H -->|Sim| L
    I -->|Sim| K
    I -->|Não| L
    J -->|Sim| K
    J -->|Não| L
```

---

## 10.8 Fluxos de Uso no Planac

### 10.8.1 Fluxo de Aprovação de Crédito

```
┌─────────────────────────────────────────────────────────────────┐
│                   APROVAÇÃO DE VENDA A PRAZO                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Vendedor cadastra pedido a prazo                            │
│                    ↓                                            │
│  2. Sistema verifica valor do pedido                            │
│                    ↓                                            │
│  3. Sistema consulta APIs conforme valor:                       │
│     • Até R$ 500 → Protesto Nacional                            │
│     • R$ 500-5.000 → Protesto + SPC                             │
│     • > R$ 5.000 → Protesto + SPC + SCR                         │
│     • Crediário PJ → Define Limite PJ Plus                      │
│                    ↓                                            │
│  4. Sistema analisa resultado automaticamente                   │
│                    ↓                                            │
│  ┌─────────────────┴─────────────────┐                         │
│  │                                    │                         │
│  ↓                                    ↓                         │
│  ✅ APROVADO                          ❌ REPROVADO              │
│  • Sem restrições                     • Protestos               │
│  • Score aceitável                    • Restrições SPC          │
│  • Limite OK                          • Score baixo             │
│                                                                  │
│  → Pedido segue para                  → Vendedor notificado     │
│    faturamento                        → Opção: venda à vista    │
│                                       → Opção: solicitar        │
│                                         garantia/entrada        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.8.2 Fluxo WhatsApp - Confirmação de Pedido

```
┌─────────────────────────────────────────────────────────────────┐
│                   NOTIFICAÇÃO VIA WHATSAPP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Pedido confirmado no sistema                                │
│                    ↓                                            │
│  2. Sistema envia WhatsApp automático:                          │
│                                                                  │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ 📦 PLANAC - Confirmação de Pedido                   │     │
│     │                                                      │     │
│     │ Olá João!                                           │     │
│     │                                                      │     │
│     │ Seu pedido #12345 foi confirmado!                   │     │
│     │                                                      │     │
│     │ 📋 Itens:                                           │     │
│     │ • 50x Placa Gesso Standard                          │     │
│     │ • 100x Perfil Montante                              │     │
│     │                                                      │     │
│     │ 💰 Total: R$ 2.450,00                               │     │
│     │ 🚚 Previsão: 10/12/2025                             │     │
│     │                                                      │     │
│     │ Acompanhe: planac.com.br/pedido/12345               │     │
│     └─────────────────────────────────────────────────────┘     │
│                    ↓                                            │
│  3. NF-e emitida → Sistema envia PDF da nota                    │
│                    ↓                                            │
│  4. Mercadoria saiu → Sistema envia rastreamento                │
│                    ↓                                            │
│  5. Entrega realizada → Sistema envia pesquisa NPS              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.9 Configuração no Cloudflare Workers

### 10.9.1 Variáveis de Ambiente

```typescript
// wrangler.toml
[vars]
APIBRASIL_BASE_URL = "https://gateway.apibrasil.io/api/v2"

// Secrets (via wrangler secret put)
// APIBRASIL_BEARER
// APIBRASIL_DEVICE_TOKEN
```

### 10.9.2 Serviço de Análise de Crédito

```typescript
// src/services/credit-analysis.ts

interface CreditAnalysisResult {
  aprovado: boolean;
  score?: number;
  limiteMaximo?: number;
  restricoes: string[];
  custoConsulta: number;
}

export async function analisarCredito(
  cpfCnpj: string, 
  valorVenda: number
): Promise<CreditAnalysisResult> {
  const env = getEnv();
  const headers = {
    'Authorization': `Bearer ${env.APIBRASIL_BEARER}`,
    'DeviceToken': env.APIBRASIL_DEVICE_TOKEN,
    'Content-Type': 'application/json'
  };

  // Estratégia baseada no valor
  let custoTotal = 0;
  const restricoes: string[] = [];

  // 1. Sempre consultar protestos (mais barato)
  const protestos = await fetch(`${env.APIBRASIL_BASE_URL}/credito/protestos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cpf_cnpj: cpfCnpj })
  }).then(r => r.json());
  
  custoTotal += 1.72;

  if (protestos.data.total_protestos > 0) {
    restricoes.push(`${protestos.data.total_protestos} protesto(s) - R$ ${protestos.data.valor_total}`);
  }

  // 2. Para valores maiores, consultar SPC
  if (valorVenda > 500) {
    const spc = await fetch(`${env.APIBRASIL_BASE_URL}/spc/boavista`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cpf_cnpj: cpfCnpj })
    }).then(r => r.json());
    
    custoTotal += 5.00;

    if (spc.data.restricoes?.length > 0) {
      restricoes.push(...spc.data.restricoes.map(r => r.descricao));
    }
  }

  // 3. Para valores altos, consultar SCR Bacen
  let score = null;
  if (valorVenda > 5000) {
    const scr = await fetch(`${env.APIBRASIL_BASE_URL}/credito/scr-bacen`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cpf_cnpj: cpfCnpj })
    }).then(r => r.json());
    
    custoTotal += 6.19;
    score = scr.data.score;

    if (scr.data.score < 500) {
      restricoes.push(`Score baixo: ${scr.data.score}`);
    }
  }

  return {
    aprovado: restricoes.length === 0,
    score,
    restricoes,
    custoConsulta: custoTotal
  };
}
```

---

## 10.10 Comparativo: API Brasil vs Consultas Diretas

| Aspecto | Consulta Direta (SPC/Serasa) | API Brasil |
|---------|------------------------------|------------|
| **Contrato** | Individual com cada bureau | Único |
| **Integração** | Múltiplas APIs diferentes | Uma API unificada |
| **Preço** | Varia (geralmente mais caro) | Competitivo |
| **Burocracia** | Alta (contrato por bureau) | Baixa |
| **Tempo de setup** | Semanas | Minutos |
| **WhatsApp incluso** | Não | Sim |
| **Suporte** | Separado por fornecedor | Unificado |

---

## 10.11 Recomendação de Uso

### Para a Planac (Distribuidora B2B):

| Cenário | APIs Recomendadas | Custo |
|---------|-------------------|-------|
| **Venda rápida à vista** | Nenhuma | R$ 0 |
| **Venda a prazo < R$ 500** | Protesto Nacional | R$ 1,72 |
| **Venda a prazo R$ 500-5.000** | Protesto + SPC | R$ 6,72 |
| **Venda a prazo > R$ 5.000** | Protesto + SPC + SCR | R$ 12,91 |
| **Abertura crediário PJ** | Define Limite PJ Plus | R$ 12,39 |
| **Comunicação cliente** | WhatsApp Baileys | R$ 9,90/mês |

---

## 📝 Histórico de Atualizações

| Data | Alteração |
|------|-----------|
| 07/12/2025 | Adicionada integração #10: API Brasil (Análise de Crédito + WhatsApp Baileys) |
| 07/12/2025 | Expandida documentação Cosmos com todas as formas de busca |
| 07/12/2025 | Adicionada integração #9: Bluesoft Cosmos (Auto Cadastro de Produtos) |
| 07/12/2025 | Adicionada integração #8: IBPT - De Olho no Imposto |
| 06/12/2025 | Adicionadas 6 novas integrações (Baselinker, CPF.CNPJ, CNPJá, SERPRO x3) |
| 06/12/2025 | Documentação inicial Nuvem Fiscal |

---

*Documentação mantida por 🏢 DEV.com - Mesa de Especialistas*
