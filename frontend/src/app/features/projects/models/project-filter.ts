import { Filter } from "@core/models/filter";

export interface ProjectFilter extends Filter {
  name?: string;
  description?: string;
  lastVersion?: string;
  responsibleName?: string;
}