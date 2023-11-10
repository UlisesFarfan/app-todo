import { Route, Routes } from "react-router-dom";
import "./App.css";
import KanbanBoard from "./views/KanbanBoard";
import Layout from "./layouts/Layout";
import AuthenticatedMiddleware from "./middlewares/AuthMiddleware";
import PublicHome from "./views/PublicHome";
import PrivateHome from "./views/PrivateHome";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<AuthenticatedMiddleware />}>
          <Route path="/" element={<PrivateHome />} />
          <Route path="/workspace" element={<KanbanBoard />} />
        </Route>
        <Route path="/home" element={<PublicHome />} />
      </Route>
    </Routes>
  );
}

export default App;
