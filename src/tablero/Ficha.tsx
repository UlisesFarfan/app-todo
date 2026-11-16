import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Nota } from "../api";
import { Lapiz, Tacho } from "../ui/iconos";

type Props = {
  nota: Nota;
  columnaId: string;
  // recién creada: abre para escribir
  nueva: boolean;
  onGuardar: (texto: string) => void;
  onBorrar: () => void;
};

// Las teclas dentro de la ficha no tienen que llegar al arrastre por teclado de dnd-kit.
const sinArrastre = (e: KeyboardEvent) => e.stopPropagation();

export function Ficha({ nota, columnaId, nueva, onGuardar, onBorrar }: Props) {
  const [editando, setEditando] = useState(nueva);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: nota._id,
    data: { tipo: "nota", columnaId },
    disabled: editando,
  });
  const style = { transform: CSS.Translate.toString(transform), transition };

  if (editando) {
    return (
      <div ref={setNodeRef} style={style} className="ficha flex flex-col gap-1.5 p-2.5 pt-1.5">
        <span className="iman mx-auto" />
        <EditorDeFicha
          inicial={nota.task}
          onListo={(texto) => {
            setEditando(false);
            // una ficha nueva que queda vacía no se guarda
            if ((texto ?? nota.task).trim() === "" && nota.task === "") onBorrar();
            else if (texto !== null && texto !== nota.task) onGuardar(texto);
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Ficha: ${nota.task || "vacía"}`}
      onClick={() => setEditando(true)}
      className={`ficha group relative flex cursor-grab flex-col gap-1.5 p-2.5 pt-1.5 active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
    >
      <span className="iman mx-auto" />
      <p className="pr-1 break-words whitespace-pre-wrap">{nota.task || <span className="text-gris italic">Ficha vacía</span>}</p>
      <div className="absolute top-0.5 right-0.5 flex rounded-md bg-papel opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <button
          className="boton-icono size-8"
          aria-label="Editar ficha"
          onKeyDown={sinArrastre}
          onClick={(e) => {
            e.stopPropagation();
            setEditando(true);
          }}
        >
          <Lapiz />
        </button>
        <button
          className="boton-icono size-8 hover:text-rojo"
          aria-label="Borrar ficha"
          onKeyDown={sinArrastre}
          onClick={(e) => {
            e.stopPropagation();
            onBorrar();
          }}
        >
          <Tacho />
        </button>
      </div>
    </div>
  );
}

// Enter guarda, Shift+Enter baja de línea, Escape deja como estaba. onListo(null) = cancelado.
function EditorDeFicha({ inicial, onListo }: { inicial: string; onListo: (texto: string | null) => void }) {
  const [texto, setTexto] = useState(inicial);
  const listo = useRef(false);
  const terminar = (t: string | null) => {
    if (listo.current) return;
    listo.current = true;
    onListo(t);
  };
  return (
    <textarea
      autoFocus
      value={texto}
      maxLength={1000}
      rows={3}
      aria-label="Texto de la ficha"
      placeholder="Escribí la tarea"
      onChange={(e) => setTexto(e.target.value)}
      onFocus={(e) => e.currentTarget.setSelectionRange(texto.length, texto.length)}
      onBlur={() => terminar(texto)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          terminar(texto);
        }
        if (e.key === "Escape") terminar(null);
      }}
      className="w-full resize-none bg-transparent outline-none placeholder:text-gris"
    />
  );
}

// La ficha que sigue al puntero mientras se arrastra.
export function FichaLevantada({ nota, color }: { nota: Nota; color: string }) {
  return (
    <div className="ficha ficha-levantada flex cursor-grabbing flex-col gap-1.5 p-2.5 pt-1.5" style={{ "--marcador": color } as CSSProperties}>
      <span className="iman mx-auto" />
      <p className="break-words whitespace-pre-wrap">{nota.task || <span className="text-gris italic">Ficha vacía</span>}</p>
    </div>
  );
}
