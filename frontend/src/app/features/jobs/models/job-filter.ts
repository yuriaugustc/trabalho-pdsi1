import { Skill } from "./skill";

export interface JobFilter {
  companies: string[];
  categories: string[];
  skills: Skill[];
  modality: string[];
  date?: Date;
}