import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { initialState } from "../redux/reducers/combineReducers";
import { useNavigate } from "react-router-dom";
import appimg from "../assets/appimg.png";
import { Button } from "@nextui-org/react";
import { useGoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { CreateUser, Login } from "../interface/user";
import { RegisterAsync, LoginAsync } from "../redux/async/authAsync";

const PublicHome = () => {
  const clientId = import.meta.env.VITE_CLIENT_ID
  gapi.load("client:auth2", () => {
    gapi.client.init({
      clientId: clientId,
    });
  });
  const dispatch = useAppDispatch()
  const handleSuccess = async (e: any) => {
    const createData = {
      name: e.profileObj.name,
      email: e.profileObj.email,
      img: e.profileObj.imageUrl,
      password: e.profileObj.googleId
    } as CreateUser
    const loginData = {
      email: e.profileObj.email,
      password: e.profileObj.googleId
    } as Login
    await dispatch(RegisterAsync(createData))
      .unwrap()
      .then(() => {
        dispatch(LoginAsync(loginData))
      })
      .catch(() => {
        dispatch(LoginAsync(loginData))
      })
  }
  const { signIn } = useGoogleLogin({
    onSuccess: handleSuccess,
    clientId,
  })
  const { logged, loading } = useAppSelector((state: initialState) => state.auth)
  const navigate = useNavigate();
  useEffect(() => {
    if (logged) {
      navigate("/");
    }
  }, [logged])
  return (
    <div className="flex w-full h-full justify-center items-center">
      {!logged && !loading &&
        <div className="max-w-[1200px] flex flex-col xl:flex-row">
          <div className="gap-4 flex flex-col">
            <span className="text-3xl">
              <p className="text-sky-500" >
                Do you ever feel like tasks are piling up and becoming overwhelming?
              </p>
              So do we! But don't worry, we're here to help you regain control of your daily life.
            </span>
            <div>
              <Button variant="solid" className="dark" color="primary" onClick={signIn} >
                Get Started
              </Button>
            </div>
          </div>
          <img src={appimg} alt="illustration of the application" className="w-[45rem]" />
        </div>
      }
    </div>
  )
}

export default PublicHome;