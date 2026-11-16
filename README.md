# Pizarra

Tableros de tareas: columnas, fichas y arrastrar hasta Hecho. [Demo](https://todoappbyulises.vercel.app/)

React 19 + React Router, Tailwind 4, dnd-kit (mouse, toque y teclado) y entrada con Google
(`@react-oauth/google`). La API es [`api-todo`](../api-todo) (Go en AWS Lambda + DynamoDB).

## Levantarlo en local

```sh
cp .env.example .env.local   # la primera vez: client ID de Google y URL de la API
npm install
npm run dev                  # http://localhost:5173
```

En Google Cloud, el ID de cliente OAuth tiene que tener `http://localhost:5173` y el dominio de
Vercel en "Orígenes autorizados de JavaScript". La API usa el mismo client ID (`GOOGLE_CLIENT_ID`).

## Tests y build

```sh
npm test        # la lógica de mover fichas (src/tablero/mover.ts)
npm run build   # tipos + build de producción en dist/
```

## Publicar

Vercel despliega solo. Variables: `VITE_CLIENT_ID` y `VITE_API_ENDPOINT` (la URL que muestra
`make deploy` en `api-todo`, sin barra final).
