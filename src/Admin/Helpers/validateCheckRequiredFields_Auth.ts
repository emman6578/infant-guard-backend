import { AdminInterface } from "../Interface/AdminInterfaceRequest";

// Function to validate if the required fields are present in the auth object
function validateProductFields(
  admin: AdminInterface,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = []; // Array to store the names of missing fields
  for (const field of requiredFields) {
    // Check if each required field exists in the product object
    if (!(field in admin)) {
      missingFields.push(field); // If the field is missing, add it to the missingFields array
    }
  }
  return missingFields; // Return the array of missing fields
}

const requiredFieldsAuth: string[] = ["email", "fullname", "username"];

// Function to check required fields and extra fields in the request body
export function checkRequiredFieldsAuth(req: any) {
  // Check if all required fields are present in req.body
  const missingFields = validateProductFields(req.body, requiredFieldsAuth);
  if (missingFields.length > 0) {
    // If there are missing fields, throw an error with the names of the missing fields
    throw new Error(
      `Missing required fields in the request body: ${missingFields.join(", ")}`
    );
  }

  // Check for additional fields in req.body that are not in requiredFields
  const extraFields = Object.keys(req.body).filter(
    (field) => !requiredFieldsAuth.includes(field)
  );
  if (extraFields.length > 0) {
    // If there are extra fields, throw an error with the names of the extra fields
    throw new Error(
      `Additional fields found in the request body: ${extraFields.join(", ")}`
    );
  }
}

// Function to check required fields and extra fields in the request body
export function checkRequiredUpdateFieldsAuth(req: any) {
  // Check for extra fields in req.body that are not in updatableFields
  const extraFields = Object.keys(req.body).filter(
    (field) => !requiredFieldsAuth.includes(field)
  );
  if (extraFields.length > 0) {
    // If there are extra fields, throw an error with the names of the extra fields
    throw new Error(
      `This field is not in the auth field: ${extraFields.join(", ")}`
    );
  }
}

// Function to check if required fields are empty
export function checkIfEmptyFields(req: any) {
  const emptyFields = requiredFieldsAuth.filter(
    (field) => !req.body[field] || req.body[field].trim() === ""
  );
  if (emptyFields.length > 0) {
    throw new Error(
      `The following required fields are empty: ${emptyFields.join(", ")}`
    );
  }
}
