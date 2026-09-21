import { createClient } from "@sanity/client";
import { getSanityEnv, getStudioUrl, isSanityPresentation } from "./env";

export function getSanityClient(options?: { stega?: boolean }) {
  const { projectId, dataset, apiVersion } = getSanityEnv();
  const stega = options?.stega ?? isSanityPresentation();
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    stega: {
      enabled: stega,
      studioUrl: getStudioUrl(),
    },
  });
}
