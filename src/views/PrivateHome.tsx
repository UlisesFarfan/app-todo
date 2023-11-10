import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { initialState } from "../redux/reducers/combineReducers";
import { GetWorkSpaceAsync } from "../redux/async/workspaceAsync";

const PrivateHome = () => {
  const { workspaces } = useAppSelector((state: initialState) => state.workspace);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(GetWorkSpaceAsync());
  }, []);
  return (
    <div className="w-full h-full justify-center items-center flex" >
      {workspaces !== null && workspaces.length > 0 ?
        <p className="text-4xl pb-[10rem]">
          Select one of your workspaces to see your pending tasks!
        </p>
        :
        <p className="text-4xl pb-[10rem]">
          Create your first workspace and start organizing your day!
        </p>}
    </div>
  );
};

export default PrivateHome;