import { useState, type CSSProperties } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useSesion } from "../sesion";
import { Logo } from "../ui/Marco";
import { BotonTema, useTemaOscuro } from "../ui/tema";

// La portada, sin sesión: qué es y el botón de Google.
export default function Inicio() {
  const { entrar } = useSesion();
  const [error, setError] = useState("");
  const oscuro = useTemaOscuro();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <BotonTema />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[5fr_7fr]">
        <div className="max-w-xl">
          <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">Tu día, en fichas.</h1>
          <p className="mt-5 text-lg text-gris">
            Armá un tablero por proyecto, sumá las columnas que necesites y arrastrá cada tarea hasta Hecho. Se guarda solo.
          </p>
          <div className="mt-8 min-h-11">
            <GoogleLogin
              // el botón lo dibuja Google: se vuelve a crear al cambiar de tema
              key={oscuro ? "oscuro" : "claro"}
              theme={oscuro ? "filled_black" : "outline"}
              onSuccess={(r) => {
                setError("");
                if (r.credential) entrar(r.credential).catch((e: Error) => setError(e.message));
              }}
              onError={() => setError("Google no respondió. Probá de nuevo.")}
              text="continue_with"
              shape="pill"
              size="large"
            />
          </div>
          {error && (
            <p role="alert" className="mt-3 font-bold text-rojo">
              {error}
            </p>
          )}
        </div>

        <PizarraDeMuestra />
      </main>

      <footer className="px-4 py-6 text-sm text-gris sm:px-6">
        Hecha por{" "}
        <a className="underline hover:text-tinta" href="https://ulises-farfan.vercel.app/" target="_blank" rel="noreferrer">
          Ulises Farfan
        </a>
        . El código está en{" "}
        <a className="underline hover:text-tinta" href="https://github.com/UlisesFarfan" target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </footer>
    </div>
  );
}

const MUESTRA = [
  { nombre: "Pendiente", color: "var(--color-azul)", fichas: ["Llamar al dentista"] },
  { nombre: "Haciendo", color: "var(--color-verde)", fichas: ["Terminar el informe", "Ordenar fotos"] },
  { nombre: "Hecho", color: "var(--color-rojo)", fichas: ["Pagar la luz"] },
];

// Una pizarra de adorno: la primera ficha viaja de Pendiente a Hecho al abrir.
// Las medidas (gap 12px, padding 10px) son las que usa la animación "viaje".
function PizarraDeMuestra() {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-3 rounded-xl border border-borde bg-papel/50 p-3 select-none">
      {MUESTRA.map((col, i) => (
        <div key={col.nombre} className="flex flex-col gap-2.5 rounded-lg bg-pizarra-hondo p-2.5">
          <p className="border-b-4 pb-1 font-display text-sm font-bold sm:text-base" style={{ borderColor: col.color }}>
            {col.nombre}
          </p>
          {i === 0 && <FichaDeMuestra texto="Responder los mails" color="var(--color-rojo)" viaja />}
          {i === 2 && <div className="h-18 rounded-md border-2 border-dashed border-borde" />}
          {col.fichas.map((f) => (
            <FichaDeMuestra key={f} texto={f} color={col.color} />
          ))}
        </div>
      ))}
    </div>
  );
}

function FichaDeMuestra({ texto, color, viaja }: { texto: string; color: string; viaja?: boolean }) {
  return (
    <div
      className={`ficha relative flex h-18 flex-col gap-1.5 px-2.5 pt-1.5 text-xs leading-snug sm:text-sm ${viaja ? "viaja z-10" : ""}`}
      style={{ "--marcador": color } as CSSProperties}
    >
      <span className="iman mx-auto" />
      {texto}
    </div>
  );
}
