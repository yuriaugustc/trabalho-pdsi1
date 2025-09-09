import { Skill } from "./skill";

export interface Job {
  id: number;
  name: string;
  companyName: string;
  companyPhoto: string;
  category: string;
  createdAt: Date;
  appliesCount: number;
  skills: Skill[];
}