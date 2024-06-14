import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { successHandler } from "../../Middleware/ErrorHandler";
import { AuthRequest } from "../../Middleware/authMiddleware";

const prisma = new PrismaClient();

export const addToDelivery = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      productInCartIds,
      driverId,
    }: { productInCartIds: string[]; driverId: string } = req.body;

    // Get the admin id
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new Error("User ID is required");
    }

    // Fetch products in the cart to add to delivery
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

    //fetch driverload based on driver id
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { DriverLoad: true },
    });

    // Create a constant holding all the values in the fetched model
    const productDetails = productInCarts.map((productInCart) => ({
      productId: productInCart.product_id,
      productName: productInCart.product.name,
      quantity: productInCart.quantity,
      total: productInCart.total,
      wholesalePriceTotal: productInCart.wholesale_price_total,
    }));

    const id = productDetails.map((id) => id.productId);

    // Create DriverLoadProducts records based on productDetails
    const createdDriverLoadProducts = await Promise.all(
      productDetails.map(async (detail) => {
        const createdProduct = await prisma.driverLoadProducts.create({
          data: {
            Product: {
              connect: { id: detail.productId },
            },
            quantity: detail.quantity,
            total: detail.total,
            wholesale_total: detail.wholesalePriceTotal,
            DriverLoad: {
              connect: { driver_id: driverId },
            },
            admin: {
              connect: { id: adminId },
            },
          },
        });
        return createdProduct;
      })
    );

    // Calculate aggregated values
    const totalLoadProducts = productDetails.reduce(
      (acc, detail) => acc + detail.quantity,
      0
    );
    const expectedSales = productDetails.reduce(
      (acc, detail) => acc + detail.total,
      0
    );
    const expectedSalesWholesale = productDetails.reduce(
      (acc, detail) => acc + detail.wholesalePriceTotal,
      0
    );

    // Update DriverLoad with aggregated values
    const updatedDriverLoad = await prisma.driverLoad.update({
      where: { driver_id: driverId },
      data: {
        total_load_products: totalLoadProducts,
        expected_sales: expectedSales,
        expected_sales_wholesale: expectedSalesWholesale,
      },
    });

    successHandler(updatedDriverLoad, res, "POST");
  }
);

export const getDeliveries = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all deliveries for the given admin
    const deliveries = await prisma.driverLoad.findMany({
      select: {
        id: true,
        status: true,
        DriverLoadProducts: true,
      },
    });

    successHandler(deliveries, res, "GET");
  }
);

// export const receipt = expressAsyncHandler(
//   async (req: Request, res: Response) => {
//     // Fetch all deliveries with the required fields
//     const deliveries = await prisma.delivery.findMany({
//       select: {
//         id: true,
//         quantity: true,
//         total: true,
//         wholesale_price_total: true,
//         status: true,
//         Products: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     // Group and aggregate the deliveries by product id
//     const groupedDeliveries = deliveries.reduce(
//       (acc, delivery) => {
//         delivery.Products.forEach((product) => {
//           const productId = product.id;
//           if (!acc[productId]) {
//             acc[productId] = {
//               quantity: 0,
//               total: 0,
//               wholesale_price_total: 0,
//               status: delivery.status,
//               Products: [{ name: product.name }],
//             };
//           }
//           acc[productId].quantity += delivery.quantity;
//           acc[productId].total = parseFloat(
//             (acc[productId].total + delivery.total).toFixed(2)
//           );
//           acc[productId].wholesale_price_total = parseFloat(
//             (
//               acc[productId].wholesale_price_total +
//               delivery.wholesale_price_total
//             ).toFixed(2)
//           );
//         });
//         return acc;
//       },
//       {} as Record<
//         string,
//         {
//           quantity: number;
//           total: number;
//           wholesale_price_total: number;
//           status: string;
//           Products: { name: string }[];
//         }
//       >
//     );

//     const result = Object.values(groupedDeliveries);

//     successHandler(result, res, "GET");
//   }
// );
