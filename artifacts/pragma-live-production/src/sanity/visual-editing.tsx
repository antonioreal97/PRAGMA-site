import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { isSanityPresentation } from "./env";

export function SanityVisualEditing() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSanityPresentation()) return undefined;
    let disable: (() => void) | undefined;
    let cancelled = false;

    void import("@sanity/visual-editing").then(({ enableVisualEditing }) => {
      if (cancelled) return;
      disable = enableVisualEditing({
        history: {
          subscribe: (navigate) => {
            const onPop = () => navigate({ type: "pop", url: location.href });
            addEventListener("popstate", onPop);
            return () => removeEventListener("popstate", onPop);
          },
          update: (update) => {
            if (update.type === "push") history.pushState(null, "", update.url);
            if (update.type === "replace") {
              history.replaceState(null, "", update.url);
            }
          },
        },
        refresh: (payload) => {
          if (payload.source === "manual") {
            window.location.reload();
            return new Promise<void>(() => {});
          }
          return queryClient.invalidateQueries({ queryKey: ["home-page"] });
        },
      });
    });

    return () => {
      cancelled = true;
      disable?.();
    };
  }, [queryClient]);

  return null;
}

