// El color de marcador de una columna. Sale del id, así acompaña a la columna cuando se reordena.
const MARCADORES = ["var(--color-azul)", "var(--color-verde)", "var(--color-rojo)", "var(--color-violeta)", "var(--color-naranja)"];

export function marcador(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return MARCADORES[h % MARCADORES.length];
}
