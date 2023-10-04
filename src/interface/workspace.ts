import { ColumnResponse } from "./column";

export interface CreateWorkSpace {
  user_id: string;
  name: string;
}
export interface UpdateWorkSpace {
  _id: string;
  name: string;
  user_id?: string;
}
export interface WorkSpaceResponse {
  _id: string;
  name: string;
  users: string;
  columns: ColumnResponse[];
  create_at: Date;
  update_at: Date;
}

export interface UpdateColumnOrder {
  _id: string;
  columns: string[];
}