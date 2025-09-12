import { Role } from "@core/enums/role";

export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  active?: boolean;
}