import { Filter } from "@core/models/filter";

export interface UserFilter extends Filter {
  name?: string;
  email?: string;
}