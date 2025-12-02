# 📊 Fluxogramas de Processo - ERP PLANAC

Diagramas visuais dos principais processos do sistema.

---

## Índice de Fluxogramas

| # | Fluxo | Módulo | Status |
|---|-------|--------|--------|
| 1 | Venda Completa (com entregas fracionadas) | Comercial | ✅ |
| 2 | Orçamento (mesclar/desmembrar) | Comercial | ✅ |
| 3 | Uso de Crédito na Venda | Comercial | ✅ |
| 4 | Devolução de Venda | Comercial | ✅ |
| 5 | Troca de Venda | Comercial | ✅ |
| 6 | Consignação | Comercial | ✅ |
| 7 | Compra Completa | Compras | ✅ |
| 8 | Fluxo Financeiro (Recebimento) | Financeiro | ✅ |
| 9 | E-commerce B2B | E-commerce | ✅ |
| 10 | E-commerce B2C | E-commerce | ✅ |
| 11 | Entrega com Rastreamento GPS | Expedição | ✅ |
| 12 | Garantia de Produtos | Comercial | ✅ |
| 13 | Produção (PCP) | Compras | ✅ |
| 14 | Inventário | Estoque | ✅ |
| 15 | RH - Admissão | RH | ✅ |
| 16 | RH - Folha de Pagamento | RH | ✅ |
| 17 | RH - Férias | RH | ✅ |
| 18 | Contratos | Contratos | ✅ |
| 19 | Precificação | Custos | ✅ |
| 20 | Bonificação | Comercial | ✅ |
| 21 | Limite de Crédito | Financeiro | ✅ |
| 22 | Cobrança (Régua) | Financeiro | ✅ |
| 23 | Transferência entre Filiais | Estoque | ✅ |
| 24 | PDV (Ponto de Venda) | Comercial | ✅ |
| 25 | Importação de NF-e | Compras | ✅ |

---

## 1. Fluxo de Venda Completa

```mermaid
flowchart TD
    A[Início] --> B{Origem?}
    B -->|Orçamento| C[Converter Orçamento em Venda]
    B -->|Direta| D[Criar Venda Direta]
    
    C --> E[Venda Criada #1000]
    D --> E
    
    E --> F{Cliente tem crédito?}
    F -->|Sim| G[Perguntar se usa crédito]
    F -->|Não| H[Definir forma de pagamento]
    
    G --> G1{Opção escolhida?}
    G1 -->|Usar na Venda Pai| G2[Abater crédito do total]
    G1 -->|Reservar para Entregas| G3[Manter crédito reservado]
    G1 -->|Não usar| H
    
    G2 --> H
    G3 --> H
    
    H --> I{Tipo de financeiro?}
    I -->|Recebimento Integral| J[Baixa total na hora]
    I -->|Contas a Receber na Pai| K[Gera parcelas no pedido principal]
    I -->|Financeiro por Entrega| L[Define em cada entrega]
    I -->|Sem Financeiro Agora| M[Define depois]
    
    J --> N[Reserva Estoque]
    K --> N
    L --> N
    M --> N
    
    N --> O{Tipo de entrega?}
    O -->|Total| P[Entrega única]
    O -->|Fracionada| Q[Entregas parciais]
    
    P --> R[Registrar Entrega]
    Q --> S[Registrar Entrega .E1]
    
    R --> T{Faturar?}
    S --> T
    
    T -->|Sim| U[Emitir NF-e]
    T -->|Depois| V[Faturamento Pendente]
    
    U --> W{Mais entregas?}
    V --> W
    
    W -->|Sim| X[Registrar Entrega .E2, .E3...]
    W -->|Não| Y{Tudo entregue e faturado?}
    
    X --> T
    
    Y -->|Sim| Z[Venda Finalizada]
    Y -->|Não| AA[Venda Parcial - Acompanhar]
    
    Z --> AB[Fim]
    AA --> AB
```

---

## 2. Fluxo de Orçamento (Mesclar/Desmembrar)

```mermaid
flowchart TD
    A[Início] --> B[Criar Orçamento]
    B --> C[Orçamento #1236]
    
    C --> D{Ação?}
    
    D -->|Aprovar| E[Converter em Venda]
    D -->|Mesclar| F[Selecionar outros orçamentos]
    D -->|Desmembrar| G[Selecionar itens para separar]
    D -->|Editar| H[Alterar itens/valores]
    D -->|Cancelar| I[Orçamento Cancelado]
    
    F --> J{Clientes diferentes?}
    J -->|Sim| K[Escolher cliente principal]
    J -->|Não| L[Manter cliente]
    
    K --> M[Mesclar orçamentos]
    L --> M
    
    M --> N{Itens duplicados?}
    N -->|Sim| O{Regra de preço?}
    N -->|Não| P[Orçamento Mesclado]
    
    O -->|Menor preço| Q[Usar menor valor]
    O -->|Maior preço| R[Usar maior valor]
    O -->|Mais recente| S[Usar último]
    O -->|Manual| T[Usuário escolhe]
    
    Q --> P
    R --> P
    S --> P
    T --> P
    
    P --> U[Orçamento Principal com dropdown de mesclados]
    
    G --> V[Criar orçamentos filhos]
    V --> W[#1236.1, #1236.2...]
    W --> X[Orçamentos vinculados ao pai]
    
    H --> C
    
    E --> Y[Venda Criada]
    U --> D
    X --> D
    
    Y --> Z[Fim]
    I --> Z
```

---

## 3. Fluxo de Uso de Crédito na Venda

```mermaid
flowchart TD
    A[Iniciar Venda] --> B{Cliente tem crédito?}
    
    B -->|Não| C[Prosseguir sem crédito]
    B -->|Sim| D[Exibir saldo de crédito]
    
    D --> E[Mostrar origem: Indicação, Devolução, etc.]
    E --> F[Mostrar validade]
    
    F --> G{Usar crédito?}
    
    G -->|Usar na Venda Pai| H[Informar valor a usar]
    G -->|Reservar para Entregas| I[Crédito fica disponível nas .E1, .E2...]
    G -->|Não usar agora| C
    
    H --> J{Valor >= Total da venda?}
    J -->|Sim| K[Venda 100% com crédito]
    J -->|Não| L[Crédito + Outra forma de pagamento]
    
    K --> M[Baixa do crédito]
    L --> N[Definir forma complementar]
    N --> M
    
    I --> O[Crédito reservado]
    O --> P[Na entrega .E1]
    
    P --> Q{Usar crédito reservado?}
    Q -->|Sim| R[Abater do valor da entrega]
    Q -->|Não| S[Usar outra forma]
    
    R --> T[Baixa parcial do crédito]
    S --> T
    
    C --> U[Definir forma de pagamento normal]
    M --> V[Venda finalizada]
    T --> V
    U --> V
    
    V --> W[Fim]
```

---

## 4. Fluxo de Devolução de Venda

```mermaid
flowchart TD
    A[Cliente solicita devolução] --> B[Localizar venda original]
    
    B --> C{Dentro do prazo?}
    C -->|Não| D[Devolução negada - Fora do prazo]
    C -->|Sim| E[Selecionar itens a devolver]
    
    E --> F[Informar motivo]
    F --> G[Registrar condição do produto]
    
    G --> H{Precisa aprovação?}
    H -->|Sim| I[Enviar para aprovação]
    H -->|Não| J[Devolução aprovada automaticamente]
    
    I --> K{Aprovado?}
    K -->|Não| L[Devolução negada]
    K -->|Sim| J
    
    J --> M[Gerar NF-e de Entrada - Devolução]
    M --> N[Dar entrada no estoque]
    
    N --> O{Tipo de estorno?}
    O -->|Dinheiro| P[Estornar pagamento]
    O -->|Crédito| Q[Gerar crédito na carteira do cliente]
    O -->|Escolher na hora| R[Perguntar ao cliente]
    
    R --> O
    
    P --> S[Registrar estorno no financeiro]
    Q --> T[Crédito disponível para próximas compras]
    
    S --> U[Devolução concluída]
    T --> U
    D --> V[Fim]
    L --> V
    U --> V
```

---

## 5. Fluxo de Troca de Venda

```mermaid
flowchart TD
    A[Cliente solicita troca] --> B[Localizar venda original]
    
    B --> C{Dentro do prazo?}
    C -->|Não| D[Troca negada - Fora do prazo]
    C -->|Sim| E[Selecionar itens a trocar]
    
    E --> F[Informar motivo]
    F --> G[Selecionar novos produtos]
    
    G --> H[Calcular diferença]
    
    H --> I{Valor da troca?}
    I -->|Novo maior que Antigo| J[Cliente paga diferença]
    I -->|Novo menor que Antigo| K[Cliente recebe crédito ou estorno]
    I -->|Igual| L[Troca sem diferença]
    
    J --> M{Precisa aprovação?}
    K --> M
    L --> M
    
    M -->|Sim| N[Enviar para aprovação]
    M -->|Não| O[Troca aprovada]
    
    N --> P{Aprovado?}
    P -->|Não| Q[Troca negada]
    P -->|Sim| O
    
    O --> R[Gerar NF-e Devolução - Produto antigo]
    R --> S[Entrada no estoque - Produto antigo]
    
    S --> T[Gerar NF-e Venda - Produto novo]
    T --> U[Saída do estoque - Produto novo]
    
    U --> V{Tem diferença a pagar?}
    V -->|Sim| W[Processar pagamento ou crédito]
    V -->|Não| X[Troca concluída]
    
    W --> X
    D --> Y[Fim]
    Q --> Y
    X --> Y
```

---

## 6. Fluxo de Consignação

```mermaid
flowchart TD
    A[Início] --> B[Criar Romaneio de Consignação]
    
    B --> C[Selecionar cliente depositário]
    C --> D[Selecionar produtos e quantidades]
    D --> E[Definir prazo para acerto]
    
    E --> F[Emitir NF-e Remessa em Consignação]
    F --> G[Saída do estoque próprio]
    G --> H[Entrada no estoque em consignação]
    
    H --> I[Consignação ativa]
    
    I --> J{Ação?}
    
    J -->|Acerto parcial| K[Informar itens vendidos pelo cliente]
    J -->|Acerto total| L[Informar todos os itens vendidos ou devolvidos]
    J -->|Devolução total| M[Cliente devolve tudo]
    J -->|Prazo vencendo| N[Alerta automático]
    
    N --> J
    
    K --> O[Separar: Vendidos x A devolver]
    L --> O
    M --> P[Todos os itens voltam]
    
    O --> Q[Gerar NF-e Venda - Itens vendidos]
    Q --> R[Gerar financeiro]
    
    O --> S{Tem itens a devolver?}
    S -->|Sim| T[Gerar NF-e Retorno de Consignação]
    S -->|Não| U[Acerto concluído]
    
    T --> V[Entrada no estoque próprio]
    V --> U
    
    P --> T
    
    R --> U
    
    U --> W{Ainda tem itens em consignação?}
    W -->|Sim| I
    W -->|Não| X[Consignação encerrada]
    
    X --> Y[Fim]
```

---

## 7. Fluxo de Compra Completa

```mermaid
flowchart TD
    A[Início] --> B{Origem?}
    
    B -->|Sugestão automática| C[Sistema sugere reposição]
    B -->|Manual| D[Usuário cria solicitação]
    
    C --> E[Solicitação de Compra]
    D --> E
    
    E --> F{Cotação obrigatória?}
    F -->|Sim| G[Criar cotação]
    F -->|Não| H[Criar pedido direto]
    
    G --> I[Enviar para fornecedores]
    I --> J[Aguardar respostas]
    J --> K[Comparar propostas]
    
    K --> L[Selecionar melhor oferta]
    L --> M[Gerar Pedido de Compra]
    H --> M
    
    M --> N{Valor precisa aprovação?}
    N -->|Sim| O[Enviar para aprovação]
    N -->|Não| P[Pedido aprovado]
    
    O --> Q{Aprovado?}
    Q -->|Não| R[Pedido recusado]
    Q -->|Sim| P
    
    P --> S[Enviar pedido ao fornecedor]
    S --> T[Aguardar entrega]
    
    T --> U[Mercadoria chegou]
    U --> V[Importar NF-e do fornecedor]
    
    V --> W[Conferência física]
    W --> X{Confere com NF?}
    
    X -->|Sim| Y[Entrada no estoque]
    X -->|Divergência| Z[Registrar divergência]
    
    Z --> AA{Tipo de divergência?}
    AA -->|Falta| AB[Reclamar com fornecedor]
    AA -->|Sobra| AC[Devolver ou aceitar]
    AA -->|Avaria| AD[Solicitar troca ou crédito]
    
    AB --> Y
    AC --> Y
    AD --> Y
    
    Y --> AE[Gerar Contas a Pagar]
    AE --> AF[Compra concluída]
    
    R --> AG[Fim]
    AF --> AG
```

---

## 8. Fluxo Financeiro - Recebimento

```mermaid
flowchart TD
    A[Título gerado] --> B[Contas a Receber]
    
    B --> C{Vencimento?}
    C -->|Futuro| D[Aguardar vencimento]
    C -->|Hoje| E[Dia do vencimento]
    C -->|Vencido| F[Título em atraso]
    
    D --> G{Pagamento antecipado?}
    G -->|Sim| H[Baixa com desconto]
    G -->|Não| C
    
    E --> I{Cliente pagou?}
    I -->|Sim| J[Identificar pagamento]
    I -->|Não| F
    
    F --> K[Iniciar régua de cobrança]
    K --> L[Enviar cobrança: Email e WhatsApp]
    
    L --> M{Dias de atraso?}
    M -->|1-7 dias| N[Cobrança amigável]
    M -->|8-30 dias| O[Cobrança firme]
    M -->|31-60 dias| P[Bloquear cliente]
    M -->|Mais de 60 dias| Q[Negativação]
    
    N --> I
    O --> I
    P --> I
    Q --> R{Cliente pagou?}
    
    R -->|Sim| S[Baixar negativação]
    R -->|Não| T[Cobrança judicial]
    
    S --> J
    
    J --> U{Forma de pagamento?}
    U -->|PIX| V[Baixa automática]
    U -->|Boleto| W[Baixa via retorno bancário]
    U -->|Cartão| X[Baixa via conciliadora]
    U -->|Dinheiro| Y[Baixa manual]
    
    V --> Z[Título baixado]
    W --> Z
    X --> Z
    Y --> Z
    
    H --> Z
    
    Z --> AA{Valor correto?}
    AA -->|Sim| AB[Recebimento concluído]
    AA -->|Menor| AC[Baixa parcial - Gerar novo título]
    AA -->|Maior| AD[Gerar crédito para cliente]
    
    AC --> AB
    AD --> AB
    
    T --> AE[Fim]
    AB --> AE
```

---

## 9. Fluxo E-commerce B2B

```mermaid
flowchart TD
    A[Empresa acessa o site] --> B{Tem cadastro?}
    
    B -->|Não| C[Fazer cadastro CNPJ]
    B -->|Sim| D[Fazer login]
    
    C --> E[Preencher dados da empresa]
    E --> F[Enviar para aprovação]
    
    F --> G[Análise de crédito]
    G --> H{Aprovado?}
    
    H -->|Não| I[Cadastro recusado - Notificar]
    H -->|Sim| J[Cadastro aprovado]
    
    J --> K[Definir limite de crédito]
    K --> L[Vincular tabela de preço B2B]
    L --> M[Vincular vendedor]
    
    M --> D
    
    D --> N[Acessar catálogo B2B]
    N --> O[Ver preços de atacado]
    
    O --> P[Adicionar produtos ao carrinho]
    P --> Q{Quantidade mínima?}
    
    Q -->|Não atingiu| R[Alerta: mínimo X unidades]
    Q -->|Atingiu| S[Produto adicionado]
    
    R --> P
    S --> T{Continuar comprando?}
    
    T -->|Sim| P
    T -->|Não| U[Ir para checkout]
    
    U --> V{Pedido mínimo atingido?}
    V -->|Não| W[Alerta: mínimo R$ X]
    V -->|Sim| X[Verificar limite de crédito]
    
    W --> P
    
    X --> Y{Dentro do limite?}
    Y -->|Não| Z[Bloquear - Limite excedido]
    Y -->|Sim| AA[Escolher forma de pagamento]
    
    AA --> AB{Forma?}
    AB -->|Faturado| AC[Prazo 28-35-42 dias]
    AB -->|Boleto| AD[Gerar boleto]
    AB -->|Cartão| AE[Processar cartão]
    AB -->|PIX| AF[Gerar QR Code]
    
    AC --> AG[Pedido gerado]
    AD --> AG
    AE --> AG
    AF --> AG
    
    AG --> AH{Precisa aprovação interna?}
    AH -->|Sim| AI[Enviar para aprovação por alçada]
    AH -->|Não| AJ[Pedido confirmado]
    
    AI --> AK{Aprovado?}
    AK -->|Não| AL[Pedido recusado]
    AK -->|Sim| AJ
    
    AJ --> AM[Notificar cliente]
    AM --> AN[Integrar com ERP]
    AN --> AO[Separação e Entrega]
    
    I --> AP[Fim]
    Z --> AP
    AL --> AP
    AO --> AP
```

---

## 10. Fluxo E-commerce B2C

```mermaid
flowchart TD
    A[Cliente acessa o site] --> B{Tem cadastro?}
    
    B -->|Não| C[Navegar como visitante]
    B -->|Sim| D[Fazer login]
    
    C --> E[Ver catálogo e preços de varejo]
    D --> E
    
    E --> F[Adicionar produtos ao carrinho]
    F --> G{Continuar comprando?}
    
    G -->|Sim| F
    G -->|Não| H[Ir para checkout]
    
    H --> I{Está logado?}
    I -->|Não| J[Cadastro rápido ou login]
    I -->|Sim| K[Confirmar endereço]
    
    J --> K
    
    K --> L[Calcular frete]
    L --> M{Frete grátis?}
    
    M -->|Sim - Atingiu valor| N[Frete R$ 0,00]
    M -->|Não| O[Exibir opções de frete]
    
    N --> P[Escolher forma de pagamento]
    O --> P
    
    P --> Q{Tem crédito de indicação?}
    Q -->|Sim| R[Perguntar se quer usar]
    Q -->|Não| S[Prosseguir]
    
    R --> T{Usar crédito?}
    T -->|Sim| U[Abater do total]
    T -->|Não| S
    
    U --> S
    
    S --> V{Forma de pagamento?}
    V -->|PIX| W[Gerar QR Code]
    V -->|Cartão Crédito| X[Processar pagamento]
    V -->|Boleto| Y[Gerar boleto]
    
    W --> Z{Pagou em 30 min?}
    Z -->|Sim| AA[Pagamento confirmado]
    Z -->|Não| AB[Pedido cancelado]
    
    X --> AC{Aprovado?}
    AC -->|Sim| AA
    AC -->|Não| AD[Pagamento recusado]
    
    Y --> AE[Aguardar pagamento]
    AE --> AF{Pagou em 3 dias?}
    AF -->|Sim| AA
    AF -->|Não| AB
    
    AA --> AG[Pedido confirmado]
    AG --> AH[Enviar email de confirmação]
    AH --> AI[Separação]
    AI --> AJ[Entrega]
    AJ --> AK[Notificar cliente: Entregue!]
    
    AB --> AL[Fim]
    AD --> AL
    AK --> AL
```

---

## 11. Fluxo de Entrega com Rastreamento GPS

```mermaid
flowchart TD
    A[Pedidos prontos para entrega] --> B[Montar romaneio de carga]
    
    B --> C[Roteirização automática]
    C --> D[Atribuir motorista]
    
    D --> E[Motorista abre App]
    E --> F[Ver lista de entregas do dia]
    
    F --> G[Iniciar rota]
    G --> H[GPS ativado - Rastreamento em tempo real]
    
    H --> I[Cliente pode acompanhar no mapa]
    
    I --> J[Motorista chega no endereço]
    J --> K[Check-in automático por GPS]
    
    K --> L[Notificar cliente: Motorista chegou!]
    
    L --> M{Cliente presente?}
    
    M -->|Sim| N[Entregar mercadoria]
    M -->|Não| O[Registrar ocorrência: Ausente]
    
    N --> P[Coletar assinatura digital]
    P --> Q[Tirar foto do comprovante]
    Q --> R[Confirmar entrega no App]
    
    R --> S[Baixa automática no sistema]
    S --> T[Notificar cliente: Entrega realizada!]
    
    O --> U{Reagendar?}
    U -->|Sim| V[Agendar nova tentativa]
    U -->|Não| W[Retornar mercadoria]
    
    V --> X[Próxima entrega da lista]
    W --> X
    T --> X
    
    X --> Y{Mais entregas?}
    Y -->|Sim| J
    Y -->|Não| Z[Finalizar rota]
    
    Z --> AA[Retornar ao CD]
    AA --> AB[Fechar romaneio]
    
    AB --> AC[Fim]
```

---

## 12. Fluxo de Garantia de Produtos

```mermaid
flowchart TD
    A[Cliente abre chamado de garantia] --> B[Informar NF ou nº de série]
    
    B --> C[Sistema localiza produto]
    C --> D{Produto encontrado?}
    
    D -->|Não| E[Solicitar documentação]
    D -->|Sim| F[Verificar prazo de garantia]
    
    E --> F
    
    F --> G{Dentro da garantia?}
    G -->|Não| H[Garantia expirada - Oferecer reparo pago]
    G -->|Sim| I[Garantia válida]
    
    I --> J[Cliente descreve o defeito]
    J --> K[Cliente envia fotos]
    
    K --> L[Criar chamado de garantia]
    L --> M[Enviar para análise técnica]
    
    M --> N[Técnico analisa]
    N --> O{Defeito confirmado?}
    
    O -->|Não| P[Garantia negada - Mau uso]
    O -->|Sim| Q{Tipo de resolução?}
    
    Q -->|Reparo| R[Agendar reparo]
    Q -->|Troca| S[Trocar por produto novo]
    Q -->|Devolução| T[Devolver valor]
    Q -->|Enviar ao fabricante| U[Encaminhar para assistência]
    
    R --> V[Produto reparado]
    S --> W[Gerar NF de troca]
    T --> X[Gerar crédito ou estorno]
    U --> Y[Aguardar retorno do fabricante]
    
    Y --> Z{Fabricante resolveu?}
    Z -->|Sim| AA[Devolver produto ao cliente]
    Z -->|Não| AB[Trocar ou devolver valor]
    
    V --> AC[Entregar ao cliente]
    W --> AC
    X --> AC
    AA --> AC
    AB --> AC
    
    AC --> AD[Fechar chamado]
    
    H --> AE[Fim]
    P --> AE
    AD --> AE
```

---

## 13. Fluxo de Produção (PCP)

```mermaid
flowchart TD
    A[Início] --> B{Origem da demanda?}
    
    B -->|Pedido de venda| C[Pedido requer produto montado]
    B -->|Estoque mínimo| D[Alerta de reposição]
    B -->|Manual| E[Solicitação de produção]
    
    C --> F[Verificar estoque de produto acabado]
    D --> F
    E --> F
    
    F --> G{Tem estoque?}
    G -->|Sim| H[Reservar estoque existente]
    G -->|Não| I[Criar Ordem de Produção]
    
    I --> J[Carregar Ficha Técnica - BOM]
    J --> K[Verificar estoque de insumos]
    
    K --> L{Todos insumos disponíveis?}
    L -->|Não| M[Gerar solicitação de compra]
    L -->|Sim| N[Reservar insumos]
    
    M --> O[Aguardar chegada dos insumos]
    O --> N
    
    N --> P[Programar produção]
    P --> Q[Definir data e turno]
    Q --> R[Alocar recursos - máquinas e pessoas]
    
    R --> S[Liberar OP para produção]
    S --> T[Iniciar produção]
    
    T --> U[Apontamento de produção]
    U --> V[Registrar quantidade produzida]
    V --> W[Registrar tempo gasto]
    W --> X[Registrar perdas e refugos]
    
    X --> Y{Produção concluída?}
    Y -->|Não| U
    Y -->|Sim| Z[Controle de qualidade]
    
    Z --> AA{Aprovado?}
    AA -->|Não| AB[Registrar não conformidade]
    AA -->|Sim| AC[Dar entrada no estoque]
    
    AB --> AD{Retrabalho possível?}
    AD -->|Sim| T
    AD -->|Não| AE[Baixa como perda]
    
    AC --> AF[Calcular custo de produção]
    AF --> AG[Atualizar custo do produto]
    
    AE --> AF
    
    AG --> AH[OP finalizada]
    H --> AI[Fim]
    AH --> AI
```

---

## 14. Fluxo de Inventário

```mermaid
flowchart TD
    A[Início] --> B{Tipo de inventário?}
    
    B -->|Geral| C[Inventário completo]
    B -->|Rotativo| D[Inventário por amostragem]
    B -->|Por categoria| E[Selecionar categorias]
    
    C --> F[Bloquear movimentação de estoque]
    D --> G[Selecionar produtos para contagem]
    E --> G
    
    F --> H[Gerar lista de contagem]
    G --> H
    
    H --> I[Imprimir fichas de contagem]
    I --> J[Distribuir para equipe]
    
    J --> K[1ª Contagem]
    K --> L[Registrar quantidades no sistema]
    
    L --> M{Divergência com sistema?}
    M -->|Não| N[Contagem validada]
    M -->|Sim| O[2ª Contagem - outra pessoa]
    
    O --> P[Registrar 2ª contagem]
    P --> Q{Confirma divergência?}
    
    Q -->|Não - erro na 1ª| N
    Q -->|Sim - divergência real| R[3ª Contagem - supervisor]
    
    R --> S[Registrar contagem final]
    S --> T[Confirmar divergência]
    
    T --> U{Tipo de divergência?}
    U -->|Sobra| V[Registrar entrada de ajuste]
    U -->|Falta| W[Registrar saída de ajuste]
    
    V --> X[Investigar causa]
    W --> X
    
    X --> Y{Causa identificada?}
    Y -->|Furto| Z[Registrar ocorrência]
    Y -->|Erro de lançamento| AA[Corrigir histórico]
    Y -->|Quebra não registrada| AB[Lançar perda]
    Y -->|Não identificada| AC[Ajuste sem justificativa]
    
    Z --> AD[Gerar relatório de divergências]
    AA --> AD
    AB --> AD
    AC --> AD
    
    N --> AE[Atualizar saldo do sistema]
    AD --> AE
    
    AE --> AF[Desbloquear movimentação]
    AF --> AG[Inventário finalizado]
    
    AG --> AH[Fim]
```

---

## 15. Fluxo de RH - Admissão

```mermaid
flowchart TD
    A[Início] --> B[Vaga aprovada]
    
    B --> C[Publicar vaga]
    C --> D[Receber currículos]
    
    D --> E[Triagem de currículos]
    E --> F[Selecionar candidatos]
    
    F --> G[Agendar entrevistas]
    G --> H[Realizar entrevistas]
    
    H --> I{Aprovado na entrevista?}
    I -->|Não| J[Dispensar candidato]
    I -->|Sim| K[Aplicar testes - se houver]
    
    J --> D
    
    K --> L{Aprovado nos testes?}
    L -->|Não| J
    L -->|Sim| M[Selecionar candidato final]
    
    M --> N[Fazer proposta]
    N --> O{Candidato aceitou?}
    
    O -->|Não| P[Negociar ou próximo candidato]
    O -->|Sim| Q[Solicitar documentos]
    
    P --> N
    
    Q --> R[Candidato envia documentos]
    R --> S{Documentação completa?}
    
    S -->|Não| T[Solicitar documentos faltantes]
    S -->|Sim| U[Validar documentos]
    
    T --> R
    
    U --> V[Agendar exame admissional]
    V --> W[Realizar exame]
    
    W --> X{Apto?}
    X -->|Não| Y[Admissão cancelada]
    X -->|Sim| Z[Cadastrar colaborador no sistema]
    
    Z --> AA[Definir cargo e salário]
    AA --> AB[Definir departamento e gestor]
    AB --> AC[Configurar benefícios]
    
    AC --> AD[Gerar contrato de trabalho]
    AD --> AE[Assinar contrato]
    
    AE --> AF[Registrar na carteira - eSocial]
    AF --> AG[Criar usuário no sistema]
    AG --> AH[Configurar ponto eletrônico]
    
    AH --> AI[Agendar integração e onboarding]
    AI --> AJ[Colaborador admitido]
    
    Y --> AK[Fim]
    AJ --> AK
```

---

## 16. Fluxo de RH - Folha de Pagamento

```mermaid
flowchart TD
    A[Início do mês] --> B[Fechar ponto do mês anterior]
    
    B --> C[Importar registros de ponto]
    C --> D[Calcular horas trabalhadas]
    
    D --> E[Identificar ocorrências]
    E --> F{Tem ocorrências?}
    
    F -->|Sim| G[Processar ocorrências]
    F -->|Não| H[Prosseguir]
    
    G --> I[Faltas]
    G --> J[Atrasos]
    G --> K[Horas extras]
    G --> L[Banco de horas]
    
    I --> M[Calcular descontos de faltas]
    J --> N[Calcular descontos de atrasos]
    K --> O[Calcular adicional de horas extras]
    L --> P[Compensar ou pagar banco]
    
    M --> H
    N --> H
    O --> H
    P --> H
    
    H --> Q[Calcular salário base]
    
    Q --> R[Adicionar proventos]
    R --> R1[Comissões - integração vendas]
    R --> R2[Gratificações]
    R --> R3[Adicional noturno]
    R --> R4[Periculosidade e insalubridade]
    
    R1 --> S[Calcular descontos]
    R2 --> S
    R3 --> S
    R4 --> S
    
    S --> S1[INSS]
    S --> S2[IRRF]
    S --> S3[Vale transporte]
    S --> S4[Vale refeição]
    S --> S5[Plano de saúde]
    S --> S6[Outros descontos]
    
    S1 --> T[Calcular líquido]
    S2 --> T
    S3 --> T
    S4 --> T
    S5 --> T
    S6 --> T
    
    T --> U[Gerar prévia da folha]
    U --> V[Conferência pelo RH]
    
    V --> W{Aprovado?}
    W -->|Não| X[Corrigir divergências]
    W -->|Sim| Y[Aprovar folha]
    
    X --> U
    
    Y --> Z[Gerar holerites]
    Z --> AA[Disponibilizar no App do Colaborador]
    
    AA --> AB[Gerar arquivo bancário]
    AB --> AC[Enviar para banco]
    
    AC --> AD[Pagamento efetuado]
    
    AD --> AE[Gerar guias]
    AE --> AE1[INSS - GPS]
    AE --> AE2[IRRF - DARF]
    AE --> AE3[FGTS - GRF]
    
    AE1 --> AF[Contabilizar folha]
    AE2 --> AF
    AE3 --> AF
    
    AF --> AG[Lançamentos contábeis automáticos]
    AG --> AH[Folha finalizada]
    
    AH --> AI[Fim]
```

---

## 17. Fluxo de RH - Férias

```mermaid
flowchart TD
    A[Início] --> B{Origem?}
    
    B -->|Solicitação do colaborador| C[Colaborador solicita pelo App]
    B -->|Programação da empresa| D[RH programa férias]
    
    C --> E[Verificar período aquisitivo]
    D --> E
    
    E --> F{Tem direito?}
    F -->|Não| G[Informar período restante]
    F -->|Sim| H[Verificar saldo de dias]
    
    G --> I[Fim]
    
    H --> J[Selecionar período de gozo]
    J --> K{Fracionamento?}
    
    K -->|Não| L[Férias de 30 dias]
    K -->|Sim| M[Dividir em períodos]
    
    M --> N{Períodos válidos?}
    N -->|Não - mínimo 14 dias no 1º| O[Ajustar períodos]
    N -->|Sim| P[Confirmar fracionamento]
    
    O --> M
    L --> P
    
    P --> Q{Vender dias - abono?}
    Q -->|Sim| R[Calcular abono pecuniário - máx 10 dias]
    Q -->|Não| S[Sem abono]
    
    R --> T[Calcular valores]
    S --> T
    
    T --> U[Salário do período]
    U --> V[Adicionar 1/3 constitucional]
    V --> W[Calcular descontos]
    
    W --> X[Enviar para aprovação do gestor]
    X --> Y{Gestor aprovou?}
    
    Y -->|Não| Z[Devolver para ajuste de datas]
    Y -->|Sim| AA[Férias aprovadas]
    
    Z --> J
    
    AA --> AB[Gerar recibo de férias]
    AB --> AC[Pagar até 2 dias antes do início]
    
    AC --> AD[Colaborador entra em férias]
    AD --> AE[Registrar afastamento no ponto]
    
    AE --> AF[Colaborador retorna]
    AF --> AG[Baixar férias no sistema]
    AG --> AH[Atualizar saldo]
    
    AH --> I
```

---

## 18. Fluxo de Contratos

```mermaid
flowchart TD
    A[Início] --> B{Tipo de contrato?}
    
    B -->|Com cliente| C[Contrato de fornecimento]
    B -->|Com fornecedor| D[Contrato de compra]
    B -->|Trabalhista| E[Contrato de trabalho]
    B -->|Locação| F[Contrato de aluguel]
    
    C --> G[Definir cliente]
    D --> H[Definir fornecedor]
    E --> I[Definir colaborador]
    F --> J[Definir imóvel e locador]
    
    G --> K[Elaborar minuta]
    H --> K
    I --> K
    J --> K
    
    K --> L[Definir cláusulas]
    L --> M[Objeto do contrato]
    M --> N[Valor e condições de pagamento]
    N --> O[Vigência - início e fim]
    O --> P[Condições de renovação]
    P --> Q[Multas e penalidades]
    Q --> R[Foro e jurisdição]
    
    R --> S[Revisão jurídica]
    S --> T{Aprovado pelo jurídico?}
    
    T -->|Não| U[Ajustar cláusulas]
    T -->|Sim| V[Gerar contrato final]
    
    U --> L
    
    V --> W[Enviar para assinatura]
    
    W --> X{Assinatura digital?}
    X -->|Sim| Y[Enviar via plataforma]
    X -->|Não| Z[Imprimir e coletar assinaturas]
    
    Y --> AA[Aguardar assinaturas]
    Z --> AA
    
    AA --> AB{Todas partes assinaram?}
    AB -->|Não| AC[Cobrar assinaturas pendentes]
    AB -->|Sim| AD[Contrato ativo]
    
    AC --> AA
    
    AD --> AE[Cadastrar no sistema]
    AE --> AF[Definir alertas de vencimento]
    
    AF --> AG[Monitoramento contínuo]
    
    AG --> AH{Alerta de vencimento?}
    AH -->|30 dias antes| AI[Notificar responsável]
    AH -->|Ainda não| AG
    
    AI --> AJ{Ação?}
    AJ -->|Renovar| AK[Criar aditivo de renovação]
    AJ -->|Encerrar| AL[Não renovar contrato]
    AJ -->|Renegociar| AM[Revisar termos]
    
    AK --> AN[Novo período de vigência]
    AL --> AO[Contrato encerrado]
    AM --> K
    
    AN --> AG
    AO --> AP[Fim]
```

---

## 19. Fluxo de Precificação

```mermaid
flowchart TD
    A[Início] --> B{Origem?}
    
    B -->|Novo produto| C[Calcular preço inicial]
    B -->|Revisão periódica| D[Revisar preços existentes]
    B -->|Alteração de custo| E[Recalcular por mudança de custo]
    
    C --> F[Obter custo de aquisição]
    D --> F
    E --> F
    
    F --> G[Somar custos diretos]
    G --> G1[Preço de compra]
    G --> G2[Frete de compra]
    G --> G3[Impostos não recuperáveis]
    
    G1 --> H[Custo de aquisição]
    G2 --> H
    G3 --> H
    
    H --> I[Calcular custos indiretos rateados]
    I --> I1[Aluguel rateado]
    I --> I2[Salários rateados]
    I --> I3[Energia e utilidades]
    I --> I4[Marketing]
    
    I1 --> J[Custo total do produto]
    I2 --> J
    I3 --> J
    I4 --> J
    
    J --> K[Definir margem desejada]
    
    K --> L{Método de precificação?}
    L -->|Markup| M[Aplicar markup sobre custo]
    L -->|Margem| N[Calcular por margem de contribuição]
    L -->|Mercado| O[Basear no preço do concorrente]
    
    M --> P[Preço calculado]
    N --> P
    O --> P
    
    P --> Q[Verificar margem mínima]
    Q --> R{Margem ok?}
    
    R -->|Não| S[Alerta: abaixo da margem mínima]
    R -->|Sim| T[Preço aprovado]
    
    S --> U{Aprovar exceção?}
    U -->|Não| V[Ajustar preço ou custo]
    U -->|Sim| W[Registrar aprovação de exceção]
    
    V --> K
    W --> T
    
    T --> X[Definir preço por tabela]
    X --> X1[Preço varejo]
    X --> X2[Preço atacado]
    X --> X3[Preço por volume]
    
    X1 --> Y[Atualizar cadastro do produto]
    X2 --> Y
    X3 --> Y
    
    Y --> Z[Atualizar e-commerce]
    Z --> AA[Registrar histórico de preços]
    
    AA --> AB{Precificação em lote?}
    AB -->|Sim| AC[Próximo produto da lista]
    AB -->|Não| AD[Precificação concluída]
    
    AC --> F
    AD --> AE[Fim]
```

---

## 20. Fluxo de Bonificação (Venda)

```mermaid
flowchart TD
    A[Vendedor cria pedido] --> B{Tem item bonificado?}
    
    B -->|Não| C[Pedido normal]
    B -->|Sim| D[Marcar checkbox BONIFICADO]
    
    D --> E[Campo obrigatório: Motivo]
    E --> F{Motivo válido?}
    
    F -->|Amostra| G[Registrar como amostra]
    F -->|Acordo comercial| H[Registrar acordo]
    F -->|Avaria parcial| I[Registrar avaria]
    F -->|Outro| J[Descrever motivo]
    
    G --> K[Verificar limite de bonificação]
    H --> K
    I --> K
    J --> K
    
    K --> L{Dentro do limite mensal?}
    L -->|Não| M[Bloquear - limite excedido]
    L -->|Sim| N[Calcular CFOP de bonificação]
    
    M --> O[Solicitar aprovação especial]
    O --> P{Diretor aprovou?}
    
    P -->|Não| Q[Bonificação negada]
    P -->|Sim| N
    
    N --> R[CFOP 5.910 ou 6.910]
    R --> S[Item não gera financeiro]
    
    S --> T[Enviar para aprovação por alçada]
    T --> U{Aprovado?}
    
    U -->|Não| V[Pedido devolvido para ajuste]
    U -->|Sim| W[Pedido aprovado]
    
    V --> D
    
    W --> X[Emitir NF-e com CFOP de bonificação]
    X --> Y[Baixar estoque]
    Y --> Z[Não gerar contas a receber]
    
    Z --> AA[Registrar no relatório de bonificações]
    
    C --> AB[Fim]
    Q --> AB
    AA --> AB
```

---

## 21. Fluxo de Limite de Crédito

```mermaid
flowchart TD
    A[Cliente faz pedido] --> B[Verificar limite de crédito]
    
    B --> C[Obter limite aprovado]
    C --> D[Calcular saldo utilizado]
    
    D --> D1[Pedidos em aberto não faturados]
    D --> D2[Títulos a vencer]
    D --> D3[Títulos vencidos]
    
    D1 --> E[Saldo comprometido total]
    D2 --> E
    D3 --> E
    
    E --> F[Calcular limite disponível]
    F --> G[Limite aprovado - Saldo comprometido]
    
    G --> H{Pedido cabe no limite?}
    
    H -->|Sim| I[Pedido liberado]
    H -->|Não| J[Pedido bloqueado por limite]
    
    J --> K{Tem títulos vencidos?}
    K -->|Sim| L[Alerta: cliente inadimplente]
    K -->|Não| M[Apenas limite excedido]
    
    L --> N[Bloquear até regularização]
    M --> O{Solicitar aumento?}
    
    O -->|Não| P[Cliente deve pagar ou reduzir pedido]
    O -->|Sim| Q[Enviar para análise de crédito]
    
    Q --> R[Analisar histórico do cliente]
    R --> S[Verificar score de crédito]
    S --> T[Consultar Serasa e SPC]
    
    T --> U{Aprovar aumento?}
    U -->|Não| V[Manter limite atual]
    U -->|Sim| W[Definir novo limite]
    
    W --> X[Atualizar cadastro do cliente]
    X --> Y[Notificar vendedor]
    
    Y --> Z[Reprocessar pedido bloqueado]
    Z --> H
    
    V --> P
    N --> AA[Fim]
    P --> AA
    I --> AA
```

---

## 22. Fluxo de Cobrança (Régua)

```mermaid
flowchart TD
    A[Título vencido] --> B[Entrar na régua de cobrança]
    
    B --> C{Dias de atraso?}
    
    C -->|1 dia| D[Cobrança D+1]
    C -->|3 dias| E[Cobrança D+3]
    C -->|7 dias| F[Cobrança D+7]
    C -->|15 dias| G[Cobrança D+15]
    C -->|30 dias| H[Cobrança D+30]
    C -->|45 dias| I[Cobrança D+45]
    C -->|60 dias| J[Cobrança D+60]
    
    D --> K[Enviar lembrete amigável]
    K --> K1[Email: Seu boleto venceu ontem]
    K --> K2[WhatsApp: Lembrete de pagamento]
    
    E --> L[Segundo lembrete]
    L --> L1[Email com 2ª via do boleto]
    
    F --> M[Cobrança mais firme]
    M --> M1[Email: Regularize seu pagamento]
    M --> M2[WhatsApp: Evite negativação]
    
    G --> N[Notificação de bloqueio iminente]
    N --> N1[Email: Cadastro será bloqueado em 15 dias]
    
    H --> O[Bloquear cliente]
    O --> O1[Impedir novas vendas]
    O --> O2[Notificar vendedor responsável]
    
    I --> P[Aviso de negativação]
    P --> P1[Email: Última chance antes do Serasa]
    
    J --> Q[Negativar cliente]
    Q --> Q1[Incluir no Serasa e SPC]
    Q --> Q2[Registrar no sistema]
    
    K1 --> R{Cliente pagou?}
    K2 --> R
    L1 --> R
    M1 --> R
    M2 --> R
    N1 --> R
    O1 --> R
    O2 --> R
    P1 --> R
    
    R -->|Sim| S[Baixar título]
    R -->|Não| C
    
    S --> T{Estava negativado?}
    T -->|Sim| U[Baixar negativação]
    T -->|Não| V[Título quitado]
    
    U --> W{Estava bloqueado?}
    V --> W
    
    W -->|Sim| X[Desbloquear cliente]
    W -->|Não| Y[Fim]
    
    X --> Y
    Q1 --> Z[Iniciar cobrança judicial]
    Q2 --> Z
    Z --> Y
```

---

## 23. Fluxo de Transferência entre Filiais

```mermaid
flowchart TD
    A[Início] --> B{Motivo?}
    
    B -->|Solicitação de filial| C[Filial destino solicita produtos]
    B -->|Balanceamento de estoque| D[Sistema sugere transferência]
    B -->|Venda de outra filial| E[Pedido requer estoque de outra filial]
    
    C --> F[Criar solicitação de transferência]
    D --> F
    E --> F
    
    F --> G[Selecionar produtos e quantidades]
    G --> H[Definir filial origem]
    H --> I[Definir filial destino]
    
    I --> J[Verificar estoque na origem]
    J --> K{Tem estoque?}
    
    K -->|Não| L[Solicitação negada - sem estoque]
    K -->|Sim| M[Reservar estoque na origem]
    
    M --> N[Enviar para aprovação]
    N --> O{Aprovado?}
    
    O -->|Não| P[Solicitação cancelada]
    O -->|Sim| Q[Gerar NF-e de Transferência]
    
    Q --> R[CFOP 5.152 ou 6.152]
    R --> S[Emitir NF-e]
    
    S --> T[Baixar estoque na filial origem]
    T --> U[Separar mercadoria]
    U --> V[Despachar para filial destino]
    
    V --> W[Mercadoria em trânsito]
    W --> X[Filial destino recebe]
    
    X --> Y[Conferir mercadoria x NF]
    Y --> Z{Confere?}
    
    Z -->|Não| AA[Registrar divergência]
    Z -->|Sim| AB[Confirmar recebimento]
    
    AA --> AC[Notificar filial origem]
    AC --> AB
    
    AB --> AD[Dar entrada no estoque destino]
    AD --> AE[Vincular NF de entrada]
    
    AE --> AF[Transferência concluída]
    
    L --> AG[Fim]
    P --> AG
    AF --> AG
```

---

## 24. Fluxo do PDV (Ponto de Venda)

```mermaid
flowchart TD
    A[Abrir caixa] --> B[Informar valor de abertura]
    B --> C[Caixa aberto]
    
    C --> D[Iniciar venda]
    D --> E{Identificar cliente?}
    
    E -->|Sim| F[Buscar cliente - CPF ou CNPJ]
    E -->|Não| G[Consumidor final]
    
    F --> H{Cliente encontrado?}
    H -->|Não| I[Cadastro rápido]
    H -->|Sim| J[Carregar dados do cliente]
    
    I --> J
    G --> K[Adicionar produtos]
    J --> K
    
    K --> L[Ler código de barras ou buscar]
    L --> M[Adicionar ao carrinho]
    
    M --> N{Mais produtos?}
    N -->|Sim| K
    N -->|Não| O[Subtotal da venda]
    
    O --> P{Desconto?}
    P -->|Sim| Q[Aplicar desconto]
    P -->|Não| R[Valor final]
    
    Q --> R
    
    R --> S{Cliente tem crédito?}
    S -->|Sim| T[Perguntar se usa crédito]
    S -->|Não| U[Escolher forma de pagamento]
    
    T --> U
    
    U --> V{Forma de pagamento?}
    V -->|Dinheiro| W[Receber dinheiro]
    V -->|Cartão Crédito| X[Processar no TEF]
    V -->|Cartão Débito| Y[Processar no TEF]
    V -->|PIX| Z[Gerar QR Code]
    V -->|Múltiplas formas| AA[Combinar formas]
    
    W --> AB[Calcular troco]
    X --> AC{Aprovado?}
    Y --> AC
    Z --> AD[Aguardar confirmação]
    AA --> AE[Processar cada forma]
    
    AB --> AF[Pagamento OK]
    AC -->|Sim| AF
    AC -->|Não| AG[Tentar novamente ou outra forma]
    AD --> AF
    AE --> AF
    
    AG --> V
    
    AF --> AH[Emitir NFC-e]
    AH --> AI[Imprimir cupom]
    AI --> AJ[Abrir gaveta - se dinheiro]
    
    AJ --> AK[Venda concluída]
    AK --> AL{Continuar vendendo?}
    
    AL -->|Sim| D
    AL -->|Não| AM{Fechar caixa?}
    
    AM -->|Não| D
    AM -->|Sim| AN[Iniciar fechamento]
    
    AN --> AO[Contar dinheiro em caixa]
    AO --> AP[Informar valores por forma de pagamento]
    
    AP --> AQ{Valores conferem?}
    AQ -->|Não| AR[Registrar diferença]
    AQ -->|Sim| AS[Fechamento OK]
    
    AR --> AT{Diferença aceitável?}
    AT -->|Sim| AS
    AT -->|Não| AU[Investigar diferença]
    
    AU --> AS
    AS --> AV[Gerar relatório de fechamento]
    AV --> AW[Caixa fechado]
    
    AW --> AX[Fim]
```

---

## 25. Fluxo de Importação de NF-e (Compras)

```mermaid
flowchart TD
    A[Início] --> B{Método de importação?}
    
    B -->|Chave de acesso| C[Digitar chave de 44 dígitos]
    B -->|XML| D[Upload do arquivo XML]
    B -->|Manifesto| E[Buscar NF-e no SEFAZ]
    
    C --> F[Consultar NF-e no SEFAZ]
    D --> G[Ler arquivo XML]
    E --> H[Listar NF-e pendentes de manifestação]
    
    H --> I[Selecionar NF-e para importar]
    I --> J[Manifestar: Ciência da Operação]
    
    F --> K[Obter dados da NF-e]
    G --> K
    J --> K
    
    K --> L{NF-e válida?}
    L -->|Não| M[NF-e cancelada ou inválida]
    L -->|Sim| N[Exibir dados da NF-e]
    
    N --> O[Fornecedor]
    N --> P[Produtos]
    N --> Q[Valores e impostos]
    
    O --> R{Fornecedor cadastrado?}
    R -->|Não| S[Cadastrar fornecedor]
    R -->|Sim| T[Vincular fornecedor existente]
    
    S --> T
    
    P --> U[Para cada produto da NF]
    U --> V{Produto cadastrado?}
    
    V -->|Não| W[Cadastrar novo produto]
    V -->|Sim| X[Vincular produto existente]
    
    W --> Y[Mapear NCM e unidade]
    X --> Y
    
    Y --> Z{Mais produtos?}
    Z -->|Sim| U
    Z -->|Não| AA[Todos produtos mapeados]
    
    AA --> AB{Tem pedido de compra vinculado?}
    AB -->|Sim| AC[Vincular com pedido de compra]
    AB -->|Não| AD[Importar sem pedido]
    
    AC --> AE[Conferir quantidades pedido x NF]
    AE --> AF{Quantidades conferem?}
    
    AF -->|Não| AG[Registrar divergência]
    AF -->|Sim| AH[Conferência OK]
    
    AG --> AH
    AD --> AH
    
    AH --> AI[Dar entrada no estoque]
    AI --> AJ[Gerar contas a pagar]
    
    AJ --> AK[NF-e importada com sucesso]
    
    M --> AL[Fim]
    AK --> AL
```

---

## Legenda dos Diagramas

| Símbolo | Significado |
|---------|-------------|
| Retângulo arredondado | Início / Fim |
| Retângulo | Processo / Ação |
| Losango | Decisão |
| Seta | Fluxo / Direção |

---

## Resumo dos Fluxogramas

| # | Fluxo | Módulo | Status |
|---|-------|--------|--------|
| 1 | Venda Completa | Comercial | ✅ |
| 2 | Orçamento | Comercial | ✅ |
| 3 | Uso de Crédito | Comercial | ✅ |
| 4 | Devolução | Comercial | ✅ |
| 5 | Troca | Comercial | ✅ |
| 6 | Consignação | Comercial | ✅ |
| 7 | Compra Completa | Compras | ✅ |
| 8 | Recebimento Financeiro | Financeiro | ✅ |
| 9 | E-commerce B2B | E-commerce | ✅ |
| 10 | E-commerce B2C | E-commerce | ✅ |
| 11 | Entrega GPS | Expedição | ✅ |
| 12 | Garantia | Comercial | ✅ |
| 13 | Produção PCP | Compras | ✅ |
| 14 | Inventário | Estoque | ✅ |
| 15 | RH - Admissão | RH | ✅ |
| 16 | RH - Folha de Pagamento | RH | ✅ |
| 17 | RH - Férias | RH | ✅ |
| 18 | Contratos | Contratos | ✅ |
| 19 | Precificação | Custos | ✅ |
| 20 | Bonificação | Comercial | ✅ |
| 21 | Limite de Crédito | Financeiro | ✅ |
| 22 | Cobrança - Régua | Financeiro | ✅ |
| 23 | Transferência Filiais | Estoque | ✅ |
| 24 | PDV | Comercial | ✅ |
| 25 | Importação NF-e | Compras | ✅ |

---

**Total: 25 Fluxogramas**

Última atualização: 01/12/2025

PLANAC Distribuidora - ERP - Documentação Oficial
