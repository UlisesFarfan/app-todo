import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { api, type Columna, type Nota, type Tablero } from "../api";
import { ColumnaTablero } from "../tablero/ColumnaTablero";
import { FichaLevantada } from "../tablero/Ficha";
import { cambioDeOrden, columnaDeNota, moverNota } from "../tablero/mover";
import { marcador } from "../ui/marcador";
import Confirmar from "../ui/Confirmar";
import { Lapiz, Mas, Tacho, Volver } from "../ui/iconos";

type ABorrar = { tipo: "tablero" } | { tipo: "columna"; columna: Columna };

const anuncios = {
  onDragStart: () => "Levantaste el elemento. Movelo con las flechas.",
  onDragOver: () => "Moviendo.",
  onDragEnd: () => "Lo soltaste.",
  onDragCancel: () => "Cancelaste el movimiento: quedó donde estaba.",
};
const instrucciones = {
  draggable: "Para moverlo, apretá espacio o Enter, usá las flechas y volvé a apretar espacio o Enter para soltarlo. Escape cancela.",
};

export default function TableroPagina() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tablero, setTablero] = useState<Tablero | null>(null);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [errorCarga, setErrorCarga] = useState("");
  // un cambio que la API no guardó; el tablero vuelve a como está en el servidor
  const [aviso, setAviso] = useState("");
  const [renombrando, setRenombrando] = useState(false);
  const [aBorrar, setABorrar] = useState<ABorrar | null>(null);
  const [nueva, setNueva] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState<{ nota?: Nota; columna?: Columna } | null>(null);
  const antesDeArrastrar = useRef<Columna[]>([]);

  const cargar = useCallback(
    () =>
      api<Tablero>("GET", `/api/work_space/${id}`)
        .then((t) => {
          setTablero(t);
          setColumnas(t.columns);
        })
        .catch((e: Error) => setErrorCarga(e.message)),
    [id],
  );
  useEffect(() => {
    setTablero(null);
    setErrorCarga("");
    cargar();
  }, [cargar]);

  // Los cambios se ven al instante; si la API falla, se avisa y se recarga lo guardado.
  function guardar(p: Promise<unknown>) {
    p.catch((e: Error) => {
      setAviso(e.message);
      cargar();
    });
  }

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // en el celular hay que mantener apretado, así el dedo igual puede scrollear
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!tablero) {
    return (
      <div className="px-4 py-8 sm:px-6">
        {errorCarga ? (
          <p role="alert" className="font-bold text-rojo">
            {errorCarga}{" "}
            <Link to="/" className="underline">
              Volver a tus tableros
            </Link>
          </p>
        ) : (
          <p className="text-gris">Abriendo el tablero…</p>
        )}
      </div>
    );
  }

  // ---------- Acciones ----------

  function renombrarTablero(nombre: string) {
    setRenombrando(false);
    nombre = nombre.trim();
    if (!nombre || nombre === tablero!.name) return;
    setTablero({ ...tablero!, name: nombre });
    guardar(api("PATCH", "/api/work_space", { _id: id, name: nombre }));
  }

  async function borrarTablero() {
    try {
      await api("DELETE", `/api/work_space/${id}`);
      navigate("/");
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  async function nuevaColumna() {
    try {
      const c = await api<Columna>("POST", "/api/column", { workspace_id: id, name: "Columna nueva" });
      setColumnas((cols) => [...cols, c]);
      setNueva(c._id);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  function renombrarColumna(colId: string, name: string) {
    setColumnas((cols) => cols.map((c) => (c._id === colId ? { ...c, name } : c)));
    guardar(api("PATCH", "/api/column", { _id: colId, name }));
  }

  function borrarColumna(colId: string) {
    setColumnas((cols) => cols.filter((c) => c._id !== colId));
    guardar(api("DELETE", `/api/column/${colId}`));
  }

  async function nuevaNota(colId: string) {
    try {
      const n = await api<Nota>("POST", "/api/note", { column_id: colId, task: "" });
      setColumnas((cols) => cols.map((c) => (c._id === colId ? { ...c, notes: [...c.notes, n] } : c)));
      setNueva(n._id);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  function guardarNota(notaId: string, task: string) {
    setNueva(null);
    setColumnas((cols) => cols.map((c) => ({ ...c, notes: c.notes.map((n) => (n._id === notaId ? { ...n, task } : n)) })));
    guardar(api("PATCH", "/api/note", { _id: notaId, task }));
  }

  function borrarNota(notaId: string) {
    setNueva(null);
    setColumnas((cols) => cols.map((c) => ({ ...c, notes: c.notes.filter((n) => n._id !== notaId) })));
    guardar(api("DELETE", `/api/note/${notaId}`));
  }

  // ---------- Arrastre ----------

  function alEmpezar({ active }: DragStartEvent) {
    setNueva(null);
    antesDeArrastrar.current = columnas;
    const activoId = String(active.id);
    if (active.data.current?.tipo === "columna") setArrastrando({ columna: columnas.find((c) => c._id === activoId) });
    else setArrastrando({ nota: columnas.flatMap((c) => c.notes).find((n) => n._id === activoId) });
  }

  // Al pasar sobre otra columna, la ficha se muda ahí (todavía sin guardar).
  function alPasar({ active, over }: DragOverEvent) {
    if (!over || active.data.current?.tipo !== "nota") return;
    const notaId = String(active.id);
    const overId = String(over.id);
    setColumnas((cols) => {
      const desde = columnaDeNota(cols, notaId);
      const hacia = over.data.current?.tipo === "columna" ? overId : columnaDeNota(cols, overId);
      if (!desde || !hacia || desde === hacia) return cols;
      const i = cols.find((c) => c._id === hacia)!.notes.findIndex((n) => n._id === overId);
      return moverNota(cols, notaId, hacia, i < 0 ? undefined : i);
    });
  }

  function alSoltar({ active, over }: DragEndEvent) {
    setArrastrando(null);
    if (!over) {
      setColumnas(antesDeArrastrar.current);
      return;
    }
    const activoId = String(active.id);
    const overId = String(over.id);

    if (active.data.current?.tipo === "columna") {
      const hacia = over.data.current?.tipo === "nota" ? columnaDeNota(columnas, overId) : overId;
      const de = columnas.findIndex((c) => c._id === activoId);
      const a = columnas.findIndex((c) => c._id === hacia);
      if (de < 0 || a < 0 || de === a) return;
      const nuevas = arrayMove(columnas, de, a);
      setColumnas(nuevas);
      guardar(api("PUT", "/api/work_space", { _id: id, columns: nuevas.map((c) => c._id) }));
      return;
    }

    let cols = columnas;
    const hacia = columnaDeNota(cols, activoId);
    if (!hacia) return;
    if (over.data.current?.tipo === "nota" && overId !== activoId && columnaDeNota(cols, overId) === hacia) {
      cols = moverNota(cols, activoId, hacia, cols.find((c) => c._id === hacia)!.notes.findIndex((n) => n._id === overId));
      setColumnas(cols);
    }
    // La API saca la ficha de su columna anterior sola: alcanza con mandar la de destino.
    const ids = cambioDeOrden(antesDeArrastrar.current, cols, hacia);
    if (ids) guardar(api("PUT", "/api/column", { _id: hacia, notes: ids }));
  }

  // ---------- Pantalla ----------

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-2 pb-4 sm:px-6">
        <Link to="/" className="boton-icono" aria-label="Volver a tus tableros">
          <Volver />
        </Link>
        {renombrando ? (
          <input
            autoFocus
            defaultValue={tablero.name}
            maxLength={100}
            aria-label="Nombre del tablero"
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => renombrarTablero(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setRenombrando(false);
            }}
            className="min-w-0 flex-1 rounded-md border border-borde bg-papel px-2 py-1 font-display text-3xl font-extrabold sm:flex-none"
          />
        ) : (
          <h1 className="min-w-0 truncate text-3xl font-extrabold tracking-tight">{tablero.name}</h1>
        )}
        {!renombrando && (
          <button className="boton-icono" aria-label="Renombrar tablero" onClick={() => setRenombrando(true)}>
            <Lapiz />
          </button>
        )}
        <button className="boton-secundario ml-auto py-1.5 text-sm text-rojo" onClick={() => setABorrar({ tipo: "tablero" })}>
          <Tacho /> Borrar tablero
        </button>
      </div>

      {aviso && (
        <div role="alert" className="mx-4 mb-4 flex flex-wrap items-center gap-3 rounded-md border border-rojo/40 bg-papel px-4 py-3 sm:mx-6">
          <p className="flex-1">
            <strong className="text-rojo">No se guardó el último cambio.</strong> {aviso} El tablero volvió a como está guardado.
          </p>
          <button className="boton-secundario py-1 text-sm" onClick={() => setAviso("")}>
            Entendido
          </button>
        </div>
      )}

      <DndContext
        sensors={sensores}
        collisionDetection={closestCorners}
        onDragStart={alEmpezar}
        onDragOver={alPasar}
        onDragEnd={alSoltar}
        onDragCancel={() => {
          setArrastrando(null);
          setColumnas(antesDeArrastrar.current);
        }}
        accessibility={{ announcements: anuncios, screenReaderInstructions: instrucciones }}
      >
        <div className="flex min-h-0 flex-1 snap-x scroll-px-4 items-start gap-4 overflow-x-auto px-4 pb-6 sm:scroll-px-6 sm:px-6">
          <SortableContext items={columnas.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
            {columnas.map((c) => (
              <ColumnaTablero
                key={c._id}
                columna={c}
                nueva={c._id === nueva}
                notaNueva={nueva}
                onRenombrar={(n) => renombrarColumna(c._id, n)}
                onBorrar={() => (c.notes.length > 0 ? setABorrar({ tipo: "columna", columna: c }) : borrarColumna(c._id))}
                onNuevaNota={() => nuevaNota(c._id)}
                onGuardarNota={guardarNota}
                onBorrarNota={borrarNota}
              />
            ))}
          </SortableContext>
          <div className="flex w-[min(20rem,85vw)] shrink-0 snap-start flex-col gap-2">
            <button
              className="boton h-14 w-full justify-start rounded-lg border-2 border-dashed border-borde text-gris hover:border-gris hover:text-tinta"
              onClick={nuevaColumna}
            >
              <Mas /> Agregar columna
            </button>
            {columnas.length === 0 && <p className="px-1 text-sm text-gris">Empezá con una columna, por ejemplo Pendiente.</p>}
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {arrastrando?.nota && (
              <FichaLevantada nota={arrastrando.nota} color={marcador(columnaDeNota(columnas, arrastrando.nota._id) ?? "")} />
            )}
            {arrastrando?.columna && (
              <div className="ficha ficha-levantada w-[min(20rem,85vw)] border-t-4 px-3 py-2" style={{ borderTopColor: marcador(arrastrando.columna._id) }}>
                <p className="font-display text-lg font-bold">{arrastrando.columna.name || "Sin nombre"}</p>
                <p className="text-sm text-gris">{arrastrando.columna.notes.length} fichas</p>
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>

      <Confirmar
        abierto={aBorrar !== null}
        titulo={aBorrar?.tipo === "columna" ? `¿Borrar la columna «${aBorrar.columna.name || "Sin nombre"}»?` : `¿Borrar el tablero «${tablero.name}»?`}
        texto={
          aBorrar?.tipo === "columna"
            ? `Se borran también sus ${aBorrar.columna.notes.length} fichas. No se puede deshacer.`
            : "Se borran todas sus columnas y fichas. No se puede deshacer."
        }
        accion={aBorrar?.tipo === "columna" ? "Borrar columna" : "Borrar tablero"}
        onConfirmar={() => (aBorrar?.tipo === "columna" ? borrarColumna(aBorrar.columna._id) : borrarTablero())}
        onCerrar={() => setABorrar(null)}
      />
    </div>
  );
}
