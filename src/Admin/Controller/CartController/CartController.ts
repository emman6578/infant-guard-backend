import { Request, Response } from "express";
import { Cart, PrismaClient } from "@prisma/client";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { successHandler } from "../../Middleware/ErrorHandler";
import { validateIdParams } from "../../Helpers/validateIdParams";

const prisma = new PrismaClient();

// Handler to add products to the user's cart
export const add = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin; // Get the authenticated user from the request
    const products = req.body.products; // Get the products from the request body

    if (!admin) {
      throw new Error("Log in first"); // Ensure user is authenticated
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Products must be a non-empty array");
    }

    const productsWithInsufficientStock: string[] = [];

    // Validate the products array
    for (const product of products) {
      if (
        typeof product.product_id !== "string" ||
        typeof product.quantity !== "number" ||
        product.quantity === 0
      ) {
        throw new Error(
          "Each product must have a valid product_id and quantity"
        );
      }

      const allowedFields = ["product_id", "quantity"];
      const productKeys = Object.keys(product);

      for (const key of productKeys) {
        if (!allowedFields.includes(key)) {
          throw new Error(`Invalid field '${key}' in product`);
        }
      }

      // Check if the requested quantity exceeds available stock
      const dbProduct = await prisma.product.findUnique({
        where: { id: product.product_id },
      });

      if (product.quantity > dbProduct!.quantity) {
        productsWithInsufficientStock.push(dbProduct!.name);
      }
    }

    // If there are products with insufficient stock, throw an error
    if (productsWithInsufficientStock.length > 0) {
      throw new Error(
        `Insufficient stock for the following products: ${productsWithInsufficientStock.join(
          ", "
        )}`
      );
    }

    // Retrieve user's cart along with associated products if it exists
    let userCart = await prisma.admin.findUnique({
      where: { id: admin.id },
      include: { Cart: true },
    });

    // If the user has no cart, create one
    if (!userCart?.Cart) {
      userCart = await prisma.admin.update({
        where: { id: admin.id },
        data: {
          Cart: {
            create: {},
          },
        },
        include: { Cart: true },
      });
    }

    if (!userCart) {
      throw new Error("User's cart does not exist");
    }

    // Loop through each product to add to the cart
    for (const { product_id, quantity } of products) {
      // Find the product in the database
      const product = await prisma.product.findUnique({
        where: { id: product_id },
      });

      if (!product) {
        throw new Error(`The product you are trying to add does not exist`);
      }

      // Calculate the total price for the product based on quantity
      const price = product.price;
      const wholesale_price = product.wholesale_price;
      const total = price! * quantity;
      const totalWholesalePrice = wholesale_price! * quantity;

      // Check if the product is already in the cart
      const existingProductInCart = await prisma.productInCart.findFirst({
        where: {
          cart_id: userCart.Cart?.id,
          product_id,
        },
      });

      // If the product is already in the cart, update the quantity and total
      if (existingProductInCart) {
        await prisma.productInCart.update({
          where: { id: existingProductInCart.id },
          data: {
            quantity: existingProductInCart.quantity + quantity,
            total: existingProductInCart.total + total,
            wholesale_price_total:
              existingProductInCart.wholesale_price_total + totalWholesalePrice,
          },
        });
      } else {
        // If the product is not in the cart, add it as a new entry
        await prisma.productInCart.create({
          data: {
            quantity,
            total,
            wholesale_price_total: totalWholesalePrice,
            product: { connect: { id: product_id } },
            cart: { connect: { id: userCart.Cart?.id } },
            status: "ACTIVE",
          },
        });
      }
    }

    // Calculate total price of products in the cart
    const cartId = userCart.Cart?.id;
    const cartProducts = await prisma.productInCart.findMany({
      where: { cart_id: cartId },
      include: { product: true },
    });

    if (!cartProducts) {
      throw new Error("Failed to retrieve cart products");
    }

    // Calculate the total price of all products in the cart
    const totalPrice = cartProducts.reduce((sum, cartProduct) => {
      return sum + cartProduct.total;
    }, 0);

    const totalPrice_wholesale = cartProducts.reduce((sum, cartProduct) => {
      return sum + cartProduct.wholesale_price_total;
    }, 0);

    try {
      // Update the cart with the new total price and set payment status to unpaid
      await prisma.cart.update({
        where: { id: cartId },
        data: {
          total_price: totalPrice,
          wholesale_price: totalPrice_wholesale,
        },
      });
    } catch (error) {
      throw new Error(`${error}`);
    }

    // Send a success response
    successHandler(cartProducts, res, "POST");
  }
);

// Handler to get the user's cart
export const getCart = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin; // Get the authenticated user from the request

    if (!admin) {
      throw new Error("Log in first"); // Ensure user is authenticated
    }

    // Find the user's cart and include products and their info
    let cart = await prisma.cart.findUnique({
      where: {
        admin_id: admin.id,
      },
      include: {
        ProductInCart: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Error getting cart for the user");
    }

    // Send the updated cart data as a success response
    successHandler(cart, res, "GET");
  }
);

export const UpdateCart = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin; // Get the authenticated user from the request

    if (!admin) {
      throw new Error("Log in first"); // Ensure user is authenticated
    }

    // Find the user's cart and include products and their info
    let cart = await prisma.cart.findUnique({
      where: {
        admin_id: admin.id,
      },
      include: {
        ProductInCart: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Error getting cart for the user");
    }

    // Fetch all products to check their stock levels
    const products = await prisma.product.findMany({});

    // Check each product's quantity and add to cart if it reaches the minimum stock level
    for (const product of products) {
      if (product.quantity <= product.minimum_stock_level) {
        // Check if the product is already in the cart
        const productInCart = cart.ProductInCart.find(
          (pic) => pic.product_id === product.id
        );
        if (!productInCart) {
          // Add the product to the cart
          await prisma.productInCart.create({
            data: {
              cart_id: cart.id,
              product_id: product.id,
              quantity: product.quantity, // Add the entire available quantity
              total: product.quantity * product.price, // Calculate the total price
              wholesale_price_total: product.quantity * product.wholesale_price,
              status: "ACTIVE",
            },
          });
        }
      }
    }

    // Fetch the updated cart after potential additions
    cart = await prisma.cart.findUnique({
      where: {
        admin_id: admin.id,
      },
      include: {
        ProductInCart: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate the total price of all products in the cart and update prices if necessary
    let totalPrice = 0;
    let wholeSalePrice = 0;

    for (const cartProduct of cart!.ProductInCart) {
      const product = cartProduct.product;
      const currentTotal = cartProduct.quantity * product.price;
      const currentWholesaleTotal =
        cartProduct.quantity * product.wholesale_price;

      // Check if there is a difference in prices and update if necessary
      if (
        cartProduct.total !== currentTotal ||
        cartProduct.wholesale_price_total !== currentWholesaleTotal
      ) {
        await prisma.productInCart.update({
          where: {
            id: cartProduct.id,
          },
          data: {
            total: currentTotal,
            wholesale_price_total: currentWholesaleTotal,
          },
        });
        cartProduct.total = currentTotal;
        cartProduct.wholesale_price_total = currentWholesaleTotal;
      }

      totalPrice += cartProduct.total;
      wholeSalePrice += cartProduct.wholesale_price_total;
    }

    // Update the cart with the new total price
    await prisma.cart.update({
      where: { id: cart!.id },
      data: {
        total_price: totalPrice,
        wholesale_price: wholeSalePrice,
      },
    });

    // Send the updated cart data as a success response
    successHandler(cart, res, "POST");
  }
);

export const deleteInCart = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin; // Get the authenticated user from the request
    const productInCartIdsToDelete = req.body.productInCartIds; // Get the productInCart IDs to be deleted from the request body

    if (!admin) {
      throw new Error("Log in first"); // Ensure user is authenticated
    }

    if (
      !Array.isArray(productInCartIdsToDelete) ||
      productInCartIdsToDelete.length === 0
    ) {
      throw new Error("Invalid productInCart IDs to delete"); // Ensure productInCart IDs to delete are provided
    }

    const adminID = admin.id;

    // Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        admin_id: adminID,
      },
      include: {
        ProductInCart: true,
      },
    });

    if (!cart) {
      throw new Error("Error getting cart for the user");
    }

    const cartId = cart.id;

    // Delete each productInCart from the cart
    for (const productInCartId of productInCartIdsToDelete) {
      // Check if the productInCart belongs to the user's cart
      const productInCart = cart.ProductInCart.find(
        (pic) => pic.id === productInCartId
      );
      if (!productInCart) {
        throw new Error(
          `ProductInCart with id ${productInCartId} not found in user's cart`
        );
      }

      // Delete the productInCart from the cart
      await prisma.productInCart.delete({
        where: {
          id: productInCartId,
        },
      });
    }

    // Send a success response
    successHandler(
      { message: "ProductInCart items deleted successfully" },
      res,
      "DELETE"
    );
  }
);

export const updateProductInCartQuantity = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const admin = req.admin; // Get the authenticated user from the request
    const { id } = req.params; // Get the productInCart ID from the request params
    const { quantity } = req.body; // Get the new quantity from the request body

    if (!admin) {
      throw new Error("Log in first"); // Ensure user is authenticated
    }

    // Validate that id is a string and is a valid UUID
    if (typeof id !== "string" || !validateIdParams(id)) {
      throw new Error("Invalid product ID format");
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }

    // Find the user's cart and include products in the cart
    const cart = await prisma.cart.findUnique({
      where: {
        admin_id: admin.id,
      },
      include: {
        ProductInCart: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Error getting cart for the user");
    }

    const productInCart = cart.ProductInCart.find((pic) => pic.id === id);

    if (!productInCart) {
      throw new Error(`ProductInCart with id ${id} not found in user's cart`);
    }

    // Find the product in the database
    const product = await prisma.product.findUnique({
      where: { id: productInCart.product_id },
    });

    if (!product) {
      throw new Error(
        `Product with id ${productInCart.product_id} does not exist`
      );
    }

    // Compare the requested quantity with the available quantity in the product
    if (quantity > product.quantity) {
      throw new Error(
        `Requested quantity ${quantity} exceeds available quantity ${product.quantity}`
      );
    }

    // Calculate the new total price for the product based on the updated quantity
    const newTotal = product.price! * quantity;
    const newWholesaleTotal = product.wholesale_price! * quantity;

    // Update the productInCart with the new quantity and totals
    await prisma.productInCart.update({
      where: { id: productInCart.id },
      data: {
        quantity,
        total: newTotal,
        wholesale_price_total: newWholesaleTotal,
      },
    });

    // Calculate the total price of all products in the cart
    const cartProducts = await prisma.productInCart.findMany({
      where: { cart_id: cart.id },
      include: { product: true },
    });

    const totalPrice = cartProducts.reduce((sum, cartProduct) => {
      return sum + cartProduct.total;
    }, 0);

    const totalPrice_wholesale = cartProducts.reduce((sum, cartProduct) => {
      return sum + cartProduct.wholesale_price_total;
    }, 0);

    // Update the cart with the new total price
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total_price: totalPrice,
        wholesale_price: totalPrice_wholesale,
      },
    });

    // Send a success response
    successHandler("Successfully updated the quantity", res, "PUT");
  }
);
