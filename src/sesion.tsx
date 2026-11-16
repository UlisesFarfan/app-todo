import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { googleLogout } from "@react-oauth/google";
import { api, token, SESION_VENCIDA, type Usuario } from "./api";

type Sesion = {
  usuario: Usuario | null;
  // true mientras se revisa el token guardado al abrir la app
  cargando: boolean;
  entrar: (credential: string) => Promise<void>;
  salir: () => Promise<void>;
};

const Ctx = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(() => token.leer() !== null);

  useEffect(() => {
    if (!token.leer()) return;
    api<Usuario>("GET", "/api/authentication")
      .then(setUsuario)
      // un 401 ya borra el token (SESION_VENCIDA); otro error deja entrar de nuevo
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const vencida = () => {
      token.borrar();
      setUsuario(null);
    };
    window.addEventListener(SESION_VENCIDA, vencida);
    return () => window.removeEventListener(SESION_VENCIDA, vencida);
  }, []);

  async function entrar(credential: string) {
    const r = await api<{ token: string; user: Usuario }>("POST", "/api/authentication/google", { credential });
    token.guardar(r.token);
    setUsuario(r.user);
  }

  async function salir() {
    // si la API no responde igual se sale de este navegador; la sesión vence sola
    await api("POST", "/api/authentication/logout").catch(() => {});
    token.borrar();
    googleLogout();
    setUsuario(null);
  }

  return <Ctx value={{ usuario, cargando, entrar, salir }}>{children}</Ctx>;
}

export function useSesion() {
  const s = use(Ctx);
  if (!s) throw new Error("useSesion fuera de SesionProvider");
  return s;
}
