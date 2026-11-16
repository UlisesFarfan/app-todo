import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api, type TableroResumen } from "../api";
import { marcador } from "../ui/marcador";

// La lista de tableros del usuario, y crear uno nuevo.
export default function Tableros() {
  const [tableros, setTableros] = useState<TableroResumen[] | null>(null);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const navigate = useNavigate();

  function cargar() {
    setError("");
    api<TableroResumen[]>("GET", "/api/work_space")
      .then(setTableros)
      .catch((e: Error) => setError(e.message));
  }
  useEffect(cargar, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const t = await api<TableroResumen>("POST", "/api/work_space", { name: nombre });
      navigate(`/t/${t._id}`);
    } catch (e) {
      setError((e as Error).message);
      setCreando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Tus tableros</h1>

      <form onSubmit={crear} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="nombre-tablero" className="sr-only">
          Nombre del tablero nuevo
        </label>
        <input
          id="nombre-tablero"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={100}
          placeholder="Nombre del tablero nuevo, por ejemplo Mudanza"
          className="ficha min-w-0 flex-1 px-3 py-2"
        />
        <button className="boton-primario" disabled={creando || !nombre.trim()}>
          Crear tablero
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 font-bold text-rojo">
          {error}{" "}
          {!tableros && (
            <button className="underline" onClick={cargar}>
              Probar de nuevo
            </button>
          )}
        </p>
      )}

      {tableros === null && !error && <p className="mt-8 text-gris">Buscando tus tableros…</p>}

      {tableros?.length === 0 && (
        <p className="mt-8 max-w-prose text-gris">
          Todavía no tenés tableros. Escribí un nombre arriba y creá el primero: después le sumás columnas y fichas.
        </p>
      )}

      {tableros && tableros.length > 0 && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tableros.map((t) => (
            <li key={t._id}>
              <Link
                to={`/t/${t._id}`}
                className="ficha flex h-full min-h-24 flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5"
                style={{ "--marcador": marcador(t._id) } as CSSProperties}
              >
                <span className="iman" />
                <span className="font-display text-lg font-bold">{t.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
