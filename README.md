# ChowPao_POS_Inventory

This is the documentation for the ChowPao POS and Inventory System

## Table of Contents

- [Features](#Features)
- [API Reference](#api-reference)
- [Contribution](#contribution)
- [License](#license)

## Features

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

## API Reference

In this section, you will find the detailed information regarding the features of the ChowPao POS and Inventory system.

### Endpoints

#### Register

Register administrator

- **URL:** `http://localhost:3006/api/auth/register`
- **Headers:**
  - **Content-type:** `application/json`
- **Method:** `POST`
- **Parameters:**
  - (None)
- **Success Response:**

  - **Status Code:** `200 OK`
  - **Response Body:**

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

  - **Status Code**: `200 OK`
  - **Response Body**:

    - **Display error if the email is not unique or the username**

      ```json
      {
        "status": "fail",
        "message": "The email address must be unique or username"
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
