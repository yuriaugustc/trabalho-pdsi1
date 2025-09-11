import { Skill } from "./skill";

export interface Job {
  id: number;
  name: string;
  description: string;
  companyName: string;
  companyPhoto: string;
  location: string;
  modality: string;
  category: string;
  createdAt: Date;
  appliesCount: number;
  skills: Skill[];
}