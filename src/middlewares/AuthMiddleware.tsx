import { Await, Navigate, Outlet } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { GetUserAsync } from "../redux/async/authAsync";
import { useEffect } from "react";
import { initialState } from "../redux/reducers/combineReducers";

const AuthenticatedMiddleware = () => {
  const { authUser, logged, accessToken } = useAppSelector((state: initialState) => state.auth);
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(GetUserAsync())
  }, [logged, accessToken])
  return (
    <Await
      resolve={authUser}
      children={() => (logged === true ? <Outlet /> : <Navigate to="/home" />)}
    />
  );
};

export default AuthenticatedMiddleware;