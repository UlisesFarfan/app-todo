import { gapi } from "gapi-script";
import { GoogleLogin, useGoogleLogout } from "react-google-login"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Avatar, Skeleton, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { GetWorkSpaceAsync, PostWorkSpaceAsync } from "../redux/async/workspaceAsync";
import { RegisterAsync, LoginAsync } from "../redux/async/authAsync";
import { CreateUser, Login } from "../interface/user";
import { useEffect } from "react";
import { setCurrentWorkSpace } from "../redux/slices/WorkSpace";
import { initialState } from "../redux/reducers/combineReducers";
import PlusIcon from "../icons/PlusIcon";
import { SocialLink, TwitterIcon, InstagramIcon, GitHubIcon, LinkedInIcon } from "./SocialIcons";

const NavBar = () => {
  const clientId = import.meta.env.VITE_CLIENT_ID
  gapi.load("client:auth2", () => {
    gapi.client.init({
      clientId: clientId,
    });
  });
  const items: Iterable<object> | undefined = [];

  const dispatch = useAppDispatch();
  const { workspaces, loading } = useAppSelector((state: initialState) => state.workspace);
  const { logged, authUser } = useAppSelector((state: initialState) => state.auth);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { signOut } = useGoogleLogout({
    clientId: import.meta.env.VITE_CLIENT_ID
  })

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

  useEffect(() => {
    dispatch(GetWorkSpaceAsync())
  }, [logged])

  return (
    <nav className="flex fixed justify-center w-full bg-transparent py-2 overflow-auto overflow-x-scroll">
      <div className="w-full flex justify-between max-w-[1200px]">
        {
          workspaces !== null && logged ?
            <div className="flex gap-4">
              {workspaces.length > 0 &&
                <Dropdown className="bg-slate-900">
                  <Skeleton isLoaded={!loading} className="rounded-lg dark">
                    <DropdownTrigger>
                      <Button
                        variant="solid"
                        className="bg-slate-900 text-slate-50"
                        isDisabled={loading}
                      >
                        Work Spaces
                      </Button>
                    </DropdownTrigger>
                  </Skeleton>
                  <DropdownMenu aria-label="Dynamic Actions" items={workspaces !== null ? workspaces : []}>
                    {(item: any) => (
                      <DropdownItem
                        key={item._id}
                        onClick={() => dispatch(setCurrentWorkSpace(item))}
                      >
                        <div className="flex flex-col w-full">
                          <span>
                            {item.name}
                          </span>
                          {item.users && item.users.map((el: any) => {
                            if (authUser != null && el.user_id === authUser._id) {
                              return (
                                <span className="text-lime-600 flex justify-end" key={item._id}>
                                  {el.role}
                                </span>
                              )
                            }
                          })}
                        </div>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>}
              <Button className="dark" variant="ghost"
                onPress={() => {
                  if (authUser)
                    dispatch(PostWorkSpaceAsync({ user_id: authUser._id, name: "New WorkSpace" }))
                      .unwrap()
                      .then(() => {
                        dispatch(GetWorkSpaceAsync())
                      })
                }}
              >
                Add a Work space
                <PlusIcon />
              </Button>
              <div>
                <Button onPress={onOpen} className="dark">About</Button>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark">
                  <ModalContent>
                    {() => (
                      <>
                        <ModalHeader className="flex gap-1">Todo App by <a href="https://ulises-farfan.vercel.app/" className="text-blue-500" target="_blank">Ulises Farfan</a></ModalHeader>
                        <ModalBody>
                          <p>
                            A todo app development with:
                          </p>
                          <p>
                            Frontend: React, TypeScript, JavaScript, TailwindCss, NextUi, Redux Toolkit, Google Login and Dnd Kit.
                          </p>
                          <p>
                            Backend: Golang, Gin Gonic, JWT, MongoDb
                          </p>
                        </ModalBody>
                        <ModalFooter>
                          <div className="mt-6 flex gap-6 w-full">
                            <SocialLink
                              href="https://twitter.com/Uli_Dev"
                              aria-label="Follow on Twitter"
                              icon={TwitterIcon}
                            />
                            <SocialLink
                              href="https://instagram.com/ulises_farfan.developer?igshid=ZDdkNTZiNTM="
                              aria-label="Follow on Instagram"
                              icon={InstagramIcon}
                            />
                            <SocialLink
                              href="https://github.com/UlisesFarfan"
                              aria-label="Follow on GitHub"
                              icon={GitHubIcon}
                            />
                            <SocialLink
                              href="https://www.linkedin.com/in/ulises-farfan/"
                              aria-label="Follow on LinkedIn"
                              icon={LinkedInIcon}
                            />
                          </div>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </div>
            :
            <div>
              <Button onPress={onOpen} className="dark">About</Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark">
                <ModalContent>
                  {() => (
                    <>
                      <ModalHeader className="flex gap-1">Todo App by <a href="https://ulises-farfan.vercel.app/" className="text-blue-500" target="_blank">Ulises Farfan</a></ModalHeader>
                      <ModalBody>
                        <p>
                          A todo app development with:
                        </p>
                        <p>
                          Frontend: React, TypeScript, JavaScript, TailwindCss, NextUi, Redux Toolkit, Google Login and Dnd Kit.
                        </p>
                        <p>
                          Backend: Golang, Gin Gonic, JWT, MongoDb
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <div className="mt-6 flex gap-6 w-full">
                          <SocialLink
                            href="https://twitter.com/Uli_Dev"
                            aria-label="Follow on Twitter"
                            icon={TwitterIcon}
                          />
                          <SocialLink
                            href="https://instagram.com/ulises_farfan.developer?igshid=ZDdkNTZiNTM="
                            aria-label="Follow on Instagram"
                            icon={InstagramIcon}
                          />
                          <SocialLink
                            href="https://github.com/UlisesFarfan"
                            aria-label="Follow on GitHub"
                            icon={GitHubIcon}
                          />
                          <SocialLink
                            href="https://www.linkedin.com/in/ulises-farfan-85ab27223/"
                            aria-label="Follow on LinkedIn"
                            icon={LinkedInIcon}
                          />
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
        }
        {logged ?
          <Dropdown className="bg-slate-900">
            <DropdownTrigger >
              <Button
                variant="solid"
                className="bg-slate-900 text-slate-50 ml-4"
              >
                {authUser !== null ? authUser.name : ""}
                <Avatar src={authUser !== null ? authUser.img : ""} size="sm" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Dynamic Actions" items={items}>
              <DropdownItem
                color="danger"
                onClick={() => {
                  signOut()
                  location.reload();
                  localStorage.removeItem("access_token")
                }}
              >
                SignOut
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          :
          <GoogleLogin
            clientId={clientId}
            onSuccess={handleSuccess}
            onFailure={(e) => console.log(e)}
          />
        }
      </div>
    </nav >
  )
}

export default NavBar