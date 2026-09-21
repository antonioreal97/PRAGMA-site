export const sanityApiVersion = "2026-09-21";

export function getSanityEnv() {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
  if (!projectId) {
    throw new Error(
      "Variável de ambiente VITE_SANITY_PROJECT_ID não definida.",
    );
  }
  return { projectId, dataset, apiVersion: sanityApiVersion };
}
