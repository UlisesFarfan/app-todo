import { createSlice } from "@reduxjs/toolkit";
import { initialWorkSpaceState } from "../../interface/slice";
import { DeleteColumnAsync, DeleteTaskAsync, DeleteWorkSpaceAsync, GetCurrentWorkSpace, GetWorkSpaceAsync, PostColumnAsync, PostTaskAsync, PostWorkSpaceAsync } from "../async/workspaceAsync";
import { ColumnResponse } from "../../interface/column";
import { NoteResponse } from "../../interface/note";

const initialState = {
  workspaces: null,
  currentWorkSpace: null,
  loading: false,
  error: false,
} as initialWorkSpaceState

export const WorkSpaceSlice: any = createSlice({
  name: "workspace",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* LOGIN */
    builder.addCase(GetWorkSpaceAsync.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = false;
      state.workspaces = payload;
    });
    builder.addCase(GetWorkSpaceAsync.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(GetWorkSpaceAsync.rejected, (state, _) => {
      state.loading = false;
      state.error = true;
      state.workspaces = null;
    });
    builder.addCase(PostWorkSpaceAsync.fulfilled, (state, _) => {
      state.loading = false;
      state.error = true;
    });
    builder.addCase(DeleteWorkSpaceAsync.fulfilled, (state, _) => {
      state.currentWorkSpace = null;
    });
    builder.addCase(GetCurrentWorkSpace.fulfilled, (state, { payload }) => {
      state.currentWorkSpace = payload;
    });
    builder.addCase(PostColumnAsync.fulfilled, (state, { payload }) => {
      const new_column: ColumnResponse = {
        _id: payload.data._id,
        name: payload.data.name,
        notes: payload.data.notes,
        created_at: payload.data.created_at,
        update_at: payload.data.update_at
      };
      const new_columns = [...payload.columns, new_column];
      let new_current_workspace = state.currentWorkSpace;
      if (new_current_workspace !== null) {
        new_current_workspace = { ...new_current_workspace, columns: new_columns, name: payload.workspace_name }
      }
      if (state.workspaces !== null) {
        const new_workspaces = state.workspaces?.map(el => el._id === new_current_workspace?._id ? new_current_workspace : el);
        state.workspaces = new_workspaces;
      }
      state.currentWorkSpace = new_current_workspace;
    });
    builder.addCase(DeleteColumnAsync.fulfilled, (state, { payload }) => {
      if (state.currentWorkSpace) {
        const new_current_workspace = state.currentWorkSpace;
        new_current_workspace.columns = payload;
        if (state.workspaces !== null) {
          const new_workspaces = state.workspaces?.map(el => el._id === new_current_workspace?._id ? new_current_workspace : el);
          state.workspaces = new_workspaces;
        }
        state.currentWorkSpace = new_current_workspace;
      };
    });
    builder.addCase(PostTaskAsync.fulfilled, (state, { payload }) => {
      const new_task: NoteResponse = {
        _id: payload.new_task._id,
        task: payload.new_task.task,
        created_at: payload.new_task.created_at,
        update_at: payload.new_task.update_at,
      };
      const new_column = { ...payload.columns?.find(el => el._id === payload.new_task.columnId) };
      if (new_column) new_column.notes = [...new_column.notes!, new_task];
      const new_columns: any = payload.columns!.map(el => el._id === payload.new_task.columnId ? new_column : el);
      const new_current_workspace = state.currentWorkSpace;
      new_current_workspace!.columns = new_columns;
      if (state.workspaces !== null) {
        const new_workspaces = state.workspaces?.map(el => el._id === new_current_workspace?._id ? new_current_workspace : el);
        state.workspaces = new_workspaces;
      }
      state.currentWorkSpace = new_current_workspace;
    });
    builder.addCase(DeleteTaskAsync.fulfilled, (state, { payload }) => {
      if (state.currentWorkSpace) {
        const new_current_workspace = state.currentWorkSpace;
        new_current_workspace.columns.forEach((el) => {
          if (el._id === payload.columnId) {
            const new_notes = el.notes.filter((el) => el._id !== payload.noteId);
            el.notes = new_notes;
          }
        })
        if (state.workspaces !== null) {
          const new_workspaces = state.workspaces?.map(el => el._id === new_current_workspace?._id ? new_current_workspace : el);
          state.workspaces = new_workspaces;
        }
        state.currentWorkSpace = new_current_workspace;
      }
    });
  },
});
export default WorkSpaceSlice.reducer;
