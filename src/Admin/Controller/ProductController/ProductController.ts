import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { successHandler } from "../../Middleware/ErrorHandler";
import {
  Category,
  ProductInterface,
} from "../../Interface/ProductInterfaceRequest";
import expressAsyncHandler from "express-async-handler";
import {
  checkRequiredFieldsProducts,
  checkRequiredUpdateFieldsProducts,
} from "../../Helpers/validateCheckRequiredFields_Products";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

export const addProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    checkRequiredFieldsProducts(req);

    const product: ProductInterface = req.body;

    if (
      await prisma.product.findUnique({ where: { barcode: product.barcode } })
    ) {
      throw new Error("Barcode must be unique");
    }

    const categories = await Promise.all(
      product.Category.map(async (category) => {
        const existingCategory = await prisma.category.findUnique({
          where: {
            name: category.name,
          },
        });
        if (existingCategory) {
          return existingCategory;
        } else {
          return prisma.category.create({
            data: {
              name: category.name,
            },
          });
        }
      })
    );

    const createProduct = await prisma.product.create({
      data: {
        barcode: product.barcode,
        name: product.name,
        quantity: product.quantity,
        weight: product.weight,
        unit_of_measure: product.unit_of_measure,
        price: product.price,
        wholesale_price: product.wholesale_price,
        Category: {
          connect: categories,
        },
        brand: product.brand,
        description: product.description,
        expiration: product.expiration,
        date_of_manufacture: product.date_of_manufacture,
        supplier: product.supplier,
        stock_status: product.stock_status,
        minimum_stock_level: product.minimum_stock_level,
        maximum_stock_level: product.maximum_stock_level,
      },
      include: {
        Category: true,
      },
    });

    if (!createProduct) {
      throw new Error("Failed to create product");
    }

    successHandler(createProduct, res, "POST");
  }
);

export const getProducts = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const allProducts = await prisma.product.findMany({
      include: {
        Category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!allProducts) {
      throw new Error("Error Getting all Products");
    }

    if (allProducts.length === 0) {
      throw new Error("Database is empty");
    }

    successHandler(allProducts, res, "GET");
  }
);

export const getProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid product ID format test");
    }

    const checkId = await prisma.product.findUnique({
      where: { id },
    });

    if (!checkId) {
      throw new Error("Product not found");
    }

    const getOne = await prisma.product.findUnique({
      where: {
        id: String(id),
      },
      include: {
        Category: { select: { name: true } },
      },
    });

    if (!getOne) {
      throw new Error(`Error Getting One Product`);
    }

    successHandler(getOne, res, "GET");
  }
);

export const updateProductInfo = expressAsyncHandler(
  async (req: Request, res: Response) => {
    checkRequiredUpdateFieldsProducts(req);

    const { id } = req.params;

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid product ID format");
    }

    const product: ProductInterface = req.body;

    if (!id) {
      throw new Error(`Error Getting id of the Product`);
    }

    const checkId = await prisma.product.findUnique({
      where: { id },
    });

    if (!checkId) {
      throw new Error("Product not found");
    }

    const update = await prisma.product.update({
      where: {
        id: String(id),
      },
      data: {
        barcode: product.barcode,
        name: product.name,
        quantity: product.quantity,
        weight: product.weight,
        price: product.price,
        brand: product.brand,
        description: product.description,
        unit_of_measure: product.unit_of_measure,
        expiration: product.expiration,
        date_of_manufacture: product.date_of_manufacture,

        supplier: product.supplier,

        stock_status: product.stock_status,
        minimum_stock_level: product.minimum_stock_level,
        maximum_stock_level: product.maximum_stock_level,
      },
      include: {
        Category: true,
      },
    });

    if (!update) {
      throw new Error(`Error Updating ${id} Product`);
    }

    successHandler(update, res, "PUT");
  }
);

export const deleteProduct = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid product ID format");
    }

    const checkId = await prisma.product.findUnique({
      where: { id },
    });

    if (!checkId) {
      throw new Error("Product not found");
    }

    try {
      await prisma.product.delete({
        where: {
          id: String(id),
        },
      });

      successHandler(`Successfully deleted product: ${id}`, res, "DELETE");
    } catch (error) {
      throw new Error("Deleting product failed");
    }
  }
);
