import { User } from "@shared/models/user";

export interface Team {
  id?: number;
  name?: string;
  description?: string;
  leaderName?: string;
  leaderId?: string;
  members?: User[];
  active?: boolean;
}