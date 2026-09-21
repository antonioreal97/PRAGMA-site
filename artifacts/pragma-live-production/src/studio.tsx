import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Studio } from "sanity";
import config from "../sanity.config";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Elemento #root não encontrado para o Studio.");
}

createRoot(root).render(
  <StrictMode>
    <Studio config={config} />
  </StrictMode>,
);
