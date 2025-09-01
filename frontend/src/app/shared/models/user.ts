import { Role } from "@core/enums/role";
import { Access } from "@core/enums/access";

export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  accesses?: Access[];
  active?: boolean;
}