import jwt from "jsonwebtoken";

// Secret key for JWT
const JWT_SECRET = "your_secret_key";

// Function to generate JWT token
function generateToken(user: any) {
  const token = jwt.sign(
    {
      user,
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );
  return token;
}

// Function to validate JWT token
function validateToken(token: string) {
  try {
    jwt.verify(token, JWT_SECRET);
    return true; // Token is valid
  } catch (error) {
    return false; // Token is invalid
  }
}

export { generateToken, validateToken };
