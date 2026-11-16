import { Navigate, Route, Routes } from "react-router";
import { useSesion } from "./sesion";
import Inicio from "./paginas/Inicio";
import Tableros from "./paginas/Tableros";
import TableroPagina from "./paginas/TableroPagina";
import Marco from "./ui/Marco";

export default function App() {
  const { usuario, cargando } = useSesion();
  if (cargando) return <p className="p-6 text-gris">Abriendo tu pizarra…</p>;
  // sin sesión, cualquier dirección muestra la portada
  if (!usuario) return <Inicio />;
  return (
    <Routes>
      <Route element={<Marco />}>
        <Route index element={<Tableros />} />
        <Route path="t/:id" element={<TableroPagina />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
