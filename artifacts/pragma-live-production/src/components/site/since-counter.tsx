import { useEffect, useState } from "react";

/** Fundação da casa: 6 de junho de 2016, meia-noite local. */
const FOUNDED = new Date(2016, 5, 6);

type Elapsed = {
  years: number;
  months: number;
  days: number;
};

const ZERO: Elapsed = { years: 0, months: 0, days: 0 };

/** Anos, meses e dias de calendário entre a fundação e agora. */
export function elapsedSince(now = new Date()): Elapsed {
  let years = now.getFullYear() - FOUNDED.getFullYear();
  let months = now.getMonth() - FOUNDED.getMonth();
  let days = now.getDate() - FOUNDED.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
}

function label(count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Trecho de 0 a 1 dentro de uma janela da animação. */
function slice(t: number, from: number, to: number) {
  if (t <= from) return 0;
  if (t >= to) return 1;
  return easeOut((t - from) / (to - from));
}

/**
 * Contagem da eyebrow: sobe de zero até o tempo desde 6 de junho de 2016.
 * Com movimento reduzido, mostra o valor final na hora.
 */
export function SinceCounter({ eyebrow }: { eyebrow: string }) {
  const lead = eyebrow.split("/")[0]?.trim() || eyebrow;
  const [elapsed, setElapsed] = useState<Elapsed>(ZERO);

  useEffect(() => {
    const target = elapsedSince();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setElapsed(target);
      return;
    }

    const duration = 2800;
    let started = 0;
    let frame = 0;
    let begun = false;

    const step = (value: number, progress: number, done: boolean) =>
      done ? value : Math.min(value, Math.floor(value * progress));

    const tick = (now: number) => {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / duration);
      const done = t >= 1;
      setElapsed({
        years: step(target.years, slice(t, 0, 0.72), done),
        months: step(target.months, slice(t, 0.28, 0.86), done),
        days: step(target.days, slice(t, 0.48, 1), done),
      });
      if (!done) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (begun) return;
      begun = true;
      frame = requestAnimationFrame(tick);
    };

    if (!document.getElementById("boot")) {
      start();
      return () => cancelAnimationFrame(frame);
    }

    document.addEventListener("pragma-boot-done", start, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pragma-boot-done", start);
    };
  }, []);

  return (
    <>
      <span>{lead}</span>
      <span className="since-slash" aria-hidden="true">
        /
      </span>
      <span className="since-count">
        <span className="since-unit">
          <b className="since-num">{elapsed.years}</b>{" "}
          {label(elapsed.years, "ano", "anos")}
        </span>
        <span className="since-unit">
          <b className="since-num">{elapsed.months}</b>{" "}
          {label(elapsed.months, "mês", "meses")}
        </span>
        <span className="since-unit">
          <b className="since-num">{elapsed.days}</b>{" "}
          {label(elapsed.days, "dia", "dias")}
        </span>
      </span>
      <span className="sr-only">desde 6 de junho de 2016</span>
    </>
  );
}
