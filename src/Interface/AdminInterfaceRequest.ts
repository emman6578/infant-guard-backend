export interface AdminInterface {
  email: string;
  fullname: string;
  username: string;
  image?: string | null;
  role: Role;
}

enum Role {
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}
