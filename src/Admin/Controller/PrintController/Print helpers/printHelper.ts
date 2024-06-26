import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { Measurement, PrismaClient, StockStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const createExcelFile = async (products: any[], filePath: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  const columns = [
    { header: "ID", key: "id" }, //1
    { header: "Barcode", key: "barcode" }, //2
    { header: "Name", key: "name" }, //3
    { header: "Quantity", key: "quantity" }, //4
    { header: "Weight", key: "weight" }, //5
    { header: "Unit of Measure", key: "unit_of_measure" }, //6
    { header: "Price", key: "price" }, //7
    { header: "Wholesale Price", key: "wholesale_price" }, //8
    { header: "Brand", key: "brand" }, //9
    { header: "Description", key: "description" }, //10
    { header: "Category", key: "category" }, //11
    { header: "Supplier", key: "supplier" }, //12
    { header: "Stock Status", key: "stock_status" }, //13
    { header: "Minimum Stock Level", key: "minimum_stock_level" }, //14
    { header: "Maximum Stock Level", key: "maximum_stock_level" }, //15
    { header: "Date of Entry", key: "date_of_entry" }, //16
    { header: "Expiration", key: "expiration" }, //17
    { header: "Date of Manufacture", key: "date_of_manufacture" }, //18
  ];
  worksheet.columns = columns;

  products.forEach((product) => {
    worksheet.addRow({
      ...product,
      category: product.Category.map((cat: any) => cat.name).join(", "),
    });
  });

  // Add data validation for the "Stock Status" column
  worksheet
    .getColumn(13)
    .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip the header row
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"IN_STOCK,OUT_OF_STOCK,LOW_STOCK"'],
          showErrorMessage: true,
          errorTitle: "Invalid Unit of Measure",
          error:
            "Please select a value from the dropdown list: IN_STOCK, OUT_OF_STOCK, LOW_STOCK",
        };
      }
    });

  // Add data validation for the "Unit of Measure" column
  worksheet.getColumn(6).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
    if (rowNumber > 1) {
      // Skip the header row
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"KILOGRAMS,GRAMS,LITERS,PIECES"'],
        showErrorMessage: true,
        errorTitle: "Invalid Unit of Measure",
        error:
          "Please select a value from the dropdown list: KILOGRAMS, GRAMS, LITERS, PIECES,",
      };
    }
  });

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  await workbook.xlsx.writeFile(filePath);
};

export const UpdateProductsFromExcelFile = async (filePath: string) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  let worksheet: ExcelJS.Worksheet | undefined;
  workbook.eachSheet((sheet) => {
    if (sheet.name === "Products") {
      worksheet = sheet;
    }
  });

  if (!worksheet) {
    throw new Error("Worksheet 'Products' not found in the Excel file.");
  }

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.text);
  });

  const requiredFields = [
    "ID",
    "Barcode",
    "Name",
    "Quantity",
    "Weight",
    "Unit of Measure",
    "Price",
    "Wholesale Price",
    "Brand",
    "Description",
    "Supplier",
    "Stock Status",
    "Minimum Stock Level",
    "Maximum Stock Level",
  ];

  const data: { [key: string]: any }[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip the header row

    const rowData: { [key: string]: any } = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      rowData[header] = cell.text;
    });

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!rowData[field]) {
        throw new Error(
          `Required field '${field}' is missing or empty in row ${rowNumber}`
        );
      }
    });

    data.push(rowData);
  });

  const formattedData = data.map((item) => {
    return {
      id: item["ID"],
      barcode: item["Barcode"],
      name: item["Name"],
      quantity: parseInt(item["Quantity"], 10),
      weight: parseFloat(item["Weight"]),
      unit_of_measure: item["Unit of Measure"],
      price: parseFloat(item["Price"]),
      wholesale_price: parseFloat(item["Wholesale Price"]),
      brand: item["Brand"],
      description: item["Description"],
      supplier: item["Supplier"],
      stock_status: item["Stock Status"],
      minimum_stock_level: parseInt(item["Minimum Stock Level"], 10),
      maximum_stock_level: parseInt(item["Maximum Stock Level"], 10),
    };
  });

  const updateProducts = await prisma.$transaction(async (prisma) => {
    return await Promise.all(
      formattedData.map(async (product) => {
        return prisma.product.update({
          where: { id: product.id },
          data: {
            barcode: product.barcode,
            name: product.name,
            quantity: product.quantity,
            weight: product.weight,
            price: product.price,
            wholesale_price: product.wholesale_price,
            brand: product.brand,
            description: product.description,
            unit_of_measure: product.unit_of_measure,
            supplier: product.supplier,
            stock_status: product.stock_status,
            minimum_stock_level: product.minimum_stock_level,
            maximum_stock_level: product.maximum_stock_level,
          },
        });
      })
    );
  });
};

export const createProductsInDatabase = async (filePath: string) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  let worksheet: ExcelJS.Worksheet | undefined;
  workbook.eachSheet((sheet) => {
    if (sheet.name === "Products") {
      worksheet = sheet;
    }
  });

  if (!worksheet) {
    throw new Error("Worksheet 'Products' not found in the Excel file.");
  }

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.text);
  });

  const requiredFields = [
    "Barcode",
    "Name",
    "Quantity",
    "Weight",
    "Unit of Measure",
    "Price",
    "Wholesale Price",
    "Brand",
    "Description",
    "Category",
    "Supplier",
    "Stock Status",
    "Minimum Stock Level",
    "Maximum Stock Level",
    "Expiration",
    "Date of Manufacture",
  ];

  const data: { [key: string]: any }[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip the header row

    const rowData: { [key: string]: any } = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      rowData[header] = cell.text;
    });

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!rowData[field]) {
        throw new Error(
          `Required field '${field}' is missing or empty in row ${rowNumber}`
        );
      }
    });

    data.push(rowData);
  });

  const formattedData = data.map((item) => {
    const categories = item["Category"]
      .split(",")
      .map((cat: string) => ({ name: cat.trim() }));

    return {
      barcode: item["Barcode"],
      name: item["Name"],
      quantity: parseInt(item["Quantity"], 10),
      weight: parseFloat(item["Weight"]),
      unit_of_measure: item["Unit of Measure"],
      price: parseFloat(item["Price"]),
      wholesale_price: parseFloat(item["Wholesale Price"]),
      brand: item["Brand"],
      description: item["Description"],
      Category: categories,
      supplier: item["Supplier"],
      stock_status: item["Stock Status"],
      minimum_stock_level: parseInt(item["Minimum Stock Level"], 10),
      maximum_stock_level: parseInt(item["Maximum Stock Level"], 10),
      expiration: item["Expiration"],
      date_of_manufacture: item["Date of Manufacture"],
    };
  });

  // Check for existing barcodes
  const barcodes = formattedData.map((product) => product.barcode);
  const existingProducts = await prisma.product.findMany({
    where: {
      barcode: {
        in: barcodes,
      },
    },
    select: {
      barcode: true,
    },
  });

  if (existingProducts.length > 0) {
    const existingBarcodes = existingProducts.map((product) => product.barcode);
    throw new Error(
      `The following barcodes already exist in the database: ${existingBarcodes.join(
        ", "
      )}`
    );
  }

  const createProducts = await prisma.$transaction(async (prisma) => {
    return await Promise.all(
      formattedData.map(async (product) => {
        // Ensure categories exist or create them (using upsert)
        const categories = await Promise.all(
          product.Category.map(async (category: any) => {
            try {
              return await prisma.category.upsert({
                where: { name: category.name },
                update: {},
                create: { name: category.name },
              });
            } catch (error) {
              // Handle any errors here, such as logging or retrying
              console.error(
                `Error upserting category ${category.name}:`,
                error
              );
              throw error; // Propagate the error up
            }
          })
        );

        // Create the product with the associated categories
        return prisma.product.create({
          data: {
            barcode: product.barcode,
            name: product.name,
            quantity: product.quantity,
            weight: product.weight,
            price: product.price,
            wholesale_price: product.wholesale_price,
            Category: {
              connect: categories.map((category) => ({ id: category.id })),
            },
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
        });
      })
    );
  });
};
