import { Request, Response } from "express";
import { PaymentStatus, PrismaClient, Status } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { successHandler } from "../../Middleware/ErrorHandler";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

export const createOrder = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productInCartIds, address } = req.body;

    // Check if user ID exists
    const adminId = req.admin?.id;

    // Check if productInCartIds is an array
    if (!Array.isArray(productInCartIds)) {
      throw new Error("productInCartIds must be an array");
    }

    // Check if all elements in productInCartIds are valid UUIDs
    if (productInCartIds.some((id: string) => !validateIdParams(id))) {
      throw new Error("productInCartIds contains invalid id");
    }

    // Retrieve user's cart along with associated products if it exists
    let order = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { Order: { include: { Product: true } } },
    });

    // If the user has no cart, create one
    if (!order?.Order) {
      order = await prisma.admin.update({
        where: { id: adminId },
        data: {
          Order: {
            create: {},
          },
        },
        include: { Order: { include: { Product: true } } },
      });
    }

    if (!order) {
      throw new Error("Order doesnt exist");
    }

    // Fetch the productInCart details
    const productInCarts = await prisma.productInCart.findMany({
      where: {
        id: { in: productInCartIds },
      },
      include: {
        product: true,
      },
    });

    if (productInCarts.length === 0) {
      res.status(400);
      throw new Error("No valid ProductInCart items found");
    }

    // Create a constant holding all the values in the fetched model
    const productDetails = productInCarts.map((productInCart) => ({
      productId: productInCart.product_id,
      productName: productInCart.product.name,
      quantity: productInCart.quantity,
      total: productInCart.total,
      wholesalePriceTotal: productInCart.wholesale_price_total,
    }));

    // Fetch existing DriverLoadProducts for the driver
    const existingOrderProducts = await prisma.orderProducts.findMany({
      where: {
        Order: {
          admin_id: adminId,
        },
        Product: {
          id: {
            in: productDetails.map((detail) => detail.productId),
          },
        },
      },
    });

    // Update or create DriverLoadProducts records based on productDetails
    const updateOrderProducts = await Promise.all(
      productDetails.map(async (detail) => {
        const existingProduct = existingOrderProducts.find(
          (p) => p.productId === detail.productId
        );

        try {
          if (existingProduct) {
            // If the product already exists for the driver, update it
            const updatedProduct = await prisma.orderProducts.update({
              where: {
                id: existingProduct.id,
              },
              data: {
                quantity: {
                  increment: detail.quantity,
                },
              },
            });

            return updatedProduct;
          } else {
            // Otherwise, create a new DriverLoadProducts record
            const createdProduct = await prisma.orderProducts.create({
              data: {
                Product: {
                  connect: { id: detail.productId },
                },
                quantity: detail.quantity,

                Order: {
                  connect: { admin_id: adminId },
                },
              },
            });

            return createdProduct;
          }
        } catch (error: any) {
          if (error.code === "P2002") {
            // Handle uniqueness constraint violation
            throw new Error(
              `Product ID ${detail.productId} already exists in DriverLoadProducts.`
            );
          }
          throw error;
        }
      })
    );

    // Check if updatedDriverLoadProducts is falsy or empty
    if (!updateOrderProducts || updateOrderProducts.length === 0) {
      res.status(400);
      throw new Error("Failed to update or create DriverLoadProducts.");
    }

    // Fetch all deliveries for the given driver
    const orders = await prisma.order.findMany({
      where: { admin_id: adminId },
      include: {
        Product: {
          include: {
            Product: {
              select: { quantity: true, price: true, wholesale_price: true },
            },
          },
        },
      },
    });

    let updateOrder;
    // Calculate total_load_products, expected_sales, expected_sales_wholesale
    for (const order of orders) {
      let totalLoadProducts = 0;
      let expectedSales = 0;
      let expectedSalesWholesale = 0;

      for (const loadProduct of order.Product) {
        if (loadProduct.Product) {
          totalLoadProducts += loadProduct.quantity;
          expectedSales += loadProduct.quantity * loadProduct.Product.price;
          expectedSalesWholesale +=
            loadProduct.quantity * loadProduct.Product.wholesale_price;
        }
      }

      // Update the DriverLoad with the recalculated values
      updateOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          quantity: totalLoadProducts,
          total: expectedSales,
          wholesale_price_total: expectedSalesWholesale,
          payment_status: PaymentStatus.PROCESSING,
          status: Status.ACTIVE,
          address,
        },
      });
    }

    successHandler(updateOrder, res, "POST");
  }
);

export const getOrder = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const adminId = req.admin;

    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      include: {
        Product: {
          include: {
            Product: {
              select: {
                name: true,
                quantity: true,
                price: true,
                wholesale_price: true,
              },
            },
          },
        },
        admin: true,
      },
    });

    // Return the orders in the response
    successHandler(orders, res, "GET");
  }
);
