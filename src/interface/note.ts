import { ColumnResponse } from "./column";

export interface CreateNote {
  column_id: string;
  task: string;
}
export interface UpdateNote {
  _id: string;
  task: string;
  columnId: string;
  signal: AbortSignal;
}
export interface NoteResponse {
  _id: string;
  task: string;
  created_at: Date | string;
  update_at: Date | string;
  columnId?: string;
}

export interface PostNote {
  new_task: CreateNote;
  columns: ColumnResponse[]
}