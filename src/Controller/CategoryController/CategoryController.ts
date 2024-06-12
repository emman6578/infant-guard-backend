import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { successHandler } from "../../Middleware/ErrorHandler";
import { Category } from "../../Interface/ProductInterfaceRequest";
import expressAsyncHandler from "express-async-handler";

import { validateIdParams } from "../../Helpers/validateIdParams";
import { checkRequiredFieldsCategory } from "../../Helpers/validateRequiredFields_Category";

const prisma = new PrismaClient();

export const addCategory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    checkRequiredFieldsCategory(req);

    const category: Category = req.body;

    if (await prisma.category.findUnique({ where: { name: category.name } })) {
      throw new Error("Category name must be unique");
    }

    const createCategory = await prisma.category.create({
      data: {
        name: category.name,
      },
    });

    successHandler(createCategory, res, "POST");
  }
);

export const getCategory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({});

    if (!categories) {
      throw new Error("Error Getting all Categories");
    }

    if (categories.length === 0) {
      throw new Error("Database is empty");
    }

    successHandler(categories, res, "GET");
  }
);

export const getOneCategory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid category ID format");
    }

    const checkId = await prisma.category.findUnique({
      where: { id },
    });

    if (!checkId) {
      throw new Error("Category not found");
    }

    const category = await prisma.category.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!category) {
      throw new Error(`Error Getting One Category`);
    }

    successHandler(category, res, "GET");
  }
);

export const deleteCategory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid category ID format");
    }

    try {
      // Find the category along with its associated products
      const category = await prisma.category.findUnique({
        where: { id },
        include: { Product: true },
      });

      // If category doesn't exist, throw an error
      if (!category) {
        throw new Error("Category not found");
      }

      // Disconnect each product from the category
      await prisma.category.update({
        where: { id },
        data: {
          Product: {
            disconnect: category.Product.map((product) => ({ id: product.id })),
          },
        },
      });

      // Now that products are disconnected, delete the category
      await prisma.category.delete({
        where: { id },
      });

      successHandler(`Successfully deleted category: ${id}`, res, "DELETE");
    } catch (error) {
      throw new Error("Deleting Category failed");
    }
  }
);
