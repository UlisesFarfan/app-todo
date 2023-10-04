import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CreateUser, Login, LoginResponse } from "../../interface/user";
import { WebResponse } from "../../interface/api_response";

export const RegisterAsync = createAsyncThunk(
  "auth/register",
  async (registerData: CreateUser, thunkApi) => {
    try {
      // Send request to login
      await axios({
        method: "POST",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/authentication/register",
        headers: {
          Accept: "application/json",
        },
        data: registerData,
      });
      return ""
    } catch (error: any) {
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const LoginAsync = createAsyncThunk(
  "auth/login",
  async (loginData: Login, thunkApi) => {
    try {
      const { data } = await axios<WebResponse<LoginResponse>>({
        method: "POST",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/authentication/login",
        headers: {
          Accept: "application/json",
        },
        data: loginData,
      });
      localStorage.setItem("access_token", data.data.token)
      return data.data.token
    } catch (error: any) {
      // If error, return error message
      console.log(error.response.data.message)
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

export const GetUserAsync = createAsyncThunk(
  "auth/getuser",
  async (_, thunkApi) => {
    try {
      const token = localStorage.getItem("access_token")
      const { data } = await axios({
        method: "GET",
        url: import.meta.env.VITE_API_ENDPOINT + "/api/authentication/",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      return {
        userData: data.data,
        token: token
      }
    } catch (error: any) {
      console.log(error)
      // If error, return error message
      throw thunkApi.rejectWithValue(error.response.data.message);
    }
  }
);

