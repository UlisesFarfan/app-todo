import { useRef, useState, type CSSProperties } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Columna } from "../api";
import { marcador } from "../ui/marcador";
import { Lapiz, Mas, Tacho } from "../ui/iconos";
import { Ficha } from "./Ficha";

type Props = {
  columna: Columna;
  // recién creada: abre el nombre para escribir
  nueva: boolean;
  notaNueva: string | null;
  onRenombrar: (nombre: string) => void;
  onBorrar: () => void;
  onNuevaNota: () => void;
  onGuardarNota: (notaId: string, texto: string) => void;
  onBorrarNota: (notaId: string) => void;
};

export function ColumnaTablero({ columna, nueva, notaNueva, onRenombrar, onBorrar, onNuevaNota, onGuardarNota, onBorrarNota }: Props) {
  const [editando, setEditando] = useState(nueva);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: columna._id,
    data: { tipo: "columna" },
    disabled: editando,
  });
  const color = marcador(columna._id);
  const nombre = columna.name || "Sin nombre";

  return (
    <section
      ref={setNodeRef}
      aria-label={`Columna ${nombre}`}
      style={{ transform: CSS.Translate.toString(transform), transition, "--marcador": color } as CSSProperties}
      className={`flex max-h-full w-[min(20rem,85vw)] shrink-0 snap-start flex-col rounded-lg bg-pizarra-hondo ${isDragging ? "opacity-40" : ""}`}
    >
      <header
        {...attributes}
        {...listeners}
        aria-label={`Mover columna ${nombre}`}
        className="flex cursor-grab items-center gap-1 rounded-t-lg border-b-4 py-2 pr-1.5 pl-3 active:cursor-grabbing"
        style={{ borderColor: color }}
      >
        {editando ? (
          <EditorDeNombre
            inicial={columna.name}
            onListo={(n) => {
              setEditando(false);
              if (n !== null && n !== columna.name) onRenombrar(n);
            }}
          />
        ) : (
          <h2 className="min-w-0 flex-1 truncate text-lg font-bold" onDoubleClick={() => setEditando(true)}>
            {nombre}
          </h2>
        )}
        <span className="px-1.5 font-display text-sm font-bold text-gris tabular-nums" aria-label={`${columna.notes.length} fichas`}>
          {columna.notes.length}
        </span>
        <button className="boton-icono" aria-label={`Renombrar columna ${nombre}`} onKeyDown={(e) => e.stopPropagation()} onClick={() => setEditando(true)}>
          <Lapiz />
        </button>
        <button className="boton-icono hover:text-rojo" aria-label={`Borrar columna ${nombre}`} onKeyDown={(e) => e.stopPropagation()} onClick={onBorrar}>
          <Tacho />
        </button>
      </header>

      <SortableContext items={columna.notes.map((n) => n._id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-14 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
          {columna.notes.map((n) => (
            <Ficha
              key={n._id}
              nota={n}
              columnaId={columna._id}
              nueva={n._id === notaNueva}
              onGuardar={(t) => onGuardarNota(n._id, t)}
              onBorrar={() => onBorrarNota(n._id)}
            />
          ))}
        </div>
      </SortableContext>

      <button className="boton mx-2.5 mb-2.5 justify-start text-gris hover:bg-pizarra hover:text-tinta" onClick={onNuevaNota}>
        <Mas /> Agregar ficha
      </button>
    </section>
  );
}

function EditorDeNombre({ inicial, onListo }: { inicial: string; onListo: (nombre: string | null) => void }) {
  const [nombre, setNombre] = useState(inicial);
  const listo = useRef(false);
  const terminar = (n: string | null) => {
    if (listo.current) return;
    listo.current = true;
    onListo(n);
  };
  return (
    <input
      autoFocus
      value={nombre}
      maxLength={100}
      aria-label="Nombre de la columna"
      onChange={(e) => setNombre(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => terminar(nombre)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") terminar(nombre);
        if (e.key === "Escape") terminar(null);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="min-w-0 flex-1 rounded border border-borde bg-papel px-2 py-1 font-display text-lg font-bold"
    />
  );
}
