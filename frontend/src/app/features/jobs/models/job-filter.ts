import { Skill } from "./skill";

export interface JobFilter {
  companies: string[];
  categories: string[];
  skills: Skill[];
  date?: Date;
}