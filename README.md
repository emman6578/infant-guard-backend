# ChowPao_POS_Inventory

This is the documentation for the ChowPao POS and Inventory System

## Table of Contents

- [Features](#Features)
- [API Reference](#api-reference)
- [Contribution](#contribution)
- [License](#license)

## Features

- ### Passwordless Authentication

  - [**Register**](#view-receive-and-sort-lists)

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

## API Reference

In this section, you will find the detailed information regarding the features of the ChowPao POS and Inventory system.

### Endpoints

#### View Receive and Sort Lists

Retrieves a list of received and sorted items, including product information, tracking numbers, date received, individuals in charge, source, received and expected amounts, and observations on quantity disparities.

- **URL:** `reports/{receive-and-sort-lists}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameters:**
  - `receive-and-sort-lists` (required)
- **Success Response:**

  - **Status Code:** `200 OK`
  - **Response Body:**

    ```json
    {
      "status": "success",
      "data": [
        {
          "product": "HP Printer",
          "to_no": "TONR97",
          "date_received": "12/26/2021",
          "received_by": "Clerk 1",
          "Source": "Store 1",
          "received_qty": 50,
          "expected_qty": 50,
          "qty_difference_remarks": "-",
        },
        {
          "product": "Razer Ring Light",
          "to_no": "GRN87",
          "date_received": "12/26/2021",
          "received_by": "Clerk 2",
          "Source": "Supplier 1",
          "received_qty": 50,
          "expected_qty": 50,
          "qty_difference_remarks": "-",
        },
        {
          "product": "RGB Light",
          "to_no": "GRN87",
          "date_received": "12/26/2021",
          "received_by": "Clerk 2",
          "Source": "Supplier 2",
          "received_qty": 42,
          "expected_qty": 45,
          "qty_difference_remarks": "Received Incomplete"
        }
      ]
      "method": "GET"
    }


    ```

- **Error Responses**:

  - **Status Code**: `200 OK`
  - **Response Body**:

    - **Display error message store manager is not authenticated**

      ```json
      {
        "status": "fail",
        "message": "The store manager is not authenticated"
      }
      ```

    - **Display error message if the store manager is not authorized to viewing lists**

      ```json
      {
        "status": "fail",
        "message": "Unathorized Access"
      }
      ```

    - **Data Validation**

      ```json
      {
        "status": "fail",
        "message": "Invalid Data"
      }
      ```

    - **Query Check**

      ```json
      {
        "status": "fail",
        "message": "Query error"
      }
      ```

<<<<<<< HEAD
Validates the username and password provided by the user. If the user is authenticated and authorized, the inventory information by a specific date range will be returned.

- **URL:** `reports/{inventory_reports}{date}`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `GET`
- **Parameters:**
  - `inventory_reports` (required)
  - `date` (required)
- **Success Response:**

  - **Status Code:** `200 OK`
  - **Response Body:**

    ```json
    {
      "status": "success",
      "data": [
        {
          "product_name": "HP Printer",
          "sku": 3,
          "beginning_stock": 50,
          "ending_stock": 50,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "Razer Ring Light",
          "sku": 6,
          "beginning_stock": 102,
          "ending_stock": 102,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "RGB Light",
          "sku": 1,
          "beginning_stock": 150,
          "ending_stock": 150,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "iPhone 13 Clear Case",
          "sku": 1,
          "beginning_stock": 123,
          "ending_stock": 123,
          "quantity_in": 7,
          "quantity_out": 7,
        },
        {
          "product_name": "Samsung A12 Screen Protector",
          "sku": 1,
          "beginning_stock": 200,
          "ending_stock": 150,
          "quantity_in": 5,
          "quantity_out": 5,
        },
        {
          "product_name": "Powerbank",
          "sku": 9,
          "beginning_stock": 70,
          "ending_stock": 60,
          "quantity_in": 1,
          "quantity_out": 1,
        },
        {
          "product_name": "HP Printer",
          "sku": 1,
          "beginning_stock": 85,
          "ending_stock": 85,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "TP-Link Router",
          "sku": 1,
          "beginning_stock": 90,
          "ending_stock": 90,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "Alhua Mouse Pad",
          "sku": 1,
          "beginning_stock": 240,
          "ending_stock": 240,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "USB Type-C Charger",
          "sku": 1,
          "beginning_stock": 130,
          "ending_stock": 130,
          "quantity_in": ,
          "quantity_out": ,
        },
        {
          "product_name": "Epson Ink",
          "sku": 3,
          "beginning_stock": 320,
          "ending_stock": 300,
          "quantity_in": ,
          "quantity_out": ,
        }
      ],
      "method": "GET"
    }
    ```

- **Error Responses:**

  - **Status Code:** `200 OK`
  - **Response Body**

    - **Display error message if the store manager is not authenticated**

      ```json
      {
        "status": "fail",
        "message": "Authentication Failed"
      }
      ```

    - **Display error message if the store manager is not authorized**

      ```json
      {
        "status": "fail",
        "message": "Unauthorized Access"
      }
      ```

    - **Display error message if the data is invalid**

      ```json
      {
        "status": "fail",
        "message": "Invalid Data"
      }
      ```

    - **Display error message if the query is unsuccessful**

      ```json
      {
        "status": "fail",
        "message": "Query Unsuccessful"
      }
      ```

## Contribution

Contributions are welcome! If you would like to contribute to the ChowPao POS and Inventory these are the steps:
=======


## Contribution

Contributions are welcome! If you would like to contribute to the ChowPao POS and Inventory these are the steps
>>>>>>> cb7bad5e2b2aded514b9ffac1ad03cbbcf53e724

1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature-name`
3. Make the necessary changes and commit them: `git commit -am 'Add feature'`
4. Push your changes to the branch: `git push origin feature-name`
5. Submit a pull request.

Please ensure your code follows the project's coding conventions and includes appropriate tests.

## License

All rights reserved.

The Reports Store Manager Retail Management System is protected by copyright and other intellectual property laws. Any unauthorized use, reproduction, or distribution of the microservice or its components is strictly prohibited.
