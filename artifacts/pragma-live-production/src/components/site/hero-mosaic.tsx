import { useEffect, useRef, useState, type CSSProperties } from "react";
import manifest from "@/assets/mosaic/manifest.json";

const modules = import.meta.glob("@/assets/mosaic/tile-*.avif", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export type MosaicTile = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
};

const LOCAL_TILES: MosaicTile[] = manifest.map((entry) => {
  const match = Object.entries(modules).find(([path]) =>
    path.endsWith(`/${entry.file}`),
  );
  if (!match) {
    throw new Error(`Tile do mosaico não encontrado: ${entry.file}`);
  }
  return { src: match[1], width: entry.width, height: entry.height };
});

const COLUMN_COUNT = 10;
const COLUMN_DURATIONS = [52, 64, 48, 70, 56, 60, 44, 74, 58, 66];
const TILE_GAP = 6;

function visibleColumnCount(width: number) {
  if (width <= 600) return 4;
  if (width <= 900) return 6;
  return COLUMN_COUNT;
}

function fillEstimate() {
  const cols = visibleColumnCount(window.innerWidth);
  return {
    colWidth: window.innerWidth / cols,
    target: window.innerHeight * 1.35,
  };
}

/** Repete a sequência da coluna até uma faixa cobrir a altura visível. */
function repeatToFill(tiles: MosaicTile[], colWidth: number, target: number) {
  if (tiles.length === 0 || colWidth <= 0 || target <= 0) return tiles;
  const filled: MosaicTile[] = [];
  let height = 0;
  let loops = 0;
  while (height < target && loops < 40) {
    for (const tile of tiles) {
      filled.push(tile);
      height += colWidth * (tile.height / tile.width) + TILE_GAP;
      if (height >= target) break;
    }
    loops += 1;
  }
  return filled;
}

function splitColumns(tiles: MosaicTile[], count: number): MosaicTile[][] {
  const columns: MosaicTile[][] = Array.from({ length: count }, () => []);
  tiles.forEach((tile, index) => {
    columns[index % count].push(tile);
  });
  // Embaralha cada coluna com um offset fixo para não alinhar as mesmas
  // fotos na horizontal — a parede ganha ritmo sem parecer carrossel.
  return columns.map((col, colIndex) => {
    const shift = (colIndex * 3) % Math.max(col.length, 1);
    return [...col.slice(shift), ...col.slice(0, shift)];
  });
}

function MosaicStrip({
  tiles,
  eager,
  copy,
}: {
  tiles: MosaicTile[];
  eager: boolean;
  copy: "a" | "b";
}) {
  return (
    <div className="hero-mosaic-strip">
      {tiles.map((tile, index) => (
        <div
          className="hero-mosaic-tile"
          key={`${copy}-${tile.src}-${index}`}
          style={{ "--ar": `${tile.width} / ${tile.height}` } as CSSProperties}
        >
          <img
            src={tile.src}
            srcSet={tile.srcSet}
            sizes="(max-width: 600px) 25vw, (max-width: 900px) 17vw, 10vw"
            alt=""
            width={tile.width}
            height={tile.height}
            loading={eager && copy === "a" && index < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

function MosaicColumn({
  tiles,
  duration,
  reverse,
  eager,
}: {
  tiles: MosaicTile[];
  duration: number;
  reverse: boolean;
  eager: boolean;
}) {
  return (
    <div
      className="hero-mosaic-col"
      style={
        {
          "--mosaic-dur": `${duration}s`,
          "--mosaic-dir": reverse ? "reverse" : "normal",
        } as CSSProperties
      }
    >
      <div className="hero-mosaic-track">
        <MosaicStrip tiles={tiles} eager={eager} copy="a" />
        <MosaicStrip tiles={tiles} eager={false} copy="b" />
      </div>
    </div>
  );
}

/**
 * Parede de fotos da abertura: colunas que sobem e descem em loop lento.
 * Decorativa — o texto e os CTAs ficam por cima, no scrim.
 * Fotos vêm do Sanity; se o CMS ainda não tiver mosaico, usa o pacote local.
 */
export function HeroMosaic({ tiles }: { tiles?: MosaicTile[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [budget, setBudget] = useState(fillEstimate);
  const columns = splitColumns(
    tiles && tiles.length > 0 ? tiles : LOCAL_TILES,
    COLUMN_COUNT,
  ).map((column) => repeatToFill(column, budget.colWidth, budget.target));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let visible = true;
    const sync = () => {
      const pause = !visible || document.hidden;
      root.toggleAttribute("data-paused", pause);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(root);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const wall = rootRef.current?.querySelector(".hero-mosaic-wall");
    if (!wall) return;

    const measure = () => {
      const sample = [...wall.querySelectorAll(".hero-mosaic-col")].find(
        (col) => getComputedStyle(col).display !== "none",
      );
      if (!sample) return;
      const rect = sample.getBoundingClientRect();
      setBudget((prev) => {
        if (
          Math.abs(prev.colWidth - rect.width) < 1 &&
          Math.abs(prev.target - rect.height) < 1
        ) {
          return prev;
        }
        return { colWidth: rect.width, target: rect.height };
      });
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wall);
    measure();
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="hero-mosaic" aria-hidden="true" ref={rootRef}>
      <div className="hero-mosaic-wall">
        {columns.map((columnTiles, index) => (
          <MosaicColumn
            key={index}
            tiles={columnTiles}
            duration={COLUMN_DURATIONS[index] ?? 60}
            reverse={index % 2 === 1}
            eager={index < 6}
          />
        ))}
      </div>
      <div className="hero-scrim" />
      <div className="hero-glow" />
      <div className="fx-grid" />
      <div className="hero-beam" />
    </div>
  );
}
