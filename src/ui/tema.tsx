import { useSyncExternalStore } from "react";

// El tema sale del sistema, salvo que se elija con el botón: queda en data-tema de <html>
// (los colores están en index.css) y en localStorage (index.html lo aplica al abrir).
const OSCURO = "(prefers-color-scheme: dark)";
const CAMBIO = "tema-cambiado";

function escuchar(avisar: () => void) {
  const m = matchMedia(OSCURO);
  m.addEventListener("change", avisar);
  window.addEventListener(CAMBIO, avisar);
  return () => {
    m.removeEventListener("change", avisar);
    window.removeEventListener(CAMBIO, avisar);
  };
}

function esOscuro() {
  const elegido = document.documentElement.dataset.tema;
  return elegido ? elegido === "oscuro" : matchMedia(OSCURO).matches;
}

export const useTemaOscuro = () => useSyncExternalStore(escuchar, esOscuro);

function cambiarTema() {
  const tema = esOscuro() ? "claro" : "oscuro";
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem("tema", tema);
  } catch {
    // sin localStorage vale hasta recargar
  }
  window.dispatchEvent(new Event(CAMBIO));
}

export function BotonTema() {
  const oscuro = useTemaOscuro();
  return (
    <button className="boton-icono" onClick={cambiarTema} aria-label={oscuro ? "Usar tema claro" : "Usar tema oscuro"}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
