import { useCallback, useEffect, useState, type PointerEvent } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Liga o movimento do site uma única vez, na raiz.
 *
 * O conteúdo é escrito visível: a classe `motion-ok` no <html> é o que
 * autoriza o CSS a escondê-lo para revelar depois. Sem JavaScript, ou com
 * movimento reduzido, a classe nunca entra e a página fica inteira.
 */
export function useSiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const preference = window.matchMedia(REDUCED);
    let observer: IntersectionObserver | null = null;

    const stop = () => {
      observer?.disconnect();
      observer = null;
      root.classList.remove("motion-ok");
    };

    const start = () => {
      if (observer) return;
      root.classList.add("motion-ok");
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -4% 0px", threshold: 0 },
      );
      document
        .querySelectorAll("[data-reveal], [data-inview]")
        .forEach((node) => observer?.observe(node));
    };

    const sync = () => (preference.matches ? stop() : start());
    sync();
    preference.addEventListener("change", sync);
    return () => {
      preference.removeEventListener("change", sync);
      stop();
    };
  }, []);
}

/**
 * Brilho que segue o ponteiro dentro de um painel. Escreve duas variáveis
 * CSS; quem decide se algo aparece é a folha de estilo, só em ponteiro fino.
 */
export function useSpotlight() {
  return useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const target = event.currentTarget;
    const box = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${event.clientX - box.left}px`);
    target.style.setProperty("--my", `${event.clientY - box.top}px`);
  }, []);
}

/** Quanto da página já foi lida, de 0 a 1, atualizado por quadro. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setStuck(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { progress, stuck };
}
