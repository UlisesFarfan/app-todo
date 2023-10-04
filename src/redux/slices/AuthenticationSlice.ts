import { createSlice } from "@reduxjs/toolkit";
import { GetUserAsync, RegisterAsync, LoginAsync } from "../async/authAsync";
import { initialAuthState } from "../../interface/slice";

const initialState = {
  authUser: null,
  loading: false,
  logged: false,
  accessToken: null,
  error: false,
} as initialAuthState

export const AuthSlice: any = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* LOGIN */
    builder.addCase(RegisterAsync.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(RegisterAsync.fulfilled, (state, _action) => {
      state.error = false;
    });
    builder.addCase(RegisterAsync.rejected, (state) => {
      state.loading = false;
      state.logged = false;
      state.error = true;
    });
    builder.addCase(LoginAsync.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(LoginAsync.fulfilled, (state, { payload }) => {
      state.logged = true;
      state.loading = false
      state.error = false;
      state.accessToken = payload
    });
    builder.addCase(LoginAsync.rejected, (state) => {
      state.loading = false;
      state.logged = false;
      state.error = true;
    });
    builder.addCase(GetUserAsync.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(GetUserAsync.fulfilled, (state, { payload }) => {
      state.accessToken = payload.token;
      state.authUser = payload.userData;
      state.loading = false;
      state.logged = true
      state.error = false;
    });
    builder.addCase(GetUserAsync.rejected, (state) => {
      state.loading = false;
      state.logged = false;
      state.error = true;
      state.accessToken = null;
    });
  },
});
export default AuthSlice.reducer;
