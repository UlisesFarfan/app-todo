import { UserData } from "./user";
import { WorkSpaceResponse } from "./workspace";

export interface initialAuthState {
  authUser: UserData | null;
  loading: boolean;
  logged: boolean;
  accessToken: string | null;
  error: boolean;
}

export interface initialWorkSpaceState {
  workspaces: any[] | WorkSpaceResponse[] | null;
  currentWorkSpace: WorkSpaceResponse | null;
  loading: boolean;
  error: boolean;
}