# 📋 Regras de Negócio - ERP PLANAC

Documentação completa das regras de negócio do sistema, organizadas por módulo.

**Status: ✅ Completo**

---

## Índice

| Módulo | Qtd Regras |
|--------|------------|
| [1. Core (Multi-Empresa)](#1-core-multi-empresa) | 12 |
| [2. Cadastros Base](#2-cadastros-base) | 25 |
| [3. Comercial](#3-comercial) | 99 |
| [4. Compras](#4-compras) | 39 |
| [5. Financeiro](#5-financeiro) | 30 |
| [6. Fiscal](#6-fiscal) | 20 |
| [7. Estoque](#7-estoque) | 18 |
| [8. Expedição](#8-expedição) | 15 |
| [9. E-commerce](#9-e-commerce) | 25 |
| [10. RH](#10-rh) | 20 |
| [11. Contratos](#11-contratos) | 10 |
| **TOTAL** | **313** |

---

## 1. CORE (Multi-Empresa)

### 1.1 Gestão de Empresas

| ID | Regra | Descrição |
|----|-------|-----------|
| CORE-01 | Multi-Tenant | O sistema suporta múltiplas empresas/filiais com CNPJs independentes |
| CORE-02 | Isolamento de dados | Cada empresa possui dados isolados (clientes, produtos, estoque, financeiro) |
| CORE-03 | Consolidação | Permite consolidar relatórios de todas as empresas para visão gerencial |
| CORE-04 | Configuração individual | Cada empresa pode ter parâmetros fiscais e comerciais próprios |
| CORE-05 | Usuário multi-empresa | Um usuário pode ter acesso a múltiplas empresas com perfis diferentes |
| CORE-06 | Transferência entre filiais | Permite transferir estoque entre filiais com NF de transferência |

### 1.2 Usuários e Permissões

| ID | Regra | Descrição |
|----|-------|-----------|
| CORE-07 | Perfis de acesso | Sistema baseado em perfis (Admin, Gerente, Vendedor, Financeiro, etc.) |
| CORE-08 | Permissões granulares | Cada perfil define permissões por módulo e ação (Ver, Criar, Editar, Excluir) |
| CORE-09 | Alçadas de aprovação | Aprovações seguem hierarquia definida (valores e tipos de operação) |
| CORE-10 | Autenticação 2FA | Autenticação em dois fatores opcional por usuário |
| CORE-11 | Log de auditoria | Todas as ações são registradas com usuário, data/hora e IP |
| CORE-12 | Sessão segura | Sessão expira após tempo de inatividade configurável |

---

## 2. CADASTROS BASE

### 2.1 Clientes

| ID | Regra | Descrição |
|----|-------|-----------|
| CAD-01 | Tipos de cliente | PF (CPF) ou PJ (CNPJ) com campos específicos para cada |
| CAD-02 | Classificação | Tipos: Consumidor, Construtora, Instalador, Revendedor |
| CAD-03 | Vendedor padrão | Cliente pode ter vendedor fixo vinculado |
| CAD-04 | Indicador | Campo para registrar quem indicou o cliente |
| CAD-05 | Múltiplos endereços | Cliente pode ter vários endereços de entrega |
| CAD-06 | Múltiplos contatos | Cliente pode ter vários contatos (telefone, email) |
| CAD-07 | Limite de crédito | Cliente PJ pode ter limite de crédito definido |
| CAD-08 | Tabela de preço | Cliente vinculado a uma tabela de preço (Varejo, Atacado, Especial) |
| CAD-09 | Validação CNPJ | Consulta automática de dados via API da Receita Federal |
| CAD-10 | Bloqueio automático | Cliente com título vencido > X dias é bloqueado automaticamente |

### 2.2 Produtos

| ID | Regra | Descrição |
|----|-------|-----------|
| CAD-11 | Categorização | Produtos organizados em categorias e subcategorias |
| CAD-12 | Classificação fiscal | NCM, CEST e origem obrigatórios |
| CAD-13 | Múltiplas fotos | Produto pode ter várias fotos |
| CAD-14 | Especificações técnicas | Campos para especificações do produto |
| CAD-15 | Unidade de medida | Cada produto tem unidade principal (UN, M, M², KG, CX) |
| CAD-16 | Conversão de unidades | Suporta conversão (ex: 1 CX = 12 UN) |
| CAD-17 | Código de barras | EAN/GTIN para leitura por scanner |
| CAD-18 | Produto inativo | Produto inativo não aparece em vendas, mas mantém histórico |

### 2.3 Kits

| ID | Regra | Descrição |
|----|-------|-----------|
| CAD-19 | Composição | Kit é formado por produtos e quantidades |
| CAD-20 | Kit virtual | Na venda, baixa os componentes individualmente do estoque |
| CAD-21 | Kit montado | Kit tem estoque próprio, precisa ser montado previamente |
| CAD-22 | Precificação | Preço pode ser soma dos itens ou valor promocional fixo |
| CAD-23 | Foto do kit | Kit pode ter foto própria do conjunto montado |

### 2.4 Tabelas de Preço

| ID | Regra | Descrição |
|----|-------|-----------|
| CAD-24 | Múltiplas tabelas | Sistema suporta várias tabelas (Varejo, Atacado, Promocional) |
| CAD-25 | Preço por quantidade | Atacarejo: preço reduz conforme quantidade (1-10: R$X, 11-50: R$Y) |

---

## 3. COMERCIAL

### 3.1 CRM

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-01 | Funil de vendas | Etapas: Lead → Contato → Proposta → Negociação → Fechado/Perdido |
| COM-02 | Tempo máximo | Alerta se lead ficar mais de X dias na mesma etapa |
| COM-03 | Follow-up obrigatório | Sistema cobra registro de interação a cada X dias |

### 3.2 Orçamentos

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-04 | Validade | Orçamento tem prazo de validade configurável (padrão: 15 dias) |
| COM-05 | Versionamento | Alterações geram nova versão do orçamento |
| COM-06 | Mesclar orçamentos | Permite combinar múltiplos orçamentos em um único |
| COM-07 | Mesclar clientes diferentes | Ao mesclar de clientes diferentes, usuário escolhe cliente principal |
| COM-08 | Item duplicado | Regra parametrizável: usar menor preço, maior, mais recente ou manual |
| COM-09 | Desmembrar orçamento | Separar itens gera orçamentos filhos (#1236.1, #1236.2) |
| COM-10 | Rastreabilidade | Orçamento mesclado/desmembrado mantém vínculo com originais |
| COM-11 | Aprovação de desconto | Desconto acima do limite do vendedor requer aprovação |
| COM-12 | Conversão em venda | Orçamento aprovado pode virar pedido de venda |
| COM-13 | Orçamento vencido | Orçamento vencido é arquivado, pode ser reativado |

### 3.3 Pedido de Venda

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-14 | Pedido mínimo | Valor mínimo configurável por tipo de cliente (B2B/B2C) |
| COM-15 | Desconto máximo | Cada perfil tem limite de desconto sem aprovação |
| COM-16 | Reserva de estoque | Estoque é reservado ao criar o pedido (mesmo sem faturar) |
| COM-17 | Tempo de reserva | Reserva expira após X dias sem faturamento |
| COM-18 | Venda sem estoque | Configurável: permitir ou bloquear venda sem estoque |
| COM-19 | Venda abaixo do custo | Configurável: bloquear ou exigir aprovação especial |
| COM-20 | Desmembrar venda | Separar pedido em múltiplos (#1000.1, #1000.2) |

### 3.4 Status do Pedido

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-21 | Aberto | Pedido criado, nada faturado ou entregue |
| COM-22 | Parcialmente Faturado | Algumas NFs emitidas, mas não todas |
| COM-23 | Totalmente Faturado | 100% do pedido com NF emitida |
| COM-24 | Parcialmente Entregue | Algumas entregas realizadas |
| COM-25 | Totalmente Entregue | 100% do pedido entregue |
| COM-26 | Finalizado | Pedido 100% faturado E 100% entregue |

### 3.5 Entregas Fracionadas

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-27 | Numeração | Entregas parciais recebem sufixo .E1, .E2, .E3... |
| COM-28 | Tipo de entrega | Retirada pelo cliente OU Entrega no endereço |
| COM-29 | Responsável | Registra quem retirou ou motorista que entregou |
| COM-30 | Vínculo com NF | Cada entrega pode ter NF vinculada ou não |
| COM-31 | Histórico | Sistema mantém histórico completo de movimentações |

### 3.6 Faturamento

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-32 | Faturar total | Emitir NF de todos os itens do pedido |
| COM-33 | Faturar parcial | Emitir NF de itens/quantidades selecionados |
| COM-34 | Faturar por entrega | Emitir NF vinculada a uma entrega específica (.E1, .E2) |
| COM-35 | Trocar destinatário | Emitir NF em nome de outro CPF/CNPJ |
| COM-36 | Consolidar pedidos | Juntar múltiplos pedidos em uma única NF |
| COM-37 | NF Consumidor Final | Emitir sem identificação do cliente (CPF genérico) |
| COM-38 | Alerta pendência | Sistema alerta pedidos há X dias sem faturar |

### 3.7 Financeiro da Venda

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-39 | Opção 1 - Integral | Recebimento total na hora (baixa imediata) |
| COM-40 | Opção 2 - Venda Pai | Parcelas geradas no pedido principal |
| COM-41 | Opção 3 - Por Entrega | Financeiro definido em cada entrega fracionada |
| COM-42 | Opção 4 - Definir Depois | Financeiro não definido no momento da venda |
| COM-43 | Múltiplas formas | Permite combinar formas na mesma venda (PIX + Cartão + Crédito) |
| COM-44 | Formas por entrega | Cada entrega pode ter forma de pagamento diferente |

### 3.8 Crédito do Cliente

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-45 | Alerta automático | Sistema avisa se cliente tem crédito disponível |
| COM-46 | Tipos de crédito | Indicação, Devolução, Bonificação, Adiantamento |
| COM-47 | Usar na Venda Pai | Abater crédito do total da venda principal |
| COM-48 | Reservar para entregas | Manter crédito para uso nas entregas fracionadas |
| COM-49 | Uso parcial | Permite usar apenas parte do crédito disponível |
| COM-50 | Combinar formas | Crédito pode ser combinado com outras formas de pagamento |
| COM-51 | Carteira unificada | Todos os créditos ficam em carteira única do cliente |
| COM-52 | Validade do crédito | Crédito pode ter data de expiração configurável |

### 3.9 Limite de Crédito

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-53 | Compromete na venda | Limite é comprometido ao criar pedido (mesmo sem faturar) |
| COM-54 | Libera no recebimento | Limite é liberado conforme recebimento |
| COM-55 | Alerta de estouro | Sistema alerta quando venda ultrapassa limite |
| COM-56 | Bloqueio configurável | Pode bloquear ou apenas alertar quando limite excedido |

### 3.10 Bonificação

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-57 | Checkbox bonificado | Marcar item como bonificação no pedido |
| COM-58 | CFOP automático | Sistema usa CFOP 5.910 (estadual) ou 6.910 (interestadual) |
| COM-59 | Sem financeiro | Item bonificado não gera contas a receber |
| COM-60 | Motivo obrigatório | Campo de motivo da bonificação é obrigatório |
| COM-61 | Aprovação | Bonificação requer aprovação por alçada específica |
| COM-62 | Limite por período | Limite de bonificação por % sobre vendas do período |

### 3.11 Comissões

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-63 | Comissão padrão | Percentual base configurável |
| COM-64 | Comissão por categoria | Pode variar por categoria de produto |
| COM-65 | Comissão por cliente | Pode ter regra especial por cliente |
| COM-66 | Momento do pagamento | Configurável: no faturamento ou no recebimento |
| COM-67 | Desconto reduz comissão | Se vendedor der desconto, comissão pode ser reduzida |
| COM-68 | Divisão de comissão | Regra para venda de cliente de outro vendedor |

### 3.12 PDV

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-69 | Abertura de caixa | Operador informa valor de abertura |
| COM-70 | Sangria | Retirada de dinheiro quando atinge limite configurado |
| COM-71 | Suprimento | Adição de troco ao caixa |
| COM-72 | Limite de caixa | Valor máximo permitido em espécie |
| COM-73 | Fechamento | Conferência de valores no encerramento |
| COM-74 | Tolerância | Diferença aceitável no fechamento (ex: R$ 5,00) |
| COM-75 | NFC-e automática | Emissão de cupom fiscal eletrônico |

### 3.13 Programa de Indicações

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-76 | Quem indica | Cliente ativo ou Parceiro Externo cadastrado |
| COM-77 | Tipo de benefício | Dinheiro (saque) ou Crédito na Loja |
| COM-78 | Valor/Percentual | Configurável por % ou valor fixo |
| COM-79 | Base de cálculo | Sobre 1ª compra ou todas as compras do indicado |
| COM-80 | Momento do crédito | Imediato na venda ou após recebimento |
| COM-81 | Validade | Crédito expira após X dias (configurável) |
| COM-82 | Limite máximo | Valor máximo de crédito por indicação |

### 3.14 Devolução e Troca

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-83 | Prazo devolução | Dias permitidos após a compra (configurável) |
| COM-84 | Prazo troca | Dias permitidos para troca (pode ser diferente) |
| COM-85 | Aprovação | Devolução/troca requer aprovação configurável |
| COM-86 | Forma de estorno | Devolve dinheiro, gera crédito ou escolha no momento |
| COM-87 | Troca com diferença | Cliente paga diferença se produto novo for mais caro |
| COM-88 | Crédito de troca | Produto mais barato gera crédito |

### 3.15 Consignação

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-89 | Prazo padrão | Dias para acerto (30, 60, 90 - configurável) |
| COM-90 | Limite por cliente | Valor máximo em consignação por cliente |
| COM-91 | Alerta de vencimento | Sistema alerta X dias antes do prazo |
| COM-92 | Acerto parcial | Permite acertar apenas parte da consignação |
| COM-93 | NF de remessa | Emite NF de remessa em consignação |
| COM-94 | NF de venda/retorno | No acerto, emite NF de venda (vendidos) e retorno (devolvidos) |

### 3.16 Garantia

| ID | Regra | Descrição |
|----|-------|-----------|
| COM-95 | Prazo padrão | Dias de garantia configurável por produto/categoria |
| COM-96 | Tipo de garantia | Fabricante ou Loja |
| COM-97 | Prazo de análise | Dias para responder chamado de garantia |
| COM-98 | Resolução | Reparo, Troca ou Devolução |
| COM-99 | Encaminhamento | Pode enviar para assistência do fabricante |

---

## 4. COMPRAS

### 4.1 Cotações

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-01 | Cotação obrigatória | Configurável se sempre exige cotação ou pode comprar direto |
| CPR-02 | Mínimo de cotações | Quantidade mínima de fornecedores a cotar (ex: 3) |
| CPR-03 | Comparativo | Sistema monta quadro comparativo de preços |
| CPR-04 | Histórico | Mantém histórico de cotações por fornecedor |

### 4.2 Pedido de Compra

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-05 | Aprovação por valor | Compras acima de X requerem aprovação |
| CPR-06 | Níveis de aprovação | Diferentes alçadas por faixa de valor |
| CPR-07 | Vínculo com cotação | Pedido pode ser vinculado à cotação vencedora |
| CPR-08 | Bonificação de compra | Checkbox para registrar recebimento de bonificação |

### 4.3 Recebimento

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-09 | Conferência | Obrigatória confrontação física x NF |
| CPR-10 | Divergências | Registrar faltas, sobras e avarias |
| CPR-11 | Manifestação | Manifestar NF-e no portal da SEFAZ |
| CPR-12 | Vínculo com pedido | Vincular NF recebida ao pedido de compra |
| CPR-13 | Entrada no estoque | Confirmação gera entrada automática |

### 4.4 Estoque

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-14 | Estoque mínimo | Quantidade mínima definida por dias de venda |
| CPR-15 | Estoque máximo | Limite máximo para evitar over-stock |
| CPR-16 | Alerta de reposição | Sistema alerta quando atinge mínimo |
| CPR-17 | Curva ABC | Classificação automática de produtos |
| CPR-18 | Lote e validade | Controle opcional por produto |

### 4.5 Inventário

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-19 | Frequência | Configurável (mensal, trimestral, anual) |
| CPR-20 | Contagem dupla | Recontagem obrigatória em caso de divergência |
| CPR-21 | Tolerância | Percentual de divergência aceitável |
| CPR-22 | Aprovação de ajuste | Ajustes requerem aprovação |

### 4.6 Transferência entre Filiais

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-23 | NF de transferência | Gera NF de saída na origem e entrada no destino |
| CPR-24 | Conferência | Destino confere e confirma recebimento |
| CPR-25 | Aprovação | Transferência pode requerer aprovação |

### 4.7 Kits

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-26 | Montagem | Criar kit a partir de componentes |
| CPR-27 | Desmontagem | Desfazer kit em componentes |
| CPR-28 | Baixa automática | Kit virtual baixa componentes na venda |
| CPR-29 | Alerta componente | Alerta se componente em falta para montar kit |
| CPR-30 | Custo do kit | Soma dos custos dos componentes |

### 4.8 Custos e Precificação

| ID | Regra | Descrição |
|----|-------|-----------|
| CPR-31 | Custos fixos | Cadastro de custos fixos mensais (aluguel, salários, etc.) |
| CPR-32 | Custos variáveis | Comissões, impostos, frete (% sobre venda) |
| CPR-33 | Rateio | Custos fixos rateados por faturamento ou m² |
| CPR-34 | Método de custo | Custo médio ponderado ou PEPS |
| CPR-35 | Markup | Percentual de margem por categoria/produto |
| CPR-36 | Margem mínima | Alerta ou bloqueio se margem abaixo do mínimo |
| CPR-37 | Precificação automática | Recalcular preços em lote |
| CPR-38 | Simulador | What-if para simular cenários de preço |
| CPR-39 | DRE por produto | Resultado por produto, categoria, cliente |

---

## 5. FINANCEIRO

### 5.1 Contas a Receber

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-01 | Geração automática | Título gerado automaticamente na venda |
| FIN-02 | Baixa manual | Permite baixar título manualmente |
| FIN-03 | Baixa automática | Baixa via retorno bancário ou conciliação |
| FIN-04 | Juros de mora | Percentual ao mês configurável |
| FIN-05 | Multa | Percentual de multa por atraso |
| FIN-06 | Carência | Dias de tolerância sem juros/multa |

### 5.2 Cobrança

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-07 | Régua de cobrança | Ações automáticas por dias de atraso |
| FIN-08 | Aviso antes | Enviar lembrete X dias antes do vencimento |
| FIN-09 | Cobrança após | Sequência de ações após vencimento (1, 7, 15, 30 dias) |
| FIN-10 | Canal de cobrança | E-mail, WhatsApp ou ambos |
| FIN-11 | Negativação | Incluir no Serasa/SPC após X dias |
| FIN-12 | Bloqueio de cliente | Bloquear venda após X dias de atraso |

### 5.3 Contas a Pagar

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-13 | Geração automática | Título gerado na compra |
| FIN-14 | Dias de pagamento | Dias fixos para pagamento (ex: terça e sexta) |
| FIN-15 | Aprovação por valor | Pagamentos acima de X requerem aprovação |
| FIN-16 | Arquivo CNAB | Geração de remessa para banco |

### 5.4 Limite de Crédito

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-17 | Limite padrão PF | Valor inicial para pessoa física |
| FIN-18 | Limite padrão PJ | Valor inicial para pessoa jurídica |
| FIN-19 | Análise de crédito | Processo de avaliação para aumento |
| FIN-20 | Considerar pedidos | Limite considera pedidos não faturados |

### 5.5 Conciliação

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-21 | Frequência | Diária, semanal ou mensal |
| FIN-22 | Extrato bancário | Importação de OFX/OFC |
| FIN-23 | Conciliação automática | Match por valor e data |
| FIN-24 | Divergências | Tratamento de lançamentos não conciliados |

### 5.6 Fluxo de Caixa

| ID | Regra | Descrição |
|----|-------|-----------|
| FIN-25 | Visão | Diária, semanal e mensal |
| FIN-26 | Projeção | Previsão baseada em recorrências |
| FIN-27 | Caixa mínimo | Alerta quando saldo projetado abaixo do mínimo |
| FIN-28 | Centro de custos | Classificação por centro de custo |
| FIN-29 | DRE gerencial | Demonstrativo de resultado mensal |
| FIN-30 | Comparativo | Realizado x Orçado x Período anterior |

---

## 6. FISCAL

### 6.1 Tributação

| ID | Regra | Descrição |
|----|-------|-----------|
| FIS-01 | Regime tributário | Configuração por empresa (Simples, Presumido, Real) |
| FIS-02 | NCM/CEST | Classificação fiscal obrigatória por produto |
| FIS-03 | CFOP automático | Sistema sugere CFOP baseado na operação |
| FIS-04 | ICMS ST | Cálculo automático de substituição tributária |
| FIS-05 | Diferencial de alíquota | Cálculo de DIFAL para operações interestaduais |
| FIS-06 | PIS/COFINS | Cálculo conforme regime da empresa |
| FIS-07 | IPI | Cálculo para indústrias |

### 6.2 Documentos Fiscais

| ID | Regra | Descrição |
|----|-------|-----------|
| FIS-08 | NF-e | Emissão de nota fiscal eletrônica |
| FIS-09 | NFC-e | Emissão de cupom fiscal (varejo) |
| FIS-10 | NFS-e | Emissão de nota de serviço |
| FIS-11 | Ambiente | Configurável: Produção ou Homologação |
| FIS-12 | Série | Série da NF configurável por empresa |
| FIS-13 | Cancelamento | Permitido dentro do prazo legal |
| FIS-14 | Carta de correção | Para ajustes menores após emissão |
| FIS-15 | Inutilização | Inutilizar faixa de números não usados |

### 6.3 Obrigações

| ID | Regra | Descrição |
|----|-------|-----------|
| FIS-16 | SPED Fiscal | Geração do arquivo ICMS/IPI |
| FIS-17 | SPED Contribuições | Geração do arquivo PIS/COFINS |
| FIS-18 | EFD-Reinf | Geração de retenções |
| FIS-19 | Exportação contábil | Arquivos para contador |
| FIS-20 | Calendário fiscal | Alertas de obrigações a vencer |

---

## 7. ESTOQUE

### 7.1 Movimentações

| ID | Regra | Descrição |
|----|-------|-----------|
| EST-01 | Entrada de compra | Entrada automática na conferência de NF |
| EST-02 | Saída de venda | Saída automática no faturamento |
| EST-03 | Entrada manual | Permite ajuste manual com justificativa |
| EST-04 | Saída manual | Permite ajuste manual com justificativa |
| EST-05 | Reserva | Produtos reservados na venda (antes de faturar) |
| EST-06 | Liberação | Reserva liberada se venda cancelada ou expirada |

### 7.2 WMS

| ID | Regra | Descrição |
|----|-------|-----------|
| EST-07 | Endereçamento | Produtos com localização no armazém |
| EST-08 | FIFO | Primeiro que entra, primeiro que sai |
| EST-09 | FEFO | Primeiro a vencer, primeiro que sai |
| EST-10 | Conferência | Leitura de código de barras |
| EST-11 | Picking | Lista de separação otimizada por rota |

### 7.3 Controles

| ID | Regra | Descrição |
|----|-------|-----------|
| EST-12 | Estoque negativo | Configurável: permitir ou bloquear |
| EST-13 | Rastreabilidade | Histórico completo de movimentações |
| EST-14 | Valorização | Custo médio ou PEPS |
| EST-15 | Lote | Controle de lote para produtos específicos |
| EST-16 | Validade | Controle de data de validade |
| EST-17 | Série | Controle de número de série |
| EST-18 | Cross-docking | Receber e expedir sem armazenar |

---

## 8. EXPEDIÇÃO

### 8.1 Separação

| ID | Regra | Descrição |
|----|-------|-----------|
| EXP-01 | Picking list | Geração automática de lista de separação |
| EXP-02 | Conferência | Validação dos itens separados |
| EXP-03 | Etiquetas | Impressão de etiquetas de volume |
| EXP-04 | Romaneio | Agrupamento de entregas por rota |

### 8.2 Entrega

| ID | Regra | Descrição |
|----|-------|-----------|
| EXP-05 | Roteirização | Otimização automática de rota |
| EXP-06 | GPS em tempo real | Rastreamento do motorista |
| EXP-07 | Check-in | Registro de chegada no cliente |
| EXP-08 | Foto de comprovante | Obrigatória na entrega |
| EXP-09 | Assinatura digital | Coleta de assinatura do recebedor |
| EXP-10 | Ocorrências | Registro de problemas (ausente, recusado) |
| EXP-11 | Notificação automática | Cliente avisado sobre saída e chegada |

### 8.3 Frete

| ID | Regra | Descrição |
|----|-------|-----------|
| EXP-12 | Frete grátis | A partir de valor configurável |
| EXP-13 | Cálculo de frete | Por peso, volume ou distância |
| EXP-14 | Retirada na loja | Opção sem frete |
| EXP-15 | Reentrega | Cobrança por reentrega configurável |

---

## 9. E-COMMERCE

### 9.1 Catálogo

| ID | Regra | Descrição |
|----|-------|-----------|
| ECO-01 | Sincronização | Produtos sincronizados automaticamente com ERP |
| ECO-02 | Estoque em tempo real | Atualização automática de disponibilidade |
| ECO-03 | Preços por perfil | Preço diferente para B2B e B2C |
| ECO-04 | Produto sob consulta | Produtos sem preço visível (orçamento) |

### 9.2 B2C

| ID | Regra | Descrição |
|----|-------|-----------|
| ECO-05 | Cadastro simplificado | CPF, e-mail e telefone |
| ECO-06 | Checkout rápido | Sem necessidade de criar conta |
| ECO-07 | Carrinho abandonado | E-mail automático após X horas |

### 9.3 B2B

| ID | Regra | Descrição |
|----|-------|-----------|
| ECO-08 | Cadastro com aprovação | CNPJ requer aprovação prévia |
| ECO-09 | Prazo de aprovação | SLA para aprovar cadastro |
| ECO-10 | Tabela atacado | Preços diferenciados após aprovação |
| ECO-11 | Pedido mínimo | Valor ou quantidade mínima para B2B |
| ECO-12 | Limite de crédito visível | Cliente vê seu limite disponível |
| ECO-13 | Aprovação de pedido | Pedidos B2B podem requerer aprovação mesmo com crédito |
| ECO-14 | Formas de pagamento | Faturamento (28/35/42 dias) para B2B |

### 9.4 Vendedor

| ID | Regra | Descrição |
|----|-------|-----------|
| ECO-15 | Pedido pelo cliente | Vendedor pode fazer pedido em nome do cliente |
| ECO-16 | Carteira de clientes | Vendedor vê apenas seus clientes |
| ECO-17 | Comissões | Acompanhamento de comissões a receber |

### 9.5 Geral

| ID | Regra | Descrição |
|----|-------|-----------|
| ECO-18 | Rastreamento GPS | Cliente acompanha entrega no mapa |
| ECO-19 | Segunda via boleto | Cliente acessa boletos na área logada |
| ECO-20 | Download NF | Cliente baixa XML/PDF das notas |
| ECO-21 | Programa indicação | Link de indicação na área do cliente |
| ECO-22 | Avaliações | Clientes podem avaliar produtos |
| ECO-23 | Moderação | Avaliações passam por moderação |
| ECO-24 | Lista de desejos | Salvar produtos para compra futura |
| ECO-25 | Repetir pedido | Refazer pedido anterior com um clique |

---

## 10. RH

### 10.1 Ponto

| ID | Regra | Descrição |
|----|-------|-----------|
| RH-01 | Registro de ponto | Entrada, saída e intervalos |
| RH-02 | Tolerância | Minutos de tolerância para atraso |
| RH-03 | Banco de horas | Controle de horas positivas/negativas |
| RH-04 | Horas extras | Limite máximo por mês |
| RH-05 | Ponto por geolocalização | Para colaboradores externos |
| RH-06 | Raio de tolerância | Distância máxima para bater ponto |

### 10.2 Férias

| ID | Regra | Descrição |
|----|-------|-----------|
| RH-07 | Período aquisitivo | Controle de saldo de férias |
| RH-08 | Fracionamento | Divisão em até 3 períodos |
| RH-09 | Abono pecuniário | Venda de até 10 dias |
| RH-10 | Aprovação | Férias requerem aprovação do gestor |
| RH-11 | Programação | Calendário de férias da equipe |

### 10.3 Folha

| ID | Regra | Descrição |
|----|-------|-----------|
| RH-12 | Cálculo automático | Processamento de salários |
| RH-13 | Descontos | INSS, IRRF, VT, VR, faltas |
| RH-14 | Comissões | Integração com módulo de vendas |
| RH-15 | 13º salário | Cálculo automático |
| RH-16 | Holerite digital | Disponível no app do colaborador |

### 10.4 App do Colaborador

| ID | Regra | Descrição |
|----|-------|-----------|
| RH-17 | Bater ponto pelo app | Com foto e geolocalização |
| RH-18 | Solicitar férias | Pedido online |
| RH-19 | Enviar atestado | Foto do documento |
| RH-20 | Ver holerite | PDF disponível para download |

---

## 11. CONTRATOS

| ID | Regra | Descrição |
|----|-------|-----------|
| CTR-01 | Tipos de contrato | Fornecimento, Serviço, Exclusividade |
| CTR-02 | Vigência | Data de início e fim obrigatórias |
| CTR-03 | Alerta de vencimento | Notificação X dias antes do fim |
| CTR-04 | Renovação automática | Configurável por contrato |
| CTR-05 | Aditivos | Alterações geram aditivo vinculado |
| CTR-06 | Versionamento | Histórico de todas as versões |
| CTR-07 | Assinatura digital | Integração com plataforma de assinatura |
| CTR-08 | Documentos anexos | Upload do contrato assinado |
| CTR-09 | Responsável | Responsável interno pelo contrato |
| CTR-10 | Acompanhamento | Relatório de cumprimento de metas |

---

## Matriz: Regras x Parâmetros de Configuração

As regras acima são controladas por **parâmetros configuráveis** no sistema:

| Módulo | Parâmetros Configuráveis |
|--------|--------------------------|
| **Comercial** | Validade orçamento, Desconto máximo, Pedido mínimo, Regra de mesclagem, Limite bonificação |
| **Financeiro** | Juros, Multa, Carência, Dias para bloqueio, Dias para negativação |
| **Estoque** | Estoque mínimo (dias), Permitir negativo, Método de custo |
| **Expedição** | Frete grátis a partir de, Valor reentrega |
| **RH** | Tolerância atraso, Limite horas extras, Raio geolocalização |
| **Indicações** | % benefício, Validade crédito, Limite máximo |

---

## Próximos Passos

- [ ] Vincular regras com Casos de Uso correspondentes
- [ ] Criar matriz de rastreabilidade Regras x Telas
- [ ] Documentar exceções e tratamentos de erro

---

**Total de Regras de Negócio: 295**

Última atualização: 01/12/2025

PLANAC Distribuidora - ERP - Documentação Oficial
