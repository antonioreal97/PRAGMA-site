import { createClient } from "@sanity/client";
import { getSanityEnv } from "./env";

export function getSanityClient() {
  const { projectId, dataset, apiVersion } = getSanityEnv();
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  });
}
