# 📖 BASELINKER API - REFERÊNCIA DETALHADA DE TODOS OS MÉTODOS

> **139 métodos documentados com parâmetros de entrada e saída**

---

## PRODUCT CATALOG

### addInventoryPriceGroup
```
    
    
        
            
            
            
            
                                    
addInventoryPriceGroup
            The method allows to create a price group in BaseLinker storage. Providing a price group ID will update the existing price group. Such price groups may be later assigned in addInventory method. 
            
            
Input parameters
                    
                        
price_group_id
int
Price group identifier
name
varchar(100)
Name of the price group
description
text
Price group description
currency
char(3)
3-letter currency symbol e.g. PLN, EUR
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
price_group_id
int
The ID number of added or updated price group.
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "USA",
    "description": "Price group for US market",
    "currency": "USD"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "price_group_id": 105
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "name": "USA",
    "description": "Price group for US market",
    "currency": "USD"
}';
$apiParams = [
    "method" => "addInventoryPriceGroup",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
```

### deleteInventoryPriceGroup
```
    
    
        
            
            
            
            
                                    
deleteInventoryPriceGroup
            The method allows you to remove the price group from BaseLinker storage.
            
            
Input parameters
                    
                        
price_group_id
int
Price group identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "price_group_id": 105
}
                    Output data:
                    
{
    "status": "SUCCESS",
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "price_group_id": 105
}';
$apiParams = [
    "method" => "deleteInventoryPriceGroup",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
```

### getInventoryPriceGroups
```
    
    
        
            
            
            
            
                                    
getInventoryPriceGroups
            The method allows to retrieve price groups existing in BaseLinker storage
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
price_groups
array
An array of available price group identifiers
| - price_group_id
int
Price group identifier
| - name
varchar(100)
Name of the price group
| - description
text
Price group description
| - currency
int
3-letter currency symbol e.g. PLN, EUR
| - is_default
bool
Flag indicating whether the price group is default
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "price_groups": [
        {
            "price_group_id": 104,
            "name": "Default",
            "description": "Default price group",
            "currency": "EUR",
            "is_default": true
        },
        {
            "price_group_id": 105,
            "name": "USA",
            "description": "Price group for US market",
            "currency": "USD",
            "is_default": false
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryPriceGroups",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
```

### addInventoryWarehouse
```
    
    
        
            
            
            
            
                                    
addInventoryWarehouse
            The method allows you to add a new warehouse available in BaseLinker inventories. Adding a warehouse with the same identifier again will cause updates of the previously saved warehouse. The method does not allow editing warehouses created automatically for the purpose of keeping external stocks of shops, wholesalers etc. Such warehouse may be later used in addInventory method.
            
            
Input parameters
                    
                        
warehouse_id
int
ID of the warehouse
name
varchar(100)
Warehouse name
description
text
Warehouse description
stock_edition
bool
Is manual editing of stocks permitted. A false value means that you can only edit your stock through the API.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
warehouse_id
int
the ID of created or updated warehouse
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "Berlin",
    "description": "Warehouse located in Berlin",
    "stock_edition": false
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "warehouse_id": 206
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "name": "Berlin",
    "description": "Warehouse located in Berlin",
    "stock_edition": false
}';
$apiParams = [
    "method" => "addInventoryWarehouse",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
```

### deleteInventoryWarehouse
```
    
    
        
            
            
            
            
                                    
deleteInventoryWarehouse
            The method allows you to remove the warehouse available in BaseLinker inventories. The method does not allow to remove warehouses created automatically for the purpose of keeping external stocks of shops, wholesalers etc.
            
            
Input parameters
                    
                        
warehouse_id
int
ID of the warehouse
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "warehouse_id": 206
}
                    Output data:
                    
{
    "status": "SUCCESS",
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "warehouse_id": 206
}';
$apiParams = [
    "method" => "deleteInventoryWarehouse",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
```

### getInventoryWarehouses
```
    
    
        
            
            
            
            
                                    
getInventoryWarehouses
            The method allows you to retrieve a list of warehouses available in BaseLinker inventories. The method also returns information about the warehouses created automatically for the purpose of keeping external stocks (shops, wholesalers etc.)
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
warehouses
array
An array of warehouses containing the fields listed below
| - warehouse_type
varchar(30)
Warehouse type. One of the following values: [bl|shop|warehouse].
| - warehouse_id
int
Warehouse identifier
| - name
varchar(100)
Warehouse name
| - description
text
Warehouse description
| - stock_edition
bool
Is manual stock editing permitted. A false value means that you can only edit your stock through the API.
| - is_default
bool
Is this warehouse a default warehouse
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "warehouses": [
        {
            "warehouse_type": "bl",
            "warehouse_id": 205,
            "name": "Default",
            "description": "Default warehouse located in London",
            "stock_edition": true,
            "is_default": true
        },
        {
            "warehouse_type": "shop",
            "warehouse_id": 2334,
            "name": "MyShop.com",
            "description": "Warehouse keeping stocks for Myshop.com",
            "stock_edition": false,
            "is_default": false
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryWarehouses",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
```

### addInventory
```
    
    
        
            
            
            
            
                                    
addInventory
            The method allows you to add the BaseLinker catalogs. Adding a catalog with the same identifier again will cause updates of the previously saved catalog.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
name
varchar(100)
Catalog name
description
text
Catalog description
languages
array
An array of languages available in the inventory.
default_language
char(2)
Default inventory language. Must be included in the "languages" parameter.
price_groups
array
An array of price group identifiers available in the inventory. The list of price group identifiers can be downloaded using the getInventoryPriceGroups method
default_price_group
int
ID of the price group default for the inventory. The identifier must be included in the "price_groups" parameter.
warehouses
array
An array of warehouse identifiers available in the inventory. The list of warehouse identifiers can be retrieved using the getInventoryWarehouses API method. The format of the identifier should be as follows: "[type:bl|shop|warehouse]_[id:int]". (e.g. "shop_2445")
default_warehouse
varchar(30)
Identifier of the warehouse default for the inventory.  The identifier must be included in the "warehouses" parameter.
reservations
bool
Does this inventory support reservations
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "Additional catalog",
    "description": "Additional product catalog",
    "languages": ["en", "de"],
    "default_language": "en",
    "price_groups": [105],
    "default_price_group": 105,
    "warehouses": ["bl_205", "shop_2334"],
    "default_warehouse": "bl_205",
    "reservations": true
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "inventory_id": 307
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "name": "Additional catalog",
    "description": "Additional product catalog",
    "languages": [
        "en",
        "de"
    ],
```

### deleteInventory
```
    
    
        
            
            
            
            
                                    
deleteInventory
            The method allows you to delete a catalog from BaseLinker storage.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": 307
}
                    Output data:
                    
{
    "status": "SUCCESS",
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": 307
}';
$apiParams = [
    "method" => "deleteInventory",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
```

### getInventories
```
    
    
        
            
            
            
            
                                    
getInventories
            The method allows you to retrieve a list of catalogs available in the BaseLinker storage.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
inventories
array
An array of available catalogs
| - inventory_id
int
ID of a catalog
| - name
varchar(100)
Catalog name
| - description
text
Catalog description
| - languages
array
An array of languages available in the inventory.
| - default_language
char(2)
Default language of the catalog.
| - price_groups
array
An array of price groups IDs available in the catalog
| - default_price_group
int
ID of the price group default for the catalog
| - warehouses
array
An array of warehouse IDs available in the catalog
| - default_warehouse
varchar(30)
ID of the warehouse default for the catalog
| - reservations
bool
Does this inventory support reservations
| - is_default
bool
Is this catalog a default catalog
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "inventories": [
        {
            "inventory_id": 306,
            "name": "Default",
            "description": "Default catalog",
            "languages": ["en"],
            "default_language": "en",
            "price_groups": [105],
            "default_price_group": 105,
            "warehouses": ["bl_205", "shop_2334", "warehouse_4556"],
            "default_warehouse": "bl_205",
            "reservations": false,
            "is_default": true
        },
        {
            "inventory_id": 307,
            "name": "Default",
            "description": "Default catalog",
            "languages": ["en", "de"],
            "default_language": "en",
            "price_groups": [105],
            "default_price_group": 105,
            "warehouses": ["bl_205", "shop_2334"],
            "default_warehouse": "bl_205",
```

### addInventoryCategory
```
    
    
        
            
            
            
            
                                    
addInventoryCategory
            The method allows you to add a category to the BaseLinker catalog. Adding a category with the same identifier again, updates the previously saved category
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved by the getInventories method (inventory_id field). To add a category available for all catalogs created in BaseLinker, this field should be omitted.
category_id
int
The category identifier to be provided for updates. Should be left blank when creating a new category.
name
varchar(200)
Category name
parent_id
int
The parent category identifier obtained previously at the output of the addCategory method. Categories should be added starting from the hierarchy root so that the child is always added after the parent (you need to know the parent ID to add the child). For the top level category, 0 should be given as parent_id.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
category_id
int
Number of a category added or updated in BaseLinker storage. In an external application you should create a link between the internal number and the number received here. It will later be used to update the added category. This number is also used in addProducts and deleteCategory methods.
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "Textiles",
    "parent_id": 5
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "category_id": 6
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "name": "Textiles",
    "parent_id": 5
}';
$apiParams = [
    "method" => "addInventoryCategory",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
```

### deleteInventoryCategory
```
    
    
        
            
            
            
            
                                    
deleteInventoryCategory
            The method allows you to remove categories from BaseLinker warehouse. Along with the category, the products contained therein are removed (however, this does not apply to products in subcategories). The subcategories will be changed to the highest level categories.
            
            
Input parameters
                    
                        
category_id
int
The number of the category to be removed in the BaseLinker storage.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "category_id": 6
}
                    Output data:
                    
{
    "status": "SUCCESS",
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "category_id": 6
}';
$apiParams = [
    "method" => "deleteInventoryCategory",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
```

### getInventoryCategories
```
    
    
        
            
            
            
            
                                    
getInventoryCategories
            The method allows you to retrieve a list of categories for a BaseLinker catalog.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved by the getInventories method (inventory_id field). To retrieve categories available for all catalogs created in BaseLinker, this field should be omitted.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
categories
array
An array of categories containing the fields listed below.
| - category_id
int
Category ID.
| - name
varchar(200)
Category name
| - parent_id
int
Parent category identifier.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "categories": [
        {
            "category_id": 5,
            "name": "Products",
            "parent_id": 0
        },
        {
            "category_id": 6,
            "name": "Textiles",
            "parent_id": 5
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryCategories",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
```

### getInventoryTags
```
    
    
        
            
            
            
            
                                    
getInventoryTags
            The method allows you to retrieve a list of tags for a BaseLinker catalog.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
tags
array
A list containing available tags.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "tags": [
        {
            "name": "Summer"
        },
        {
            "name": "Winter"
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryTags",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    function paste_example()
```

### addInventoryManufacturer
```
    
    
        
            
            
            
            
                                    
addInventoryManufacturer
            The method allows you to add a manufacturer to the BaseLinker catalog. Adding a manufacturer with the same identifier again, updates the previously saved manufacturer
            
            
Input parameters
                    
                        
manufacturer_id
int
Manufacturer ID provided in case of an update. Should be blank when creating a new manufacturer.
name
varchar(200)
Manufacturer name
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
manufacturer_id
int
ID of a created or updated manufacturer
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "Test manufacturer 2"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "manufacturer_id": 8
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "name": "Test manufacturer 2"
}';
$apiParams = [
    "method" => "addInventoryManufacturer",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
```

### deleteInventoryManufacturer
```
    
    
        
            
            
            
            
                                    
deleteInventoryManufacturer
            The method allows you to remove manufacturer from BaseLinker catalog
            
            
Input parameters
                    
                        
manufacturer_id
int
The ID of the manufacturer removed from BaseLinker warehouse.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "manufacturer_id": 8
}
                    Output data:
                    
{
    "status": "SUCCESS",
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "manufacturer_id": 8
}';
$apiParams = [
    "method" => "deleteInventoryManufacturer",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
```

### getInventoryManufacturers
```
    
    
        
            
            
            
            
                                    
getInventoryManufacturers
            The method allows you to retrieve a list of manufacturers for a BaseLinker catalog.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
manufacturers
array
An array of manufacturers containing the fields listed below.
| - manufacturer_id
int
Manufacturer ID.
| - name
varchar(200)
Manufacturer name.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "manufacturers": [
        {
            "manufacturer_id": 7,
            "name": "Test manufacturer"
        },
        {
            "manufacturer_id": 8,
            "name": "Test manufacturer 2"
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryManufacturers",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
```

### getInventoryExtraFields
```
    
    
        
            
            
            
            
                                    
getInventoryExtraFields
            The method allows you to retrieve a list of extra fields for a BaseLinker catalog.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extra_fields
array
An array of extra fields containing the fields listed below
| - extra_field_id
int
ID of the extra field
| - name
varchar
Field name.
| - kind
int
Type of additional field. Value 0 indicates a short field (max 200 characters). Value 1 means a long field (no limit of characters), where the value can be overwritten for specific integrations e.g. marketplace.
| - editor_type
varchar
Editor type. The following values are available: text, number, select, checkbox, radio, date, file.
| - options
array
(optional) An array of values available for a given additional field. Applicable to select, checkbox and radio editors.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "extra_fields": [
        {
            "extra_field_id": 201,
            "name": "Short text field",
            "kind": 0,
            "editor_type": "text"
        },
        {
            "extra_field_id": 202,
            "name": "Select field",
            "kind": 0,
            "editor_type": "select",
            "options": ["First option", "Second option", "Third option"]
        },
        {
            "extra_field_id": 203,
            "name": "Long (translated) text field",
            "kind": 1,
            "editor_type": "text"
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getInventoryExtraFields",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
```

### getInventoryIntegrations
```
    
    
        
            
            
            
            
                                    
getInventoryIntegrations
            The method returns a list of integrations where text values in the catalog can be overwritten. The returned data contains a list of accounts for each integration and a list of languages supported by the integration
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved by the getInventories method (inventory_id field).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
integrations
array
A list containing information about the integrations, where the code of the integration is the key. The value is an array containing the fields listed below.
| - langs
array
An array of two-letter codes for the languages supported by a given integration, e.g. ["en", "de"].
| - accounts
array
List of connected accounts of a given integration, where the key is the account identifier and the value is the account name.
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": 307
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "integrations": [
        {
            "ebay": {
                "langs": ["pl","en","de"],
                "accounts": {
                    "301": "eBay account, ID 301"
                }
            },
            "amazon": {
                "langs": ["en","de"],
                "accounts": {
                    "402": "Amazon account, ID 402",
                    "401": "Amazon account, ID 401"
                }
            },
            "emag": {
                "langs": ["pl"],
                "accounts": {
                    "101": "emag account, ID 301"
                }
            },
            "custom_422": {
                "langs": ["en", "de"],
                "accounts": {
                    "422": "My custom channel"
                }
            }
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": 307
}';
$apiParams = [
    "method" => "getInventoryIntegrations",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
```

### getInventoryAvailableTextFieldKeys
```
    
    
        
            
            
            
            
                                    
getInventoryAvailableTextFieldKeys
            The method returns a list of product text fields that can be overwritten for specific integration.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved by the getInventories method (inventory_id field).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
text_field_keys
array
A list containing product text fields, where the key is the code of the text field and the value is the text field name
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": 307
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "text_field_keys": {
        "name": "Product name (EN)",
        "description": "Description (EN)",
        "description_extra1": "Additional description 1 (EN)",
        "description_extra2": "Additional description 2 (EN)",
        "description_extra3": "Additional description 3 (EN)",
        "description_extra4": "Additional description 4 (EN)",
        "features": "Parameters (EN)",
        "extra_field_201": "Short text field",
        "extra_field_202": "Select field",
        "extra_field_203": "Long (translated) text field (DE)",
        "name|de|ebay_0": "eBay - Product name (DE)",
        "description|de|ebay_0": "eBay - Description (DE)",
        "description_extra1|de|ebay_0": "eBay - Additional description 1 (DE)",
        "description_extra2|de|ebay_0": "eBay - Additional description 2 (DE)",
        "description_extra3|de|ebay_0": "eBay - Additional description 3 (DE)",
        "description_extra4|de|ebay_0": "eBay - Additional description 4 (DE)",
        "features|de|ebay_0": "eBay - Parameters (DE)",
        "extra_field_4|de|ebay_0": "eBay - translated field (DE)",
        "name|de|ebay_301": "eBay [eBay Account 301] - Product name (DE)",
        "description|de|ebay_301": "eBay [eBay Account 301] - Description (DE)",
        "description_extra1|de|ebay_301": "eBay [eBay Account 301] - Additional description 1 (DE)",
        "description_extra2|de|ebay_301": "eBay [eBay Account 301] - Additional description 2 (DE)",
        "description_extra3|de|ebay_301": "eBay [eBay Account 301] - Additional description 3 (DE)",
        "description_extra4|de|ebay_301": "eBay [eBay Account 301] - Additional description 4 (DE)",
        "features|de|ebay_301": "eBay [eBay Account 301] - Parameters (DE)",
        "extra_field_4|de|ebay_301": "eBay [eBay Account 301] - Long (translated) text field (DE)"
    }
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": 307
}';
$apiParams = [
    "method" => "getInventoryAvailableTextFieldKeys",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
```

### addInventoryProduct
```
    
    
        
            
            
            
            
                                    
addInventoryProduct
            The method allows you to add a new product to BaseLinker catalog. Entering the product with the ID updates previously saved product.
            
            
Input parameters
                    
                        
inventory_id
varchar(30)
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
. (inventory_id field).
product_id
varchar(30)
Main product identifier, given only during the update. Should be left blank when creating a new product. The new product identifier is returned as a response to this method.
parent_id
varchar(30)
Product parent ID. To be provided only if the added/edited product is a variant of another product.
is_bundle
bool
Is the given product a part of a bundle
sku
varchar(50)
Product SKU number.
ean
varchar(32)
Product EAN number.
ean_additional
array
A list containing EAN numbers. Each EAN data should be an array containing the fields listed below:
ean
 (string) - EAN number
quantity
 (int) - quantity of product with given EAN number
asin
varchar(50)
Product ASIN number.
tags
array
A list containing tag names. If:
            
No tags are provided in the API request, the product retains its existing tags (e.g., A, B, C).
            
Tags A, B, and C are provided in the API request, the product retains its existing tags (A, B, C).
            
Tags B and C are provided in the API request, tag A is removed from the product, leaving tags B and C.
            
An empty list of tags is provided in the API request, all existing tags (A, B, C) are removed from the product.
            
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
weight
decimal(10,2)
Weight in kilograms.
height
decimal(10,2)
Product height
width
decimal(10,2)
Product width
length
decimal(10,2)
Product length
average_cost
decimal(10,2)
Product average cost. If storage documents are turned off, this field sets product average cost. If storage documents are turned on, a value in this field can be set in two cases: while creating a new product or when a current average cost is set to 0.
star
int
Product star type. It takes from 0 to 5 values. 0 means no starring.
manufacturer_id
int
Product manufacturer ID. IDs can be retrieved with 
getInventoryManufacturers
 method.
category_id
int
Product category ID (category must be previously created with 
addInventoryCategories
) method.
prices
array
A list containing product prices, where the key is the price group ID and value is a product gross price for a given price group. The list of price groups can be retrieved with 
getInventoryPriceGroups
 method.
stock
array
A list containing product stocks, where the key is the warehouse ID and value is a product stock for a given warehouse. Warehouse ID should have the following format: "bl_[id:int]" (eg. "bl_123").The list of warehouse IDs can be retrieved with 
```

### deleteInventoryProduct
```
    
    
        
            
            
            
            
                                    
deleteInventoryProduct
            The method allows you to remove the product from BaseLinker catalog.
            
            
Input parameters
                    
                        
product_id
int
BaseLinker inventory product identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "product_id": 8
}
                    Output data:
                    
{
    "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "product_id": 8
}';
$apiParams = [
    "method" => "deleteInventoryProduct",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
```

### getInventoryProductsData
```
    
    
        
            
            
            
            
                                    
getInventoryProductsData
            The method allows you to retrieve detailed data for selected products from the BaseLinker inventory.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
products
array
An array of product ID numbers to download
include_erp_units
bool
(optional) Include ERP units in the response. Only available for inventories with purchase cost calculations system different than AVCO.
include_wms_units
bool
(optional) Include WMS units in the response. Only available for inventories with enabled advanced warehouse management system.
include_additional_eans
bool
(optional) Include additional EANs in response. User can set additional EANs for product, to work with products cases (4-pack etc.) or different regional codes for the same product.
include_suppliers
bool
(optional) Include suppliers data in the response.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
products
array
A list of products where the key is the product id and the value is an array of fields listed below.
| - is_bundle
bool
Indicates whether a product is a bundle.
| - sku
varchar(32)
Product SKU number. It can be filled with e.g. an external system product number. This will later allow you to rebuild the list of product associations in case of loss.
| - ean
varchar(32)
Product EAN number (primary EAN).
| - ean_additional
array
A list containing EAN numbers. Each EAN data is an array containing the fields listed below.
ean
 (string) - EAN number
quantity
 (int) - quantity of product with given EAN number
| - asin
varchar(50)
Product ASIN number (primary ASIN).
| - tags
array
A list of product tags.
| - tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
| - weight
float
Weight in kilograms
| - height
float
Height in centimeters
| - width
float
Width in centimeters
| - length
float
Length in centimeters
| - star
float
A type of star assigned to product
| - category_id
int
Product category ID (the category must be created earlier with the addCategories method)
| - manufacturer_id
int
Product manufacturer ID. IDs can be retrieved with 
getInventoryManufacturers
```

### getInventoryProductsList
```
    
    
        
            
            
            
            
                                    
getInventoryProductsList
            The method allows to retrieve a basic data of chosen products from BaseLinker catalogs.
Performance Recommendation:
 For retrieving product prices and stock (especially with variants), use the dedicated 
getInventoryProductsPrices
 and 
getInventoryProductsStock
 methods. This method should be used primarily for basic product information.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
filter_id
int
(optional) limiting results to a specific product id
filter_category_id
int
(optional) Retrieving products from a specific category (optional)
filter_sku
varchar(50)
(optional) limiting the results to a specific SKU (stock keeping number)
filter_ean
varchar(32)
(optional) limiting results to a specific ean
filter_asin
varchar(50)
(optional) limiting results to a specific asin
filter_name
varchar(200)
(optional) item name filter (part of the searched name or an empty field)
filter_price_from
float
(optional) minimum price limit (not displaying products with lower price)
filter_price_to
float
(optional) maximum price limit
filter_stock_from
int
(optional) minimum quantity limit
filter_stock_to
int
(optional) maximum quantity limit
page
int
(optional) Results paging (1000 products per page for BaseLinker warehouse)
filter_sort
varchar(30)
(optional) the value for sorting the product list. Possible values: "id [ASC|DESC]"
include_variants
bool
(optional) Include product variants additonally to products
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
products
array
A list of products where the key is the product id and the value is an array of fields listed below.
| - id
int
Product ID number.
| - sku
varchar(32)
Product SKU number.
| - ean
varchar(32)
Product EAN number.
| - asin
varchar(50)
Product ASIN number.
| - name
varchar(200)
Product name
| - prices
array
```

### getInventoryProductsStock
```
    
    
        
            
            
            
            
                                    
getInventoryProductsStock
            The method allows you to retrieve stock data of products from BaseLinker catalogs.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
page
int
(optional) Results paging (1000 products per page for BaseLinker warehouse)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
products
array
A list containing product stocks, where the key is the product ID and the value is an array containing the fields listed below.
| - product_id
int
ID of the product.
| - stock
array
A list where the key is the warehouse ID and the value is a stock for this warehouse. Warehouse ID should have the following format: "[type:bl|shop|warehouse]_[id:int]" (e.g. "bl_123"). The list of warehouse IDs can be retrieved with 
getInventoryWarehouses
 method.
| - reservations
array
Only returned for inventories that have reservations enabled. A list where the key is the warehouse ID and the value is a reserved stock for this warehouse. Warehouse ID should have the following format: "[type:bl|shop|warehouse]_[id:int]" (e.g. "bl_123"). The list of warehouse IDs can be retrieved with 
getInventoryWarehouses
 method.
| - variants
array
A list containing variants stocks, where the key is the variant ID. The value is a list where a key is a warehouse ID and value is a stock in this warehouse.
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": "307"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "products": {
        "2685": {
            "product_id": 2685,
            "stock": {
                "bl_206": 5,
                "bl_207": 7
            },
            "reservations": {
                "bl_206": 0,
                "bl_207": 2
            }
        },
        "2686": {
            "product_id": 2686,
            "stock": {
                "bl_206": 5,
                "bl_207": 7
            },
            "reservations": {
                "bl_206": 1,
                "bl_207": 3
            }
            "variants": {
                "2687": {
                    "bl_206": 2,
                    "bl_207": 4
                },
                "2688": {
                    "bl_206": 3,
                    "bl_207": 3
```

### updateInventoryProductsStock
```
    
    
        
            
            
            
            
                                    
updateInventoryProductsStock
            The method allows to update stocks of products (and/or their variants) in BaseLinker catalog. Maximum 1000 products at a time.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
products
array
An array of products, where the key is a product ID and the value is a list of stocks. When determining the variant stock, provide variant ID as a product ID.
In the stocks array the key should be the warehouse ID and the value - stock for that warehouse. The format of the warehouse identifier should be as follows: "[type:bl|shop|warehouse]_[id:int]". (e.g. "bl_123"). The list of warehouse identifiers can be retrieved using the 
getInventoryWarehouses
method.
Stocks 
cannot be assigned
 to the warehouses created automatically for purposes of keeping external stocks (shops, wholesalers, etc.).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
counter
int
Number of updated products.
warnings
array
Warning list for product updates. The key of each element is the product identifier, the value is the update error message. Only the keys containing an error are returned.
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": "307",
    "products": {
        "2685": {
            "bl_206": 5,
            "bl_207": 7
        },
        "2687": {
            "bl_206": 2,
            "bl_207": 4
        }
    }
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "counter": 2,
    "warnings": ""
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": "307",
    "products": {
        "2685": {
            "bl_206": 5,
            "bl_207": 7
        },
        "2687": {
            "bl_206": 2,
            "bl_207": 4
        }
    }
}';
$apiParams = [
    "method" => "updateInventoryProductsStock",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
```

### getInventoryProductsPrices
```
    
    
        
            
            
            
            
                                    
getInventoryProductsPrices
            The method allows to retrieve the gross prices of products from BaseLinker inventories.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
page
int
(optional) Results paging (1000 products per page for BaseLinker warehouse)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
products
array
A list containing product prices, where the key is the product ID and the value is an array containing the fields listed below.
| - prices
float
A list where the key is the price group identifier and the value is the gross price set for that price group. The list of price groups can be retrieved using the 
getInventoryPriceGroups
 method.
| - variants
array
A list containing variant prices, where the key is the variant ID. The value is a list where a key is the price group identifier and value is the gross price set for that price group.
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": "307"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "products": {
        "2685": {
            "prices": {
                "105": 20.99,
                "106": 23.99
            }
        },
        "2686": {
            "prices": {
                "105": 21.99,
                "106": 24.99
            },
            "variants": {
                "2687": {
                    "105": 21.99,
                    "106": 23.99
                },
                "2688": {
                    "105": 20.99,
                    "106": 22.99
                }
            }
        }
    }
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": "307"
}';
$apiParams = [
    "method" => "getInventoryProductsPrices",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
```

### updateInventoryProductsPrices
```
    
    
        
            
            
            
            
                                    
updateInventoryProductsPrices
            The method allows bulk update of gross prices of products (and/or their variants) in the BaseLinker catalog. Maximum 1000 products at a time.
            
            
Input parameters
                    
                        
inventory_id
int
Catalog ID. The list of identifiers can be retrieved using the method 
getInventories
.
products
array
An array of products, where the key is a product ID and the value is a list of prices. When determining the variant price, provide variant ID as a product ID.
In the prices array the key should be the price group ID and the value - price for that price group. The list of price groups can be retrieved using the 
getInventoryPriceGroups
 method.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
counter
int
Number of updated products.
warnings
array
Warning list for product updates. The key of each element is the product identifier, the value is the update error message. Only the keys containing an error are returned.
                    
                    
                    
Sample
                    Input data:
                    
{
    "inventory_id": "307",
    "products": {
        "2685": {
            "105": 21.99,
            "106": 24.99
        },
        "2687": {
            "105": 21.99,
            "106": 23.99
        }
    }
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "counter": 2,
    "warnings": ""
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "inventory_id": "307",
    "products": {
        "2685": {
            "105": 21.99,
            "106": 24.99
        },
        "2687": {
            "105": 21.99,
            "106": 23.99
        }
    }
}';
$apiParams = [
    "method" => "updateInventoryProductsPrices",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
```

### getInventoryProductLogs
```
    
    
        
            
            
            
            
                                    
getInventoryProductLogs
            The method allows to retrieve a list of events related to product change (or their variants) in the BaseLinker catalog.
            
            
Input parameters
                    
                        
product_id
int
Product identifier. In case of retrieving logs for a variant, the variant identifier must be provided as the product identifier.
date_from
int
(optional) Date from which logs are to be retrieved. Unix time stamp format.
date_to
int
(optional) Date up to which logs are to be retrieved. Unix time stamp format.
log_type
int
(optional) List of event types you want to retrieve. Available values:
1 - Change in stock
                    
2 - Price change
                    
3 - Product creation
                    
4 - Product deletion
                    
5 - Text fields modifications
                    
6 - Locations modifications
                    
7 - Modifications of links
                    
8 - Gallery modifications
                    
9 - Variant modifications
                    
10 - Modifications of bundle products
sort
int
(optional) Type of log sorting. Possible "ASC" values ( ascending from date), "DESC" (descending after the date). By default the sorting is done in ascending order.
page
int
(optional) Results paging (100 product editions per page).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
logs
array
An array of logs grouped by date and the profile executing the change. An array contains the fields listed below.
| - profile
string
The name of the profile performing the change.
| - date
int
Event date
| - entries
array
An array of events performed by a given profile at a given time. An array contains the fields listed below.
| - | - type
array
Event type. Available values:
1 - Change in stock
                    
2 - Price change
                    
3 - Product creation
                    
4 - Product deletion
                    
5 - Text fields modifications
                    
6 - Locations modifications
                    
7 - Modifications of links
                    
8 - Gallery modifications
                    
9 - Variant modifications
                    
```

### runProductMacroTrigger
```
    
    
        
            
            
            
            
                                    
runProductMacroTrigger
            The method allows you to run personal trigger for products automatic actions.
            
            
Input parameters
                    
                        
product_id
int
Product identifier from BaseLinker product manager.
trigger_id
int
Identifier of personal trigger from products automatic actions.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "product_id":"143476260",
        "trigger_id":"12413"
    }
                    Output data:
                    
{ "status": "SUCCESS" }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "product_id": "143476260",
    "trigger_id": "12413"
}';
$apiParams = [
    "method" => "runProductMacroTrigger",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
```


---

## INVENTORY DOCUMENTS

### addInventoryDocument
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInventoryDocument
            The method allows you to create a new inventory document in BaseLinker storage. Documents are created as draft and need to be confirmed by the user or setInventoryDocumentStatusConfirmed API method.
            
            
Input parameters
                    
                        
warehouse_id
int
Source warehouse identifier
document_type
int
Document type 
                
0 - GR (Goods Received)
                
1 - IGR (Internal Goods Received)
                
2 - GI (Goods Issue)
                
3 - IGI (Internal Goods Issue)
                
4 - IT (Internal Transfer)
                
5 - OB (Opening Balance)
                
target_warehouse_id
int
(optional) Target warehouse identifier - required only for transfer documents
date_add
int
(optional) Date of document creation (in unix time format). If not specified, the current date will be used.
date_execute
int
(optional) Date of document execution (in unix time format). If not specified, the current date will be used.
contractor
varchar(500)
(optional) Contractor description/notes
invoice_no
varchar(50)
(optional) Related invoice number
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
document_id
int
Created document identifier
document_number
string
Generated document number
                    
                    
                    
Sample
                    Input data:
                    
{
        "warehouse_id": 205,
        "document_type": 2,
        "date_add": 1740479190,
```

### setInventoryDocumentStatusConfirmed
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setInventoryDocumentStatusConfirmed
            The method allows you to confirm an inventory document, which will affect the stock levels in the warehouse.
            
            
Input parameters
                    
                        
document_id
int
Document identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "document_id": 101
}
                    Output data:
                    
{ "status": "SUCCESS" }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "document_id": 101
}';
$apiParams = [
    "method" => "setInventoryDocumentStatusConfirmed",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
```

### getInventoryDocuments
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryDocuments
            This method allows you to retrieve a list of inventory documents from BaseLinker. It supports pagination and optional filtering by document type, date range, etc.
            
            
Input parameters
                    
                        
filter_document_id
int
(optional) A specific inventory document ID.
filter_document_type
int
(optional) The document type, consistent with the "type" field in the inventory_documents table.
filter_document_status
int
(optional) The document status.
0 - Draft
1 - Confirmed
filter_date_from
int
(optional) The minimum creation date (in Unixtime) to filter by.
filter_date_to
int
(optional) The maximum creation date (in Unixtime) to filter by.
filter_warehouse_id
int
(optional) The warehouse ID.
page
int
(optional) Page number of the results (e.g. 1, 2, 3...). Maximum 100 documents per page.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
"SUCCESS" - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
documents
array
An array of inventory documents matching the filters. Each element of the array contains the fields below.
| - document_id
int
The unique identifier of the inventory document.
| - document_type
int
The document type
                
0 - GR (Goods Received)
                
1 - IGR (Internal Goods Received)
                
2 - GI (Goods Issue)
                
3 - IGI (Internal Goods Issue)
                
4 - IT (Internal Transfer)
                
5 - OB (Opening Balance)
                
| - document_status
int
The document status.
0 - Draft
1 - Confirmed
```

### getInventoryDocumentItems
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryDocumentItems
            This method allows you to retrieve document items for specific or for all inventory documents in BaseLinker. In case of a large number of items, pagination is possible.
            
            
Input parameters
                    
                        
document_id
int
Inventory document ID.
page
int
(optional) Page number of the results if there are many items in a document (100 items per page).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
items
array
List of document items. Each element in the array has the fields below.
| - document_id
int
The ID of the document to which this item belongs.
| - item_id
int
The main identifier of the document item.
| - position
int
The line item number within the document.
| - product_id
int
The product ID.
| - product_name
varchar(200)
The product name as copied at the time of document creation.
| - product_ean
varchar(32)
The product EAN.
| - product_sku
varchar(50)
The product SKU.
| - quantity
int
The quantity of this line item in the document.
| - price
decimal(10,2)
The unit price.
| - total_price
decimal(10,2)
The total value of the item.
| - inventory_id
int
The catalog ID, if applicable.
| - location_name
varchar(255)
The location (location column).
| - expiry_date
date
The expiry date, if relevant. Date format YYYY-MM-DD (ISO 8601)
| - batch
varchar(128)
```

### addInventoryDocumentItems
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInventoryDocumentItems
            The method allows you to add items to an existing inventory document.
            
            
Input parameters
                    
                        
document_id
int
Document identifier
items
array
List of document items. Each element should contain fields listed below
| - product_id
int
The product ID.
| - quantity
int
The quantity of this line item in the document.
| - price
decimal(10,2)
(optional) Item unit price
| - location_name
varchar(255)
(optional) Storage location
| - expiry_date
date
(optional) The expiry date, if relevant. Date format YYYY-MM-DD (ISO 8601)
| - batch
varchar(128)
(optional) Batch number
| - serial_no
varchar(128)
(optional) The product serial number.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
items
array
List of created document items. Each element contains fields listed below
                    
                    
                    
Sample
                    Input data:
                    
{
        "document_id": 101,
        "items": [
            {
                "product_id": 5432,
                "quantity": 5,
                "price": 10.99,
                "location_name": "A-1-2",
                "expiry_date": "2023-12-31",
                "batch": "LOT2021",
                "serial_no": "SN20211231001"
            }
        ]
}
```

### getInventoryDocumentSeries
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryDocumentSeries
            This method allows you to retrieve information about available inventory document series in BaseLinker. Each series can be linked to a specific warehouse (warehouse_id) and can have its own numbering format settings.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
document_series
array
List of document series. Each element contains the fields listed below.
| - document_series_id
int
Unique identifier of the series.
| - name
varchar(20)
The name of the series.
| - document_type
tinyint(4)
The type of document for which this series is intended.
                    
0 - GR (Goods Received)
                    
1 - IGR (Internal Goods Received)
                    
2 - GI (Goods Issue)
                    
3 - IGI (Internal Goods Issue)
                    
4 - IT (Internal Transfer)
                    
5 - OB (Opening Balance)
                    
| - warehouse_id
int
The warehouse ID to which this series applies.
| - format
varchar(30)
The format for document numbering (e.g. "%N/%M/%Y/GR" in the format column).
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
        "status": "SUCCESS",
        "document_series": [
            {
                "document_series_id": 3,
                "name": "GRN",
                "type": 1,
                "warehouse_id": 205,
                "format": "%N/%M/%Y/GR"
            },
            {
```


## INVENTORY PURCHASE ORDERS

### getInventoryPurchaseOrders
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryPurchaseOrders
            The method allows you to retrieve a list of purchase orders from BaseLinker storage.
            
            
Input parameters
                    
                        
warehouse_id
int
(optional) Warehouse ID. The list of identifiers can be retrieved using the method 
getInventoryWarehouses
.
supplier_id
int
(optional) Limiting results to a specific supplier ID
series_id
int
(optional) Limiting results to a specific document series ID
date_from
int
(optional) Date from which documents should be retrieved (Unix timestamp)
date_to
int
(optional) Date up to which documents should be retrieved (Unix timestamp)
filter_document_number
varchar(50)
(optional) Filtering by document number (full or partial match)
page
int
(optional) Results paging (100 documents per page)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
purchase_orders
array
List of purchase orders. Each element contains fields listed below
| - id
int
Purchase order identifier
| - name
varchar(80)
Purchase order name
| - series_id
int
Purchase order series identifier
| - document_number
varchar(50)
Full document number
| - date_created
int
Purchase order creation date (Unix timestamp)
| - date_sent
int
Purchase order sent date (Unix timestamp)
| - date_received
int
(optional) Purchase order received date (Unix timestamp)
| - date_completed
int
(optional) Purchase order completed date (Unix timestamp)
```

### getInventoryPurchaseOrderItems
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryPurchaseOrderItems
            The method allows you to retrieve items from a specific purchase order.
            
            
Input parameters
                    
                        
order_id
int
Purchase order identifier
page
int
(optional) Page number of the results if there are many items in a purchase order (100 items per page).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
items
array
List of order items. Each element contains fields listed below
| - item_id
int
Item identifier
| - product_id
int
Product identifier
| - position
int
The line item number within the purchase order
| - product_name
varchar(200)
Product name on document
| - product_sku
varchar(50)
Product SKU
| - product_ean
varchar(32)
Product EAN
| - supplier_code
varchar(50)
(optional) Product code from supplier
| - quantity
int
Ordered quantity
| - completed_quantity
int
Received quantity
| - item_cost
decimal(10,2)
Item unit cost
| - location
varchar(255)
(optional) Storage location
| - expiry_date
date
(optional) Expiry date
| - batch
varchar(128)
(optional) Batch number
| - serial_no
varchar(128)
```

### getInventoryPurchaseOrderSeries
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInventoryPurchaseOrderSeries
            The method allows you to retrieve a list of purchase order document series available in BaseLinker storage.
            
            
Input parameters
                    
                        
warehouse_id
int
(optional) Filter series by warehouse ID
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
series
array
List of document series. Each element contains fields listed below
| - series_id
int
Series identifier
| - name
varchar(20)
Series name
| - warehouse_id
int
Warehouse identifier
| - format
varchar(30)
Document number format
                    
                    
                    
Sample
                    Input data:
                    
{
        "warehouse_id": 1
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "series": [
            {
                "series_id": 15,
                "name": "PSO",
                "warehouse_id": 1,
                "format": "%N/%M/%Y/PSO"
            }
        ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "warehouse_id": 1
}';
$apiParams = [
    "method" => "getInventoryPurchaseOrderSeries",
    "parameters" => $methodParams
];
```

### addInventoryPurchaseOrder
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInventoryPurchaseOrder
            The method allows you to create a new purchase order in BaseLinker storage. Orders are created as drafts by default.
            
            
Input parameters
                    
                        
warehouse_id
int
Warehouse identifier
supplier_id
int
Supplier identifier
payer_id
int
Payer identifier
currency
varchar(3)
Order currency (e.g. EUR, USD)
name
varchar(80)
(optional) Order name
notes
text
(optional) Order description/notes
invoice_no
varchar(50)
(optional) Related invoice number
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
order_id
int
Created purchase order identifier
document_number
varchar(50)
Generated document number
                    
                    
                    
Sample
                    Input data:
                    
{
        "series_id": 15,
        "warehouse_id": 1,
        "supplier_id": 5,
        "payer_id": 1,
        "currency": "EUR",
        "date_created": 1640908800,
        "name": "Monthly stock delivery",
        "notes": "Monthly stock delivery",
        "invoice_no": "FV/2021/12/123"
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "order_id": 1234,
        "document_number": "PO/2024/03/001"
```

### addInventoryPurchaseOrderItems
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInventoryPurchaseOrderItems
            The method allows you to add items to an existing purchase order.
            
            
Input parameters
                    
                        
order_id
int
Purchase order identifier
items
array
List of items to add. Each item should contain fields listed below
| - product_id
int
Product identifier
| - quantity
int
Item quantity
| - item_cost
decimal(10,2)
Item unit cost
| - supplier_code
varchar(50)
(optional) Product code from supplier
| - location
varchar(255)
(optional) Storage location
| - batch
varchar(128)
(optional) Batch number
| - expiry_date
date
(optional) Expiry date
| - serial_no
varchar(128)
(optional) Serial number
| - comments
varchar255)
(optional) Item comments or notes
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
items
array
List of created order items. Each element contains fields listed below
| - item_id
int
Item identifier
| - position
int
Item position in order
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_id": 1234,
```

### setInventoryPurchaseOrderStatus
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setInventoryPurchaseOrderStatus
            The method allows you to change the status of a purchase order.
            
            
Input parameters
                    
                        
order_id
int
Purchase order identifier
status
int
New order status. Available values:
            
0 - draft
            
1 - sent
            
2 - received
            
3 - completed
            
4 - completed partially
            
5 - canceled
completed_items
array
(optional) List of items received. Each element should contain fields listed below
| - item_id
int
Item identifier
| - completed_quantity
int
Received quantity
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_id": 1234,
        "status": 2,
        "completed_items": [
            {
                "item_id": 1,
                "completed_quantity": 3
            }
        ]
}
                    Output data:
                    
{
        "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
```


## SUPPLIERS & PAYERS

### getInventorySuppliers
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getInventorySuppliers
            The method allows you to retrieve a list of suppliers available in BaseLinker storage.
            
            
Input parameters
                    
                        
filter_id
int
(optional) Limiting results to a specific supplier ID
filter_name
varchar(40)
(optional) Filtering by supplier name (full or partial match)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
suppliers
array
List of suppliers. Each element contains fields listed below
| - supplier_id
int
Supplier identifier
| - name
varchar(40)
Supplier name
| - address
varchar(200)
(optional) Supplier address
| - postcode
varchar(20)
(optional) Supplier postal code
| - city
varchar(80)
(optional) Supplier city
| - phone
varchar(40)
(optional) Supplier phone number
| - email
varchar(200)
(optional) Supplier email address
```

### addInventorySupplier
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addInventorySupplier
            The method allows you to add a new supplier or update an existing one in BaseLinker storage.
            
            
Input parameters
                    
                        
supplier_id
int
(optional) Supplier identifier. If provided, the existing supplier will be updated.
name
varchar(40)
Supplier name
take_product_cost_from
varchar(20)
Source of product cost for this supplier. Available values: "cost" (Product cost at the supplier), or price group ID. Price group ids can be retrieved from the method 
getInventoryPriceGroups
take_product_code_from
varchar(20)
Source of product code for this supplier. Available values: "sku" (Product SKU), "ean" (Product EAN), "code" (Product code at the supplier), or extra field ID. Extra field ids can be retrieved from the method 
getInventoryExtraFields
address
varchar(200)
(optional) Supplier address
postcode
varchar(20)
(optional) Supplier postal code
city
varchar(80)
(optional) Supplier city
phone
varchar(40)
(optional) Supplier phone number
email
varchar(200)
(optional) Supplier email address
email_copy_to
varchar(200)
(optional) Additional email addresses for correspondence
currency
varchar(3)
(optional) Default supplier currency (e.g. EUR, USD)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
```

### deleteInventorySupplier
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteInventorySupplier
            The method allows you to remove a supplier from BaseLinker storage.
            
            
Input parameters
                    
                        
supplier_id
int
Supplier identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "supplier_id": 1
}
                    Output data:
                    
{
        "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "supplier_id": 1
}';
$apiParams = [
    "method" => "deleteInventorySupplier",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
```

### getInventoryPayers
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getInventoryPayers
            The method allows you to retrieve a list of payers available in BaseLinker storage.
            
            
Input parameters
                    
                        
filter_id
int
(optional) Limiting results to a specific payer ID
filter_name
varchar(40)
(optional) Filtering by payer name (full or partial match)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
payers
array
List of payers. Each element contains fields listed below
| - payer_id
int
Payer identifier
| - name
varchar(40)
Payer name
| - address
varchar(200)
(optional) Payer address
| - postcode
varchar(20)
(optional) Payer postal code
| - city
varchar(80)
(optional) Payer city
| - tax_no
varchar(40)
(optional) Payer tax identification number
                    
                    
                    
```

### addInventoryPayer
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addInventoryPayer
            The method allows you to add a new payer or update an existing one in BaseLinker storage.
            
            
Input parameters
                    
                        
payer_id
int
(optional) Payer identifier. If provided, the existing payer will be updated.
name
varchar(100)
Payer name
address
varchar(100)
(optional) Payer address
postcode
varchar(20)
(optional) Payer postal code
city
varchar(50)
(optional) Payer city
tax_no
varchar(20)
(optional) Payer tax identification number
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
payer_id
int
Created or updated payer identifier
                    
                    
                    
Sample
                    Input data:
                    
{
    "name": "Company Ltd",
    "address": "123 Main Street",
```

### deleteInventoryPayer
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteInventoryPayer
            The method allows you to remove a payer from BaseLinker storage.
            
            
Input parameters
                    
                        
payer_id
int
Payer identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "payer_id": 1
}
                    Output data:
                    
{
        "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "payer_id": 1
}';
$apiParams = [
    "method" => "deleteInventoryPayer",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
```


---

## EXTERNAL STORAGES

### getExternalStoragesList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStoragesList
            The method allows you to retrieve a list of available external storages (shops, wholesalers) that can be referenced via API.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storages
array
An array of storages containing the fields listed below
| - storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
| - name
varchar(100)
Storage name
| - methods
array
An array of names of methods supported by the storage.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "storages": [
        {
            "storage_id": "shop_2444",
            "name": "Online store",
            "methods": ["getExternalStorageCategories", "getExternalStorageProductsData", "getExternalStorageProductsList", "getExternalStorageProductsPrices", "getExternalStorageProductsQuantity", "updateExternalStorageProductsQuantity"]
        },
        {
            "storage_id": "warehouse_1334",
```

### getExternalStorageCategories
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStorageCategories
            The method allows you to retrieve a category list from an external storage (shop/wholesale) connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
categories
array
An array of categories containing the fields listed below.
| - category_id
int
Category ID.
| - name
varchar(200)
Category name
| - parent_id
int
Parent category identifier.
                    
                    
                    
Sample
                    Input data:
                    
{
    "storage_id": "shop_2445"
}
                    Output data:
                    
{
```

### getExternalStorageProductsData
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStorageProductsData
            The method allows to retrieve detailed data of selected products from an external storage (shop/wholesaler) connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
products
array
An array of product ID numbers to download
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - sku
varchar(32)
Product SKU number. It can be filled with e.g. an external system product number. This will later allow you to rebuild the list of product associations in case of loss.
| - ean
varchar(32)
Product EAN number.
| - asin
varchar(50)
Product ASIN number.
| - name
varchar(200)
Product name
| - quantity
int
Stock quantity
```

### getExternalStorageProductsList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStorageProductsList
            The method allows to retrieve detailed data of selected products from an external storage (shop/wholesaler) connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
filter_category_id
varchar(30)
(optional) Retrieving products from a specific category (optional)
filter_sort
varchar(30)
(optional) the value for sorting the product list. Possible values:
                                                                                                                            "id [ASC|DESC]", "name [ASC|DESC]", "quantity [ASC|DESC]", "price [ASC|DESC]"
filter_id
varchar(30)
(optional) limiting results to a specific product id
filter_sku
varchar(32)
(optional) limiting the results to a specific SKU (stock keeping number)
filter_ean
varchar(320)
(optional) limiting results to a specific ean
filter_asin
varchar(50)
(optional) limiting results to a specific asin
filter_name
varchar(100)
(optional) item name filter (part of the searched name or an empty field)
filter_price_from
float
(optional) minimum price limit (not displaying products with lower price)
filter_price_to
float
(optional) maximum price limit
filter_quantity_from
int
(optional) minimum quantity limit
filter_quantity_to
int
(optional) maximum quantity limit
filter_available
int
(optional) displaying only products marked as available (value 1) or not available (0) or all (empty value)
page
```

### getExternalStorageProductsQuantity
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStorageProductsQuantity
            The method allows to retrieve stock from an external storage (shop/wholesaler) connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
page
int
(optional) Results paging
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - quantity
int
Stock quantity
| - variants
array
An array of variants containing the fields listed below
| - | - variant_id
varchar(30)
Variant main identifier.
| - | - quantity
int
Stock quantity
                    
                    
                    
```

### getExternalStorageProductsPrices
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getExternalStorageProductsPrices
            The method allows to retrieve product prices from an external storage (shop/wholesaler) connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
page
int
(optional) Results paging
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - price
float
Price
| - variants
array
An array of variants containing the fields listed below
| - | - variant_id
varchar(30)
Variant main identifier.
| - | - price
float
Price
                    
                    
                    
```

### updateExternalStorageProductsQuantity
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
updateExternalStorageProductsQuantity
            The method allows to bulk update the product stock (and/or variants) in an external storage (shop/wholesaler) connected to BaseLinker. Maximum 1000 products at a time.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:shop|warehouse]_[id:int]"  (e.g. "shop_2445").
products
array
An array of products. Each product is a separate element of the array. The product consists of a 3 element array of components:
                                           
0
 => product ID number (varchar)
1
 => variant ID number (0 if the main product is changed, not the variant) (int)
2
 => Stock quantity (int)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
counter
int
Number of received items.
warnings
array
An array of warning notices for product updates. The key to each item is the identifier of the sent category, the value is an error message when adding. Only the keys containing errors are returned.
                    
                    
                    
Sample
                    Input data:
                    
{
    "storage_id": "shop_2445",
    "products": [
        [1081730, 0, 100],
        [1081730, 1734642, 150]
```


---

## ORDERS

### getJournalList
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getJournalList
            The method allows you to download a list of order events from the last 3 days. Contact Base support to activate this method on your account. By default it will return empty response.
            
            
Input parameters
                    
                        
last_log_id
int
Log ID number from which the logs are to be retrieved
logs_types
array
Event ID List
order_id
int
Order ID number
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
logs
array
List of events
| - id
int
Event ID
| - order_id
int
Order identifier
| - log_type
int
Event type:
                
1 - Order creation
                
2 - DOF download (order confirmation)
                
3 - Payment of the order
                
4 - Removal of order/invoice/receipt
                
5 - Merging the orders
                
6 - Splitting the order
                
7 - Issuing an invoice
                
8 - Issuing a receipt
                
9 - Package creation
                
10 - Deleting a package
                
11 - Editing delivery data
                
12 - Adding a product to an order
                
13 - Editing the product in the order
                
14 - Removing the product from the order
                
15 - Adding a buyer to a blacklist
                
16 - Editing order data
                
17 - Copying an order
                
18 - Order status change
                
19 - Invoice deletion
                
20 - Receipt deletion
                
21 - Editing invoice data
| - object_id
int
Additional information, depending on the event type:
                
5 - ID of the merged order
                
6 - ID of the new order created by the order separation
```

### addOrder
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrder
            The method allows adding a new order to the BaseLinker order manager.
            
            
Input parameters
                    
                        
order_status_id
int
Order status (the list available to retrieve with getOrderStatusList)
custom_source_id
int
(optional) Identifier of custom order source defined in BaseLinker panel. If not provided, default order source is assigned.
date_add
int
Date of order creation (in unix time format)
currency
char(3)
3-letter currency symbol (e.g. EUR, PLN)
payment_method
varchar(30)
Payment method
payment_method_cod
bool
Flag indicating whether the type of payment is COD (cash on delivery)
paid
bool
Information whether the order is already paid. The value "1" automatically adds a full payment to the order.
user_comments
varchar(510)
Buyer comments
admin_comments
varchar(200)
Seller comments
email
varchar(150)
Buyer e-mail address
phone
varchar(100)
Buyer phone number
user_login
varchar(30)
Allegro or eBay user login
delivery_method
varchar(30)
Delivery method name
delivery_price
float
Gross delivery price
delivery_fullname
varchar(100)
Delivery address - name and surname
delivery_company
varchar(100)
Delivery address - company
delivery_address
varchar(156)
Delivery address - street and number
delivery_postcode
varchar(100)
Delivery address - postcode
delivery_city
varchar(100)
Delivery address - city
delivery_state
varchar(20)
Delivery address - state/province
delivery_country_code
char(2)
Delivery address - country code (two-letter, e.g. EN)
delivery_point_id
varchar(40)
Pick-up point delivery - pick-up point identifier
delivery_point_name
varchar(100)
Pick-up point delivery - pick-up point name
delivery_point_address
varchar(100)
Pick-up point delivery - pick-up point address
delivery_point_postcode
varchar(100)
Pick-up point delivery - pick-up point postcode
delivery_point_city
varchar(100)
Pick-up point delivery - pick-up point city
invoice_fullname
varchar(100)
Billing details - name and surname
```

### addOrderDuplicate
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrderDuplicate
            The method allows you to add a new order to the BaseLinker order manager by duplicating an existing order. The new order will have the same data as the original order, but with a different ID.
            
            
Input parameters
                    
                        
order_id
int
ID of the order to duplicate
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
order_id
int
ID of added order.
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_id": 12345
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "order_id: 12346
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 12345
}';
$apiParams = [
    "method" => "addOrderDuplicate",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
```

### getOrderSources
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderSources
            The method returns types of order sources along with their IDs. Order sources are grouped by their type that corresponds to a field order_source from the getOrders method. Available source types are  "personal", "shop" or "marketplace_code" e.g. "ebay", "amazon", "ceneo", "emag", "allegro", etc. 
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
sources
array
An array of order sources grouped by type.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "sources": {
        "personal": {
            0: "In person / by phone",
            1621: "stationary shop"
        },
        "shop": {
            8235: "Shop 1",
            4626: "Shop 2",
        },
        "ebay": {
            1522: "eBay Account 1",
            1634: "eBay Account 2"
        },
        "amazon": {
            7245: "Amazon Account 1",
            7342: "Amazon Account 2"
        }
    }
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getOrderSources",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
```

### getOrderExtraFields
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderExtraFields
            The method returns extra fields defined for the orders. Values of those fields can be set with method 
setOrderFields
. In order to retrieve values of those fields set parameter include_custom_extra_fields in method 
getOrders
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extra_fields
array
A list containing orders extra fields, where the key of the field serves as the key in the array and the value is an array containing the fields name and type.
| - extra_field_id
int
ID of the extra field
| - name
int
Field name.
| - editor_type
varchar
Editor type. The following values are available: text, number, select, checkbox, radio, date, file.
| - options
array
(optional) An array of values available for a given additional field. Applicable to select, checkbox and radio editors.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
        "status": "SUCCESS",
        "extra_fields": {
            {
                "extra_field_id": 1,
                "name": "Additional Field 1",
                "editor_type": "text"
            },
            {
                "extra_field_id": 2,
                "name": "Additional Field 2",
                "editor_type": "text"
            },
            {
                "extra_field_id": 135,
                "name": "Client type",
                "editor_type": "radio",
                "options": ["B2B", "B2C"]
            },
            {
                "extra_field_id": 172,
                "name": "Shipping date deadline",
                "editor_type": "date"
            },
            {
                "extra_field_id": 196,
                "name": "Warranty Card",
                "editor_type": "file"
            }
        }
      }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getOrderExtraFields",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
```

### getOrders
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrders
            The method allows you to download orders from a specific date from the BaseLinker order manager. The order list can be limited using the filters described in the method parameters. A maximum of 100 orders are returned at a time.
                                        It is recommended to download only confirmed orders (get_unconfirmed_orders = false). Unconfirmed orders may be incomplete. The user may be, for example, in the process of creating an order - it already exists in the database, but not all information is completed. Unconfirmed orders may contain only a partial list of products and may be changed soon. Confirmed orders usually do not change anymore and can be safely downloaded to an external system.                                        
The best way to download the ongoing orders is:
                                         Collecting new order identifiers using getJournalList.
Or, using this method:
                                         1. Setting the starting date and specifying it in the date_confirmed_from field
                                         2. Processing of all received orders. If 100 orders are received, there may be even more to download.
                                         3. Downloading the next package of orders by entering the value of the date_confirmed field from last downloaded order in the date_confirmed_from field. In order to avoid downloading the same orders value of date_confirmed should be increased by 1 second. This operation is repeated until you receive a package with less than 100 orders (this means that there are no more orders left to download).
                                         4. Saving the date_confirmed last processed order. You can download orders from this date onwards so that you do not download the same order twice. It is not possible for an order to 'jump' into the database with an earlier confirmation date. This way you can be sure that all confirmed orders have been downloaded.
            
            
Input parameters
                    
                        
order_id
int
(optional) Order identifier. Completing this field will download information about only one specific order.
date_confirmed_from
int
(optional) Date of order confirmation from which orders are to be collected. Format unix time stamp.
date_from
int
(optional) The order date from which orders are to be collected. Format unix time stamp.
id_from
int
(optional) The order ID number from which subsequent orders are to be collected.
get_unconfirmed_orders
bool
(optional, false by default) Download unconfirmed orders as well (this is e.g. an order from Allegro to which the customer has not yet completed the delivery form). Default is false. Unconfirmed orders may not be complete yet, the shipping method and price is also unknown.
status_id
int
(optional) The status identifier from which orders are to be collected. Leave blank to download orders from all statuses.
filter_email
varchar(50)
(optional) Filtering of order lists by e-mail address (displays only orders with the given e-mail address).
filter_order_source
varchar(20)
(optional) Filtering of order lists by order source, for instance "ebay", "amazon" (displays only orders come from given source). The list of order sources can be retrieved with 
getOrderSources
 method.
filter_order_source_id
int
(optional) Filtering of order lists by order source identifier, for instance "2523" (displays only orders come from order source defined in "filter_order_source" identified by given order source identifier). Filtering by order source indentifier requires "filter_order_source" to be set prior. The list of order source identifiers can be retrieved with 
getOrderSources
 method.
filter_shop_order_id
int
(optional) Shop Order identifier. Completing this field will download information about specific orders.
include_custom_extra_fields
bool
(optional, false by default) Download values of custom additional fields.
include_commission_data
bool
(optional, false by default) Download orders with commission information. If set to true, the response will contain additional "commission" field.
include_connect_data
bool
(optional, false by default) Base Connect and contractor data.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
orders
array
An array of information about the orders found. Each order is described by the fields listed below.
order_id
int
Order Identifier from BaseLinker order manager 
shop_order_id
int
Order ID given by the store
external_order_id
varchar(50)
An order identifier taken from an external source. e.g. the order number in the store, or the eBay transaction number.
order_source
varchar(20)
Order source - available values: "shop", "personal", "order_return" or "marketplace_code" e.g. "ebay", "amazon", "ceneo", "emag", "allegro", etc. 
order_source_id
int
Source ID (e.g. internal allegro account ID, internal shop ID, etc.). Unique only in combination with the "order_source" field (e.g. an ebay account and an allegro account may have the same ID, but two ebay accounts always have different IDs)
order_source_info
```

### getOrderTransactionData
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderTransactionData
            The method allows you to retrieve transaction details for a selected order
            
            
Input parameters
                    
                        
order_id
int
Order Identifier from BaseLinker order manager
include_complex_taxes
bool
(optional, false by default) Whether to include detailed tax breakdown with order_lines structure.
include_amazon_data
bool
(optional, true by default) Whether to include legacy Amazon fulfillment data for backward compatibility.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
currency
char(3)
Order currency code
fulfillment_shipments
array
[Only for Amazon]
An array of information about the Amazon fulfillment shipments found. Each shipment is described by the fields listed below:
product_sku
 (varchar(40)) - product_sku
product_name
 (varchar(200)) - product name
quantity
 (int) - quantity of pieces
fba
 (varchar(10)) - Amazon storage identifier
fulfillment_center_id
varchar(10)
[Only for Amazon Vendor]
 Amazon fulfillment center identifier. (Requires providing "include_amazon_data" parameter)
ship_date_from
int
Ship date from (unix time format)
ship_date_to
int
Ship date to (unix time format)
delivery_date_from
int
Delivery date from (unix time format)
delivery_date_to
int
Delivery date to (unix time format)
marketplace_transaction_id
varchar(60)
Transaction identifier from marketplace
account_id
int
Marketplace account identifier
transaction_date
int
Transaction date (unix timestamp)
order_items
array
(only when include_complex_taxes=true) Detailed tax breakdown per product:
itemId
 (varchar(50)) - Product SKU or identifier
outerItemId
 (varchar(51)) - Additional identifier  ("p" + sku)
shipping
 (object) - Shipping costs and taxes for this specific product
taxes
 (array) - Array of tax objects applied to the product
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_id": 143477867,
        "include_complex_taxes": true,
        "include_amazon_data": false
```

### getOrdersByEmail
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrdersByEmail
            The method allows to search for orders related to the given e-mail address. This function is designed to be used in plugins for mail clients (Thunderbird, Outlook, etc.).
            
            
Input parameters
                    
                        
email
varchar(50)
The e-mail address we search for in orders.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
orders
array
An array of information about the orders found. Each order is described by the fields listed below.
order_id
int
Order Identifier from BaseLinker order manager 
order_status_id
int
Order status (the list available to retrieve with getOrderStatusList)
date_in_status
int
Date from which the order is in current status (unix time format)
date_add
int
Date of order creation (in unix time format)
                    
                    
                    
Sample
                    Input data:
                    
{
    "email": "test@test.com"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "orders": [
      {
        "order_id": "143476149",
        "order_status_id": "1051",
        "date_in_status": "1599752305",
        "date_add": "1599752305"
      },
      {
        "order_id": "143476148",
        "order_status_id": "6624",
        "date_in_status": "1599731534",
        "date_add": "1599731534"
      },
      {
        "order_id": "143476147",
        "order_status_id": "1051",
        "date_in_status": "1599731405",
        "date_add": "1599731405"
      }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "email": "test@test.com"
}';
$apiParams = [
    "method" => "getOrdersByEmail",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
```

### getOrdersByPhone
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrdersByPhone
            The method allows you to search for orders related to the given phone number. This function is intended for use in caller recognition programs.
            
            
Input parameters
                    
                        
phone
varchar(50)
The phone number we search for in orders.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
orders
array
An array of information about the orders found. Each order is described by the fields listed below.
order_id
int
Order Identifier from BaseLinker order manager 
order_status_id
int
Order status (the list available to retrieve with getOrderStatusList)
delivery_fullname
varchar(100)
Delivery address - name and surname
delivery_company
varchar(100)
Delivery address - company
date_in_status
int
Date from which the order is in current status (unix time format)
date_add
int
Date of order creation (in unix time format)
                    
                    
                    
Sample
                    Input data:
                    
{
    "phone": "+48123456789"
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "orders": [
    {
      "order_id": 510297,
      "order_status_id": 6624,
      "delivery_fullname": "John Doe",
      "delivery_company": "Company Ltd.",
      "date_in_status": "1305049346"
      "date_add": "1305049346"
    },
    {
      "order_id": "512256",
      "order_status_id": 6624,
      "delivery_fullname": "John Doe",
      "delivery_company": "Company Ltd.",
      "date_in_status": "1305059346"
      "date_add": "1305059346"
    }t
  ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "phone": "+48123456789"
}';
$apiParams = [
    "method" => "getOrdersByPhone",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
```

### deleteOrders
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
deleteOrders
            The method allows you to delete multiple orders from the BaseLinker order manager.
            
            
Input parameters
                    
                        
order_ids
array
Array of order identifiers from BaseLinker order manager (max 1000 at a time)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
deleted_order_ids
array
Array of confirmed IDs of successfully deleted orders
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_ids": [
          12345,
          123456,
          1234567
        ]
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "deleted_order_ids: [
          12346,
          123456,
          1234567
        ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_ids": [
        12345,
        123456,
        1234567
    ]
}';
$apiParams = [
    "method" => "deleteOrders",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
```

### addInvoice
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInvoice
            The method allows to issue an order invoice.
            
            
Input parameters
                    
                        
order_id
int
Order Identifier from BaseLinker order manager 
series_id
int
Series numbering identifier
vat_rate
string|int|float
(optional) VAT rate - parameter accepts values:
- "DEFAULT": according to the numbering series (is set as default value)
- "ITEM": use the rate assigned to the item of the order
- "EXPT" / "ZW": exempt from VAT
- "NP": annotation NP
- "OO": VAT reverse charge
- value: number from range 0-100
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
invoice_id
int
ID of the added invoice.
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "series_id": 15
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "invoice_id": 20276565
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 3754894,
    "series_id": 15
}';
$apiParams = [
    "method" => "addInvoice",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
```

### addInvoiceCorrection
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addInvoiceCorrection
            The method allows to issue an order invoice correction. 
              
Either 
original_invoice_id
 or 
return_order_id
 must be provided.
              
If 
return_order_id
 is provided, all other fields will be ignored (except series_id) and invoice will be created with data from the return order.
              
If field is optional and not provided, it will be set according to the series settings or default values.
            
            
Input parameters
                    
                        
original_invoice_id
int
Original invoice identifier
return_order_id
int
Return order identifier
series_id
int
(optional) Series numbering identifier
date_sell
int
(optional) Sell date in unix timestamp
correcting_reason
int
(optional) Reason for correction
              - 1: prepayments return 
              - 2: compulsory discounts 
              - 3: price increase after invoicing 
              - 4: refund the buyer the amount of undue 
              - 5: return the goods 
              - 6: mistakes as to price, rate, amount of tax on invoices or position 
              - 7: correcting buyer's address 
              - 8: withdrawal from the contract 
              - 9: other reason - fill in in the comments 
        
correcting_items
bool
(optional) Whether to correct invoice items (0 - no, 1 - yes)
correcting_data
bool
(optional) Whether to correct invoice data (0 - no, 1 - yes)
invoice_fullname
string
(optional) Full name for the invoice
invoice_company
string
(optional) Company name
invoice_address
string
(optional) Address
invoice_postcode
string
(optional) Postal code
invoice_city
string
(optional) City
invoice_state
string
(optional) State/Province
invoice_country_code
string
(optional) Country code (e.g. PL)
invoice_nip
string
(optional) Tax ID number
items
array
(optional) Array of items to correct. If order_product_id is not provided, item will be added as new position at the end
fv_payment
string
(optional) Payment method
fv_person
string
(optional) Issuer name
                    
                    
                    
Output data
                    The method returns the data in JSON format.
```

### getInvoices
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInvoices
            The method allows you to download invoices issued from the BaseLinker order manager. The list of invoices can be limited using filters described in the method parameters. Maximum 100 invoices are returned at a time. 
            
            
Input parameters
                    
                        
invoice_id
int
(optional) Invoice identifier. Completing this field will result in downloading information about only one specific invoice.
order_id
int
(optional) Order identifier. Completing this field will result in downloading information only about the invoice associated with this order (if the order has an invoice created).
date_from
int
(optional) Date from which invoices are to be collected. Unix time stamp format.
id_from
int
(optional) The invoice ID number from which subsequent invoices are to be retrieved.
series_id
int
(optional) numbering series ID that allows filtering after the invoice numbering series.
get_external_invoices
bool
If set to 'false' then omits from the results invoices that already have an external invoice file uploaded by addOrderInvoiceFile method (useful for ERP integrations uploading invoice files to BaseLinker)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
invoices
array
An array of the information about the invoices found. Each invoice is described by the fields listed below.
invoice_id
int
Invoice identifier
order_id
int
Order identifier for which an invoice is issued
series_id
int
Invoice numbering series identifier
type
varchar(10)
Type of invoice. Available values: 
normal
 - regular invoice
correcting
 - corrective invoice
number
varchar(30)
Full invoice number. Format depends on account settings. Usually [no]/[month]/[year]
sub_id
int
Monthly/yearly number - invoice number element
month
int
Month - element of invoice number (0 if annual numbering is used)
year
int
Year - invoice number element
postfix
varchar(1)
Suffix - invoice number element
date_add
int
Invoice creation date (unix time format)
date_sell
int
Sale date (unix time format)
date_pay_to
int
Due date (unix time format). Not completed by default (value 0)
currency
char(3)
3-letter currency symbol (e.g. EUR, PLN)
total_price_brutto
float
Total gross invoice value
total_price_netto
float
Total net invoice value
```

### getSeries
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getSeries
            The method allows to download a series of invoice/receipt numbering.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
series
array
An array of numbering series information.
| - id
int
Series numbering identifier
| - type
varchar(10)
Numbering type - possible values (INVOICE, CORRECTION, RECEIPT)
| - name
varchar(20)
Numbering name
| - format
varchar(30)
Numbering format
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
    "status": "SUCCESS",
    "series": [
        {
            "id": "15",
            "type": "INVOICE",
            "name": "default",
            "format": "%N/%Y"
        },
        {
            "id": "24525",
            "type": "INVOICE",
            "name": "Invoice DE",
            "format": "%N/%M/%Y/de"
        },
        {
            "id": "61178",
            "type": "RECEIPT",
            "name": "Receipt",
            "format": "%N/%M/%Y"
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getSeries",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
```

### getOrderStatusList
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderStatusList
            The method allows you to download order statuses created by the customer in the BaseLinker order manager.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
statuses
array
An array of statuses. Each status contains fields:
            
id
 (int) - status identifier
            
name
 (varchar) - status name (basic)
            
name_for_customer
 (varchar) - long status name (displayed to the customer on the order page)
            
color
 (varchar) - status color in hex
                    
                    
                    
Sample
                    Input data:
                    
[]
                    Output data:
                    
{
  "status": "SUCCESS",
  "statuses": [
    {
      "id": 1051,
      "name": "New orders",
      "name_for_customer": "Order accepted"
    },
    {
      "id": 1052,
      "name": "To be paid (courier)",
      "name_for_customer": " Awaiting payment"
    },
    {
      "id": 1291,
      "name": "Ready to ship (courier)",
      "name_for_customer": "Processing"
    },
    {
      "id": 1470,
      "name": "To be paid (post mail)",
      "name_for_customer": " Awaiting payment"
    },
    {
      "id": 1471,
      "name": "Dispatched",
      "name_for_customer": "The parcel has been shipped"
    },
    {
      "id": 4073,
      "name": "Ready to ship (post mail)",
      "name_for_customer": "Processing"
    },
    {
      "id": 4128,
      "name": "Ready to ship (economy mail)",
      "name_for_customer": "Processing"
    },
    {
      "id": 4129,
      "name": "Ready to ship (priority mail)",
      "name_for_customer": "Processing"
    },
    {
      "id": 4130,
      "name": "Ready to ship (post priority)",
      "name_for_customer": "Processing"
```

### getOrderPaymentsHistory
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderPaymentsHistory
            The method allows you to retrieve payment history for a selected order, including an external payment identifier from the payment gateway. One order can have multiple payment history entries, caused by surcharges, order value changes, manual payment editing
            
            
Input parameters
                    
                        
order_id
int
Order Identifier from BaseLinker order manager 
show_full_history
bool
(optional, false by default) Download full payment history, including order value change entries, manual order payment edits. False by default - only returns entries containing an external payment identifier (most commonly used)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
payments
array
An array of payments list. Each payment contains fields:
                                                                                                                
paid_before
 (float) - total amount paid before the given change
                                                                                                                
paid_after
 (float) - total amount paid after the change
                                                                                                                
total_price
 (float) - total order price
                                                                                                                
currency
 (varchar) - the currency
                                                                                                                
external_payment_id
 (varchar) - external payment identifier
                                                                                                                
date
 (int) - date of change record (unix time format)
                                                                                                                
comment
 (varchar) - comment added when setting the payment for this order
                                                                                                                
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "payments": [
    {
      "paid_before": "0.00",
      "paid_after": "55.00",
      "total_price": "82.97",
      "date": "1515001701",
      "currency": "GBP",
      "external_payment_id": "189a1236-0aa9-21ee-15ab-8b0992243303",
      "comment": ""
    }
  ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 3754894
}';
$apiParams = [
    "method" => "getOrderPaymentsHistory",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
```

### getOrderPickPackHistory
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getOrderPickPackHistory
            The method allows you to retrieve pick pack history for a selected order.
            
            
Input parameters
                    
                        
order_id
int
Order Identifier from BaseLinker order manager 
action_type
int
(optional) List of event types you want to retrieve. Available values:
1 - Reservation of an order for products collecting
2 - Picking products started
3 - Picking products cancelled
4 - Products picking status changed: in progress
5 - Products picking status changed: finished
6 - Products picking status changed: error
7 - Reservation of an order for products packing
8 - Packing products started
9 - Packing products cancelled
10 - Products packing status changed: in progress
11 - Products packing status changed: finished
12 - Products packing status changed: error
13 - Products photo initialized
14 - Products photo taken
15 - Products photo deleted
16 - Error when trying to save products photo
17 - Error when trying to save product image: image size too large
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
history
array
An array of pick pack history list. Each entry contains fields:
                
action_type
 (int) - action type. Available values:
1 - Reservation of an order for products collecting
2 - Picking products started
3 - Picking products cancelled
4 - Products picking status changed: in progress
5 - Products picking status changed: finished
6 - Products picking status changed: error
7 - Reservation of an order for products packing
8 - Packing products started
9 - Packing products cancelled
10 - Products packing status changed: in progress
11 - Products packing status changed: finished
12 - Products packing status changed: error
13 - Products photo initialized
14 - Products photo taken
15 - Products photo deleted
16 - Error when trying to save products photo
17 - Error when trying to save product image: image size too large
                
profile_id
 (varchar) - name of the profile performing the change
                
station_id
 (int) - id of the packing station
                
cart_id
 (int) - id of cart assigned to order
                
entry_date
 date of history entry (unix time format)
            
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894
}
                    Output data:
                    
```

### getNewReceipts
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getNewReceipts
            The method allows you to retrieve receipts waiting to be issued. This method should be used in creating integration with a fiscal printer. The method can be requested for new receipts every e.g. 10 seconds. If any receipts appear in response, they should be confirmed by the setOrderReceipt method after printing to disappear from the waiting list.
            
            
Input parameters
                    
                        
series_id
int
(optional) The numbering series ID allows filtering by the receipt numbering series. Using multiple series numbering for receipts is recommended when the user has multiple fiscal printers. Each fiscal printer should have a separate series.
id_from
int
(optional) ID from which logs are to be retrieved. [default=0]
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
orders
array
An array of information on the receipts found. Each order is described by the fields listed below.
receipt_id
int
The receipt ID, used in the setOrderReceipt method to return the receipt as printed.
series_id
int
Receipt numbering series identifier
receipt_full_nr
varchar(30)
The number assigned by BaseLinker when creating the receipt. Example number: "123/10/2018/P". The format depends on the settings - the numbering can be monthly, annual or continuous (then the number is a consecutive number). The number can be skipped, the fiscal printer can generate its own receipt number and save it in the setOrderReceipt method.
order_id
int
Order Identifier from BaseLinker order manager 
date_add
int
Date of order creation (in unix time format)
payment_method
varchar(30)
Payment type name
nip
varchar(30)
Payers details - VAT Reg No.. It may contain special characters: letters (prefix), hyphens and spaces. The VAT registration number should be cleared from these characters at your own discretion.
products
array
An array of order products. Each element of the array is also an array containing fields:
name
 (varchar) - product name
price_brutto
 (float) - single item gross price
tax_rate
 (float) - VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
 (int) - quantity of pieces
sku
 (varchar) - product SKU number
ean
 (varchar) - product EAN number
                    
                    
                    
Sample
                    Input data:
                    
{
    "series_id": 0,
    "id_from": 1
 }
                    Output data:
                    
{
  "status": "SUCCESS",
  "orders": [
    {
      "receipt_id": 15384,
      "receipt_full_nr": "123/10/2018/P",
      "order_id": 1630473,
      "date_add": 1407841161,
      "payment_method": "PayPal,
          "sku": "LU4235",
          "ean": "1597368451236"
        }
      ]
```

### getReceipts
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getReceipts
            The method allows you to retrieve issued receipts. Max 100 receipts are returned at a time. To retrieve a list of new receipts (when integrating a fiscal printer), use the getNewReceipts method.
            
            
Input parameters
                    
                        
series_id
int
(optional) The numbering series ID allows filtering by the receipt numbering series.
id_from
int
(optional) The ID of the receipt from which subsequent receipts will be retrieved (inclusive).
date_from
int
(optional) Date from which receipts are to be collected. Unix timestamp format.
date_to
int
(optional) Date to which receipts are to be collected. Unix timestamp format.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
receipts
array
An array of information on the receipts found. Each receipt is described by the fields listed below.
receipt_id
int
The receipt ID
series_id
int
Receipt numbering series identifier
receipt_full_nr
varchar(30)
The number assigned by Base when creating the receipt.
order_id
int
Order Identifier from Base order manager 
date_add
int
Date of order creation (in unix time format)
payment_method
varchar(30)
Payment type name
nip
varchar(30)
Payers details - VAT Reg No.. It may contain special characters: letters (prefix), hyphens and spaces. The VAT registration number should be cleared from these characters at your own discretion.
products
array
An array of order products. Each element of the array is also an array containing fields:
name
 (varchar) - product name
price_brutto
 (float) - single item gross price
tax_rate
 (float) - VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
 (int) - quantity of pieces
sku
 (varchar) - product SKU number
ean
 (varchar) - product EAN number
                    
                    
                    
Sample
                    Input data:
                    
{
    "series_id": 0,
    "id_from": 1
 }
                    Output data:
                    
{
  "status": "SUCCESS",
  "receipts": [
    {
      "receipt_id": 15384,
      "receipt_full_nr": "123/10/2018/P",
      "order_id": 1630473,
```

### getReceipt
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getReceipt
            The method allows you to retrieve a single receipt from the BaseLinker order manager. To retrieve a list of new receipts (when integrating a fiscal printer), use the getNewReceipts method.
            
            
Input parameters
                    
                        
receipt_id
int
Receipt ID. Not required if order_id is provided.
order_id
int
Order ID. Not required if receipt_id is provided.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
receipt_id
int
The receipt ID, used in the setOrderReceipt method to return the receipt as printed.
series_id
int
Receipt numbering series identifier
receipt_full_nr
varchar(30)
The number assigned by BaseLinker when creating the receipt. Example number: "123/10/2018/P". The format depends on the settings - the numbering can be monthly, annual or continuous (then the number is a consecutive number). The number can be skipped, the fiscal printer can generate its own receipt number and save it in the setOrderReceipt method.
year
int
Year - an element of the receipt number
month
int
Month - element of receipt number (0 if annual numbering is used)
sub_id
int
Monthly/yearly number - receipt number element
order_id
int
Order Identifier from BaseLinker order manager 
date_add
int
Date of order creation (in unix time format)
payment_method
varchar(30)
Payment type name
nip
varchar(30)
Payers details - VAT Reg No.. It may contain special characters: letters (prefix), hyphens and spaces. The VAT registration number should be cleared from these characters at your own discretion.
currency
char(3)
3-letter currency symbol (e.g. EUR, PLN)
total_price_brutto
float
Łączna wartość paragonu brutto
external_receipt_number
varchar(30)
Receipt number from the fiscal cash register or from the external system
exchange_currency
char(3)
Only for converted receipts. The target currency into which the receipt value was additionally converted.
exchange_rate
decimal(10,4)
Only for converted receipts. Exchange rate (conversion from field "currency" to field "exchange_currency".
exchange_date
varchar(10)
Only for converted receipts. Date of exchange rate.
exchange_info
varchar(10)
Only for converted receipts. Information on the exchange rate source (NBP table number).
items
array
An array of receipt items. Each element of the array is also an array containing fields:
name
 (varchar) - item name
sku
 (varchar) - product SKU number
ean
 (varchar) - product EAN number
price_brutto
 (float) - single item gross price
tax_rate
 (float) - VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
```

### setOrderFields
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderFields
            The method allows you to edit selected fields (e.g. address data, notes, etc.) of a specific order. Only the fields that you want to edit should be given, other fields can be omitted in the request.
            
            
Input parameters
                    
                        
order_id
int
Order identifier from the BaseLinker order manager. Field required. Other fields are optional.
admin_comments
varchar(200)
Seller comments
user_comments
varchar(510)
Buyer comments
payment_method
varchar(30)
Payment method
payment_method_cod
bool
Flag indicating whether the type of payment is COD (cash on delivery)
email
varchar(150)
Buyer e-mail address
phone
varchar(100)
Buyer phone number
user_login
varchar(30)
Buyer login
delivery_method
varchar(30)
Delivery method name
delivery_price
float
Gross delivery price
delivery_fullname
varchar(100)
Delivery address - name and surname
delivery_company
varchar(100)
Delivery address - company
delivery_address
varchar(156)
Delivery address - street and number
delivery_postcode
varchar(100)
Delivery address - postcode
delivery_city
varchar(100)
Delivery address - city
delivery_state
varchar(100)
Delivery address - state/province
delivery_country_code
char(2)
Delivery address - country code (two-letter, e.g. EN)
delivery_point_id
varchar(40)
Pick-up point delivery - pick-up point identifier
delivery_point_name
varchar(100)
Pick-up point delivery - pick-up point name
delivery_point_address
varchar(100)
Pick-up point delivery - pick-up point address
delivery_point_postcode
varchar(100)
Pick-up point delivery - pick-up point postcode
delivery_point_city
varchar(100)
Pick-up point delivery - pick-up point city
invoice_fullname
varchar(100)
Billing details - name and surname
invoice_company
varchar(100)
Billing details - company
invoice_nip
varchar(100)
Billing details - Vat Reg. no./tax number
invoice_address
varchar(100)
Billing details - street and house number
invoice_postcode
varchar(100)
Billing details - postcode
```

### addOrderProduct
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrderProduct
            The method allows you to add a new product to your order.
            
            
Input parameters
                    
                        
order_id
int
Order Identifier from BaseLinker order manager 
storage
varchar(9)
Type of product source storage (available values: "db" - BaseLinker internal inventory, "shop" - online shop storage, "warehouse" - the connected wholesaler)
storage_id
varchar(50)
The identifier of the storage (inventory/shop/warehouse) from which the product comes.
product_id
varchar(50)
Product identifier in BaseLinker or shop storage. Blank if the product number is not known
variant_id
varchar(30)
Product variant ID. Blank if the variant number is unknown
auction_id
varchar(20)
Listing ID number (if the order comes from ebay/allegro)
name
varchar(200)
Product name
sku
varchar(50)
Product SKU number
ean
varchar(32)
Product EAN number
location
varchar(50)
Product location. To assign multiple locations, separate them with a semicolon.
warehouse_id
int
Product source warehouse identifier. Only applies to products from BaseLinker inventory. By default warehouse_id is determined based on the warehouse identifiers in the existing products of the order. If no such product exist, it will be determined based on the source of the order
attributes
varchar(350)
The detailed product attributes, e.g. "Colour: blue" (Variant name)
price_brutto
float
Single item gross price
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
int
Number of pieces
weight
float
Single piece weight
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
order_product_id
int
Identifier of the item added to the order.
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "storage": "db",
    "storage_id": 0,
    "product_id": "5434",
    "variant_id": 52124,
    "name": "Harry Potter and the Chamber of Secrets",
    "sku": "LU4235",
    "ean": "1597368451236",
    "location": "A1-13-7",
    "attributes": "colour red",
    "price_brutto": 20.00,
    "tax_rate": 23,
```

### setOrderProductFields
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderProductFields
            The method allows you to edit the data of selected items (e.g. prices, quantities etc.) of a specific order. Only the fields that you want to edit should be given, the remaining fields can be omitted in the request.
            
            
Input parameters
                    
                        
order_id
int
Order identifier from the BaseLinker order manager. Field required.
order_product_id
int
Order item ID from BaseLinker order manager. Field required.
storage
varchar(9)
Type of product source storage (available values: "db" - BaseLinker internal inventory, "shop" - online shop storage, "warehouse" - the connected wholesaler)
storage_id
varchar(50)
The identifier of the storage (inventory/shop/warehouse) from which the product comes.
product_id
varchar(50)
Product identifier in BaseLinker or shop storage. Blank if the product number is not known
variant_id
varchar(30)
Product variant ID. Blank if the variant number is unknown
auction_id
varchar(20)
Listing ID number (if the order comes from ebay/allegro)
name
varchar(200)
Product name
sku
varchar(50)
Product SKU number
ean
varchar(32)
Product EAN number
location
varchar(50)
Product location
warehouse_id
int
Product source warehouse identifier. Only applies to products from BaseLinker inventory.
attributes
varchar(350)
The detailed product attributes, e.g. "Colour: blue" (Variant name)
price_brutto
float
Single item gross price
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
int
Number of pieces
weight
float
Single piece weight
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "order_product_id": "59157160",
    "attributes": "new product attribute",
    "quantity": "5"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
```

### deleteOrderProduct
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
deleteOrderProduct
            The method allows you to remove a specific product from the order.
            
            
Input parameters
                    
                        
order_id
int
Order ID from BaseLinker order manager.
order_product_id
int
Order item ID from BaseLinker order manager.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "order_product_id": "59157160"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 3754894,
    "order_product_id": "59157160"
}';
$apiParams = [
    "method" => "deleteOrderProduct",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
```

### setOrderPayment
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderPayment
            The method allows you to add a payment to the order.
            
            
Input parameters
                    
                        
order_id
int
Order ID number
payment_done
float
The amount of the payment. The value changes the current payment in the order (not added to the previous value). If the amount matches the order value, the order will be marked as paid.
payment_date
int
Payment date unixtime.
payment_comment
varchar(30)
Payments commentary.
external_payment_id
varchar(30)
(optional) External payment identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "payment_done": 120.57,
    "payment_date": 1444736731,
    "payment_comment": "bank transfer mBank 12.10.2015"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 3754894,
    "payment_done": 120.57,
    "payment_date": 1444736731,
    "payment_comment": "bank transfer mBank 12.10.2015"
}';
$apiParams = [
    "method" => "setOrderPayment",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
```

### setOrderStatus
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderStatus
            The method allows you to change order status.
            
            
Input parameters
                    
                        
order_id
int
Order ID number
status_id
int
Status ID number. The status list can be retrieved using getOrderStatusList.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 3754894,
    "status_id": 34562
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 3754894,
    "status_id": 34562
}';
$apiParams = [
    "method" => "setOrderStatus",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
```

### setOrderStatuses
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderStatuses
            The method allows you to batch set orders statuses
            
            
Input parameters
                    
                        
order_ids
array
Array of Order ID numbers
status_id
int
Status ID number. The status list can be retrieved using getOrderStatusList.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_ids": [3754894, 3754895],
    "status_id": 2
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_ids": [
        3754894,
        3754895
    ],
    "status_id": 2
}';
$apiParams = [
    "method" => "setOrderStatuses",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
```

### setOrderReceipt
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrderReceipt
            The method allows you to mark orders with a receipt already issued.
            
            
Input parameters
                    
                        
receipt_id
int
Receipt_id number received in the getNewReceipts method
receipt_nr
varchar(20)
The number of the issued receipt (may be blank if the printer does not return the number)
date
int
Receipt printing date (unixtime format)
printer_error
bool
Flag indicating whether an error occurred during receipt printing (false by default)
printer_name
varchar(50)
(optional) Printer name
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "receipt_id": 153845,
    "receipt_nr": "FP 23212",
    "date": 1407341754,
    "printer_error": false,
    "printer_name": "Fiscal123"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "receipt_id": 153845,
    "receipt_nr": "FP 23212",
    "date": 1407341754,
    "printer_error": false,
    "printer_name": "Fiscal123"
}';
$apiParams = [
    "method" => "setOrderReceipt",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
```

### addOrderInvoiceFile
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrderInvoiceFile
            The method allows you to add an external file to an invoice previously issued from BaseLinker. It enables replacing a standard invoice from BaseLinker with an invoice issued e.g. in an ERP program.
            
            
Input parameters
                    
                        
invoice_id
int
BaseLinker invoice identifier
file
text
Invoice PDF file in binary format encoded in base64, at the very beginning of the invoice string provide a prefix "data:" e.g. "data:4AAQSkSzkJRgABA[...]"
In some countries (e.g. Brazil), XML encoded in base64 is allowed - the string should also start with a prefix "data:" e.g. "data:PG5mZVB[...]"
external_invoice_number
varchar(30)
External system invoice number (overwrites BaseLinker invoice number)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "invoice_id": 153845,
    "file": "data:4AAQSkZJRgABA[...]",
    "external_invoice_number": "FV 101/03/2020"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "invoice_id": 153845,
    "file": "data:4AAQSkZJRgABA[...]",
    "external_invoice_number": "FV 101\/03\/2020"
}';
$apiParams = [
    "method" => "addOrderInvoiceFile",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
```

### addOrderReceiptFile
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrderReceiptFile
            The method allows you to add an external file to a receipt previously issued from BaseLinker. It enables replacing a standard receipt from BaseLinker with a receipt issued e.g. in an ERP program.
            
            
Input parameters
                    
                        
receipt_id
int
BaseLinker receipt identifier
file
text
Receipt PDF file in binary format encoded in base64, at the very beginning of the receipt string provide a prefix "data:" e.g. "data:4AAQSkSzkJRgABA[...]"
external_receipt_number
varchar(20)
External system receipt number (overwrites BaseLinker receipt number)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "receipt_id": 153845,
    "file": "data:4AAQSkZJRgABA[...]",
    "external_receipt_number": "RC40/08/2023"
}
                    Output data:
                    
{
    "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "receipt_id": 153845,
    "file": "data:4AAQSkZJRgABA[...]",
    "external_receipt_number": "RC40\/08\/2023"
}';
$apiParams = [
    "method" => "addOrderReceiptFile",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
```

### addOrderBySplit
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
addOrderBySplit
            Creates a new order by splitting selected products from an existing order. The new order inherits all fields and information from the original one.
            
            
Input parameters
                    
                        
order_id
int
ID of the order to split
items_to_split
array
A list of products to move to the new order. Each item must contain fields listed below
| - order_product_id
int
ID of the product in the original order (from 
getOrders
) method
| - quantity
int
Quantity to be moved (must be less than or equal to the original quantity)
delivery_cost_to_split
float
Optional. Delivery cost (net or gross, depending on order) to transfer to the new order. This amount will be deducted from the original order and assigned to the new one. Must not exceed the current delivery price.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
new_order_id
int
ID of the newly created order
                    
                    
                    
Sample
                    Input data:
                    
{
        "order_id": 1234567,
        "items_to_split": [
            {
                "order_product_id": 123,
                "quantity": 2
            },
            {
                "order_product_id": 456,
                "quantity": 1
            },
            {
                "order_product_id": 789,
                "quantity": 3
            }
        ],
        "delivery_cost_to_split": 123.00
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "new_order_id: 12345678
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 1234567,
    "items_to_split": [
        {
            "order_product_id": 123,
            "quantity": 2
        },
        {
            "order_product_id": 456,
            "quantity": 1
        },
        {
            "order_product_id": 789,
            "quantity": 3
        }
    ],
    "delivery_cost_to_split": 123
```

### setOrdersMerge
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
setOrdersMerge
            Merges multiple orders into one, based on the selected merge mode.
            
            
Input parameters
                    
                        
main_order_id
int
ID of the main order (its shipping and invoice data will be retained).
order_ids_to_merge
array
List of other order IDs to merge. Must not include main_order_id.
merge_mode
string
Merge mode: technical_merge (creates a new technical order without changing the originals) or into_main_order (moves items into the main order and deletes the others).
sum_delivery_costs
bool
Whether to sum delivery costs: true (add up all shipping costs from merged orders) or false (keep only the main order’s shipping cost).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
merged_order_id
int
ID of the merged order
                    
                    
                    
Sample
                    Input data:
                    
{
        "main_order_id": 1234567,
        "order_ids_to_merge": [
            2345678,
            3456789,
            4567890
        ],
        "merge_mode": "technical_merge",
        "sum_delivery_costs": true
}
                    Output data:
                    
{
        "status": "SUCCESS",
        "merged_order_id: 12345678
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "main_order_id": 1234567,
    "order_ids_to_merge": [
        2345678,
        3456789,
        4567890
    ],
    "merge_mode": "technical_merge",
    "sum_delivery_costs": true
}';
$apiParams = [
    "method" => "setOrdersMerge",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
```

### getInvoiceFile
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
getInvoiceFile
            The method allows you to get the invoice file from BaseLinker.
            
            
Input parameters
                    
                        
invoice_id
int
BaseLinker invoice identifier
get_external
bool
false (by default) - download invoice file generated by BaseLinker
true - download an invoice from an external accounting system (if provided there), or an invoice uploaded by API. If an additional invoice file does not exist, an invoice in BaseLinker format will be returned
        
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
invoice
text
Invoice file in binary format encoded in base64, at the very beginning of the invoice string a prefix "data:" is provided e.g. "data:4AAQSkSzkJRgABA[...]"
invoice_number
varchar(30)
BaseLinker invoice number (or external accounting system number if get_external is set to true)
                    
                    
                    
Sample
                    Input data:
                    
{
    "invoice_id": 153845
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "invoice": "data:4AAQSkZJRgABA[...]",
    "invoice_number": "FV 101/03/2023"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "invoice_id": 153845
}';
$apiParams = [
    "method" => "getInvoiceFile",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
```

### runOrderMacroTrigger
```
    
    
        
            
            
Test your request
            
Changelog
            
                                    
runOrderMacroTrigger
            The method allows you to run personal trigger for orders automatic actions.
            
            
Input parameters
                    
                        
order_id
int
Order identifier from BaseLinker order manager 
trigger_id
int
Identifier of personal trigger from orders automatic actions.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id":"143476260",
    "trigger_id":"12413"
}
                    Output data:
                    
{ "status": "SUCCESS" }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": "143476260",
    "trigger_id": "12413"
}';
$apiParams = [
    "method" => "runOrderMacroTrigger",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
                try
                {
                    if (!isJson(data)) {
                        data2 = JSON.stringify(data, null, 2);
                    } else {
                        data2 = JSON.stringify(JSON.parse(data), null, 2);
                    }
                    $("#response").html(data2);
                }
                catch(e)
                {
                    $("#response").html(data );
                }
        });
    }
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
```


---

## ORDER RETURNS

### getOrderReturnJournalList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnJournalList
            The method allows you to download a list of return events from the last 3 days.
            
            
Input parameters
                    
                        
last_log_id
int
Log ID number from which the logs are to be retrieved
logs_types
array
Event ID List
return_id
int
Return ID number
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
logs
array
List of events
| - id
int
Event ID
| - return_id
int
Return identifier
| - log_type
int
Event type:
                
1 - Return creation
                
2 - Return accepted
                
3 - Return completed
                
4 - Return canceled
                
5 - Return refunded
                
6 - Editing return delivery data
                
7 - Adding a product to a return
                
8 - Editing a product in the return
                
9 - Removing a product from the return
                
10 - Editing return data
                
11 - Return status change
                
12 - Return item status change
| - object_id
int
Additional information, depending on the event type:
                
9 - Deleted product ID
```

### addOrderReturn
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addOrderReturn
            The method allows adding a new order return to BaseLinker.
            
            
Input parameters
                    
                        
order_id
int
(optional) Order ID in BaseLinker panel
status_id
int
Order return status (the list available to retrieve with 
getOrderReturnStatusList
)
custom_source_id
int
(optional) Identifier of custom order source defined in BaseLinker panel. If not provided, default order return source is assigned.
reference_number
varchar(100)
(optional) Reference number from external source.
date_add
int
Date of order return creation (in unix time format)
currency
char(3)
3-letter currency symbol (e.g. EUR, PLN)
refunded
bool
Information whether the order return is already refunded. The value "1" automatically marks order return as refunded.
admin_comments
varchar(200)
Seller comments
email
varchar(150)
Buyer e-mail address
phone
varchar(100)
Buyer phone number
user_login
varchar(30)
Marketplace user login
delivery_price
float
Gross delivery price
delivery_fullname
varchar(100)
Delivery address - name and surname
delivery_company
varchar(100)
Delivery address - company
delivery_address
varchar(100)
Delivery address - street and number
delivery_postcode
varchar(100)
Delivery address - postcode
delivery_city
varchar(100)
Delivery address - city
delivery_state
varchar(20)
Delivery address - state/province
delivery_country_code
char(2)
Delivery address - country code (two-letter, e.g. EN)
extra_field_1
varchar(50)
```

### getOrderReturnExtraFields
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnExtraFields
            The method returns extra fields defined for order returns. Values of those fields can be set with method 
setOrderReturnFields
. To retrieve values of those fields set parameter include_custom_extra_fields in method 
getOrderReturns
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extra_fields
array
A list containing returns extra fields, where the key of the field serves as the key in the array and the value is an array containing the fields name and type
| - extra_field_id
int
ID of the extra field
| - name
int
Field name.
| - editor_type
varchar
Editor type. The following values are available: text, number, select, checkbox, radio, date, file.
| - options
array
(optional) An array of values available for a given additional field. Applicable to select, checkbox and radio editors.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
        "status": "SUCCESS",
        "extra_fields": {
            {
                "extra_field_id": 1,
                "name": "Additional Field 1",
                "editor_type": "text"
            },
            {
                "extra_field_id": 2,
                "name": "Additional Field 2",
                "editor_type": "text"
            },
            {
                "extra_field_id": 135,
                "name": "Client type",
                "editor_type": "radio",
                "options": ["B2B", "B2C"]
            },
            {
                "extra_field_id": 172,
                "name": "Shipping date deadline",
                "editor_type": "date"
            },
```

### getOrderReturns
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturns
            The method allows you to download order returns from a specific date from the BaseLinker return manager. The return list can be limited using the filters described in the method parameters. A maximum of 100 order returns are returned at a time.
            
            
Input parameters
                    
                        
order_id
int
Identifier of an order the return was created from.
return_id
int
Order return identifier. Completing this field will download information about only one specific order return.
date_from
int
The return creation date from which order return are to be collected. Format unix time stamp.
id_from
int
The order return ID number from which subsequent order returns are to be collected
status_id
int
(optional) The status identifier from which order returns are to be collected. Leave blank to download order returns from all statuses.
filter_order_return_source
varchar(20)
(optional) Filtering of order return lists by order return source, for instance "ebay", "amazon" (displays only orders come from given source). The list of order return sources can be retrieved with 
getOrderSources
 method.
filter_order_return_source_id
int
(optional) Filtering of order return lists by order return source identifier, for instance "2523" (displays only order returns come from order return source defined in "filter_order_return_source" identified by given order return source identifier). Filtering by order return source identifier requires "filter_order_return_source" to be set prior. The list of order source identifiers can be retrieved with 
getOrderSources
 method.
include_custom_extra_fields
bool
(optional, false by default) Download values of custom additional fields.
include_connect_data
bool
(optional, false by default) Base Connect and contractor data.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
Success / error.
returns
array
An array of information about the order returns found. Each order return is described by the fields listed below.
return_id
int
Return order identifier.
order_id
int
Identifier of an order the return was created from.
shop_order_id
int
Order ID given by the store
external_order_id
varchar(50)
An order identifier taken from an external source. e.g. the order number in the store, or the eBay transaction number.
reference_number
varchar(100)
Reference number from external source.
order_return_source
varchar(20)
```

### getOrderReturnStatusList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnStatusList
            The method allows you to download order return statuses created by the customer in the BaseLinker order manager.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
statuses
array
An array of statuses. Each status contains fields:
            
id
 (int) - status identifier
            
name
 (varchar) - status name (basic)
            
name_for_customer
 (varchar) - long status name (displayed to the customer on the order page)
            
color
 (varchar) - status color in hex
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
      "status": "SUCCESS",
      "statuses": [
        {
          "id": 1051,
          "name": "New orders",
          "name_for_customer": "Order accepted"
        },
        {
          "id": 1052,
          "name": "To be paid (courier)",
          "name_for_customer": " Awaiting payment"
        },
        {
          "id": 1291,
          "name": "Ready to ship (courier)",
          "name_for_customer": "Processing"
        },
        {
          "id": 1470,
          "name": "To be paid (post mail)",
          "name_for_customer": " Awaiting payment"
        },
        {
          "id": 1471,
          "name": "Dispatched",
          "name_for_customer": "The parcel has been shipped"
```

### getOrderReturnPaymentsHistory
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnPaymentsHistory
            The method allows you to retrieve payment history for a selected order, including an external payment identifier from the payment gateway. One order can have multiple payment history entries, caused by surcharges, order value changes, manual payment editing
            
            
Input parameters
                    
                        
return_id
int
Order return identifier.
show_full_history
bool
(optional, false by default) Download full payment history, including order value change entries, manual order payment edits. False by default - only returns entries containing an external payment identifier (most commonly used).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
payments
array
An array of payments list. Each payment contains fields:
                
paid_before
 (float) - total amount paid before the given change
                
paid_after
 (float) - total amount paid after the change
                
total_price
 (float) - total order price
                
currency
 (varchar) - the currency
                
external_payment_id
 (varchar) - external payment identifier
                
date
 (int) - date of change record (unix time format)
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_id": 1102
        }
                    Output data:
                    
{
      "status": "SUCCESS",
      "payments": [
        {
          "paid_before": "0.00",
          "paid_after": "55.00",
          "total_price": "82.97",
          "date": "1515001701",
          "currency": "GBP",
          "external_payment_id": "189a1236-0aa9-21ee-15ab-8b0992243303",
        }
      ]
```

### setOrderReturnFields
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setOrderReturnFields
            The method allows you to edit selected fields of a specific order return. Only the fields that you want to edit should be given, other fields can be omitted in the request.
            
            
Input parameters
                    
                        
return_id
int
Order return identifier. Field required. Other fields are optional.
admin_comments
varchar(200)
Seller comments
email
varchar(150)
Buyer e-mail address
phone
varchar(100)
Buyer phone number
user_login
varchar(30)
Buyer login
delivery_price
float
Gross delivery price
delivery_fullname
varchar(100)
Delivery address - name and surname
delivery_company
varchar(100)
Delivery address - company
delivery_address
varchar(100)
Delivery address - street and number
delivery_postcode
varchar(100)
Delivery address - postcode
delivery_city
varchar(100)
Delivery address - city
delivery_state
varchar(100)
Delivery address - state/province
delivery_country_code
char(2)
Delivery address - country code (two-letter, e.g. EN)
extra_field_1
varchar(50)
Value of the "extra field 1".
extra_field_2
varchar(50)
Value of the "extra field 2".
custom_extra_fields
array
A list containing order return custom extra fields, where the key is the extra field ID and value is an extra field content for given extra field. The list of extra fields can be retrieved with 
getOrderReturnExtraFields
 method.
In case of removing a field the empty string is expected.
In case of file the following format is expected:
{
&nbsp;&nbsp;&nbsp;&nbsp;"title": "file.pdf" (varchar(40) - the file name)
&nbsp;&nbsp;&nbsp;&nbsp;"file": "data:4AAQSkZJRgABA[...]" (binary - the file body limited to 2MB)
}
                    
                    
                    
Output data
                    The method returns the data in JSON format.
```

### addOrderReturnProduct
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addOrderReturnProduct
            Add new product to existing order return
            
            
Input parameters
                    
                        
return_id
int
Order return identifier. Field required. Other fields are optional.
order_product_id
int
(optional) ID of connected order item from BaseLinker order manager.
storage
varchar(9)
Type of product source storage (available values: "db" - BaseLinker internal inventory, "shop" - online shop storage, "warehouse" - the connected wholesaler)
storage_id
varchar(50)
The identifier of the storage (inventory/shop/warehouse) from which the product comes.
product_id
varchar(50)
Product identifier in BaseLinker or shop storage. Blank if the product number is not known
variant_id
varchar(30)
Product variant ID. Blank if the variant number is unknown
auction_id
varchar(20)
Listing ID number (if the order comes from ebay/allegro)
name
varchar(200)
Product name
sku
varchar(50)
Product SKU number
ean
varchar(32)
Product EAN number
location
varchar(50)
Product location
warehouse_id
int
Product source warehouse identifier. Only applies to products from BaseLinker inventory. By default warehouse_id is determined based on the warehouse identifiers in the existing products of the return. If no such product exist, it will be determined based on the source of the return
attributes
varchar(350)
The detailed product attributes, e.g. "Colour: blue" (Variant name)
price_brutto
float
Single item gross price
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
int
Number of pieces
weight
float
Single piece weight
status_id
int
Identifier of return item status. The list can be retrieved with 
getOrderReturnProductStatuses
 method.
return_reason_id
int
Identifier of return reason. The list can be retrieved with 
getOrderReturnReasonsList
 method.
```

### setOrderReturnProductFields
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setOrderReturnProductFields
            The method allows you to edit the data of selected items (e.g. prices, quantities etc.) of a specific order. Only the fields that you want to edit should be given, the remaining fields can be omitted in the request.
            
            
Input parameters
                    
                        
return_id
int
Order return identifier from the BaseLinker order manager. Field required.
order_return_product_id
int
Order return item ID from BaseLinker order manager. Field required.
storage
varchar(9)
Type of product source storage (available values: "db" - BaseLinker internal inventory, "shop" - online shop storage, "warehouse" - the connected wholesaler)
storage_id
varchar(50)
The identifier of the storage (inventory/shop/warehouse) from which the product comes.
product_id
varchar(50)
Product identifier in BaseLinker or shop storage. Blank if the product number is not known
variant_id
varchar(30)
Product variant ID. Blank if the variant number is unknown
auction_id
varchar(20)
Listing ID number (if the order comes from ebay/allegro)
name
varchar(200)
Product name
sku
varchar(50)
Product SKU number
ean
varchar(32)
Product EAN number
location
varchar(50)
Product location
warehouse_id
int
Product source warehouse identifier. Only applies to products from BaseLinker inventory.
attributes
varchar(350)
The detailed product attributes, e.g. "Colour: blue" (Variant name)
price_brutto
float
Single item gross price.
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
quantity
int
Number of pieces
weight
float
Single piece weight
status_id
int
Identifier of product return status. The list can be retrieved with 
getOrderReturnProductStatuses
 method.
return_reason_id
int
Identifier of return reason. The list can be retrieved with 
getOrderReturnReasonsList
 method.
```

### deleteOrderReturnProduct
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteOrderReturnProduct
            The method allows you to remove a specific product from the return.
            
            
Input parameters
                    
                        
return_id
int
Order return ID.
order_return_product_id
int
Order return item ID.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_id": 1102,
        "order_return_product_id": 1232
    }
                    Output data:
                    
{
      "status": "SUCCESS"
    }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "return_id": 1102,
    "order_return_product_id": 1232
}';
$apiParams = [
    "method" => "deleteOrderReturnProduct",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
```

### setOrderReturnRefund
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setOrderReturnRefund
            The method allows you to mark an order return as refunded. Note this method doesn't issue an actual money refund.
            
            
Input parameters
                    
                        
return_id
int
Order return ID.
order_refund_done
float
The amount of the refund. The value changes the current refund in the order return (not added to the previous value). If the amount matches the order value, the order will be marked as refund.
refund_date
int
Refund date (unixtime format).
refund_comment
varchar(50)
Refund commentary.
external_refund_id
varchar(50)
(optional) External refund identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_id": 1102,
        "order_refund_done": 25.50,
        "refund_date": 1702905036,
        "refund_comment": "by paypal"
    }
                    Output data:
                    
{
      "status": "SUCCESS"
    }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "return_id": 1102,
    "order_refund_done": 25.5,
    "refund_date": 1702905036,
    "refund_comment": "by paypal"
}';
$apiParams = [
    "method" => "setOrderReturnRefund",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
```

### getOrderReturnReasonsList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnReasonsList
            The method returns a list of order return reasons. Values of those fields can be set with method 
setOrderReturnFields
.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
return_reasons
array
A list containing order return reasons:
            
return_reason_id
 (int) - ID of the order return reason
            
name
 (varchar) - Order return reason name
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
      "status": "SUCCESS",
      "return_reasons": [
        {
          "return_reason_id": 1001,
          "name": "None"
        },
        {
          "return_reason_id": 1002,
          "name": "Purchase mistake"
        },
        {
          "return_reason_id": 1003,
          "name": "Problem during transport"
        },
        {
          "return_reason_id": 1004,
          "name": "Delay in shipment"
        },
        {
          "return_reason_id": 1005,
          "name": "Damaged goods"
        },
      ]
    }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getOrderReturnReasonsList",
```

### setOrderReturnStatus
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setOrderReturnStatus
            The method allows you to change order return status.
            
            
Input parameters
                    
                        
return_id
array
Order return ID number.
status_id
int
Status ID number. The status list can be retrieved using 
getOrderReturnStatusList
.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_id": 1102,
        "status_id": 10224
    }
                    Output data:
                    
{
      "status": "SUCCESS",
      "order_return_reasons": [
        {
          "return_reason_id": 1001,
          "name": "None"
        },
        {
          "return_reason_id": 1002,
          "name": "Purchase mistake"
        },
        {
          "return_reason_id": 1003,
          "name": "Problem during transport"
        },
        {
          "return_reason_id": 1004,
          "name": "Delay in shipment"
        },
        {
          "return_reason_id": 1005,
          "name": "Damaged goods"
        },
      ]
    }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "return_id": 1102,
```

### setOrderReturnStatuses
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setOrderReturnStatuses
            The method allows you to batch set order return statuses.
            
            
Input parameters
                    
                        
return_ids
array
Array of Order return ID numbers
status_id
int
Order return status ID number. The status list can be retrieved using 
getOrderReturnStatusList
.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_ids": [1102, 1105],
        "status_id": 10224
    }
                    Output data:
                    
{ "status": "SUCCESS" }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "return_ids": [
        1102,
        1105
    ],
    "status_id": 10224
}';
$apiParams = [
    "method" => "setOrderReturnStatuses",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
```

### runOrderReturnMacroTrigger
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
runOrderReturnMacroTrigger
            The method allows you to run personal trigger for order returns automatic actions.
            
            
Input parameters
                    
                        
return_id
int
Order return identifier from BaseLinker order manager.
trigger_id
int
Identifier of personal trigger from orders automatic actions.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
        "return_id": 1102,
        "trigger_id": 1241
        }
                    Output data:
                    
{ "status": "SUCCESS" }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "return_id": 1102,
    "trigger_id": 1241
}';
$apiParams = [
    "method" => "runOrderReturnMacroTrigger",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
    {
        $("#response_div").slideDown();
        $("#response").html("Loading..");
        $.ajax({
            type: "POST",
            url: "connector.php",
            headers: {"X-BLToken": $("#token").val()},
            data: {method: $("#method").val(), parameters: $("#parameters").val() }
        })
        .done(function( data ) {
```

### getOrderReturnProductStatuses
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderReturnProductStatuses
            The method returns a list of order return item statuses. Values of those fields can be set with method 
setOrderReturnFields
.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
order_return_product_statuses
array
A list containing order return reasons:
            
status_id
 (int) - ID of the order return item status
            
name
 (varchar) - Order return reason name
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
      "status": "SUCCESS",
      "order_return_product_statuses": [
        {
          "status_id": 1001,
          "name": "None"
        },
        {
          "status_id": 1002,
          "name": "Accepted"
        },
        {
          "status_id": 1003,
          "name": "Damaged"
        }
      ]
    }
                                        A sample request in PHP:
                    
<?php
$methodParams = '{}';
$apiParams = [
    "method" => "getOrderReturnProductStatuses",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
```


---

## COURIER SHIPMENTS

### createPackage
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
createPackage
            The method allows you to create a shipment in the system of the selected courier.
            
            
Input parameters
                    
                        
order_id
int
Order identifier
courier_code
varchar(20)
Courier code
account_id
int
(optional) Courier API account id for the courier accounts retrieved from the request 
getCourierAccounts
If blank, the first account will be used.
fields
array
List of form fields retrieved from the request 
getCourierFields
For checkbox with multiple selection, the information should be sent in separate arrays e.g.
[
&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;"id":"services",
&nbsp;&nbsp;&nbsp;&nbsp;"value":"sms"
&nbsp;&nbsp;},
&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;"id":"services",
&nbsp;&nbsp;&nbsp;&nbsp;"value":"email"
&nbsp;&nbsp;},
]
| - id
varchar(50)
The field ID
| - value
varchar
Option ID (required for checkbox, select field types) or value (required for text, date field types)
Date - format unix time
packages
array
Array of shipments list, weight of at least one shipment required. The array includes fields received in response to the request 
getCourierFields
. The response returns also information whether the courier supports multiple shipments.
                As a key use the field 'id' retrieved from the packages_fields parameter in response of the 
getCourierFields
 method.
                As a value of field provide a value compatible with the field type from the 
getCourierFields
 response. Height, length, width should be sent in centimeters. Weight should be sent in kilograms.
E.g.
[
&nbsp;&nbsp;"weight":"1",
&nbsp;&nbsp;"height":"25",
]
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
package_id
```

### createPackageManual
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
createPackageManual
            The method allows you to enter the shipping number and the name of the courier to the order (function used only to add shipments created outside BaseLinker)
            
            
Input parameters
                    
                        
order_id
int
Order identifier
courier_code
varchar(20)
Courier code (courier code retrieved with 
getCouriersList
 or custom courier name)
package_number
varchar(40)
Shipping number (consignment number)
pickup_date
int
Date of dispatch (unix time format)
return_shipment
bool
(optional, false by default) Marks package as return shipment
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
package_id
int
Shipment ID
package_number
varchar(40)
Shipping number (consignment number)
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 6910995,
    "courier_code": "dhl",
    "package_number": "622222044730624327700197",
    "pickup_date": "1487006161",
    "return_shipment": true
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "package_id": 77014697,
  "package_number": "622222044730624327700198"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "order_id": 6910995,
    "courier_code": "dhl",
    "package_number": "622222044730624327700197",
```

### getCouriersList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCouriersList
            The method allows you to retrieve a list of available couriers.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
couriers
array
An array with a list of couriers containing the fields listed below.
| - code
varchar(20)
Courier code
| - name
varchar(30)
Courier name
                    
                    
                    
Sample
                    Input data:
                    
[]
                    Output data:
                    
{
  "status": "SUCCESS",
  "couriers": [
    {
      "code": "dhl",
      "name": "DHL"
    },
    {
      "code": "dpd",
      "name": "DPD"
    },
    {
      "code": "fedexpl",
      "name": "FedEx"
    },
    {
      "code": "globkurier",
      "name": "Globkurier"
    },
    {
      "code": "gls",
      "name": "GLS"
    },
    {
      "code": "inpostkurier",
      "name": "InPost"
    },
    {
      "code": "kex2",
      "name": "K-EX Geis"
    },
    {
      "code": "paczkomaty",
      "name": "Paczkomaty"
    }
    {
      "code": "pkwid",
```

### getCourierFields
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCourierFields
            The method allows you to retrieve the form fields for creating shipments for the selected courier.
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
multi_packages
bool
Does the courier support multiple shipments (0/1).
fields
array
An array with a list of fields to create a shipment containing the fields listed below.
| - id
varchar(50)
The field ID
| - name
varchar(50)
The field name
| - type
varchar(10)
Field type (available select, checkbox, text, date)
| - desc
text
Additional field description
| - options
array
List of available options (appears for select, checkbox).
The key to each element is the option id (varchar)
The value is the option name (varchar)
| - show_field
array
List of additional fields that are available for the selected option.
The key for each element is (varchar) - id of the option for which additional fields (varchar) are to be available 
The value is the list of fields that are available for this option (array)
| - value
varchar(50)
Default value for a field
| - function
varchar(20)
If this value is not empty, it means that the field has dynamic options and in order to download the current options for a particular order, you should retrieve with the 
getCourierServices
" request
package_fields
array
An array with a list of fields to create packages containing the fields listed below. The completed list of these fields must be provided to the 
createPackage
 method under the packages key as an array of objects.
| - id
varchar(50)
The field ID
| - name
varchar(50)
The field name
```

### getCourierServices
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCourierServices
            The method allows you to retrieve additional courier services, which depend on other shipment settings. Used only for X-press, BrokerSystem, Wysyłam z Allegro, ErliPRO couriers. Not applicable to other couriers whose forms have fixed options. The details of the package should be sent with the method (the format as in createPackage) in order to receive a list of additional services
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
order_id
int
Order identifier
account_id
int
(optional) Courier API account id for the courier accounts retrieved from the request 
getCourierAccounts
If blank, the first account will be used.
fields
array
Fields same as in 
createPackage
" function
packages
array
Fields same as in 
createPackage
" function
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
services
array
List of available services.
The key to each element is the service id (varchar)
Value is the name of the service (varchar)
                    
                    
                    
Sample
                    Input data:
                    
{
    "order_id": 6911000,
    "courier_code": "xpress",
    "account_id": 294,
    "fields": [
        {
            "id":"package_type",
            "value":"Package"
        },
        {
            "id":"pickup_date",
            "value":"1487006161"
        },
        {
            "id":"pickup_hour",
            "value":"19"
        },
        {
```

### getCourierAccounts
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCourierAccounts
            The method allows you to retrieve the list of accounts connected to a given courier.
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
accounts
array
An array with a list of available accounts.
| - id
int
Account ID
| - name
varchar
Account name
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "pkwid"
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "accounts": [
    {
      "id": 60,
      "name": "London Branch"
    },
    {
      "id": 251,
      "name": "Manchester Branch"
    }
  ]
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "courier_code": "pkwid"
}';
$apiParams = [
    "method" => "getCourierAccounts",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
```

### getLabel
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getLabel
            The method allows you to download a shipping label (consignment) for a selected shipment.
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
package_id
int
Shipment ID, optional if package_number was provided
package_number
varchar(40)
Shipping number (consignment number), optional if package_id was provided
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extension
varchar(4)
Label file extension (pdf, html, gif, png, epl, zpl, dpl).
label
text
Label encoded with base64 algorithm.
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "dhl",
    "package_id": 7323859
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "extension": "pdf",
  "label": "JVBERi0xLjQKJeLjz9MKNiAwIG9iago8PC9Db2xvclNwYWNlW.........FIvU2l6ZSAyNT4+CnN0YXJ0eHJlZgo3NjIyNgolJUVPRgo="
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "courier_code": "dhl",
    "package_id": 7323859
}';
$apiParams = [
    "method" => "getLabel",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
```

### getProtocol
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getProtocol
            The method allows you to download a parcel protocol for selected shipments if the protocol is available for chosen courier
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
package_ids
array
Array of shipments ID, optional if package_numbers was provided
package_numbers
array
Array of shipments number (consignment number), optional if package_ids was provided
account_id
int
Courier API account id for the courier accounts retrieved from the request 
getCourierAccounts
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extension
varchar(4)
Protocol file extension (pdf, html).
protocol
text
Protocol encoded with base64 algorithm.
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "raben",
    "package_ids": [7323859,8421839]
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "extension": "pdf",
  "protocol": "JVBERi0xLjQKJeLjz9MKNiAwIG9iago8PC9Db2xvclNwYWNlW.........FIvU2l6ZSAyNT4+CnN0YXJ0eHJlZgo3NjIyNgolJUVPRgo="
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "courier_code": "raben",
    "package_ids": [
        7323859,
        8421839
    ]
}';
$apiParams = [
    "method" => "getProtocol",
    "parameters" => $methodParams
];
```

### getCourierDocument
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCourierDocument
            The method allows you to download a parcel document
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
document_type
varchar(10)
Types:
            
manifest
account_id
int
Courier API account id for the courier accounts retrieved from the request 
getCourierAccounts
package_ids
array
Array of shipments ID, optional
package_numbers
array
Array of shipments number (consignment number), optional
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
extension
varchar(4)
Document file extension (pdf, zpl, epl, html, etc.).
document
text
Document encoded with base64 algorithm.
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "flipkartshipping",
    "document_type": "manifest",
    "account_id": 16
}
                    Output data:
                    
{
  "status": "SUCCESS",
  "extension": "pdf",
  "document": "JVBERi0xLjQKJeLjz9MKNiAwIG9iago8PC9Db2xvclNwYWNlW.........FIvU2l6ZSAyNT4+CnN0YXJ0eHJlZgo3NjIyNgolJUVPRgo="
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "courier_code": "flipkartshipping",
    "document_type": "manifest",
    "account_id": 16
}';
```

### getOrderPackages
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderPackages
            The method allows you to download shipments previously created for the selected order.
            
            
Input parameters
                    
                        
order_id
int
Order identifier
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
packages
array
List of shipments
| - package_id
int
Shipment ID
| - courier_package_nr
varchar(40)
Shipping number (consignment number)
| - courier_inner_number
varchar(40)
Courier internal number
| - courier_code
varchar(20)
Courier code
| - courier_other_name
varchar(20)
Additional courier name, applicable to brokers.
| - account_id
int
Courier account id
| - tracking_status_date
int
Last shipment tracking status date
| - tracking_delivery_days
int
Number of days for a shipment to be delivered from status Shipped to status Delivered, excluding weekends
| - tracking_status
int
Tracking status code:
                    
0 - Unknown
                    
1 - Courier label created
                    
2 - Shipped
                    
3 - Not delivered
                    
4 - Out for delivery
                    
5 - Delivered
                    
6 - Return
                    
7 - Aviso
                    
```

### getPackageDetails
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getPackageDetails
            This method allows to get detailed information about a package. If the package contains multiple subpackages, information about all of them is included in the response.
            
            
Input parameters
                    
                        
package_id
int
Shipment ID
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
package_details
array
List of shipments details
| - weight
float
Package weight
| - weight_unit
enum
Unit of package weight ("kg", "g", "lb", "oz", "")
| - length
float
Package length
| - width
float
Package width
| - height
float
Package height
| - size_unit
enum
Unit of package size ("cm", "in", "")
| - size_template
varchar(255)
Size template identifier if used, otherwise empty
| - is_custom
bool
True if package dimensions are custom, false otherwise
| - cod_value
float
Cash on delivery (COD) value
| - cod_currency
char(3)
Currency of COD value
| - insurance_value
float
Insurance value of the package
| - insurance_currency
char(3)
Currency of insurance value
| - cost_value
float
Shipping cost declared for the package
| - cost_currency
char(3)
Currency of shipping cost
| - type
enum
```

### getCourierPackagesStatusHistory
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCourierPackagesStatusHistory
            The method allows you to retrieve the history of the status list of the given shipments. Maximum 100 shipments at a time
            
            
Input parameters
                    
                        
package_ids
array
An array with a list of parcel IDs.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
packages_history
array
Array of shipments, key parcel ID
| - tracking_status_date
int
Status date
| - courier_status_code
varchar(100)
Original status code in the courier system
| - tracking_status
int
Tracking status code:
                    
0 - Unknown
                    
1 - Courier label created
                    
2 - Shipped
                    
3 - Not delivered
                    
4 - Out for delivery
                    
5 - Delivered
                    
6 - Return
                    
7 - Aviso
                    
8 - Waiting at point
                    
9 - Lost
                    
10 - Canceled
                    
11 - On the way
                    
12 - Exception (sorting error, other event, complaint)
                    
13 - Transferred abroad
        
                    
                    
                    
Sample
                    Input data:
                    
```

### deleteCourierPackage
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteCourierPackage
            The method allows you to delete a previously created shipment. The method removes the shipment from the BaseLinker system and from the courier system if the courier API allows it
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
package_id
int
Shipment ID, optional if package_number is provided
package_number
varchar(40)
Shipping number (consignment number), optional if package_id was provided
force_delete
bool
(optional, false by default) Forcing a shipment to be removed from BaseLinker database in the case of an error with the removal of the shipment in the courier API.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "dhl",
    "package_id": 77014696,
    "package_number": "622222044730624327700197"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "courier_code": "dhl",
    "package_id": 77014696,
    "package_number": "622222044730624327700197"
}';
$apiParams = [
    "method" => "deleteCourierPackage",
    "parameters" => $methodParams
];
$curl = curl_init("https://api.baselinker.com/connector.php");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, ["X-BLToken: xxx"]);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($apiParams));
$response = curl_exec($curl);
                    
                
            
        
    function send()
```

### runRequestParcelPickup
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
runRequestParcelPickup
            The method allows you to request a parcel pickup for previously created shipments. The method sends a parcel pickup request to courier API if the courier API allows it
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
package_ids
array
Array of shipments ID, optional if package_numbers was provided
package_numbers
array
Array of shipments number (consignment number), optional if package_ids was provided
account_id
int
Courier API account id for the courier accounts retrieved from the request 
getCourierAccounts
fields
array
List of form fields retrieved from the request 
getRequestParcelPickupFields
For checkbox with multiple selection, the information should be sent in separate arrays e.g.
[
&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;"id":"pickup_date",
&nbsp;&nbsp;&nbsp;&nbsp;"value":"1642416311"
&nbsp;&nbsp;},
&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;"id":"shipments_weight",
&nbsp;&nbsp;&nbsp;&nbsp;"value":"40"
&nbsp;&nbsp;},
]
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
pickup_number
varchar(50)
The parcel pickup number provided by the courier API
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code": "dpd",
    "package_numbers": [
        "0000000815947Q",
        "0000000633844Q"
    ],
    "account_id": 1645,
    "fields": [
        {
            "id": "pickup_date",
            "value": 1642672310
        }
    ]
```

### getRequestParcelPickupFields
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getRequestParcelPickupFields
            The method allows you to retrieve additional fields for a parcel pickup request.
            
            
Input parameters
                    
                        
courier_code
varchar(20)
Courier code
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
fields
array
An array with a list of additional fields to request parcel pickup containing the fields listed below.
| - id
varchar(50)
The field ID
| - name
varchar(50)
The field name
| - type
varchar(10)
Field type (available select, checkbox, text, date)
| - desc
text
Additional field description
| - options
array
List of available options (appears for select, checkbox).
The key to each element is the option id (varchar)
The value is the option name (varchar)
| - value
varchar(50)
Default value for a field
                    
                    
                    
Sample
                    Input data:
                    
{
    "courier_code":"dpd"
}
                    Output data:
                    
{
    "status": "SUCCESS",
    "fields": [
        {
            "id": "pickup_date",
            "name": "Data nadania",
            "type": "date"
        }
    ]
}
                                        A sample request in PHP:
                    
<?php
```


---

## PRODUCTS STORAGE [OBSOLETE]

### getStoragesList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getStoragesList
            This method allows downloading a list of available storages that can be accessed via API.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storages
array
An array of storages containing the fields listed below
| - storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
| - name
varchar(100)
Storage name
| - methods
array
An array of names of methods supported by the storage.
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
  "status": "SUCCESS",
  "storages": [
    {
      "storage_id": "bl_1",
      "name": "BaseLinker catalog",
      "methods": [
          "addCategory", "addProduct", "addProductVariant", "deleteCategory", "deleteProduct", "deleteProductVariant",
          "getCategories", "getProductsData", "getProductsList", "updateProductsQuantity", "updateProductsPrices"
      ]
```

### addCategory
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addCategory
            The method allows adding a category to the BaseLinker storage. Adding a category with the same ID again, updates the previously saved category.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
category_id
int
The category identifier to be provided for updates. Should be left blank when creating a new category.
name
varchar(200)
Category name
parent_id
int
The parent category identifier obtained previously at the output of the addCategory method. Categories should be added starting from the hierarchy root so that the child is always added after the parent (you need to know the parent ID to add the child). For the top level category, 0 should be given as parent_id.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
The identifier of the storage where the category has been added or modified in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
category_id
int
Number of a category added or updated in BaseLinker storage. In an external application you should create a link between the internal number and the number received here. It will later be used to update the added category. This number is also used in addProducts and deleteCategory methods.
                    
                    
                    
Sample
                    Input data:
                    
{
"storage_id": "bl_1",
"name": "Shoes",
"parent_id": 0
}
                    Output data:
```

### addProduct
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addProduct
            The method allows you to add a new product to BaseLinker storage. Entering the product with the ID updates previously saved product.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
product_id
varchar(30)
Main product identifier, given only during the update. Should be left blank when creating a new product. The new product identifier is returned as a response to this method.
sku
varchar(32)
Product SKU number.
ean
varchar(32)
Product EAN number.
asin
varchar(50)
Product ASIN number.
name
varchar(200)
Product name
quantity
int
Stock quantity
price_brutto
float
Price gross
price_wholesale_netto
float
Net wholesale price
tax_rate
float
VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
weight
float
Weight in kilograms
description
text
Product description
description_extra1
text
Additional product description
description_extra2
text
```

### addProductVariant
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
addProductVariant
            The method allows to add a new variant to the product in BaseLinker storage. Providing the variant together with the ID, causes an update of the previously saved variant.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
product_id
varchar(30)
Product ID.
variant_id
varchar(30)
Product variant ID. Given only for updates. Should be left blank when creating a new variant. The new variant identifier is returned as a response to this method.
name
varchar(100)
Variant name
quantity
int
Stock quantity
price_brutto
float
Price gross
sku
varchar(32)
Product SKU number.
ean
varchar(32)
Product EAN number.
asin
varchar(50)
Product ASIN number.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
The identifier of the storage, where the product was added or changed in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
```

### deleteCategory
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteCategory
            The method allows you to remove categories from BaseLinker storage. Along with the category, the products contained therein are removed (however, this does not apply to products in subcategories). The subcategories will be changed to the highest level categories.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
category_id
int
The number of the category to be removed in the BaseLinker storage.
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
"storage_id": "bl_1",
"category_id": "543"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "storage_id": "bl_1",
    "category_id": "543"
}';
$apiParams = [
    "method" => "deleteCategory",
```

### deleteProduct
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteProduct
            The method allows you to remove the product from BaseLinker storage.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
product_id
varchar(30)
Product identifier from BaseLinker storage
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
"storage_id": "bl_1",
"product_id": "3245"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "storage_id": "bl_1",
    "product_id": "3245"
}';
$apiParams = [
    "method" => "deleteProduct",
```

### deleteProductVariant
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
deleteProductVariant
            The method allows you to remove the product from BaseLinker storage.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
product_id
varchar(30)
Product identifier from BaseLinker storage
variant_id
varchar(30)
Product variant identifier from BaseLinker storage
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
                    
                    
                    
Sample
                    Input data:
                    
{
"storage_id": "bl_1",
"product_id": "3245",
"variant_id": "5132"
}
                    Output data:
                    
{
  "status": "SUCCESS"
}
                                        A sample request in PHP:
                    
<?php
$methodParams = '{
    "storage_id": "bl_1",
```

### getCategories
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getCategories
            The method allows you to download a list of categories for a BaseLinker storage or a shop storage connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
categories
array
An array of categories containing the fields listed below.
| - category_id
int
Category ID.
| - name
varchar(200)
Category name
| - parent_id
int
Parent category identifier.
                    
                    
                    
Sample
                    Input data:
                    
{
"storage_id": "bl_1"
}
                    Output data:
                    
{
```

### getProductsData
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getProductsData
            The method allows to download detailed data of selected products from the BaseLinker storage or a shop/wholesaler storage connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of product ID numbers to download
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - sku
varchar(32)
Product SKU number. It can be filled with e.g. an external system product number. This will later allow you to rebuild the list of product associations in case of loss.
| - ean
varchar(32)
Product EAN number.
| - asin
varchar(50)
Product ASIN number.
| - name
varchar(200)
Product name
| - quantity
int
Stock quantity
```

### getProductsList
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getProductsList
            The method allows to download detailed data of selected products from the BaseLinker storage or a shop/wholesaler storage connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
filter_category_id
varchar(30)
(optional) Retrieving products from a specific category (optional)
filter_limit
varchar(30)
(OBSOLETE)
 (optional) limit of returned categories in SQL format ("quantity skipped, quantity downloaded")
filter_sort
varchar(30)
(optional) the value for sorting the product list. Possible values:
                                                                                                                            "id [ASC|DESC]", "name [ASC|DESC]", "quantity [ASC|DESC]", "price [ASC|DESC]"
filter_id
varchar(30)
(optional) limiting results to a specific product id
filter_sku
varchar(32)
(optional) limiting the results to a specific SKU (stock keeping number)
filter_ean
varchar(320)
(optional) limiting results to a specific ean
filter_asin
varchar(50)
(optional) limiting results to a specific asin
filter_name
varchar(100)
(optional) item name filter (part of the searched name or an empty field)
filter_price_from
float
(optional) minimum price limit (not displaying products with lower price)
filter_price_to
float
(optional) maximum price limit
filter_quantity_from
int
(optional) minimum quantity limit
filter_quantity_to
int
(optional) maximum quantity limit
```

### getProductsQuantity
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getProductsQuantity
            The method allows to retrieve stock from the BaseLinker storage or the shop/wholesaler storage connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
page
int
(optional) Results paging (for BaseLinker storage 1000 products per page)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - quantity
int
Stock quantity
| - variants
array
An array of variants containing the fields listed below
| - | - variant_id
varchar(30)
Variant main identifier.
| - | - quantity
int
Stock quantity
                    
                    
                    
```

### getProductsPrices
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getProductsPrices
            The method allows you to fetch prices of products from the BaseLinker storage or the shop/wholesaler storage connected to BaseLinker.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
page
int
(optional) Results paging (for BaseLinker storage 1000 products per page)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of products containig the fields listed below
| - product_id
varchar(30)
The main Product ID.
| - price
float
Product price
| - variants
array
An array of variants containing the fields listed below
| - | - variant_id
varchar(30)
Variant main identifier.
| - | - price
float
Variant price
                    
                    
                    
```

### updateProductsQuantity
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
updateProductsQuantity
            The method allows to bulk update the product stock (and/or variants) in BaseLinker storage or in a shop/wholesaler storage connected to BaseLinker. Maximum 1000 products at a time.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of products. Each product is a separate element of the array. The product consists of a 3 element array of components:
                                           
0
 => product ID number (varchar)
1
 => variant ID number (0 if the main product is changed, not the variant) (int)
2
 => Stock quantity (int)
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
counter
int
Number of received items.
warnings
array
An array of warning notices for product updates. The key to each item is the identifier of the sent category, the value is an error message when adding. Only the keys containing errors are returned.
                    
                    
                    
Sample
                    Input data:
                    
{
  "storage_id": "bl_1",
  "products": [
     [1081730, 0, 100],
     [1081730, 1734642, 150]
```

### updateProductsPrices
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
updateProductsPrices
            The method allows for bulk update of product prices (and/or variants) in BaseLinker storage. Maximum 1000 products at a time.
            
            
Input parameters
                    
                        
storage_id
varchar(30)
Storage ID in format "[type:bl|shop|warehouse]_[id:int]" (e.g. "shop_2445").
products
array
An array of products. Each product is a separate element of the array. The product consists of a 3 element array of components:
product_id
 (int) - Product identifier
variant_id
 (int) - Product variant identifier (0 or no value if the main product is changed, not the variant)
price_brutto
 (float) - Price gross
price_wholesale_netto
 (float) - Net wholesale price (not applicable to variants)
tax_rate
 (float) - VAT tax rate e.g. "23", (value from range 0-100, EXCEPTION values: "-1" for "EXPT"/"ZW" exempt from VAT, "-0.02" for "NP" annotation, "-0.03" for "OO" VAT reverse charge)
Only one price field can be given (then the second price will not be updated). The VAT rate must always be specified (in case of variants, it is the VAT rate of the main product).
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
counter
int
Number of received items.
warnings
array
An array of warning notices for product updates. The key to each item is the identifier of the sent category, the value is an error message when adding. Only the keys containing errors are returned.
                    
                    
                    
Sample
                    Input data:
                    
{
```


---

## PRINTOUTS

### getOrderPrintoutTemplates
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getOrderPrintoutTemplates
            Returns a list of all configured printout templates available for orders. The output includes technical identifiers used when executing a printout.
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
printouts
array
A list of order printout templates. 
Each template contains the following fields:
| - printout_id
int
Unique identifier of the printout template
| - name
varchar
Name of the printout template
| - file_format
varchar
Output format (e.g. PDF, HTML, XLS)
| - language
varchar
Language of the template
                    
                    
                    
Sample
                    Input data:
```

### getInventoryPrintoutTemplates
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getInventoryPrintoutTemplates
            Returns a list of all configured printout templates available for inventory (products).
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
printouts
array
A list of inventory printout templates. 
Each template contains the following fields:
| - printout_id
int
Unique identifier of the printout template
| - name
varchar
Name of the printout template
| - file_format
varchar
Output format (e.g. PDF, HTML, XLS)
                    
                    
                    
Sample
                    Input data:
                    
                    Output data:
                    
```


---

## BASE CONNECT

### getConnectIntegrations
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getConnectIntegrations
            The method allows you to retrieve a list of all Base Connect integrations on this account
            
            
Input parameters
                    
                                            
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
integrations
array
List of Base Connect integrations divided into:
         
- own_integrations: integrations created on this account,
         
- connected_integrations: integrations to which this account has connected
         
Each integration has fields listed below.
| - connect_integration_id
int
Connect integration ID
| - name
varchar(100)
Integration name
| - settings
array
Integration options
                    
                    
                    
Sample
                    Input data:
                    
{}
                    Output data:
                    
{
      "status": "SUCCESS",
      "integrations": {
        "own_integrations": [
```

### getConnectIntegrationContractors
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getConnectIntegrationContractors
            The method allows you to retrieve a list of contractors connected to the selected Base Connect integration
            
            
Input parameters
                    
                        
connect_integration_id
int
Connect integration ID
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
contractors
array
List of Base Connect contractors for selected Base Connect integration.
        Each contractor has fields listed below.
| - connect_contractor_id
int
Contractor ID
| - name
string
Contractor name
| - credit_data
array
Contractor credit summary data
| - settings
array
Contractor options
                    
                    
                    
Sample
                    Input data:
                    
{
        "connect_integration_id": 1
}
                    Output data:
                    
```

### getConnectContractorCreditHistory
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
getConnectContractorCreditHistory
            The method allows you to retrieve an information about chosen contractor trade credit history
            
            
Input parameters
                    
                        
connect_contractor_id
int
Contractor ID
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
credit_data
array
List of Base Connect contractor trade credit data.
        
Each credit entry has fields listed below.
| - credit_entry_id
int
Entry ID
| - date_add
int
Entry add date in unix timestamp format
| - description
string
Entry description
| - currency
char(3)
Entry currency
| - type
string
Entry type:
 - charge
 - payment
| - amount
float
Entry amount
| - is_accepted
int
```

### setConnectContractorCreditLimit
```
    
    
        
            
Method list
            
Test your request
            
Changelog
            
                                    
setConnectContractorCreditLimit
            The method allows you to set new trade credit limit for chosen contractor
            
            
Input parameters
                    
                        
contractor_id
int
Contractor ID
new_limit
float
New limit value
message
string
Message shown in trade credit history
                    
                    
                    
Output data
                    The method returns the data in JSON format.
                    
                        
status
varchar(30)
SUCCESS - request executed correctly
ERROR - an error occurred during an API request. Error details will be described in 2 additional returned fields: error_message and error_code
new_limit_set
float
New trade credit limit value
                    
                    
                    
Sample
                    Input data:
                    
{
        "contractor_id": 2,
        "new_limit": 10000.00,
        "message": "Sample history message"
}
                    Output data:
                    
{
      "status": "SUCCESS",
      "new_limit_set": 10000.00 PLN
}
                                        A sample request in PHP:
```


---

**FIM DO DOCUMENTO**

Gerado em: Mon Dec  8 21:25:40 UTC 2025
