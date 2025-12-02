# 📋 Casos de Uso - ERP PLANAC

Documentação completa dos casos de uso do sistema, organizados por módulo.

**Status: ✅ Completo**

---

## Índice

| Módulo | Qtd Casos de Uso |
|--------|------------------|
| [Comercial](#1-módulo-comercial) | 35 |
| [Compras](#2-módulo-compras) | 18 |
| [Financeiro](#3-módulo-financeiro) | 15 |
| [Fiscal](#4-módulo-fiscal) | 10 |
| [Estoque](#5-módulo-estoque) | 12 |
| [Expedição](#6-módulo-expedição) | 8 |
| [E-commerce](#7-módulo-e-commerce) | 16 |
| [RH](#8-módulo-rh) | 20 |
| [Contratos](#9-módulo-contratos) | 6 |
| [BI e Relatórios](#10-módulo-bi-e-relatórios) | 5 |
| **TOTAL** | **145** |

---

## 1. MÓDULO COMERCIAL

### 1.1 CRM

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| CRM-01 | Cadastrar Lead | Vendedor | Registrar novo lead no funil de vendas |
| CRM-02 | Avançar Lead no Funil | Vendedor | Mover lead entre etapas (Lead → Contato → Proposta → Negociação → Fechado) |
| CRM-03 | Registrar Interação | Vendedor | Registrar ligação, email, visita ou reunião com cliente/lead |
| CRM-04 | Agendar Follow-up | Vendedor | Criar tarefa de acompanhamento futuro |
| CRM-05 | Converter Lead em Cliente | Vendedor | Transformar lead qualificado em cliente cadastrado |

### 1.2 Orçamentos

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| ORC-01 | Criar Orçamento | Vendedor | Criar novo orçamento para cliente |
| ORC-02 | Editar Orçamento | Vendedor | Alterar itens, quantidades ou preços do orçamento |
| ORC-03 | Mesclar Orçamentos | Vendedor | Combinar múltiplos orçamentos em um único (mesmo cliente ou clientes diferentes) |
| ORC-04 | Desmembrar Orçamento | Vendedor | Separar itens de um orçamento em orçamentos filhos (#1236.1, #1236.2) |
| ORC-05 | Aplicar Desconto | Vendedor | Aplicar desconto no orçamento (com ou sem aprovação) |
| ORC-06 | Aprovar Desconto | Gerente | Aprovar desconto acima do limite do vendedor |
| ORC-07 | Converter em Venda | Vendedor | Transformar orçamento aprovado em pedido de venda |
| ORC-08 | Enviar Orçamento | Vendedor | Enviar orçamento por email ou WhatsApp |
| ORC-09 | Duplicar Orçamento | Vendedor | Criar cópia de orçamento existente |
| ORC-10 | Cancelar Orçamento | Vendedor | Cancelar orçamento com motivo |

### 1.3 Pedido de Venda

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| VEN-01 | Criar Venda Direta | Vendedor | Criar pedido de venda sem orçamento prévio |
| VEN-02 | Criar Venda de Orçamento | Vendedor | Converter orçamento em pedido de venda |
| VEN-03 | Definir Forma de Pagamento | Vendedor | Escolher forma(s) de pagamento da venda |
| VEN-04 | Usar Crédito do Cliente | Vendedor | Utilizar crédito disponível (indicação, devolução) na venda |
| VEN-05 | Reservar Crédito para Entregas | Vendedor | Reservar crédito para uso nas entregas fracionadas |
| VEN-06 | Registrar Entrega Fracionada | Expedição | Registrar entrega parcial (.E1, .E2, .E3...) |
| VEN-07 | Definir Financeiro por Entrega | Vendedor | Definir forma de pagamento em cada entrega |
| VEN-08 | Marcar Item como Bonificado | Vendedor | Marcar item como bonificação (não gera financeiro) |
| VEN-09 | Aprovar Bonificação | Gerente | Aprovar venda com item bonificado |
| VEN-10 | Desmembrar Venda | Vendedor | Separar pedido em múltiplos (#1000.1, #1000.2) |
| VEN-11 | Faturar Venda Total | Faturamento | Emitir NF-e de todos os itens |
| VEN-12 | Faturar Venda Parcial | Faturamento | Emitir NF-e de itens/quantidades selecionados |
| VEN-13 | Faturar por Entrega | Faturamento | Emitir NF-e vinculada a uma entrega específica |
| VEN-14 | Trocar Destinatário da NF | Faturamento | Emitir NF em nome de outro CPF/CNPJ |
| VEN-15 | Consolidar Pedidos em NF | Faturamento | Juntar múltiplos pedidos em uma única NF |
| VEN-16 | Cancelar Venda | Gerente | Cancelar pedido de venda com motivo |

### 1.4 PDV (Ponto de Venda)

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| PDV-01 | Abrir Caixa | Operador | Iniciar operação do caixa com valor de abertura |
| PDV-02 | Realizar Venda no PDV | Operador | Venda rápida no balcão |
| PDV-03 | Aplicar Desconto no PDV | Operador | Aplicar desconto (dentro do limite permitido) |
| PDV-04 | Usar Crédito no PDV | Operador | Utilizar crédito do cliente na venda |
| PDV-05 | Receber Pagamento Múltiplo | Operador | Receber em mais de uma forma de pagamento |
| PDV-06 | Realizar Sangria | Operador | Retirar dinheiro do caixa |
| PDV-07 | Realizar Suprimento | Operador | Adicionar dinheiro ao caixa |
| PDV-08 | Fechar Caixa | Operador | Encerrar operação e conferir valores |
| PDV-09 | Emitir NFC-e | Sistema | Emitir cupom fiscal eletrônico |

### 1.5 Devolução e Troca

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| DEV-01 | Solicitar Devolução | Vendedor | Registrar solicitação de devolução do cliente |
| DEV-02 | Aprovar Devolução | Gerente | Aprovar ou negar devolução |
| DEV-03 | Processar Devolução | Estoque | Dar entrada no estoque e gerar NF de devolução |
| DEV-04 | Estornar Pagamento | Financeiro | Devolver valor ao cliente |
| DEV-05 | Gerar Crédito de Devolução | Financeiro | Criar crédito na carteira do cliente |
| DEV-06 | Solicitar Troca | Vendedor | Registrar solicitação de troca |
| DEV-07 | Processar Troca | Estoque | Entrada do produto devolvido, saída do novo |
| DEV-08 | Cobrar Diferença de Troca | Financeiro | Cobrar diferença quando produto novo é mais caro |

### 1.6 Programa de Indicações

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| IND-01 | Cadastrar Indicador | Vendedor | Registrar quem indicou o cliente |
| IND-02 | Gerar Crédito de Indicação | Sistema | Criar crédito automático após venda/recebimento |
| IND-03 | Consultar Saldo de Créditos | Cliente | Ver créditos disponíveis e validade |
| IND-04 | Usar Crédito de Indicação | Vendedor | Aplicar crédito em nova compra |

### 1.7 Consignação

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| CON-01 | Criar Romaneio de Consignação | Vendedor | Enviar produtos em consignação para cliente |
| CON-02 | Registrar Acerto de Consignação | Vendedor | Informar itens vendidos e devolvidos |
| CON-03 | Gerar NF de Venda (Consignação) | Faturamento | Emitir NF dos itens vendidos pelo cliente |
| CON-04 | Gerar NF de Retorno (Consignação) | Faturamento | Emitir NF de retorno dos itens devolvidos |

### 1.8 Garantia

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| GAR-01 | Abrir Chamado de Garantia | Atendimento | Registrar solicitação de garantia |
| GAR-02 | Analisar Chamado de Garantia | Técnico | Avaliar defeito e emitir laudo |
| GAR-03 | Aprovar Garantia | Gerente | Aprovar resolução (reparo, troca, devolução) |
| GAR-04 | Executar Garantia | Técnico | Realizar reparo ou troca |
| GAR-05 | Encaminhar para Fabricante | Técnico | Enviar produto para assistência do fabricante |

### 1.9 Gamificação

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| GAM-01 | Definir Metas | Gerente | Criar metas individuais ou de equipe |
| GAM-02 | Consultar Ranking | Vendedor | Ver posição no ranking de vendas |
| GAM-03 | Registrar Premiação | RH | Registrar prêmio ganho pelo vendedor |

---

## 2. MÓDULO COMPRAS

### 2.1 Cotações

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| COT-01 | Criar Solicitação de Compra | Comprador | Solicitar compra de produtos |
| COT-02 | Criar Cotação | Comprador | Solicitar cotação de fornecedores |
| COT-03 | Registrar Proposta de Fornecedor | Comprador | Cadastrar resposta do fornecedor |
| COT-04 | Comparar Cotações | Comprador | Analisar propostas lado a lado |
| COT-05 | Selecionar Melhor Oferta | Comprador | Escolher fornecedor vencedor |

### 2.2 Pedido de Compra

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| COM-01 | Criar Pedido de Compra | Comprador | Gerar pedido para fornecedor |
| COM-02 | Aprovar Pedido de Compra | Gerente/Diretor | Aprovar compra acima do limite |
| COM-03 | Enviar Pedido ao Fornecedor | Comprador | Transmitir pedido ao fornecedor |
| COM-04 | Marcar Compra como Bonificação | Comprador | Registrar recebimento de bonificação |

### 2.3 Recebimento

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| REC-01 | Importar NF-e de Compra | Comprador | Importar XML da NF do fornecedor |
| REC-02 | Manifestar NF-e | Comprador | Confirmar ciência da operação no SEFAZ |
| REC-03 | Conferir Mercadoria | Estoque | Conferir física x NF |
| REC-04 | Registrar Divergência | Estoque | Informar falta, sobra ou avaria |
| REC-05 | Dar Entrada no Estoque | Estoque | Confirmar entrada dos produtos |

### 2.4 Devolução de Compra

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| DVC-01 | Solicitar Devolução ao Fornecedor | Comprador | Iniciar devolução de compra |
| DVC-02 | Emitir NF de Devolução | Faturamento | Gerar NF de saída (devolução) |
| DVC-03 | Registrar Crédito do Fornecedor | Financeiro | Lançar crédito a receber do fornecedor |

### 2.5 Produção (PCP)

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| PCP-01 | Criar Ordem de Produção | PCP | Gerar OP para fabricação |
| PCP-02 | Reservar Insumos | PCP | Reservar matéria-prima para produção |
| PCP-03 | Apontar Produção | Operador | Registrar quantidade produzida |
| PCP-04 | Registrar Perda/Refugo | Operador | Informar perdas na produção |
| PCP-05 | Finalizar OP | PCP | Encerrar ordem e dar entrada no estoque |

---

## 3. MÓDULO FINANCEIRO

### 3.1 Contas a Receber

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| CRE-01 | Gerar Título a Receber | Sistema | Criar título automaticamente na venda |
| CRE-02 | Emitir Boleto | Financeiro | Gerar boleto bancário |
| CRE-03 | Gerar PIX | Sistema | Criar QR Code para pagamento |
| CRE-04 | Baixar Título Manualmente | Financeiro | Registrar recebimento em dinheiro |
| CRE-05 | Baixar Título Automaticamente | Sistema | Baixa via retorno bancário ou conciliação |
| CRE-06 | Renegociar Título | Financeiro | Alterar vencimento ou parcelar dívida |
| CRE-07 | Negativar Cliente | Financeiro | Incluir cliente no Serasa/SPC |
| CRE-08 | Baixar Negativação | Financeiro | Remover cliente do Serasa/SPC após pagamento |

### 3.2 Contas a Pagar

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| CPA-01 | Gerar Título a Pagar | Sistema | Criar título automaticamente na compra |
| CPA-02 | Agendar Pagamento | Financeiro | Programar data de pagamento |
| CPA-03 | Aprovar Pagamento | Gerente | Autorizar pagamento acima do limite |
| CPA-04 | Efetuar Pagamento | Financeiro | Realizar pagamento e baixar título |
| CPA-05 | Gerar Arquivo de Pagamento | Financeiro | Criar arquivo CNAB para banco |

### 3.3 Limite de Crédito

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| LIM-01 | Definir Limite de Crédito | Financeiro | Estabelecer limite para cliente |
| LIM-02 | Solicitar Aumento de Limite | Vendedor | Pedir aumento para cliente |
| LIM-03 | Analisar Crédito | Financeiro | Avaliar histórico e aprovar/negar |
| LIM-04 | Bloquear Cliente por Limite | Sistema | Impedir venda quando limite excedido |

---

## 4. MÓDULO FISCAL

### 4.1 Documentos Fiscais

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| FIS-01 | Emitir NF-e | Faturamento | Gerar Nota Fiscal Eletrônica |
| FIS-02 | Emitir NFC-e | PDV | Gerar Cupom Fiscal Eletrônico |
| FIS-03 | Emitir NFS-e | Faturamento | Gerar Nota Fiscal de Serviço |
| FIS-04 | Cancelar NF-e | Faturamento | Cancelar nota fiscal (dentro do prazo) |
| FIS-05 | Emitir Carta de Correção | Faturamento | Corrigir dados da NF-e |
| FIS-06 | Inutilizar Numeração | Faturamento | Inutilizar faixa de números não usados |

### 4.2 Obrigações

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| OBR-01 | Gerar SPED Fiscal | Contabilidade | Exportar arquivo SPED ICMS/IPI |
| OBR-02 | Gerar SPED Contribuições | Contabilidade | Exportar arquivo PIS/COFINS |
| OBR-03 | Gerar EFD-Reinf | Contabilidade | Exportar retenções |
| OBR-04 | Consultar Situação Fiscal | Contabilidade | Verificar pendências no SEFAZ |

---

## 5. MÓDULO ESTOQUE

### 5.1 Movimentações

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| EST-01 | Dar Entrada Manual | Estoque | Registrar entrada sem NF |
| EST-02 | Dar Saída Manual | Estoque | Registrar saída sem venda |
| EST-03 | Transferir entre Filiais | Estoque | Mover produtos entre unidades |
| EST-04 | Reservar Estoque | Sistema | Reservar produtos para venda |
| EST-05 | Liberar Reserva | Sistema | Cancelar reserva de estoque |

### 5.2 Inventário

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| INV-01 | Criar Inventário | Estoque | Iniciar processo de inventário |
| INV-02 | Registrar Contagem | Operador | Informar quantidade contada |
| INV-03 | Registrar Recontagem | Supervisor | Segunda contagem em caso de divergência |
| INV-04 | Aprovar Ajuste | Gerente | Autorizar ajuste de estoque |
| INV-05 | Efetuar Ajuste | Sistema | Atualizar saldo do sistema |

### 5.3 Kits

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| KIT-01 | Montar Kit | Estoque | Criar kit a partir de componentes |
| KIT-02 | Desmontar Kit | Estoque | Desfazer kit em componentes |

---

## 6. MÓDULO EXPEDIÇÃO

### 6.1 Separação

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| EXP-01 | Gerar Lista de Separação | Sistema | Criar picking list |
| EXP-02 | Separar Pedido | Separador | Coletar itens no estoque |
| EXP-03 | Conferir Separação | Conferente | Validar itens separados |

### 6.2 Entrega

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| EXP-04 | Montar Romaneio de Carga | Expedição | Agrupar entregas por rota |
| EXP-05 | Roteirizar Entregas | Sistema | Otimizar rota de entrega |
| EXP-06 | Iniciar Rota | Motorista | Começar entregas do dia |
| EXP-07 | Registrar Entrega | Motorista | Confirmar entrega com foto e assinatura |
| EXP-08 | Registrar Ocorrência | Motorista | Informar problema na entrega |

---

## 7. MÓDULO E-COMMERCE

### 7.1 B2C (Consumidor)

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| ECB-01 | Navegar no Catálogo | Cliente | Visualizar produtos e preços |
| ECB-02 | Adicionar ao Carrinho | Cliente | Incluir produto no carrinho |
| ECB-03 | Fazer Cadastro Rápido | Cliente | Criar conta simplificada |
| ECB-04 | Finalizar Compra B2C | Cliente | Checkout com pagamento imediato |
| ECB-05 | Rastrear Pedido | Cliente | Acompanhar status da entrega |
| ECB-06 | Avaliar Produto | Cliente | Deixar avaliação e comentário |

### 7.2 B2B (Empresa)

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| ECE-01 | Solicitar Cadastro B2B | Empresa | Preencher cadastro de empresa |
| ECE-02 | Aprovar Cadastro B2B | Comercial | Analisar e aprovar empresa |
| ECE-03 | Fazer Pedido B2B | Empresa | Comprar com condições de atacado |
| ECE-04 | Solicitar Orçamento Online | Empresa | Pedir cotação pelo portal |
| ECE-05 | Repetir Pedido Anterior | Empresa | Refazer pedido com mesmos itens |
| ECE-06 | Gerenciar Listas de Compras | Empresa | Criar e manter listas salvas |

### 7.3 Área do Vendedor

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| ECV-01 | Fazer Pedido pelo Cliente | Vendedor | Criar pedido em nome do cliente |
| ECV-02 | Consultar Carteira de Clientes | Vendedor | Ver clientes vinculados |
| ECV-03 | Acompanhar Comissões | Vendedor | Consultar comissões a receber |
| ECV-04 | Ver Metas e Performance | Vendedor | Acompanhar resultados |

---

## 8. MÓDULO RH

### 8.1 Recrutamento

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| RHR-01 | Publicar Vaga | RH | Criar e divulgar vaga |
| RHR-02 | Receber Currículo | Sistema | Cadastrar candidato |
| RHR-03 | Triar Currículos | RH | Selecionar candidatos |
| RHR-04 | Agendar Entrevista | RH | Marcar entrevista com candidato |
| RHR-05 | Registrar Avaliação | RH | Documentar resultado da entrevista |

### 8.2 Admissão

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| RHA-01 | Fazer Proposta | RH | Enviar proposta de contratação |
| RHA-02 | Coletar Documentos | RH | Solicitar e receber documentação |
| RHA-03 | Agendar Exame Admissional | RH | Marcar exame médico |
| RHA-04 | Cadastrar Colaborador | RH | Criar registro do funcionário |
| RHA-05 | Registrar no eSocial | Sistema | Enviar admissão ao governo |

### 8.3 Ponto e Jornada

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| RHP-01 | Bater Ponto | Colaborador | Registrar entrada/saída |
| RHP-02 | Bater Ponto pelo App | Colaborador | Registro com geolocalização |
| RHP-03 | Solicitar Abono | Colaborador | Pedir justificativa de falta |
| RHP-04 | Aprovar Abono | Gestor | Autorizar justificativa |
| RHP-05 | Fechar Ponto do Mês | RH | Consolidar registros mensais |

### 8.4 Férias

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| RHF-01 | Solicitar Férias | Colaborador | Pedir período de férias |
| RHF-02 | Aprovar Férias | Gestor | Autorizar férias |
| RHF-03 | Programar Férias | RH | Definir férias coletivas ou individuais |
| RHF-04 | Calcular Férias | Sistema | Gerar valores a pagar |
| RHF-05 | Vender Férias (Abono) | Colaborador | Converter até 10 dias em dinheiro |

### 8.5 Folha de Pagamento

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| RHO-01 | Calcular Folha | Sistema | Processar salários do mês |
| RHO-02 | Conferir Folha | RH | Validar cálculos |
| RHO-03 | Aprovar Folha | Gerente | Autorizar pagamento |
| RHO-04 | Gerar Holerites | Sistema | Criar demonstrativos |
| RHO-05 | Pagar Folha | Financeiro | Efetuar pagamentos |

---

## 9. MÓDULO CONTRATOS

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| CTR-01 | Criar Contrato | Jurídico/Comercial | Elaborar novo contrato |
| CTR-02 | Enviar para Assinatura | Sistema | Enviar via plataforma de assinatura digital |
| CTR-03 | Assinar Contrato | Partes | Coletar assinaturas |
| CTR-04 | Renovar Contrato | Comercial | Estender vigência |
| CTR-05 | Criar Aditivo | Jurídico | Alterar termos do contrato |
| CTR-06 | Encerrar Contrato | Comercial | Finalizar contrato |

---

## 10. MÓDULO BI E RELATÓRIOS

| ID | Caso de Uso | Ator Principal | Descrição |
|----|-------------|----------------|-----------|
| BIR-01 | Visualizar Dashboard | Usuário | Acessar painel de indicadores |
| BIR-02 | Gerar Relatório | Usuário | Criar relatório com filtros |
| BIR-03 | Exportar Dados | Usuário | Baixar relatório em Excel/PDF |
| BIR-04 | Agendar Relatório | Usuário | Programar envio automático |
| BIR-05 | Criar Dashboard Personalizado | Admin | Montar painel customizado |

---

## Matriz de Rastreabilidade: Casos de Uso x Fluxogramas

| Fluxograma | Casos de Uso Relacionados |
|------------|---------------------------|
| 1. Venda Completa | VEN-01 a VEN-16, CRE-01 |
| 2. Orçamento | ORC-01 a ORC-10 |
| 3. Uso de Crédito | VEN-04, VEN-05, IND-04, PDV-04 |
| 4. Devolução | DEV-01 a DEV-05 |
| 5. Troca | DEV-06 a DEV-08 |
| 6. Consignação | CON-01 a CON-04 |
| 7. Compra | COT-01 a COT-05, COM-01 a COM-04, REC-01 a REC-05 |
| 8. Recebimento Financeiro | CRE-01 a CRE-08 |
| 9. E-commerce B2B | ECE-01 a ECE-06 |
| 10. E-commerce B2C | ECB-01 a ECB-06 |
| 11. Entrega GPS | EXP-04 a EXP-08 |
| 12. Garantia | GAR-01 a GAR-05 |
| 13. Produção | PCP-01 a PCP-05 |
| 14. Inventário | INV-01 a INV-05 |
| 15. RH Admissão | RHR-01 a RHR-05, RHA-01 a RHA-05 |
| 16. RH Folha | RHO-01 a RHO-05 |
| 17. RH Férias | RHF-01 a RHF-05 |
| 18. Contratos | CTR-01 a CTR-06 |
| 19. Precificação | (Configurações) |
| 20. Bonificação | VEN-08, VEN-09, COM-04 |
| 21. Limite de Crédito | LIM-01 a LIM-04 |
| 22. Cobrança | CRE-01 a CRE-08 |
| 23. Transferência Filiais | EST-03 |
| 24. PDV | PDV-01 a PDV-09 |
| 25. Importação NF-e | REC-01, REC-02 |

---

## Próximos Passos

- [ ] Detalhar cada caso de uso com: Pré-condições, Fluxo Principal, Fluxos Alternativos, Pós-condições
- [ ] Vincular casos de uso com requisitos funcionais
- [ ] Criar protótipos de tela para cada caso de uso

---

**Total de Casos de Uso: 145**

Última atualização: 01/12/2025

PLANAC Distribuidora - ERP - Documentação Oficial
