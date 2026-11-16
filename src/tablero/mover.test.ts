import { describe, expect, it } from "vitest";
import { cambioDeOrden, columnaDeNota, moverNota } from "./mover";
import type { Columna } from "../api";

const cols: Columna[] = [
  { _id: "a", name: "A", notes: [{ _id: "1", task: "uno" }, { _id: "2", task: "dos" }] },
  { _id: "b", name: "B", notes: [{ _id: "3", task: "tres" }] },
];
const ids = (c: Columna[]) => c.map((col) => col.notes.map((n) => n._id));

describe("moverNota", () => {
  it("pasa una nota a otra columna en la posición pedida", () => {
    expect(ids(moverNota(cols, "2", "b", 0))).toEqual([["1"], ["2", "3"]]);
  });
  it("sin posición va al final", () => {
    expect(ids(moverNota(cols, "1", "b"))).toEqual([["2"], ["3", "1"]]);
  });
  it("reordena dentro de la misma columna", () => {
    expect(ids(moverNota(cols, "2", "a", 0))).toEqual([["2", "1"], ["3"]]);
  });
  it("con ids que no existen no cambia nada y no toca la entrada", () => {
    expect(moverNota(cols, "9", "b")).toBe(cols);
    expect(moverNota(cols, "1", "z")).toBe(cols);
    moverNota(cols, "1", "b");
    expect(ids(cols)).toEqual([["1", "2"], ["3"]]);
  });
});

describe("columnaDeNota y cambioDeOrden", () => {
  it("encuentra la columna y detecta si cambió el orden", () => {
    const despues = moverNota(cols, "1", "b");
    expect(columnaDeNota(despues, "1")).toBe("b");
    expect(cambioDeOrden(cols, despues, "b")).toEqual(["3", "1"]);
    expect(cambioDeOrden(cols, cols, "a")).toBeNull();
  });
});
