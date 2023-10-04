import { Outlet } from "react-router-dom"
import NavBar from "../components/NavBar"

const Layout = () => {

  return (
    <div className="h-screen w-screen">
      <NavBar />
      <Outlet />
    </div>
  )
}

export default Layout