# SUMÁRIO GERAL - ERP PLANAC

Sistema ERP Completo | Multi-Empresas | Atacado, Varejo e Atacarejo

Versão 3.0 - Estrutura Completa | 28 Capítulos + 4 Anexos

---

## Índice Geral

| Parte | Nome | Capítulos |
|:-----:|:-----|:---------:|
| **1** | Módulos Core | 01-03 |
| **2** | Módulo Comercial | 04 |
| **3** | Módulo Compras | 05 |
| **4** | Módulos Financeiros | 06-09 |
| **5** | Módulos Fiscais e Contábeis | 10-14 |
| **6** | Separação e Expedição | 15 |
| **7** | Módulos de Inteligência | 16 |
| **8** | Marketing, E-commerce e Atendimento | 17-19 |
| **9** | Módulos de Integração | 20-21 |
| **10** | Módulos de Interface | 22-23 |
| **11** | Módulos de Suporte | 24-25 |
| **12** | Recursos Humanos | 26 |
| **-** | Anexos | A-D |

---

## PARTE 1 - MÓDULOS CORE (Fundamentais)

### Capítulo 01 - Gestão de Empresas e Multi-Tenant

- Cadastro de múltiplas empresas/filiais
- Configurações fiscais por empresa (CNPJ, IE, regime tributário)
- Permissões e acessos por empresa
- Consolidação de dados entre empresas
- Parâmetros individuais por empresa

### Capítulo 02 - Cadastros Base

**Clientes (PF/PJ) com integração API CNPJ/CPF:**

- Vendedor padrão do cliente
- Quem indicou (vínculo com Programa de Indicações)
- Múltiplos endereços e contatos
- Tipos: Consumidor, Construtora, Instalador, Revendedor

**Fornecedores:**

- Cadastro completo de fornecedores
- Histórico de compras
- Avaliação de fornecedores

**Produtos e serviços:**

- Categorias e subcategorias
- NCM, CEST, origem
- Múltiplas fotos
- Especificações técnicas

**Produto Kit:**

- Composição (produtos e quantidades)
- Tipo: Virtual (baixa componentes) ou Montado (estoque próprio)
- Precificação: Soma dos itens ou preço promocional
- Foto do kit montado

**Unidades de medida:**

- Cadastro de unidades
- Conversão entre unidades

**Tabelas de preço (atacado/varejo):**

- Preço por quantidade (atacarejo)
- Vigência

### Capítulo 03 - Gestão de Usuários e Permissões

- Controle de acesso por módulo
- Perfis de usuário (admin, vendedor, financeiro, etc.)
- Log de atividades/auditoria
- Autenticação segura (2FA opcional)
- Sessões e dispositivos autorizados

---

## PARTE 2 - MÓDULO COMERCIAL

### Capítulo 04 - Comercial (12 Submódulos)

**Menu da Interface:**

```
COMERCIAL
├── CRM
├── CalcPro
├── Orçamentos
├── Pedido de Venda
├── PDV
├── Programa de Indicações
├── Devolução de Venda
├── Troca de Venda
├── Serviços
├── Consignação
├── Garantia de Produtos
└── Gamificação
```

---

#### 4.1 - CRM (Gestão de Relacionamento)

- Funil de vendas
- Pipeline de oportunidades
- Histórico de interações
- Tarefas e follow-ups
- Segmentação de clientes
- Análise de conversão

#### 4.2 - CalcPro (Calculadoras de Sistemas Construtivos)

- Calculadora de Drywall
- Calculadora de Steel Frame
- Calculadora de Forro
- Calculadora de Revestimento
- Geração automática de lista de materiais
- Conversão em orçamento

#### 4.3 - Orçamentos

**Funcionalidades Básicas:**

- Criação de orçamentos
- Validade do orçamento
- Conversão em pedido de venda
- Histórico de orçamentos por cliente
- Versionamento de orçamentos
- Aprovação de orçamentos
- Envio por email/WhatsApp
- Impressão personalizada

**Mesclar Orçamentos:**

- Seleção múltipla de orçamentos
- Permite mesclar de clientes diferentes
- Alteração do cliente no orçamento principal
- Soma automática de itens iguais
- Regra de preço duplicado parametrizável pelo Admin (menor preço, maior preço, mais recente ou manual)
- Geração de orçamento principal
- Dropdown com orçamentos mesclados vinculados
- Permite mesclar orçamentos já mesclados
- Desmesclar: voltar aos orçamentos originais

**Desmembrar Orçamentos:**

- Seleção de itens para separar
- Funciona em orçamentos mesclados e não mesclados
- Numeração sequencial: #1236.1, #1236.2, #1236.3...
- Vínculo com orçamento pai
- Dropdown com orçamentos filhos (desmembrados)
- Rastreabilidade completa

#### 4.4 - Pedido de Venda

**Funcionalidades Básicas:**

- Pedidos de venda (atacado e varejo)
- Venda direta (sem orçamento) ou conversão de orçamento
- Regras de preço por quantidade (atacarejo)
- Descontos progressivos
- Comissões de vendedores
- Metas de vendas
- Histórico de negociações
- Aprovação de descontos

**Checkbox Bonificado:**

- CFOP automático (5.910/6.910)
- Campo obrigatório: Motivo da bonificação
- Não gera financeiro (contas a receber)
- Aprovação por alçada específica
- Limite de bonificação por período (parametrizável)
- Relatório de bonificações

**Status do Pedido:**

- Aberto (criado, nada faturado/entregue)
- Parcialmente Faturado (algumas NFs emitidas)
- Totalmente Faturado (100% com NF)
- Parcialmente Entregue (algumas entregas feitas)
- Totalmente Entregue (tudo entregue)
- Finalizado (100% faturado + 100% entregue)

**Controle de Entregas/Retiradas:**

- Registro de entregas fracionadas (.E1, .E2, .E3...)
- Tipo: Retirada pelo cliente ou Entrega
- Itens e quantidades por entrega
- Responsável (quem retirou / motorista)
- Vinculação com NF (se emitida)
- Status: Com NF / Sem NF / Consumidor Final
- Histórico completo de movimentações

**Faturamento Flexível:**

- Faturar total (NF de tudo)
- Faturar parcial (seleciona itens/quantidades)
- Faturar por entrega (NF só do que foi na .E1, .E2...)
- Trocar destinatário da NF (emitir em outro CPF/CNPJ)
- Consolidar pedidos em uma NF (juntar A + B + C)
- NF Consumidor Final (não identificado)
- Painel de faturamento pendente
- Alerta de pedidos há X dias sem faturar

**Controle Financeiro da Venda:**

- Opção 1: Recebimento Integral (baixa total na hora)
- Opção 2: Contas a Receber na Venda Pai (parcelas no pedido principal)
- Opção 3: Financeiro por Entrega (gera financeiro em cada .E1, .E2...)
- Opção 4: Sem Financeiro Agora (define depois na entrega)

**Múltiplas Formas de Pagamento:**

- Combinar formas na mesma entrega (PIX + Cartão + Crédito)
- Formas diferentes por entrega
- Parcelamento por forma de pagamento
- Integração automática com Contas a Receber

**Uso de Crédito do Cliente:**

- Alerta automático de crédito disponível na venda
- Opção: Usar crédito na Venda Pai
- Opção: Reservar crédito para Entregas Fracionadas
- Opção: Não usar crédito agora
- Uso parcial do crédito
- Combinar crédito com outras formas de pagamento
- Tipos de crédito: Indicação, Devolução, Bonificação, Adiantamento
- Carteira unificada de créditos do cliente
- Histórico de uso de créditos

**Limite de Crédito:**

- Compromete limite na venda (mesmo sem faturar)
- Libera limite conforme recebimento
- Alerta de estouro de limite
- Bloqueio de venda por limite excedido (parametrizável)

**Desmembrar Vendas:**

- Separar pedido em múltiplos (#1000.1, #1000.2...)
- Seleção de itens para separar
- Funciona igual orçamento
- Rastreabilidade com pedido pai
- Dropdown com vendas filhas

**Visão Consolidada da Venda:**

- Total da venda
- Valor faturado
- Valor entregue
- Valor recebido
- Valor a receber
- Crédito utilizado
- Valor pendente (sem financeiro definido)

**Relatórios de Vendas:**

- Vendas por período
- Vendas por vendedor
- Vendas por cliente
- Faturamento pendente
- Entregas pendentes
- Itens mais vendidos
- Ticket médio
- Conversão orçamento para venda

#### 4.5 - PDV (Ponto de Venda)

- Frente de caixa para varejo
- Integração com balanças e leitores
- Sangria e suprimento de caixa
- Fechamento de caixa
- TEF (cartões de crédito/débito)
- Múltiplas formas de pagamento
- Cupom fiscal eletrônico (NFC-e)
- Gaveta de dinheiro
- Uso de crédito de indicação no PDV
- Consulta de crédito disponível do cliente

#### 4.6 - Programa de Indicações

**Configuração:**

- Quem pode indicar: Cliente ou Parceiro Externo
- Tipo de benefício: Dinheiro ou Crédito na Loja
- Percentual ou valor fixo por indicação
- Aplicar sobre: 1ª Compra ou Todas as Compras
- Momento do crédito: Imediato ou Após Recebimento
- Validade do crédito (dias)
- Limite máximo de crédito por indicação

**Funcionalidades:**

- Cadastro de indicadores
- Vínculo cliente com indicador
- Geração automática de crédito
- Carteira de créditos do cliente
- Uso do crédito em vendas e PDV
- Relatório de indicações
- Ranking de indicadores

#### 4.7 - Devolução de Venda

Cliente devolvendo produto que comprou:

- NF-e de Entrada (devolução)
- Entrada no estoque
- Financeiro: Estorno ou crédito para cliente
- Motivo da devolução (obrigatório)
- Aprovação por alçada
- Vínculo com venda original
- Geração de crédito na carteira do cliente

#### 4.8 - Troca de Venda

Cliente troca produto por outro:

- Devolução + Nova Venda (2 NF-e)
- Entra produto devolvido, sai novo produto
- Diferença a pagar ou receber
- Aprovação por alçada
- Rastreabilidade completa

#### 4.9 - Serviços

- Ordem de Serviço (OS)
- Agendamento de Serviços
- Controle de Técnicos/Equipes
- Checklist de Execução
- Apontamento de Horas
- Materiais Utilizados
- Assinatura Digital do Cliente
- Histórico de Serviços por Cliente
- SLA e Prazos
- NFS-e (Nota Fiscal de Serviço)

#### 4.10 - Consignação

**Envio em Consignação:**

- Romaneio de consignação
- Cliente depositário
- Produtos e quantidades
- Prazo para retorno/acerto
- NF de remessa em consignação

**Controle de Consignação:**

- Estoque em consignação (por cliente)
- Posição de consignação
- Alertas de prazo vencendo

**Acerto de Consignação:**

- Registrar vendas realizadas pelo cliente
- Devolução de itens não vendidos
- Geração de NF de venda (itens vendidos)
- Geração de NF de retorno (itens devolvidos)
- Diferenças e ajustes

**Relatórios:**

- Posição por cliente
- Produtos em consignação
- Histórico de acertos
- Consignações vencidas

#### 4.11 - Garantia de Produtos

**Cadastro de Garantias:**

- Prazo de garantia por produto/categoria
- Tipo: Garantia do fabricante ou da loja
- Condições de garantia
- Documentação necessária

**Controle de Garantias:**

- Produtos em garantia (por cliente/venda)
- Consulta de garantia por número de série
- Consulta de garantia por NF

**Chamado de Garantia:**

- Abertura de chamado pelo cliente
- Descrição do defeito
- Fotos do problema
- Análise técnica
- Laudo técnico
- Aprovação ou reprovação
- Motivo da reprovação

**Resolução:**

- Reparo do produto
- Troca por produto novo
- Devolução do valor
- Crédito para o cliente
- Envio para assistência do fabricante

**Relatórios:**

- Chamados por período
- Taxa de aprovação/reprovação
- Produtos com mais chamados
- Tempo médio de resolução

#### 4.12 - Gamificação

**Metas:**

- Metas individuais por vendedor
- Metas de equipe/filial
- Metas por período (diária, semanal, mensal)
- Tipos de meta:
  - Volume de vendas (R$)
  - Quantidade de pedidos
  - Novos clientes
  - Mix de produtos
  - Margem de lucro
  - Itens específicos

**Sistema de Pontuação:**

- Pontos por venda realizada
- Pontos por meta batida
- Pontos por cliente novo
- Pontos por produto estratégico
- Multiplicadores (campanhas especiais)

**Ranking e Competição:**

- Ranking em tempo real
- Ranking por período
- Ranking por equipe
- Comparativo com período anterior

**Premiações:**

- Cadastro de prêmios
- Regras de premiação
- Resgate de prêmios
- Histórico de premiações

**Dashboard de Performance:**

- Visão individual do vendedor
- Progresso das metas
- Posição no ranking
- Conquistas e badges
- Histórico de performance

---

## PARTE 3 - MÓDULO COMPRAS

### Capítulo 05 - Compras (12 Submódulos)

**Menu da Interface:**

```
COMPRAS
├── Cotações com Fornecedores
├── Pedido de Compra
├── Recebimento de Mercadorias
├── Devolução de Compra
├── Troca de Compra
├── Importação de Documentos (NF-e, NFS-e, CT-e)
├── Análise de Preços por Fornecedor
├── Estoque
├── WMS (Gestão de Armazém)
├── Produção / PCP
├── Gestão de Kits
└── Custos e Precificação
```

---

#### 5.1 - Cotações com Fornecedores

- Solicitação de cotação
- Comparativo de preços
- Aprovação de melhor oferta
- Histórico de cotações

#### 5.2 - Pedido de Compra

- Criação de pedidos
- Checkbox Bonificado (recebimento de bonificação de fornecedor)
- Aprovação por alçada
- Acompanhamento de status
- Vínculo com cotação

#### 5.3 - Recebimento de Mercadorias

- Conferência física vs NF
- Entrada no estoque
- Divergências (faltas, sobras, avarias)
- Etiquetagem
- Lote e validade

#### 5.4 - Devolução de Compra

Devolvendo produto ao fornecedor:

- NF-e de Saída (devolução)
- Saída do estoque
- Financeiro: Estorno ou crédito do fornecedor
- Motivo da devolução

#### 5.5 - Troca de Compra

Trocando produto com fornecedor:

- Devolução + Nova Entrada
- Rastreabilidade completa

#### 5.6 - Importação de Documentos Fiscais

- Importação de NF-e (mercadorias)
- Importação de NFS-e (serviços)
- Importação de CT-e (transporte)
- Manifestação do destinatário
- Vinculação com pedido de compra

#### 5.7 - Análise de Preços por Fornecedor

- Histórico de preços
- Curva de preço
- Comparativo entre fornecedores
- Sugestão de compra

#### 5.8 - Estoque

- Controle de estoque por empresa/filial
- Estoque mínimo/máximo
- Inventário físico
- Transferência entre filiais
- Controle de lote e validade
- Curva ABC
- Reserva de estoque (na venda, mesmo sem faturar)
- Rastreabilidade

#### 5.9 - WMS (Gestão de Armazém)

- Endereçamento de estoque
- FIFO/FEFO
- Conferência por código de barras
- Inventário rotativo
- Cross-docking
- Mapa do armazém

#### 5.10 - Produção / PCP

- Ordem de Produção
- Ficha Técnica (BOM - Bill of Materials)
- Roteiro de Fabricação
- Apontamento de Produção
- Controle de Insumos
- Custo de Produção
- Capacidade Produtiva
- Rastreabilidade de Lotes

#### 5.11 - Gestão de Kits

- Montagem de kits
- Desmontagem de kits
- Baixa automática de componentes (kit virtual)
- Alerta de componente em falta
- Custo do kit

#### 5.12 - Custos e Precificação

**Custos Fixos:**

- Cadastro de custos fixos mensais
- Aluguel, energia, água, telefone
- Salários e encargos
- Seguros
- Manutenção
- Marketing
- Outros custos fixos
- Rateio por filial/departamento

**Custos Variáveis:**

- Comissões de vendas
- Impostos sobre vendas
- Frete de entrega
- Embalagens
- Taxa de cartão
- Outros custos variáveis
- Percentual sobre venda

**Custo de Mercadoria:**

- Custo de aquisição
- Frete de compra
- Impostos recuperáveis
- Custo médio ponderado
- PEPS (Primeiro que Entra, Primeiro que Sai)
- Custo de reposição
- Histórico de custos

**Precificação:**

- Markup por categoria/produto
- Margem de contribuição
- Margem líquida
- Ponto de equilíbrio

**Formação de Preço:**

- Custo + Markup fixo
- Custo + Custos fixos rateados + Margem
- Baseado no preço do concorrente
- Preço sugerido pelo fabricante
- Simulador de preços (what-if)

**Regras de Precificação:**

- Margem mínima por categoria
- Alerta de venda abaixo do custo
- Alerta de margem abaixo do mínimo
- Aprovação para venda com margem reduzida
- Precificação automática em lote

**Análises:**

- DRE por produto
- DRE por categoria
- DRE por cliente
- DRE por vendedor
- Comparativo custo vs preço vs mercado
- Evolução de margens
- Produtos com margem negativa

**Relatórios:**

- Rentabilidade por produto
- Rentabilidade por categoria
- Rentabilidade por cliente
- Custos fixos vs variáveis
- Ponto de equilíbrio
- Simulação de cenários

---

## PARTE 4 - MÓDULOS FINANCEIROS

### Capítulo 06 - Contas a Receber

- Títulos e parcelas
- Boletos (integração bancária)
- PIX (integração)
- Cartões (conciliação)
- Cobrança automatizada
- Régua de cobrança
- Renegociação
- Baixa automática
- Carteira de créditos do cliente

### Capítulo 07 - Contas a Pagar

- Títulos a pagar
- Agendamento de pagamentos
- Pagamento em lote
- Integração bancária (CNAB)
- Aprovação por alçada

### Capítulo 08 - Fluxo de Caixa

- Visão diária/semanal/mensal
- Projeção de caixa
- DRE gerencial
- Centro de custos
- Conciliação bancária

### Capítulo 09 - Bancos e Tesouraria

- Cadastro de contas bancárias
- Movimentações
- Transferências entre contas
- Integração Open Banking

---

## PARTE 5 - MÓDULOS FISCAIS E CONTÁBEIS

### Capítulo 10 - Fiscal / Tributário

- Configuração de NCM/CEST
- Regras de ICMS por estado (ST, diferencial de alíquota)
- PIS/COFINS
- IPI
- Benefícios fiscais
- CFOP automático

### Capítulo 11 - Documentos Fiscais

- Emissão NF-e
- Emissão NFC-e (varejo)
- Emissão NFS-e (serviços)
- CT-e (transporte próprio)
- Carta de Correção
- Cancelamento
- Inutilização

### Capítulo 12 - Obrigações Acessórias

- SPED Fiscal
- SPED Contribuições
- EFD-Reinf
- DCTF

### Capítulo 13 - Contabilidade

**Plano de Contas:**

- Plano de contas padrão
- Personalização do plano
- Contas patrimoniais
- Contas de resultado
- Vinculação automática de lançamentos

**Lançamentos Contábeis:**

- Lançamentos automáticos (vendas, compras, pagamentos)
- Lançamentos manuais
- Lançamentos de ajuste
- Estorno de lançamentos
- Importação de lançamentos

**Livros Contábeis:**

- Livro Diário
- Livro Razão
- Balancete de Verificação

**Demonstrações:**

- DRE (Demonstrativo de Resultado do Exercício)
- Balanço Patrimonial
- DFC (Demonstração de Fluxo de Caixa)
- DMPL (Demonstração das Mutações do Patrimônio Líquido)

**Fechamento:**

- Fechamento mensal
- Fechamento anual
- Apuração de resultado
- Distribuição de lucros

**Integração:**

- Exportação para contador
- Importação de ajustes do contador
- Layouts padrão (SPED Contábil)

### Capítulo 14 - Patrimônio

**Cadastro de Bens:**

- Código do patrimônio (etiqueta)
- Descrição do bem
- Categoria (veículos, equipamentos, móveis, TI, imóveis)
- Data de aquisição
- Valor de aquisição
- Nota fiscal de origem
- Número de série
- Foto do bem
- Localização (filial, departamento, sala)
- Responsável

**Depreciação:**

- Vida útil por categoria
- Taxa de depreciação
- Cálculo automático mensal
- Depreciação acumulada
- Valor residual
- Lançamento contábil automático

**Movimentações:**

- Transferência entre filiais
- Transferência entre departamentos
- Transferência de responsável
- Histórico de movimentações

**Manutenção:**

- Registro de manutenções preventivas
- Registro de manutenções corretivas
- Agendamento de manutenções
- Custos de manutenção
- Histórico por bem

**Seguros:**

- Apólice de seguro
- Vigência
- Valor segurado
- Alertas de vencimento

**Baixa de Bens:**

- Venda do bem
- Doação
- Perda/Sinistro
- Descarte
- Lançamento contábil de baixa

**Inventário:**

- Inventário físico de patrimônio
- Conferência por código de barras/QR Code
- Divergências (sobras, faltas)
- Relatório de inventário

**Relatórios:**

- Relação de bens por categoria
- Relação de bens por localização
- Relação de bens por responsável
- Bens totalmente depreciados
- Depreciação por período
- Valor patrimonial total

---

## PARTE 6 - SEPARAÇÃO E EXPEDIÇÃO

### Capítulo 15 - Separação e Expedição

- Separação de pedidos (picking)
- Conferência de itens
- Romaneio de carga
- Etiquetas de volume
- Roteirização de entregas
- Controle de frota
- Integração com transportadoras
- Cálculo de frete
- Registro de entregas fracionadas (.E1, .E2...)

**App do Motorista/Entregador:**

- Login do motorista
- Lista de entregas do dia
- Roteiro otimizado (Waze/Google Maps)
- GPS em tempo real (compartilhado com cliente)
- Check-in na entrega (chegou no local)
- Foto do comprovante de entrega
- Assinatura digital do recebedor
- Registro de ocorrências (ausente, recusado, endereço errado)
- Baixa automática da entrega
- Notificação automática para o cliente

---

## PARTE 7 - MÓDULOS DE INTELIGÊNCIA

### Capítulo 16 - BI, Dashboards e Relatórios Gerenciais

**16.1 - Dashboards Executivos:**

**Dashboard do CEO/Diretor:**

- Visão consolidada em 1 página
- Faturamento (período, meta, variação)
- Crescimento MoM (mês a mês) e YoY (ano a ano)
- Top 10 clientes por faturamento
- Top 10 produtos mais vendidos
- Pipeline comercial (funil de vendas)
- Mapa de calor de vendas por região/estado
- Alertas críticos (clientes em risco, metas abaixo, exceções)
- Indicadores: Ticket Médio, Conversão, NPS

**Dashboard do CFO/Financeiro:**

- Posição de caixa atual
- Fluxo de caixa realizado vs projetado
- Contas a receber (aging: 0-30, 31-60, 61-90, >90 dias)
- Contas a pagar (vencimentos próximos)
- Inadimplência % e evolução
- EBITDA e margens
- DRE resumido do período
- Indicadores: PMR, PMP, PME, Liquidez

**Dashboard Comercial:**

- Vendas do dia/semana/mês
- Ranking de vendedores
- Atingimento de metas (individual e equipe)
- Orçamentos pendentes de aprovação
- Pedidos aguardando faturamento
- Entregas pendentes
- Comissões a pagar
- Indicadores: Conversão orçamento→venda, Ticket médio

**Dashboard de Compras/Estoque:**

- Posição de estoque (valor e quantidade)
- Produtos abaixo do estoque mínimo
- Produtos sem giro (parados)
- Pedidos de compra pendentes
- Recebimentos previstos
- Curva ABC de estoque
- Giro de estoque

**Dashboard E-commerce:**

- Vendas online (tempo real)
- Visitantes e conversão
- Carrinho abandonado
- Origem de tráfego
- Top produtos online
- Pedidos aguardando envio

**16.2 - Relatórios para CFO/Financeiro:**

**Demonstrativos Contábeis:**

- DRE - Demonstrativo de Resultado (Mensal/Trimestral/Anual)
- DRE Comparativo (período atual vs anterior)
- DRE por Centro de Custo/Filial
- Balanço Patrimonial
- DFC - Demonstração de Fluxo de Caixa (Método Direto e Indireto)
- DMPL - Demonstração das Mutações do Patrimônio Líquido

**Fluxo de Caixa:**

- Fluxo de Caixa Realizado (por período)
- Fluxo de Caixa Projetado (30/60/90 dias)
- Posição Diária de Caixa
- Movimentação por Conta Bancária
- Conciliação Bancária

**Indicadores Financeiros:**

- EBITDA e Margem EBITDA
- Margem Bruta, Operacional e Líquida
- ROI (Retorno sobre Investimento)
- ROE (Retorno sobre Patrimônio)
- ROA (Retorno sobre Ativos)
- ROIC (Retorno sobre Capital Investido)

**Indicadores de Liquidez:**

- Liquidez Corrente
- Liquidez Seca
- Liquidez Imediata
- Liquidez Geral

**Capital de Giro:**

- NCG - Necessidade de Capital de Giro
- Capital Circulante Líquido
- Ciclo Operacional
- Ciclo Financeiro

**Prazos Médios:**

- PMR - Prazo Médio de Recebimento
- PMP - Prazo Médio de Pagamento
- PME - Prazo Médio de Estoque
- Ciclo de Caixa

**Recebíveis:**

- Aging de Contas a Receber (estratificado por dias)
- Análise de Inadimplência (% e evolução)
- PDD - Provisão para Devedores Duvidosos
- Recebíveis por Cliente
- Recebíveis por Vendedor
- Títulos Vencidos Detalhado

**Contas a Pagar:**

- Aging de Contas a Pagar
- Concentração de Fornecedores
- Pagamentos Previstos (próximos 30 dias)
- Histórico de Pagamentos

**Rentabilidade:**

- Rentabilidade por Produto
- Rentabilidade por Categoria
- Rentabilidade por Cliente
- Rentabilidade por Canal de Venda
- Rentabilidade por Filial
- Rentabilidade por Vendedor
- Margem de Contribuição

**Custos:**

- Custo por Unidade Vendida
- Custos Fixos vs Variáveis
- Evolução de Custos (histórico)
- Composição de Custos
- Custo da Mercadoria Vendida (CMV)

**Ponto de Equilíbrio:**

- Break-even Geral da Empresa
- Break-even por Produto
- Break-even por Filial
- Simulador de Cenários

**Orçamento (Budget):**

- Orçado vs Realizado (por conta)
- Variações (favoráveis e desfavoráveis)
- Forecast (projeção atualizada)
- Budget por Centro de Custo
- Budget por Filial

**Endividamento:**

- Dívida Bruta e Líquida
- Dívida/Patrimônio Líquido
- Dívida/EBITDA
- Cobertura de Juros
- Cronograma de Amortização

**Tributário:**

- Impostos a Pagar (por tipo)
- Créditos Tributários Acumulados
- Carga Tributária % sobre Faturamento
- Apuração de ICMS/PIS/COFINS/ISS

**16.3 - Relatórios para CEO/Executivo:**

**Faturamento:**

- Faturamento por Período (dia/semana/mês/ano)
- Faturamento por Região/Estado/Cidade
- Faturamento por Canal (Loja/E-commerce/Representante)
- Faturamento por Vendedor
- Faturamento por Filial
- Evolução MoM e YoY
- Faturamento vs Meta

**Crescimento:**

- Crescimento vs Ano Anterior
- Crescimento vs Meta
- Tendência de Crescimento
- Projeção de Faturamento

**Performance Comercial:**

- Ticket Médio (geral e por canal)
- Conversão de Leads (CRM)
- Taxa de Fechamento
- Tempo Médio de Fechamento
- Velocidade do Funil

**Clientes:**

- Top 10/20/50 Clientes por Faturamento
- Novos Clientes por Período
- Clientes Perdidos (Churn)
- Clientes Reativados
- Concentração de Faturamento (Pareto)
- Frequência de Compra
- Recência de Compra

**Indicadores de Valor:**

- LTV - Lifetime Value (valor vitalício do cliente)
- CAC - Custo de Aquisição de Cliente
- Relação LTV/CAC
- Payback de Aquisição

**Produtos:**

- Top 10/20 Produtos Mais Vendidos
- Mix de Vendas (participação por categoria)
- Curva ABC de Produtos
- Produtos sem Giro
- Lançamentos e Performance
- Cross-sell e Up-sell

**Equipes:**

- Ranking de Vendedores
- Atingimento de Metas (% individual)
- Produtividade (vendas por vendedor)
- Comparativo entre Equipes
- Evolução de Performance

**Pipeline/Funil:**

- Valor Total em Prospecção
- Oportunidades por Etapa
- Previsão de Fechamento
- Taxa de Conversão por Etapa
- Tempo Médio por Etapa

**Satisfação:**

- NPS - Net Promoter Score
- Avaliações de Clientes
- Reclamações e Tratativas
- Tempo de Resposta

**Operacional:**

- Pedidos Pendentes de Faturamento
- Entregas Atrasadas
- Estoque Crítico (abaixo do mínimo)
- Devoluções e Trocas
- Ocorrências de Entrega

**Mapa de Calor:**

- Vendas por Estado (mapa visual)
- Vendas por Cidade (mapa visual)
- Concentração Geográfica

**Comparativos:**

- Filial vs Filial
- Canal vs Canal
- Vendedor vs Vendedor
- Período vs Período
- Produto vs Produto

**16.4 - Relatórios por Área/Módulo:**

**Comercial:**

- Vendas por Período
- Vendas por Vendedor
- Vendas por Cliente
- Vendas por Produto/Categoria
- Comissões a Pagar
- Bonificações Concedidas
- Devoluções e Trocas
- Consignações (posição e acertos)
- Orçamentos Emitidos vs Convertidos
- Pedidos por Status
- Garantias (chamados e custos)

**Compras:**

- Compras por Período
- Compras por Fornecedor
- Histórico de Preços por Produto
- Comparativo de Fornecedores
- Pedidos de Compra Pendentes
- Recebimentos Realizados
- Divergências de Recebimento
- Bonificações Recebidas

**Estoque:**

- Posição de Estoque (quantidade e valor)
- Estoque por Filial/Armazém
- Estoque por Categoria
- Giro de Estoque
- Estoque Parado (sem movimento)
- Produtos Abaixo do Mínimo
- Produtos Acima do Máximo
- Inventário (posição e divergências)
- Valorização de Estoque (custo médio/PEPS)
- Movimentação de Estoque
- Transferências entre Filiais
- Curva ABC

**Financeiro:**

- Contas a Receber (analítico e sintético)
- Contas a Pagar (analítico e sintético)
- Recebimentos por Forma de Pagamento
- Pagamentos por Tipo
- Conciliação Bancária
- Movimentação de Caixa
- Cheques Emitidos/Recebidos
- Créditos de Clientes (carteira)

**Fiscal:**

- NF-e Emitidas
- NFC-e Emitidas
- NFS-e Emitidas
- NF-e Canceladas
- Apuração de ICMS
- Apuração de PIS/COFINS
- Livros Fiscais
- Obrigações Acessórias

**RH:**

- Headcount (quadro de funcionários)
- Turnover (rotatividade)
- Absenteísmo
- Custo de Pessoal
- Horas Extras
- Banco de Horas
- Férias Vencidas/a Vencer
- Aniversariantes

**E-commerce:**

- Vendas Online por Período
- Taxa de Conversão
- Carrinho Abandonado (valor e quantidade)
- Origem de Tráfego
- Produtos Mais Vistos vs Mais Vendidos
- Tempo Médio de Navegação
- Avaliações de Produtos

**Expedição/Logística:**

- Entregas Realizadas
- Entregas Pendentes
- Prazo Médio de Entrega
- Ocorrências de Entrega
- Custo de Frete (próprio e terceiro)
- Reentregas
- Performance por Motorista
- Roteirização

**16.5 - KPIs e Indicadores:**

**Matriz de KPIs por Perfil:**

| KPI | CEO | CFO | Gerente Comercial | Gerente Compras | Gerente RH |
|-----|-----|-----|-------------------|-----------------|------------|
| Faturamento | ✅ | ✅ | ✅ | - | - |
| EBITDA | ✅ | ✅ | - | - | - |
| Margem Bruta | ✅ | ✅ | ✅ | ✅ | - |
| Margem Líquida | ✅ | ✅ | - | - | - |
| Ticket Médio | ✅ | - | ✅ | - | - |
| Conversão | ✅ | - | ✅ | - | - |
| Inadimplência | ✅ | ✅ | ✅ | - | - |
| Giro de Estoque | - | ✅ | - | ✅ | - |
| PMR/PMP/PME | - | ✅ | - | ✅ | - |
| NPS | ✅ | - | ✅ | - | - |
| Turnover | ✅ | ✅ | - | - | ✅ |
| Custo por Pedido | - | ✅ | - | ✅ | - |
| LTV/CAC | ✅ | ✅ | ✅ | - | - |

**Alertas Automáticos:**

- Meta de vendas abaixo de X%
- Inadimplência acima de X%
- Estoque crítico (abaixo do mínimo)
- Fluxo de caixa negativo projetado
- Títulos vencidos há mais de X dias
- Pedidos sem faturamento há mais de X dias
- Entregas atrasadas
- Clientes inativos há mais de X dias
- Certificado digital próximo do vencimento
- Contratos próximos do vencimento

**16.6 - Funcionalidades do BI:**

**Visualização:**

- Gráficos interativos (linha, barra, pizza, área, funil)
- Tabelas dinâmicas (pivot)
- Mapas geográficos (calor, bolhas)
- Gauges (velocímetros)
- Sparklines (mini-gráficos)
- Cards de KPIs

**Filtros e Drill-down:**

- Filtros por período
- Filtros por filial/empresa
- Filtros por vendedor/equipe
- Filtros por cliente/categoria
- Drill-down (de ano para mês para dia)
- Drill-through (do resumo para o detalhe)

**Personalização:**

- Dashboards personalizáveis por usuário
- Widgets arrastáveis
- Favoritos
- Layouts salvos
- Cores e temas

**Exportação:**

- PDF (relatórios formatados)
- Excel (dados brutos)
- CSV
- Impressão
- Agendamento de envio por e-mail

**Integração:**

- Power BI (exportação de dados)
- Google Data Studio
- Metabase
- API de dados para ferramentas externas

**Histórico:**

- Dados históricos (mínimo 5 anos)
- Comparativos entre períodos
- Tendências e projeções
- Sazonalidade

---

## PARTE 8 - MARKETING, E-COMMERCE E ATENDIMENTO

### Capítulo 17 - OmniPro (Atendimento Multicanal)

- WhatsApp Business API
- Instagram Direct
- Facebook Messenger
- Chat do site
- Chatbot com IA
- Fila de atendimento
- Histórico unificado
- Transferência entre atendentes

### Capítulo 18 - E-commerce (B2B + B2C)

**18.1 - Configurações Gerais:**

- Domínio e SSL
- Identidade visual (logo, cores, fontes)
- Páginas institucionais (Sobre, Contato, etc.)
- Políticas (privacidade, troca, entrega)
- SEO básico (meta tags, sitemap, robots)
- Blog integrado

**18.2 - Catálogo de Produtos:**

- Sincronização automática com cadastro do ERP
- Categorias e subcategorias
- Filtros avançados (marca, preço, características)
- Múltiplas fotos e vídeos por produto
- Especificações técnicas detalhadas
- Produtos relacionados e similares
- Kits e combos
- Produtos sob consulta (sem preço visível)
- Estoque em tempo real
- Avise-me quando chegar

**18.3 - Vitrine B2C (Consumidor Final):**

- Cadastro simplificado (CPF, e-mail, telefone)
- Preço de varejo
- Carrinho de compras
- Lista de desejos
- Avaliações e comentários de produtos
- Comparador de produtos

**18.4 - Portal B2B (Atacado/Revenda):**

- Cadastro com aprovação prévia (CNPJ)
- Análise de crédito integrada
- Aprovação de pedido por alçada (mesmo com crédito aprovado)
- Tabelas de preço por cliente/grupo
- Quantidade mínima por produto
- Desconto progressivo por volume
- Pedido mínimo (valor ou quantidade)
- Limite de crédito visível no painel
- Saldo de crédito (indicações, devoluções)
- Vendedor vinculado ao cliente
- Cotação online (solicitar orçamento)
- Pedido recorrente (repetir último pedido)
- Múltiplas listas de compras salvas
- Histórico de compras e preços
- Download de XML das notas fiscais
- Múltiplos endereços de entrega

**18.5 - Área do Cliente (Minha Conta):**

- Meus pedidos (status, histórico completo)
- Rastreamento de entregas
- Rastreamento em tempo real no mapa (GPS do motorista)
- Previsão de chegada atualizada
- Segundas vias de boletos
- Minhas notas fiscais (download XML/PDF)
- Meus orçamentos/cotações
- Meu limite de crédito (B2B)
- Meu saldo de créditos (indicações, devoluções)
- Meus endereços
- Meus dados cadastrais
- Minhas listas de compras (B2B)
- Repetir pedido anterior
- Abrir chamado/suporte
- Histórico de atendimentos
- Programa de indicação (meu link, minhas indicações)
- Trocar senha
- Preferências de notificação

**18.6 - Área do Vendedor/Representante:**

- Login como representante
- Selecionar cliente para fazer pedido
- Ver carteira de clientes
- Acompanhar pedidos dos clientes
- Comissões a receber
- Metas e performance

**18.7 - Formas de Pagamento:**

- Checkout transparente
- PIX (com QR Code e copia/cola)
- Cartão de crédito (parcelado)
- Cartão de débito
- Boleto bancário
- Duas ou mais formas combinadas
- Uso de crédito do cliente (indicação, devolução)

**Exclusivo B2B:**

- Faturamento (28/35/42/56 dias)
- Boleto parcelado
- Cartão corporativo

**18.8 - Frete e Logística:**

- Integração com Correios
- Integração com transportadoras
- Tabela de frete própria
- Frete grátis (regras configuráveis por valor/região)
- Retirada na loja/CD
- Entrega agendada
- Frete CIF / FOB (B2B)
- Rastreamento integrado (código de rastreio)
- Rastreamento em tempo real no mapa (Google Maps)
- GPS dos motoristas/entregadores
- Notificação automática (saiu para entrega, chegando)
- Múltiplos CDs (estoque por região)

**18.9 - Recuperação e Conversão:**

- Carrinho abandonado (e-mail automático)
- Cupons de desconto
- Promoções (compre X leve Y, desconto progressivo)
- Banners rotativos
- Vitrines personalizadas (mais vendidos, lançamentos)
- Pop-ups de captura (primeira compra)
- Contador de urgência (promoção por tempo limitado)

**18.10 - Integrações:**

- Sincronização com ERP PLANAC (estoque, preços, pedidos, clientes)
- Marketplaces (estrutura preparada para futuro)
  - Mercado Livre
  - Amazon
  - Shopee
  - Magalu
- Google Shopping / Merchant Center
- Facebook/Instagram Shopping
- Comparadores de preço (Buscapé, Zoom)
- WhatsApp (botão flutuante e notificações)
- Google Analytics / Tag Manager
- Meta Pixel (Facebook/Instagram Ads)

**18.11 - Relatórios e Analytics:**

- Vendas por período
- Vendas por categoria/produto
- Produtos mais vendidos
- Clientes que mais compram
- Carrinho abandonado (taxa e valor)
- Taxa de conversão
- Origem do tráfego
- Ticket médio
- Novos clientes vs recorrentes
- Dashboard em tempo real

**18.12 - App Mobile (PWA):**

- Versão responsiva otimizada
- Progressive Web App (instalar na tela inicial)
- Notificações push
- Navegação offline (catálogo em cache)

### Capítulo 19 - Google e Meta

**Google:**

- Analytics
- Tag Manager
- Search Console
- Merchant Center
- Google Ads
- Google Meu Negócio

**Meta:**

- Ads Manager
- Conversions API (CAPI)
- Catálogo de produtos
- Lookalike audiences
- Instagram Shopping

---

## PARTE 9 - MÓDULOS DE INTEGRAÇÃO

### Capítulo 20 - Integrações Externas

- Marketplaces (Mercado Livre, Amazon, Shopee)
- APIs de consulta (CNPJ, CEP, IBGE)
- Gateways de pagamento
- Contabilidade (exportação)
- ERP legado (migração)
- WhatsApp Business API
- Bancos (Open Banking, CNAB)

### Capítulo 21 - Automação e Workflows

- Regras de negócio automatizadas
- Notificações e alertas (email, SMS, push)
- Aprovações em cadeia
- Agendamento de tarefas
- Webhooks personalizados
- Filas de processamento

---

## PARTE 10 - MÓDULOS DE INTERFACE

### Capítulo 22 - Portal do Cliente

(Funcionalidades migradas para o Capítulo 18 - E-commerce, seção 18.5 - Área do Cliente)

O acesso do cliente ao portal acontece através do mesmo login do E-commerce, na área "Minha Conta".

### Capítulo 23 - App Mobile (Força de Vendas)

- Cadastro de clientes em campo
- Pedidos offline (sincronização)
- Consulta de estoque/preços
- Roteiro de visitas
- Catálogo digital
- Assinatura na entrega
- GPS e check-in

---

## PARTE 11 - MÓDULOS DE SUPORTE

### Capítulo 24 - Configurações do Sistema

- Parâmetros gerais
- Personalização de campos
- Numeração de documentos
- Backup e restauração
- Logs do sistema
- Importação/exportação de dados

**Configurações específicas:**

- Regra de preço duplicado (mesclar orçamentos)
- Limite de bonificação
- Validade de crédito de indicação
- Dias para alerta de faturamento pendente

### Capítulo 25 - Agenda e Calendário

**Agenda Pessoal:**

- Compromissos individuais
- Tarefas pessoais
- Lembretes
- Visualização dia/semana/mês

**Agenda de Equipe:**

- Compromissos compartilhados
- Reuniões
- Eventos da empresa
- Visualização por equipe/departamento

**Agenda Comercial:**

- Visitas a clientes agendadas
- Follow-ups programados
- Retornos de orçamentos
- Integração com CRM

**Recursos:**

- Sincronização com Google Calendar
- Notificações e lembretes
- Convites por e-mail
- Confirmação de presença
- Anexos em compromissos
- Recorrência de eventos

### Capítulo 26 - Central de Ajuda

- Documentação do sistema
- Tutoriais em vídeo
- Chat de suporte
- Tickets de atendimento
- Base de conhecimento
- Atualizações do sistema

---

## PARTE 12 - RECURSOS HUMANOS

### Capítulo 27 - Gestão de RH

**27.1 - Cadastro de Colaboradores:**

- Dados pessoais (nome, CPF, RG, endereço)
- Dados contratuais (cargo, departamento, data admissão)
- Documentos digitalizados
- Dependentes
- Dados bancários
- Histórico de cargos/salários
- Foto do colaborador

**27.2 - Estrutura Organizacional:**

- Departamentos e setores
- Cargos e funções
- Hierarquia (organograma)
- Centros de custo por departamento

**27.3 - Controle de Ponto:**

- Registro de ponto (entrada, saída, intervalos)
- Ponto eletrônico integrado
- Ponto pelo App do Colaborador
- Ponto por geolocalização (externo)
- Banco de horas
- Horas extras
- Faltas e atrasos
- Abonos
- Espelho de ponto
- Fechamento mensal

**27.4 - Férias e Afastamentos:**

- Programação de férias
- Saldo de férias
- Solicitação de férias (pelo app)
- Aprovação de férias
- Afastamentos (atestado, licenças)
- Controle de atestados médicos

**27.5 - Folha de Pagamento:**

- Cálculo automático de salários
- Horas extras e adicionais
- Descontos (INSS, IRRF, VT, VR, faltas)
- Benefícios
- Comissões (integração com vendas)
- 13º salário
- Rescisão
- Geração de holerites
- Integração contábil

**27.6 - Benefícios:**

- Vale transporte
- Vale refeição/alimentação
- Plano de saúde
- Plano odontológico
- Seguro de vida
- Outros benefícios

**27.7 - Recrutamento e Seleção:**

- Banco de currículos
- Vagas abertas
- Candidaturas
- Triagem de currículos
- Agendamento de entrevistas
- Avaliação de candidatos
- Histórico de processos seletivos

**27.8 - Treinamentos:**

- Cadastro de treinamentos
- Programação de treinamentos
- Inscrições
- Lista de presença
- Certificados
- Histórico por colaborador
- Treinamentos obrigatórios (NR)

**27.9 - Avaliação de Desempenho:**

- Ciclos de avaliação
- Metas individuais
- Autoavaliação
- Avaliação do gestor
- Feedback 360º
- Plano de desenvolvimento individual (PDI)

**27.10 - App do Colaborador:**

- Login seguro (CPF + senha)
- Bater ponto pelo celular
- Ponto com geolocalização e foto
- Ver espelho de ponto
- Solicitar férias
- Solicitar abono/justificativa
- Ver holerites (PDF)
- Ver informe de rendimentos
- Atualizar dados cadastrais
- Enviar atestados médicos (foto)
- Ver escala de trabalho
- Ver comunicados da empresa
- Canal de denúncias (anônimo)
- Chat com RH
- Notificações push

---

## PARTE 13 - CONTRATOS

### Capítulo 28 - Gestão de Contratos

**28.1 - Contratos com Clientes:**

- Contrato de fornecimento
- Contrato de prestação de serviços
- Acordo comercial
- Condições especiais (preços, prazos, descontos)
- Volume mínimo acordado
- Exclusividade

**28.2 - Contratos com Fornecedores:**

- Contrato de fornecimento
- Acordo de exclusividade
- Condições de pagamento especiais
- Bonificações acordadas
- Metas de compra

**28.3 - Cadastro de Contratos:**

- Número do contrato
- Partes envolvidas
- Objeto do contrato
- Valor total ou estimado
- Vigência (início e fim)
- Condições de renovação
- Cláusulas especiais
- Documentos anexados (PDF do contrato)
- Responsável interno

**28.4 - Gestão de Vigência:**

- Alertas de vencimento (30, 60, 90 dias)
- Renovação automática
- Renovação manual
- Encerramento de contrato
- Histórico de renovações

**28.5 - Aditivos:**

- Aditivo de prazo
- Aditivo de valor
- Aditivo de escopo
- Histórico de aditivos
- Versionamento do contrato

**28.6 - Acompanhamento:**

- Cumprimento de metas
- Volumes realizados vs acordados
- Alertas de descumprimento
- Relatório de performance do contrato

**28.7 - Assinatura Digital:**

- Integração com plataforma de assinatura
- Assinatura eletrônica
- Certificado digital
- Validade jurídica
- Histórico de assinaturas

**28.8 - Relatórios:**

- Contratos vigentes
- Contratos a vencer
- Contratos por cliente/fornecedor
- Valores contratados
- Performance de contratos

---

## ANEXOS

### Anexo A - Arquitetura Técnica

Stack tecnológica, infraestrutura, servidores, banco de dados, APIs

### Anexo B - Modelo de Dados

Diagrama Entidade-Relacionamento, principais tabelas

### Anexo C - Glossário de Termos

Definições: CFOP, NCM, CEST, ST, NF-e, etc.

### Anexo D - Roadmap de Implementação

Fases de implantação, ordem de módulos, cronograma

---

## Resumo da Estrutura

| Info | Valor |
|------|-------|
| Total de Capítulos | 28 |
| Total de Partes | 13 |
| Total de Anexos | 4 |
| Submódulos COMERCIAL | 12 |
| Submódulos COMPRAS | 12 |
| Versão | 3.1 |

---

## Histórico de Versões

| Versão | Data | Alterações |
|--------|------|------------|
| 3.1 | 02/12/2025 | Capítulo 16 expandido: BI, Dashboards e Relatórios Gerenciais (CFO, CEO, por área) |
| 3.0 | 29/11/2025 | Adicionado: Custos/Precificação, Contabilidade, Patrimônio, Contratos, Consignação, Garantia, Gamificação, Agenda |
| 2.1 | 29/11/2025 | Adicionado: E-commerce B2B+B2C, RH com App do Colaborador, Rastreamento GPS |
| 2.0 | 28/11/2025 | Reorganização: 23 capítulos, menus COMERCIAL e COMPRAS |
| 1.0 | 28/11/2025 | Estrutura inicial: 34 capítulos |

---

PLANAC Distribuidora - Sistema ERP - Documentação Oficial
