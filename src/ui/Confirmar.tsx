import { useEffect, useRef } from "react";

type Props = {
  abierto: boolean;
  titulo: string;
  texto: string;
  accion: string;
  onConfirmar: () => void;
  onCerrar: () => void;
};

// Pregunta antes de borrar algo que no se puede recuperar. Usa <dialog>: foco, Esc y fondo vienen del navegador.
export default function Confirmar({ abierto, titulo, texto, accion, onConfirmar, onCerrar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (abierto && !d?.open) d?.showModal();
    if (!abierto && d?.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      aria-labelledby="confirmar-titulo"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-borde bg-papel p-6 text-tinta backdrop:bg-black/50"
    >
      <h2 id="confirmar-titulo" className="text-xl font-bold">
        {titulo}
      </h2>
      <p className="mt-2 text-gris">{texto}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="boton-secundario" onClick={onCerrar} autoFocus>
          Cancelar
        </button>
        <button
          className="boton-peligro"
          onClick={() => {
            onConfirmar();
            onCerrar();
          }}
        >
          {accion}
        </button>
      </div>
    </dialog>
  );
}
