import type { Columna } from "../api";

// Funciones puras para el arrastre: devuelven columnas nuevas, no tocan las de entrada.

export function columnaDeNota(cols: Columna[], notaId: string) {
  return cols.find((c) => c.notes.some((n) => n._id === notaId))?._id;
}

// moverNota saca la nota de donde esté y la pone en la columna destino, en la posición
// indice (o al final). Sirve para pasar de columna y para reordenar dentro de una.
export function moverNota(cols: Columna[], notaId: string, destino: string, indice?: number): Columna[] {
  const nota = cols.flatMap((c) => c.notes).find((n) => n._id === notaId);
  if (!nota || !cols.some((c) => c._id === destino)) return cols;
  return cols.map((c) => {
    const notes = c.notes.filter((n) => n._id !== notaId);
    if (c._id === destino) notes.splice(indice ?? notes.length, 0, nota);
    return { ...c, notes };
  });
}

// cambioDeOrden: los ids de las notas de la columna, si cambiaron respecto de antes; si no, null.
export function cambioDeOrden(antes: Columna[], ahora: Columna[], columnaId: string) {
  const ids = (cols: Columna[]) => cols.find((c) => c._id === columnaId)?.notes.map((n) => n._id) ?? [];
  const a = ids(antes);
  const b = ids(ahora);
  return a.length === b.length && a.every((id, i) => id === b[i]) ? null : b;
}
