import { Filter } from "@core/models/filter";

export interface VersionFilter extends Filter {
  number?: string;
  created?: string;
}