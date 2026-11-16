// Habla con la API (api-todo, en AWS). Toda respuesta es {code, status, message, data};
// si falla, message es para mostrarle al usuario.

export type Usuario = { _id: string; name: string; email: string; img: string };
export type Nota = { _id: string; task: string };
export type Columna = { _id: string; name: string; notes: Nota[] };
export type TableroResumen = { _id: string; name: string };
export type Tablero = TableroResumen & { columns: Columna[] };

const BASE = import.meta.env.VITE_API_ENDPOINT ?? "";
const CLAVE = "access_token";

export const token = {
  leer: () => localStorage.getItem(CLAVE),
  guardar: (t: string) => localStorage.setItem(CLAVE, t),
  borrar: () => localStorage.removeItem(CLAVE),
};

export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

// Evento que escucha la sesión: la API dijo 401, hay que volver a entrar.
export const SESION_VENCIDA = "sesion-vencida";

export async function api<T = unknown>(metodo: string, ruta: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const t = token.leer();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(BASE + ruta, { method: metodo, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ErrorApi(0, "No hay conexión con el servidor. Revisá tu internet y probá de nuevo.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && t) window.dispatchEvent(new Event(SESION_VENCIDA));
    throw new ErrorApi(res.status, json?.message || "Algo salió mal. Probá de nuevo.");
  }
  return json?.data as T;
}
