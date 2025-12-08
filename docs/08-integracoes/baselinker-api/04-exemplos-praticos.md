# 🧪 BASELINKER API - Exemplos Práticos

**Arquivo:** Comandos prontos para testar a integração

---

## 🔑 TOKEN DE ACESSO

```bash
export BL_TOKEN="8003146-8033898-532H6155RLJVRTS9GX0RKTKI8IO74JQ9PPAL391UOJZ9VGTP8QAT5N42HZMPC5IQ"
```

---

## 📋 CONSULTAS BÁSICAS

### Listar Inventários

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventories"
```

**Resposta esperada:**
```json
{
  "status": "SUCCESS",
  "inventories": [{
    "inventory_id": 47551,
    "name": "Padrão",
    "languages": ["br"],
    "default_language": "br",
    "price_groups": [47607],
    "warehouses": ["bl_53659"]
  }]
}
```

### Listar Status de Pedidos

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getOrderStatusList"
```

### Listar Fontes de Pedidos (Marketplaces)

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getOrderSources"
```

### Listar Grupos de Preço

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryPriceGroups"
```

### Listar Armazéns

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryWarehouses"
```

### Listar Transportadoras

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getCouriersList"
```

---

## 📁 CATEGORIAS

### Listar Categorias

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryCategories" \
  --data-urlencode 'parameters={"inventory_id":47551}'
```

### Criar Categoria

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=addInventoryCategory" \
  --data-urlencode 'parameters={
    "inventory_id": 47551,
    "category_id": 0,
    "name": "Drywall",
    "parent_id": 0
  }'
```

### Criar Subcategoria

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=addInventoryCategory" \
  --data-urlencode 'parameters={
    "inventory_id": 47551,
    "category_id": 0,
    "name": "Placas de Gesso",
    "parent_id": ID_CATEGORIA_PAI
  }'
```

---

## 🏭 FABRICANTES

### Listar Fabricantes

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryManufacturers" \
  --data-urlencode 'parameters={"inventory_id":47551}'
```

### Criar Fabricante

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=addInventoryManufacturer" \
  --data-urlencode 'parameters={
    "inventory_id": 47551,
    "manufacturer_id": 0,
    "name": "Knauf"
  }'
```

---

## 📦 PRODUTOS

### Listar Produtos (Básico)

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryProductsList" \
  --data-urlencode 'parameters={"inventory_id":47551}'
```

### Listar Produtos por SKU

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryProductsList" \
  --data-urlencode 'parameters={
    "inventory_id": 47551,
    "filter_sku": "PLACA-ST-1200"
  }'
```

### Obter Detalhes de Produto

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInventoryProductsData" \
  --data-urlencode 'parameters={
    "inventory_id": 47551,
    "products": [ID_DO_PRODUTO]
  }'
```

### ⭐ CRIAR PRODUTO (EXEMPLO COMPLETO)

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=addInventoryProduct" \
  --data-urlencode 'parameters={
    "inventory_id": "47551",
    "sku": "PLACA-ST-1200X2400",
    "ean": "7891234567890",
    "tax_rate": 18,
    "weight": 25.5,
    "height": 240,
    "width": 120,
    "length": 1.25,
    "average_cost": 45.90,
    "prices": {
      "47607": 89.90
    },
    "stock": {
      "bl_53659": 100
    },
    "locations": {
      "bl_53659": "A-01-03"
    },
    "text_fields": {
      "name": "Placa de Gesso Standard 1200x2400mm 12.5mm",
      "description": "Placa de gesso acartonado para divisórias e forros. Ideal para ambientes secos como salas, quartos e escritórios.",
      "features": {
        "Espessura": "12.5mm",
        "Largura": "1200mm",
        "Comprimento": "2400mm",
        "Tipo": "Standard (ST)",
        "Borda": "Rebaixada",
        "Cor": "Branca",
        "NCM": "6809.11.00"
      }
    },
    "images": {
      "0": "url:https://via.placeholder.com/500x500.png?text=Placa+Gesso"
    }
  }'
```

### Atualizar Estoque (Bulk)

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=updateInventoryProductsStock" \
  --data-urlencode 'parameters={
    "inventory_id": "47551",
    "products": {
      "ID_PRODUTO_1": {
        "bl_53659": 150
      },
      "ID_PRODUTO_2": {
        "bl_53659": 200
      }
    }
  }'
```

### Atualizar Preços (Bulk)

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=updateInventoryProductsPrices" \
  --data-urlencode 'parameters={
    "inventory_id": "47551",
    "products": {
      "ID_PRODUTO_1": {
        "47607": 95.90
      },
      "ID_PRODUTO_2": {
        "47607": 105.00
      }
    }
  }'
```

---

## 🛒 PEDIDOS

### Listar Pedidos Recentes

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getOrders" \
  --data-urlencode 'parameters={
    "get_unconfirmed_orders": true
  }'
```

### Listar Pedidos a partir de uma Data

```bash
# Data em formato Unix timestamp
# Para converter: date -d "2024-01-01" +%s

curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getOrders" \
  --data-urlencode 'parameters={
    "date_confirmed_from": 1704067200,
    "get_unconfirmed_orders": false
  }'
```

### Criar Pedido Manual

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=addOrder" \
  --data-urlencode 'parameters={
    "order_status_id": 299122,
    "date_add": 1733673600,
    "currency": "BRL",
    "payment_method": "Boleto",
    "payment_method_cod": false,
    "paid": false,
    "email": "cliente@teste.com",
    "phone": "41999998888",
    "delivery_method": "Transportadora",
    "delivery_price": 50.00,
    "delivery_fullname": "João da Silva",
    "delivery_company": "Construtora ABC",
    "delivery_address": "Rua das Palmeiras, 123",
    "delivery_city": "Curitiba",
    "delivery_state": "PR",
    "delivery_postcode": "80000-000",
    "delivery_country_code": "BR",
    "invoice_fullname": "João da Silva",
    "invoice_company": "Construtora ABC",
    "invoice_nip": "12345678000190",
    "invoice_address": "Rua das Palmeiras, 123",
    "invoice_city": "Curitiba",
    "invoice_state": "PR",
    "invoice_postcode": "80000-000",
    "invoice_country_code": "BR",
    "want_invoice": true,
    "products": [
      {
        "storage": "bl",
        "storage_id": 53659,
        "product_id": "ID_DO_PRODUTO",
        "name": "Placa de Gesso Standard",
        "sku": "PLACA-ST-1200",
        "price_brutto": 89.90,
        "tax_rate": 18,
        "quantity": 10,
        "weight": 25.5
      }
    ]
  }'
```

### Alterar Status do Pedido

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=setOrderStatus" \
  --data-urlencode 'parameters={
    "order_id": ID_DO_PEDIDO,
    "status_id": 299123
  }'
```

---

## 🧾 NOTAS FISCAIS

### Listar Notas Fiscais

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInvoices" \
  --data-urlencode 'parameters={}'
```

### Listar Séries de Numeração

```bash
curl --insecure -s -X POST "https://api.baselinker.com/connector.php" \
  -H "X-BLToken: $BL_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "method=getInvoiceSeries"
```

---

## 📊 SCRIPTS DE TESTE EM TYPESCRIPT

### Classe de Cliente Baselinker

```typescript
// baselinker-client.ts

interface BaselinkerResponse {
  status: 'SUCCESS' | 'ERROR';
  error_message?: string;
  error_code?: string;
  [key: string]: any;
}

export class BaselinkerClient {
  private token: string;
  private baseUrl = 'https://api.baselinker.com/connector.php';
  
  // IDs da conta Planac
  readonly INVENTORY_ID = '47551';
  readonly WAREHOUSE_ID = 'bl_53659';
  readonly PRICE_GROUP_ID = '47607';
  
  constructor(token: string) {
    this.token = token;
  }
  
  async request(method: string, params: object = {}): Promise<BaselinkerResponse> {
    const formData = new URLSearchParams();
    formData.append('method', method);
    formData.append('parameters', JSON.stringify(params));
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'X-BLToken': this.token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(`Baselinker Error: ${data.error_message} (${data.error_code})`);
    }
    
    return data;
  }
  
  // ========== PRODUTOS ==========
  
  async getProducts(filters: object = {}) {
    return this.request('getInventoryProductsList', {
      inventory_id: this.INVENTORY_ID,
      ...filters
    });
  }
  
  async getProductDetails(productIds: number[]) {
    return this.request('getInventoryProductsData', {
      inventory_id: this.INVENTORY_ID,
      products: productIds
    });
  }
  
  async createProduct(product: {
    sku: string;
    ean?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    weight?: number;
    category_id?: number;
    features?: Record<string, string>;
    images?: string[];
  }) {
    const text_fields: Record<string, any> = {
      name: product.name,
    };
    
    if (product.description) {
      text_fields.description = product.description;
    }
    
    if (product.features) {
      text_fields.features = product.features;
    }
    
    const images: Record<string, string> = {};
    if (product.images) {
      product.images.forEach((url, index) => {
        images[index.toString()] = `url:${url}`;
      });
    }
    
    return this.request('addInventoryProduct', {
      inventory_id: this.INVENTORY_ID,
      sku: product.sku,
      ean: product.ean || '',
      tax_rate: 18,
      weight: product.weight || 0,
      category_id: product.category_id || 0,
      prices: {
        [this.PRICE_GROUP_ID]: product.price
      },
      stock: {
        [this.WAREHOUSE_ID]: product.stock
      },
      text_fields,
      images: Object.keys(images).length > 0 ? images : undefined
    });
  }
  
  async updateStock(products: Record<string, number>) {
    const stockUpdate: Record<string, Record<string, number>> = {};
    
    for (const [productId, quantity] of Object.entries(products)) {
      stockUpdate[productId] = {
        [this.WAREHOUSE_ID]: quantity
      };
    }
    
    return this.request('updateInventoryProductsStock', {
      inventory_id: this.INVENTORY_ID,
      products: stockUpdate
    });
  }
  
  async updatePrices(products: Record<string, number>) {
    const priceUpdate: Record<string, Record<string, number>> = {};
    
    for (const [productId, price] of Object.entries(products)) {
      priceUpdate[productId] = {
        [this.PRICE_GROUP_ID]: price
      };
    }
    
    return this.request('updateInventoryProductsPrices', {
      inventory_id: this.INVENTORY_ID,
      products: priceUpdate
    });
  }
  
  // ========== CATEGORIAS ==========
  
  async getCategories() {
    return this.request('getInventoryCategories', {
      inventory_id: this.INVENTORY_ID
    });
  }
  
  async createCategory(name: string, parentId: number = 0) {
    return this.request('addInventoryCategory', {
      inventory_id: this.INVENTORY_ID,
      category_id: 0,
      name,
      parent_id: parentId
    });
  }
  
  // ========== FABRICANTES ==========
  
  async getManufacturers() {
    return this.request('getInventoryManufacturers', {
      inventory_id: this.INVENTORY_ID
    });
  }
  
  async createManufacturer(name: string) {
    return this.request('addInventoryManufacturer', {
      inventory_id: this.INVENTORY_ID,
      manufacturer_id: 0,
      name
    });
  }
  
  // ========== PEDIDOS ==========
  
  async getOrders(fromDate?: number) {
    const params: any = {
      get_unconfirmed_orders: false
    };
    
    if (fromDate) {
      params.date_confirmed_from = fromDate;
    }
    
    return this.request('getOrders', params);
  }
  
  async getOrderStatuses() {
    return this.request('getOrderStatusList');
  }
  
  async setOrderStatus(orderId: number, statusId: number) {
    return this.request('setOrderStatus', {
      order_id: orderId,
      status_id: statusId
    });
  }
}

// ========== USO ==========

const TOKEN = '8003146-8033898-532H6155RLJVRTS9GX0RKTKI8IO74JQ9PPAL391UOJZ9VGTP8QAT5N42HZMPC5IQ';
const client = new BaselinkerClient(TOKEN);

// Exemplo: Criar categoria
// const cat = await client.createCategory('Drywall');

// Exemplo: Criar produto
// const product = await client.createProduct({
//   sku: 'TESTE-001',
//   name: 'Produto Teste',
//   price: 99.90,
//   stock: 50
// });

// Exemplo: Atualizar estoque
// await client.updateStock({ '12345': 100 });
```

---

## 🎯 CHECKLIST DE TESTES

### Configuração Inicial
- [ ] Testar conexão com `getInventories`
- [ ] Verificar grupos de preço com `getInventoryPriceGroups`
- [ ] Verificar armazéns com `getInventoryWarehouses`
- [ ] Verificar status de pedidos com `getOrderStatusList`

### Categorias e Fabricantes
- [ ] Listar categorias existentes
- [ ] Criar categoria "Drywall"
- [ ] Criar subcategorias (Placas, Perfis, Massas, etc.)
- [ ] Criar fabricantes (Knauf, Placo, Gypsum, etc.)

### Produtos
- [ ] Criar produto de teste
- [ ] Listar produtos
- [ ] Obter detalhes do produto
- [ ] Atualizar estoque
- [ ] Atualizar preço

### Pedidos
- [ ] Listar pedidos (deve estar vazio)
- [ ] Criar pedido manual de teste
- [ ] Alterar status do pedido

---

*Gerado por 🏢 DEV.com*
