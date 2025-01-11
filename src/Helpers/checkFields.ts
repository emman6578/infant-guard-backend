import { InfantInterface } from "../Interface/InfantInterface";
import { ParentInterface } from "../Interface/UserInterface";

export const checkFieldsInfantController = (infant: any) => {
  const requiredFields: (keyof InfantInterface)[] = [
    "fullname",
    "birthday",
    "place_of_birth",
    "address",
    "height",
    "gender",
    "weight",
    "mothers_name",
    "fathers_name",
    "health_center",
    "family_no",
  ];

  const emptyFields = requiredFields.filter(
    (field) =>
      !infant[field] || // Check for undefined/null
      (typeof infant[field] === "object" &&
        Object.keys(infant[field]!).length === 0) // Check if object is empty
  );

  if (emptyFields.length > 0) {
    throw new Error(`Empty Fields: ${emptyFields.join(", ")}`);
  }
};

export const checkFieldsAuth = (parent: any) => {
  const requiredFields: (keyof ParentInterface)[] = [
    "email",
    "fullname",
    "contact_number",
    "address",
  ];

  const emptyFields = requiredFields.filter(
    (field) =>
      !parent[field] || // Check for undefined/null
      (typeof parent[field] === "object" &&
        Object.keys(parent[field]!).length === 0) // Check if object is empty
  );

  if (emptyFields.length > 0) {
    throw new Error(`Empty Fields: ${emptyFields.join(", ")}`);
  }
};
