import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { UserViewComponent } from "sanity/structure";
import { getSanityEnv } from "./env";

type ImageValue = {
  _type: "image";
  asset?: { _ref?: string; _id?: string };
};

type Shot = {
  id: string;
  section: SectionId;
  label: string;
  source: ImageValue;
};

type SectionId = "mosaic" | "about" | "work" | "gallery" | "method" | "other";

const SECTIONS: { id: SectionId; title: string; empty: string }[] = [
  {
    id: "mosaic",
    title: "Mosaico da abertura",
    empty: "Nenhuma foto no mosaico. Com o campo vazio, o site usa o pacote local.",
  },
  {
    id: "about",
    title: "O que fazemos",
    empty: "Nenhuma imagem nesta seção.",
  },
  {
    id: "work",
    title: "Em campo",
    empty: "Nenhuma imagem nesta seção.",
  },
  {
    id: "gallery",
    title: "Bastidores",
    empty: "Nenhuma imagem nesta seção.",
  },
  {
    id: "method",
    title: "Método",
    empty: "Nenhuma imagem nesta seção.",
  },
];

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isImage(value: unknown): value is ImageValue {
  return isRecord(value) && value._type === "image";
}

function assetId(image: ImageValue) {
  return image.asset?._ref || image.asset?._id;
}

function sectionOf(path: string[]): SectionId {
  if (path[0] === "hero" && path[1] === "mosaic") return "mosaic";
  if (path[0] === "about") return "about";
  if (path[0] === "work") return "work";
  if (path[0] === "gallery") return "gallery";
  if (path[0] === "method") return "method";
  return "other";
}

function roleOf(path: string[]) {
  if (path.includes("wide")) return "Deitada";
  if (path.includes("tall")) return "Em pé";
  if (path.includes("stills")) return "Extra";
  return undefined;
}

function nearest(frames: Record<string, unknown>[], key: string) {
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const value = text(frames[index]?.[key]);
    if (value) return value;
  }
  return undefined;
}

function collectImages(value: unknown) {
  const shots: Shot[] = [];
  const counts = new Map<SectionId, number>();

  function walk(node: unknown, path: string[], frames: Record<string, unknown>[]) {
    if (isImage(node)) {
      if (!assetId(node)) return;
      const section = sectionOf(path);
      const count = (counts.get(section) ?? 0) + 1;
      counts.set(section, count);
      const phase = path.includes("steps") ? nearest(frames, "phase") : undefined;
      const role = roleOf(path);
      const detail =
        nearest(frames, "caption") ||
        nearest(frames, "alt") ||
        nearest(frames, "title");
      const label =
        section === "mosaic"
          ? String(count).padStart(2, "0")
          : [phase, role, detail].filter(Boolean).join(" · ") || "Imagem";
      shots.push({
        id: path.join("."),
        section,
        label,
        source: node,
      });
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        const key =
          isRecord(item) && typeof item._key === "string" ? item._key : String(index);
        walk(item, [...path, key], frames);
      });
      return;
    }

    if (!isRecord(node)) return;
    const nextFrames = [...frames, node];
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("_")) continue;
      walk(child, [...path, key], nextFrames);
    }
  }

  walk(value, [], []);
  return shots;
}

function imageUrl(source: SanityImageSource, width: number) {
  const { projectId, dataset } = getSanityEnv();
  const url = createImageUrlBuilder({ projectId, dataset })
    .image(source)
    .width(width)
    .format("jpg")
    .url();
  if (!url) {
    throw new Error("Não foi possível montar a URL da imagem.");
  }
  return url;
}

function ShotCard({ shot, onOpen }: { shot: Shot; onOpen: (shot: Shot) => void }) {
  const [error, setError] = useState<string | null>(null);
  const src = useMemo(() => imageUrl(shot.source, 640), [shot.source]);

  return (
    <button
      type="button"
      onClick={() => onOpen(shot)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 0,
        border: "1px solid var(--card-border-color)",
        borderRadius: 6,
        background: "var(--card-bg-color)",
        color: "var(--card-fg-color)",
        textAlign: "left",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {error ? (
        <span style={{ padding: 16, color: "var(--card-badge-critical-fg-color, #f03e2f)" }}>
          {error}
        </span>
      ) : (
        <img
          src={src}
          alt={shot.label}
          onError={() => setError(`Falha ao carregar: ${shot.label}`)}
          style={{
            width: "100%",
            height: 148,
            objectFit: "contain",
            background: "var(--card-muted-bg-color, #111)",
          }}
        />
      )}
      <span
        style={{
          padding: "0 10px 10px",
          fontSize: 12,
          lineHeight: 1.35,
          color: "var(--card-muted-fg-color)",
        }}
      >
        {shot.label}
      </span>
    </button>
  );
}

function Lightbox({ shot, onClose }: { shot: Shot; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const src = useMemo(() => imageUrl(shot.source, 1600), [shot.source]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.label}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        background: "rgba(0, 0, 0, 0.86)",
      }}
    >
      {error ? (
        <p style={{ color: "#fff", margin: 0 }}>{error}</p>
      ) : (
        <img
          src={src}
          alt={shot.label}
          onClick={(event) => event.stopPropagation()}
          onError={() => setError(`Falha ao carregar: ${shot.label}`)}
          style={{
            maxWidth: "min(1200px, 100%)",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
      )}
      <p style={{ color: "#fff", margin: 0, fontSize: 14 }}>{shot.label}</p>
    </div>,
    document.body,
  );
}

export const ImagesView: UserViewComponent = ({ document }) => {
  const ready = Boolean(document.draft || document.published || document.displayed._id);
  const shots = useMemo(
    () => (ready ? collectImages(document.displayed) : []),
    [document.displayed, ready],
  );
  const [open, setOpen] = useState<Shot | null>(null);
  const sections = SECTIONS.map((section) => ({
    ...section,
    shots: shots.filter((shot) => shot.section === section.id),
  }));
  const extras = shots.filter((shot) => shot.section === "other");

  if (!ready) {
    return <p style={{ padding: 24, margin: 0 }}>Carregando as imagens da página…</p>;
  }

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 24 }}>
      <p style={{ margin: "0 0 24px", color: "var(--card-muted-fg-color)" }}>
        Fotos usadas na página. Clique para ampliar.
      </p>
      {sections.map((section) => (
        <section key={section.id} style={{ marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
            {section.title}
            <span style={{ marginLeft: 8, color: "var(--card-muted-fg-color)", fontWeight: 400 }}>
              {section.shots.length}
            </span>
          </h2>
          {section.shots.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {section.shots.map((shot) => (
                <ShotCard key={shot.id} shot={shot} onOpen={setOpen} />
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--card-muted-fg-color)" }}>{section.empty}</p>
          )}
        </section>
      ))}
      {extras.length ? (
        <section>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>Outras</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {extras.map((shot) => (
              <ShotCard key={shot.id} shot={shot} onOpen={setOpen} />
            ))}
          </div>
        </section>
      ) : null}
      {open ? <Lightbox shot={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
};
