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
    { header: "Expiration", key: "expiration" }, //16
    { header: "Date of Manufacture", key: "date_of_manufacture" }, //17
    { header: "Date of Entry", key: "date_of_entry" }, //18
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

export const readExcelFile = async (filePath: string) => {
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

  const productsToUpdate: {
    [key: string]: {
      barcode?: string;
      name?: string;
      quantity?: number;
      weight?: number;
      unit_of_measure?: Measurement;
      price?: number;
      wholesale_price: number;
      brand?: string;
      description?: string;
      supplier?: string;
      stock_status?: StockStatus;
      minimum_stock_level?: number;
      maximum_stock_level?: number;
    };
  } = {};

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData_id = row.getCell(1).value?.toString();
    if (rowData_id) {
      productsToUpdate[rowData_id] = {
        barcode: row.getCell(2).value?.toString(),
        name: row.getCell(3).value?.toString(),
        quantity: row.getCell(4).value as number,
        weight: row.getCell(5).value as number,
        unit_of_measure: row.getCell(6).value as Measurement,
        price: row.getCell(7).value as number,
        wholesale_price: row.getCell(8).value as number,
        brand: row.getCell(9).value?.toString(),
        description: row.getCell(10).value?.toString(),
        supplier: row.getCell(12).value as StockStatus,
        stock_status: row.getCell(13).value as StockStatus,
        minimum_stock_level: row.getCell(14).value as number,
        maximum_stock_level: row.getCell(15).value as number,
      };
    }
  });

  return productsToUpdate;
};

export const updateProductsInDatabase = async (productsToUpdate: {
  [key: string]: {
    barcode?: string;
    name?: string;
    quantity?: number;
    weight?: number;
    unit_of_measure?: Measurement;
    price?: number;
    wholesale_price?: number;
    brand?: string;
    description?: string;
    supplier?: string;
    stock_status?: StockStatus;
    minimum_stock_level?: number;
    maximum_stock_level?: number;
  };
}) => {
  const updates = Object.entries(productsToUpdate).map(([id, data]) => ({
    where: { id },
    data: {
      barcode: data.barcode,
      name: data.name,
      quantity: data.quantity,
      weight: data.weight,
      unit_of_measure: data.unit_of_measure,
      price: data.price,
      wholesale_price: data.wholesale_price,
      brand: data.brand,
      description: data.description,
      stock_status: data.stock_status,
      minimum_stock_level: data.minimum_stock_level,
      maximum_stock_level: data.maximum_stock_level,
    },
  }));

  await Promise.all(
    updates.map(async (update) => {
      await prisma.product.update({
        where: { id: update.where.id },
        data: update.data,
      });
    })
  );
};
