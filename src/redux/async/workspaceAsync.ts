import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { WebResponse } from "../../interface/api_response";
import { ColumnResponse, CreateColumn, UpdateColumn, UpdateNoteOrder } from "../../interface/column";
import { NoteResponse, PostNote, UpdateNote } from "../../interface/note";
import { CreateWorkSpace, UpdateColumnOrder, UpdateWorkSpace } from "../../interface/workspace";

export const GetWorkSpaceAsync = createAsyncThunk(
  "workspace/getworkspace",
  async (_, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      const { data } = await axios<WebResponse<string[]>>({
        method: "GET",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/work_space",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return data.data
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const UpdateWorkSpaceAsync = createAsyncThunk(
  "workspace/updateworkspace",
  async (data: UpdateWorkSpace, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "PATCH",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/work_space/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const PostWorkSpaceAsync = createAsyncThunk(
  "workspace/postworkspace",
  async (data: CreateWorkSpace, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "POST",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/work_space/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const DeleteWorkSpaceAsync = createAsyncThunk(
  "workspace/postworkspace",
  async (work_space_id: string, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "DELETE",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/work_space/" + work_space_id,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const PostColumnAsync = createAsyncThunk(
  "workspace/postcolumn",
  async ({ workspace_name, columns, new_column }: { workspace_name: string; columns: ColumnResponse[]; new_column: CreateColumn }, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      const { data } = await axios<WebResponse<ColumnResponse>>({
        method: "POST",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/column",
        data: new_column,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      data.data.workspace_id = new_column.workspace_id
      return {
        workspace_name: workspace_name,
        data: data.data,
        columns: columns
      }
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const DeleteColumnAsync = createAsyncThunk(
  "workspace/deletecolumn",
  async ({ id, new_columns }: { id: string, new_columns: ColumnResponse[] }, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios<WebResponse<null>>({
        method: "DELETE",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/column/" + id,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return new_columns
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const UpdateColumnAsync = createAsyncThunk(
  "workspace/updatecolumn",
  async (data: UpdateColumn, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "PATCH",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/column/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        signal: data.signal
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const PostTaskAsync = createAsyncThunk(
  "workspace/posttask",
  async (body: PostNote, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      const { data } = await axios<WebResponse<NoteResponse>>({
        method: "POST",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/note/",
        data: body.new_task,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      data.data.columnId = body.new_task.column_id
      return { new_task: data.data, columns: body.columns }
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const DeleteTaskAsync = createAsyncThunk(
  "workspace/deletetask",
  async ({ noteId, columnId }: { noteId: string, columnId: string }, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios<WebResponse<null>>({
        method: "DELETE",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/note/" + noteId,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return { noteId, columnId }
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const UpdateTaskAsync = createAsyncThunk(
  "workspace/updatetask",
  async (data: UpdateNote, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "PATCH",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/note/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        signal: data.signal
      });
      return data
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const UpdateColumnsOrderAsync = createAsyncThunk(
  "workspace/updatecolumnorder",
  async (data: UpdateColumnOrder, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "PUT",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/work_space/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const UpdateNotesOrderAsync = createAsyncThunk(
  "workspace/updatenoteorder",
  async (data: UpdateNoteOrder, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      await axios({
        method: "PUT",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/column/",
        data: data,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return null
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);