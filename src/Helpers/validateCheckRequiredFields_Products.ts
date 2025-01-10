import { ProductInterface } from "../Interface/ProductInterfaceRequest";

// Function to validate if the required fields are present in the product object
function validateProductFields(
  product: ProductInterface,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = []; // Array to store the names of missing fields
  for (const field of requiredFields) {
    // Check if each required field exists in the product object
    if (!(field in product)) {
      missingFields.push(field); // If the field is missing, add it to the missingFields array
    }
  }
  return missingFields; // Return the array of missing fields
}

const requiredFieldsProducts: string[] = [
  "barcode",
  "name",
  "quantity",
  "weight",
  "price",
  "wholesale_price",
  "Category",
  "brand",
  "description",
  "unit_of_measure",
  "expiration",
  "date_of_manufacture",
  "supplier",
  "stock_status",
  "minimum_stock_level",
  "maximum_stock_level",
];

// Function to check required fields and extra fields in the request body
export function checkRequiredFieldsProducts(req: any) {
  // Check if all required fields are present in req.body
  const missingFields = validateProductFields(req.body, requiredFieldsProducts);
  if (missingFields.length > 0) {
    // If there are missing fields, throw an error with the names of the missing fields
    throw new Error(
      `Missing required fields in the request body: ${missingFields.join(", ")}`
    );
  }

  // Check for additional fields in req.body that are not in requiredFields
  const extraFields = Object.keys(req.body).filter(
    (field) => !requiredFieldsProducts.includes(field)
  );
  if (extraFields.length > 0) {
    // If there are extra fields, throw an error with the names of the extra fields
    throw new Error(
      `Additional fields found in the request body: ${extraFields.join(", ")}`
    );
  }
}

// Function to check required fields and extra fields in the request body
export function checkRequiredUpdateFieldsProducts(req: any) {
  // Check for extra fields in req.body that are not in updatableFields
  const extraFields = Object.keys(req.body).filter(
    (field) => !requiredFieldsProducts.includes(field)
  );
  if (extraFields.length > 0) {
    // If there are extra fields, throw an error with the names of the extra fields
    throw new Error(
      `This field is not in the product field: ${extraFields.join(", ")}`
    );
  }
}

export function checkIfEmptyFields(req: any) {
  const emptyFields: string[] = []; // Array to store the names of empty fields

  // Loop through each required field to check if it's empty
  for (const field of requiredFieldsProducts) {
    if (!req.body[field] || req.body[field].toString().trim() === "") {
      emptyFields.push(field); // If the field is empty or undefined, add it to the emptyFields array
    }
  }

  // If there are empty fields, throw an error with the names of the empty fields
  if (emptyFields.length > 0) {
    throw new Error(
      `The following required fields are empty or undefined: ${emptyFields.join(
        ", "
      )}`
    );
  }
}
