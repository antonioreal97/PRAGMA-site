export const sanityApiVersion = "2026-09-21";

function env(name: string): string | undefined {
  const fromMeta = (import.meta as ImportMeta & { env?: Record<string, string> })
    .env?.[name];
  if (fromMeta) return fromMeta;
  if (typeof process !== "undefined") return process.env[name];
  return undefined;
}

export function getSanityEnv() {
  const projectId =
    env("VITE_SANITY_PROJECT_ID") || env("SANITY_STUDIO_PROJECT_ID");
  const dataset =
    env("VITE_SANITY_DATASET") || env("SANITY_STUDIO_DATASET") || "production";
  if (!projectId) {
    throw new Error(
      "Variável de ambiente VITE_SANITY_PROJECT_ID ou SANITY_STUDIO_PROJECT_ID não definida.",
    );
  }
  return { projectId, dataset, apiVersion: sanityApiVersion };
}

export function getStudioBasePath() {
  return env("SANITY_STUDIO_HOSTED") === "true" ? "/" : "/studio";
}

export function getPreviewOrigin() {
  const fromEnv = env("SANITY_STUDIO_PREVIEW_ORIGIN") || env("VITE_SITE_URL");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5173";
}

export function getStudioUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${getStudioBasePath() === "/" ? "" : "/studio"}`;
  }
  return getStudioBasePath();
}

export function isSanityPresentation() {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
