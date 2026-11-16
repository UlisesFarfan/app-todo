import { Link, Outlet } from "react-router";
import { useSesion } from "../sesion";
import { BotonTema } from "./tema";

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <img src="/favicon.svg" alt="" className="size-7" />
      Pizarra
    </span>
  );
}

// La barra de arriba y la página adentro, con sesión abierta.
export default function Marco() {
  const { usuario, salir } = useSesion();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Pizarra, ir a tus tableros" className="rounded-md">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <BotonTema />
          {usuario?.img && <img src={usuario.img} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" />}
          <span className="hidden text-sm text-gris sm:inline">{usuario?.name}</span>
          <button className="boton-secundario py-1.5 text-sm" onClick={salir}>
            Salir
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
