export interface Version {
  id?: number;
  projectId?: number;
  number?: string;
  note?: string;
  fileUrl?: string;
  fileName?: string;
  created?: string;
  lastVersion?: string;
  active?: boolean;
  file?: File;
}