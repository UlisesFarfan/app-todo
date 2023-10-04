import { Route, Routes } from "react-router-dom";
import "./App.css";
import KanbanBoard from "./components/KanbanBoard";
import Layout from "./layouts/Layout";
import AuthenticatedMiddleware from "./middlewares/AuthMiddleware";
import Home from "./views/Home";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<AuthenticatedMiddleware />}>
          <Route path="/" element={<KanbanBoard />} />
        </Route>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
