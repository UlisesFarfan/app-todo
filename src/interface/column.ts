import { NoteResponse } from "./note";

export interface CreateColumn {
  workspace_id: string;
  name: string;
}

export interface UpdateColumn {
  _id: string;
  name: string;
  signal: AbortSignal;
}

export interface ColumnResponse {
  _id: string;
  name: string;
  notes: NoteResponse[];
  created_at: Date | string;
  update_at: Date | string;
  workspace_id?: string;
}

export interface UpdateNoteOrder {
  _id: string;
  notes: string[];
}