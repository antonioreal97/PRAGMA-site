import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset =
  process.env.VITE_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  "production";

if (!projectId) {
  throw new Error(
    "Variável de ambiente VITE_SANITY_PROJECT_ID não definida.",
  );
}

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "pragma-live",
  deployment: {
    appId: "q8bnjo6h4xsdycvoq2htk4hz",
    autoUpdates: false,
  },
});
