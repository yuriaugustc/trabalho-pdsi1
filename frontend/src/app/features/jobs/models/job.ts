import { JobStatus } from "@core/enums/job-status";
import { Skill } from "./skill";

export interface Job {
  id: number;
  name: string;
  status: JobStatus;
  description: string;
  companyId: number;
  companyName: string;
  companyPhoto: string;
  location: string;
  modality: string;
  category: string;
  createdAt: Date;
  appliesCount: number;
  skills: Skill[];
}