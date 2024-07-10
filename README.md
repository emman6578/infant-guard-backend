# ChowPao_POS_Inventory

This is the documentation for the ChowPao POS and Inventory System

## Table of Contents

- [Features](#Features)
- [API Reference](#api-reference)
- [Contribution](#contribution)
- [License](#license)

# Features

- ### Passwordless Authentication

  - [**Register**](#register)

    This feature allows owner of the system to register administrator

  - [**Login**](#filter-dropdown-by-date)

    This feature allows registered admin to generate a code to use in authentication

  - [**Authenticate**](#filter-dropdown-by-receiver)

    This feature allows the admin to login into the system using the generated token sent to email

- ### Products CRUD (admin)

  - [**Create Products**](#view-transfer-order)

    This feature allows the authorized admin to create products

  - [**View all Products**](#filter-dropdown-by-date-1)

    This feature allows the authorized admin to view all products

  - [**View single Product**](#filter-dropdown-by-date-1)

    This feature allows the authorized admin to view single products

  - [**Update Product**](#filter-dropdown-by-destination)

    This feature allows the authorized admin to update products

  - [**Delete Product**](#filter-dropdown-by-status)

    This feature allows the authorized admin to delete products

- ### Products (Excel Export and Import)

  - [**Print**](#view-inventory-reports)

    This feature allows the authorized admin to Print all products into a excel file

  - [**Update**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin to upload excel file into the system to update existing products

  - [**View list of files**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin view all file from the server

  - [**Download**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin download the file from the server

- ### Category CRUD

  - [**Create**](#view-inventory-reports)

    This feature allows the authorized admin create new category

  - [**View all**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin view all categories

  - [**View single category**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin view single categories

  - [**Delete**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin delete category

- ### Cart

  - [**Add to cart**](#view-inventory-reports)

    This feature allows the authorized admin to add products to cart

  - [**View cart**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin view what is inside the admin's cart

  - [**Delete Products in the cart**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin delete products in the cart

- ### Orders

  - [**Create order**](#view-inventory-reports)

    This feature allows the authorized admin to create order base on the products in the cart

  - [**View orders**](#filter-dropdown-by-date-2)

    This feature allows the authorized admin view all orders and can export the order into pdf in the frontend

# API Reference

In this section, you will find the detailed information regarding the features of the ChowPao POS and Inventory system.

## Endpoints

### Authentication Admin Side

#### Register

Register administrator

- **URL:** `http://localhost:3006/api/auth/register`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameters:**

  - (None)

- **Request Body:**

  ```json
  {
    "email": "motaemman6578@gmail.com",
    "fullname": "Emmanuel ADMIN",
    "username": "iamadmin"
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "POST",
    "data": {
      "id": "28080be9-9681-4b88-bebe-2872f0c0cfb2",
      "fullname": "Emmanuel ADMIN",
      "username": "iamadmin1",
      "image": null,
      "role": "ADMIN",
      "created": "2024-06-12T03:35:39.861Z",
      "updated": "2024-06-12T03:35:39.861Z",
      "lastLogin": null,
      "auth": {
        "email": "motaemman1@gmail.com"
      }
    }
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "The email address must be unique or username"
      }
      ```

#### Login

Login administrator

- **URL:** `http://localhost:3006/api/auth/login`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameters:**

  - (None)

- **Request Body:**

  ```json
  {
    "email": "motaemman6578@gmail.com"
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "POST",
    "data": {
      "id": "5d69d400-ba2a-4f9c-a4d3-09a3d8fecdf6",
      "type": "EMAIL",
      "emailToken": "70076025",
      "valid": true,
      "expiration": "2024-07-10T02:18:21.984Z",
      "admin_id": "e2760d13-e8dc-4b73-939a-8aa793dcaae2",
      "driverId": null,
      "created": "2024-07-10T02:08:23.076Z",
      "updated": "2024-07-10T02:08:23.076Z"
    }
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "The email address must be unique or username"
      }
      ```

#### Authenticate

Authenticate administrator

- **URL:** `http://localhost:3006/api/auth/authenticate`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameters:**

  - (None)

- **Request Body:**

  ```json
  {
    "email": "motaemman6578@gmail.com",
    "emailToken": "59102556"
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiM2FkN2UyYmMtNmJlMS00YjgyLWFjNDUtYWM1ZDI2MGZlN2Y0In0.kRQ4_gaxJ_SX1hcTSGSmOFg5qv7zL_AXfp7MrACiH2Q"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "The email address must be unique or username"
      }
      ```

### Products Route (CRUD)

#### Product Create

Create Product

- **URL:** `http://localhost:3006/api/product`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameters:**

  - (None)

- **Request Body:**

  ```json
  [
    {
      "barcode": "1",
      "name": "Frozen Pizza",
      "quantity": 8.11,
      "weight": 0.66,
      "unit_of_measure": "KILOGRAMS",
      "price": 14.96,
      "wholesale_price": 2.14,
      "brand": "BrandB",
      "description": "Delicious frozen pizza.",
      "Category": [{ "name": "Frozen Food" }, { "name": "Convenience" }],
      "supplier": "SupplierX",
      "stock_status": "IN_STOCK",
      "minimum_stock_level": 1,
      "maximum_stock_level": 8,
      "expiration": "2024-03-20",
      "date_of_manufacture": "2022-10-31"
    },
    {},
    {}
  ]
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "POST",
    "data": [
      {
        "id": "9ef0c1eb-8894-4e43-b564-92516dfe62d5",
        "barcode": "2",
        "name": "Frozen Pizza",
        "quantity": 8,
        "weight": 0.66,
        "price": 14.96,
        "wholesale_price": 2.14,
        "brand": "BrandB",
        "description": "Delicious frozen pizza.",
        "unit_of_measure": "KILOGRAMS",
        "expiration": "2024-03-20",
        "date_of_manufacture": "2022-10-31",
        "date_of_entry": "2024-07-10T02:19:20.669Z",
        "supplier": "SupplierX",
        "stock_status": "IN_STOCK",
        "minimum_stock_level": 1,
        "maximum_stock_level": 8,
        "createdAt": "2024-07-10T02:19:20.669Z",
        "updatedAt": "2024-07-10T02:19:20.669Z"
      }
    ]
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "The email address must be unique or username"
      }
      ```

#### View all Products

This route is to view all products

- **URL:** `http://localhost:3006/api/product`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameters:**

  - (None)

- **Request Body:**

  - (None)

- **Success Responses**:
- **Status Code:** `200 OK`

```json
{
  "success": true,
  "method": "GET",
  "data": [
    {
      "id": "e8b757b9-79f0-4e2b-a236-36dbcc4dc3a7",
      "barcode": "63636",
      "name": "Frozen Beef Patties",
      "quantity": 100,
      "weight": 0.24,
      "price": 12.47,
      "wholesale_price": 13.72,
      "brand": "BrandA",
      "description": "Juicy frozen beef patties.",
      "unit_of_measure": "KILOGRAMS",
      "expiration": "2024-09-21",
      "date_of_manufacture": "2024-04-10",
      "date_of_entry": "2024-07-03T04:23:00.465Z",
      "supplier": "SupplierZ",
      "stock_status": "OUT_OF_STOCK",
      "minimum_stock_level": 2,
      "maximum_stock_level": 10,
      "createdAt": "2024-07-03T04:23:00.465Z",
      "updatedAt": "2024-07-03T04:23:00.465Z",
      "Category": [
        {
          "name": "Frozen"
        },
        {
          "name": "Poultry"
        }
      ]
    }
  ]
}
```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### View one Products

This route is to view one product

- **URL:** `http://localhost:3006/api/product/{id}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameters:**

  - id

- **Request Body:**

  - (None)

- **Success Responses**:
- **Status Code:** `200 OK`

```json
{
  "success": true,
  "method": "GET",
  "data": [
    {
      "id": "e8b757b9-79f0-4e2b-a236-36dbcc4dc3a7",
      "barcode": "63636",
      "name": "Frozen Beef Patties",
      "quantity": 100,
      "weight": 0.24,
      "price": 12.47,
      "wholesale_price": 13.72,
      "brand": "BrandA",
      "description": "Juicy frozen beef patties.",
      "unit_of_measure": "KILOGRAMS",
      "expiration": "2024-09-21",
      "date_of_manufacture": "2024-04-10",
      "date_of_entry": "2024-07-03T04:23:00.465Z",
      "supplier": "SupplierZ",
      "stock_status": "OUT_OF_STOCK",
      "minimum_stock_level": 2,
      "maximum_stock_level": 10,
      "createdAt": "2024-07-03T04:23:00.465Z",
      "updatedAt": "2024-07-03T04:23:00.465Z",
      "Category": [
        {
          "name": "Frozen"
        },
        {
          "name": "Poultry"
        }
      ]
    }
  ]
}
```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Update product field

This route is to update specific product

- **URL:** `http://localhost:3006/api/product/{id}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `PUT`
- **Parameters:**

  - id

- **Request Body:**

  ```json
  {
    "name": "Updated"
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

```json
{
  "success": true,
  "method": "PUT",
  "data": {
    "id": "e8b757b9-79f0-4e2b-a236-36dbcc4dc3a7",
    "barcode": "63636",
    "name": "Updated",
    "quantity": 100,
    "weight": 0.24,
    "price": 12.47,
    "wholesale_price": 13.72,
    "brand": "BrandA",
    "description": "Juicy frozen beef patties.",
    "unit_of_measure": "KILOGRAMS",
    "expiration": "2024-09-21",
    "date_of_manufacture": "2024-04-10",
    "date_of_entry": "2024-07-03T04:23:00.465Z",
    "supplier": "SupplierZ",
    "stock_status": "OUT_OF_STOCK",
    "minimum_stock_level": 2,
    "maximum_stock_level": 10,
    "createdAt": "2024-07-03T04:23:00.465Z",
    "updatedAt": "2024-07-10T02:26:10.265Z",
    "Category": [
      {
        "id": "6f6f2fbd-e6af-4c28-b195-755f5e65d670",
        "name": "Frozen",
        "createdAt": "2024-07-03T04:23:00.465Z",
        "updatedAt": "2024-07-03T04:23:00.465Z"
      },
      {
        "id": "1e7b305d-95e9-4b1c-a822-e4cd52a6da89",
        "name": "Poultry",
        "createdAt": "2024-07-03T04:23:00.465Z",
        "updatedAt": "2024-07-03T04:23:00.465Z"
      }
    ]
  }
}
```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Delete product

This route is to delete specific product

- **URL:** `http://localhost:3006/api/product/{id}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `DELETE`
- **Parameters:**

  - id

- **Request Body:**

  - none

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "DELETE",
    "data": "Successfully deleted product: e8b757b9-79f0-4e2b-a236-36dbcc4dc3a7"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

### Products Route (EXCEL FILE SYSTEM)

#### Save all products in server

This route is responsible saving all products in excel file in server

- **URL:** `http://localhost:3006/api/print`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameters:**

  - none

- **Request Body:**

  - none

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "GET",
    "data": "Excel file generated successfully."
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Save all products in by supplier

This route is responsible saving all products in excel file in server base on a selected supplier

- **URL:** `http://localhost:3006/api/print/supplier?supplier=Sample Supplier`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Query Parameter:**

  - supplier={dito dapat su supplier}

- **Request Body:**

  - none

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "GET",
    "data": "Excel file generated successfully."
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Update Product base on excel file

This route is responsible to update base on an excel file sent by admin

- **URL:** `http://localhost:3006/api/print`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameter:**

  - none

- **Request Body: form-data**

  - file = {dito dapat naka pick si admin ning file}
  - etong file na variable sya maga hold nung file na napick

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "GET",
    "data": "Products successfully updated"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Create Product base on excel file

This route is responsible to create multiple products base on a excel file

- **URL:** `http://localhost:3006/api/print/create`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameter:**

  - none

- **Request Body: form-data**

  - file = {dito dapat naka pick si admin ning file}
  - etong file na variable sya maga hold nung file na napick

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "GET",
    "data": "Products successfully created"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### View excel files in server

This route is responsible to view all products excel file in the server

- **URL:** `http://localhost:3006/api/print/files`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameter:**

  - none

- **Request Body**

  - none

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "files": [
      "products_2024-06-25_11-45-26.xlsx",
      "products_2024-07-10_10-30-30.xlsx"
    ],
    "downloadToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZTI3NjBkMTMtZThkYy00YjczLTkzOWEtOGFhNzkzZGNhYWUyIiwiaWF0IjoxNzIwNTc4OTk3LCJleHAiOjE3MjA1NzkyOTd9.wJIzwhMWjIbkr9W-pWyDv5V5ZBg7Kdx4Zvs1rab4eQQ"
  }
  ```

  <!-- etong download token amo adi su parang security measure kunwari nag generate ning download link yading downloadToken ma expire lang sya 5 mins ata -->

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### View excel files in server

This route is responsible to view all products excel file in the server

- **URL:** `http://localhost:3006/api/print/download/products_2024-06-23T04-16-00-322Z.xlsx?token={token}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameter:**

  -filename = products_2024-06-23T04-16-00-322Z.xlsx

- **Query Parameter:**

  - token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjZiZjA5MzMtZmE0Yi00NTZhLWFjMGQtMjMwOTM3YjcwNDQ4IiwiaWF0IjoxNzE5MTE2NDI0LCJleHAiOjE3MTkxMTY3MjR9.Qh4pGHtIsHc1JgpoO87yMNitNY5S9SsRfzUgYSjj6Eg`

- **Request Body**

  - none

- **Success Responses**:
- **Status Code:** `200 OK`

  -none (kasi maga automatically yadi dapat maga open sa browser)

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

### Cart Route

#### Add to Cart

This route is responsible for adding products to cart

- **URL:** `http://localhost:3006/api/cart`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameter:**

  - none

- **Request Body**

  ```json
  {
    "products": [
      {
        "product_id": "0e35e13b-a8c2-466a-95bc-84aa965dc0ce",
        "quantity": 10
      },
      {
        "product_id": "20bcd94a-b24d-4136-9131-ed8f75c53ddd",
        "quantity": 10
      }
    ]
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "POST",
    "data": [
      {
        "id": "3dac9bcc-c20e-4794-ba35-61005bde2104",
        "product_id": "e9189a34-1337-4dac-9deb-73c3657031e6",
        "quantity": 100,
        "total": 764,
        "wholesale_price_total": 428,
        "status": "ACTIVE",
        "cart_id": "d1e8ec81-aa20-4be3-86e5-59fa6a553245",
        "createdAt": "2024-07-03T04:25:12.804Z",
        "updatedAt": "2024-07-03T04:25:18.567Z",
        "product": {
          "id": "e9189a34-1337-4dac-9deb-73c3657031e6",
          "barcode": "2623",
          "name": "Ice Cream",
          "quantity": 400,
          "weight": 0.8,
          "price": 7.64,
          "wholesale_price": 4.28,
          "brand": "BrandE",
          "description": "Creamy ice cream.",
          "unit_of_measure": "KILOGRAMS",
          "expiration": "2022-01-29",
          "date_of_manufacture": "2022-04-15",
          "date_of_entry": "2024-07-03T04:23:00.465Z",
          "supplier": "SupplierX",
          "stock_status": "IN_STOCK",
          "minimum_stock_level": 5,
          "maximum_stock_level": 12,
          "createdAt": "2024-07-03T04:23:00.465Z",
          "updatedAt": "2024-07-05T01:35:45.759Z"
        }
      }
    ]
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Get Data Cart

This route is responsible for getting all prducts in cart

- **URL:** `http://localhost:3006/api/cart`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameter:**

  - none

- **Request Body**

- none

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "GET",
    "data": {
      "id": "d1e8ec81-aa20-4be3-86e5-59fa6a553245",
      "total_price": 844.7,
      "wholesale_price": 481.3,
      "admin_id": "e2760d13-e8dc-4b73-939a-8aa793dcaae2",
      "createdAt": "2024-07-03T04:19:00.483Z",
      "updatedAt": "2024-07-10T02:44:54.642Z",
      "ProductInCart": [
        {
          "id": "3dac9bcc-c20e-4794-ba35-61005bde2104",
          "product_id": "e9189a34-1337-4dac-9deb-73c3657031e6",
          "quantity": 100,
          "total": 764,
          "wholesale_price_total": 428,
          "status": "ACTIVE",
          "cart_id": "d1e8ec81-aa20-4be3-86e5-59fa6a553245",
          "createdAt": "2024-07-03T04:25:12.804Z",
          "updatedAt": "2024-07-03T04:25:18.567Z",
          "product": {
            "id": "e9189a34-1337-4dac-9deb-73c3657031e6",
            "barcode": "2623",
            "name": "Ice Cream",
            "quantity": 400,
            "weight": 0.8,
            "price": 7.64,
            "wholesale_price": 4.28,
            "brand": "BrandE",
            "description": "Creamy ice cream.",
            "unit_of_measure": "KILOGRAMS",
            "expiration": "2022-01-29",
            "date_of_manufacture": "2022-04-15",
            "date_of_entry": "2024-07-03T04:23:00.465Z",
            "supplier": "SupplierX",
            "stock_status": "IN_STOCK",
            "minimum_stock_level": 5,
            "maximum_stock_level": 12,
            "createdAt": "2024-07-03T04:23:00.465Z",
            "updatedAt": "2024-07-05T01:35:45.759Z"
          }
        }
      ]
    }
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Recalculate Cart Data

This route is responsible for recalculating total in cart

- **URL:** `http://localhost:3006/api/cart`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `PUT`
- **Parameter:**

  - none

- **Request Body**

- none

- **Success Responses**:
- **Status Code:** `200 OK`

  <!-- ading route na yadi butang mo adi sa refresh control kunwari nag refresh sa page nung cart dapat maangal yading route na yadi
  amo adi ang responsible sa pag recalculate ning total sa cart kunwari nag delete ning product sa cart
   -->

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Update Cart Product Quantity Cart Data

This route is responsible for getting all prducts in cart

- **URL:** `http://localhost:3006/api/cart/{id}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `PUT`
- **Parameter:**

  - id (etong id na to product in cart id)
  - makikita mo su id ning productincart pag nag getcart ka dd sa taas na route

- **Request Body**

  ```json
  {
    "quantity": 100
  }
  ```

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "PUT",
    "data": "Successfully updated the quantity"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

#### Delete Cart Product

This route is responsible for getting all prducts in cart

- **URL:** `http://localhost:3006/api/cart`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `DELETE`
- **Parameter:**

  - none

- **Request Body**

  ```json
  {
    "productInCartIds": [
      "8654b96c-90f0-48e6-a893-2ea56fa9fba7",
      "895b7cad-47e0-4d21-83ba-18dc37437c4c"
    ]
  }
  ```

  <!-- eto ids na andito sa products in cart id's din to ginawa ko sya na array para si admin maka select ning multiple ids na madelete nya  di usad usad-->

- **Success Responses**:
- **Status Code:** `200 OK`

  ```json
  {
    "success": true,
    "method": "PUT",
    "data": "Successfully delete product in cart"
  }
  ```

- **Error Responses**:

  - **Status Code**: `200 NOT OK`
  - **Response Body**:

    - **Display error**

      ```json
      {
        "status": "fail",
        "message": "Message Error"
      }
      ```

## Contribution

Contributions are welcome! If you would like to contribute to the ChowPao POS and Inventory these are the steps

> > > > > > > cb7bad5e2b2aded514b9ffac1ad03cbbcf53e724

1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature-name`
3. Make the necessary changes and commit them: `git commit -am 'Add feature'`
4. Push your changes to the branch: `git push origin feature-name`
5. Submit a pull request.

Please ensure your code follows the project's coding conventions and includes appropriate tests.

## License

All rights reserved.

```

```
