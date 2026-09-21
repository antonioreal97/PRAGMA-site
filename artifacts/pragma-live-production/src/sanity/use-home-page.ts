import { useQuery } from "@tanstack/react-query";
import { getSanityClient } from "./client";
import { homePageQuery } from "./queries";
import type { HomePayload } from "./types";

function missing(name: string) {
  return new Error(
    `Documento "${name}" não encontrado no Sanity. Rode pnpm --filter @workspace/pragma-live-production seed.`,
  );
}

export async function fetchHomePage(): Promise<HomePayload> {
  const data = await getSanityClient().fetch<Partial<HomePayload>>(homePageQuery);
  if (!data.home) throw missing("home");
  if (!data.settings) throw missing("siteSettings");
  return { home: data.home, settings: data.settings };
}

export function useHomePage() {
  return useQuery({
    queryKey: ["home-page"],
    queryFn: fetchHomePage,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
