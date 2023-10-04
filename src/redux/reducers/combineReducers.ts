import { CombinedState, Reducer, combineReducers } from "@reduxjs/toolkit";
import AuthSlice from "../slices/AuthenticationSlice";
import WorkSpaceSlice from "../slices/WorkSpace";
import { initialAuthState, initialWorkSpaceState } from "../../interface/slice";

export interface initialState {
  auth: initialAuthState;
  workspace: initialWorkSpaceState;
}

const rootReducer: Reducer<CombinedState<initialState>, any> = combineReducers({
  // Add the generated reducer as a specific top-level slice
  auth: AuthSlice,
  workspace: WorkSpaceSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
