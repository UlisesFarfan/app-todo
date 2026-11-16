import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SesionProvider } from "./sesion";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID} locale="es">
      <SesionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SesionProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
