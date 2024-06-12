export interface ProductInterface {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
  Category: Category[];
  brand: string;

  description: string;
  unit_of_measure: Measurement;
  expiration: string;
  date_of_manufacture: string;

  supplier: string;

  stock_status: StockStatus;
  minimum_stock_level: number;
  maximum_stock_level: number;
}

export interface Category {
  name: string;
}

// Define the enum for StockStatus
export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  LOW_STOCK = "LOW_STOCK",
}

// Define the enum for Measurement
export enum Measurement {
  KILOGRAMS = "KILOGRAMS",
  LITERS = "LITERS",
  PIECES = "PIECES",
}
