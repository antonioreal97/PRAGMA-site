import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { motionAllowed } from "./motion";

/**
 * Vista explodida de um palco, em CSS 3D.
 *
 * Cada camada que a PRAGMA opera vira um plano real no espaço, afastado no
 * eixo Z. A geometria é decorativa e fica escondida de leitores de tela; os
 * nomes das camadas são uma lista de verdade, porque são conteúdo.
 */

const LED_COLS = 8;
const LED_ROWS = 4;
// Painéis que ficam acesos: desenha uma forma, em vez de ruído aleatório
// que mudaria a cada render.
const LIT = new Set([2, 3, 4, 5, 10, 11, 12, 13, 18, 19, 20, 21, 27, 28]);

type Layer = {
  id: string;
  name: string;
  note: string;
};

const LAYOUT: Record<string, { z: number; tag: [string, string] }> = {
  imagem: { z: -210, tag: ["78%", "20%"] },
  luz: { z: -70, tag: ["22%", "78%"] },
  som: { z: 70, tag: ["13%", "34%"] },
  infra: { z: 210, tag: ["58%", "4%"] },
};

export function StageLayers({ layers }: { layers: Layer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  // Camada fixada por clique, toque ou teclado. O hover só pré-visualiza;
  // quando o ponteiro sai, a cena volta para a camada escolhida.
  const [active, setActive] = useState<string | null>(null);
  const toggle = (id: string) =>
    setActive((current) => (current === id ? null : id));

  // A cena acompanha o ponteiro de leve. Amplitude pequena de propósito:
  // é profundidade, não um brinquedo.
  const track = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !motionAllowed()) return;
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.setProperty("--yaw", `${-26 + x * 16}deg`);
    node.style.setProperty("--pitch", `${6 - y * 10}deg`);
  }, []);

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.removeProperty("--yaw");
    node.style.removeProperty("--pitch");
  }, []);

  const resolved = layers.map((layer) => {
    const layout = LAYOUT[layer.id];
    if (!layout) {
      throw new Error(
        `Camada de anatomia desconhecida: "${layer.id}". IDs válidos: ${Object.keys(LAYOUT).join(", ")}.`,
      );
    }
    return { ...layer, ...layout };
  });

  return (
    <div
      className="stage3d"
      ref={ref}
      onPointerMove={track}
      onPointerLeave={reset}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape" && active) setActive(null);
      }}
    >
      <ul
        className="stage3d-scene"
        data-active={active ?? undefined}
        aria-label="Camadas do palco"
      >
        {resolved.map((layer) => (
          <li
            className="stage-layer"
            key={layer.id}
            data-layer={layer.id}
            data-selected={active === layer.id || undefined}
            style={
              {
                "--z": `${layer.z}px`,
                "--tag-l": layer.tag[0],
                "--tag-b": layer.tag[1],
              } as CSSProperties
            }
          >
            <div className="stage-art" aria-hidden="true">
              {layer.id === "imagem" && (
                <div className="led-wall">
                  {Array.from({ length: LED_COLS * LED_ROWS }, (_, i) => (
                    <span
                      key={i}
                      className="led-panel"
                      data-lit={LIT.has(i) || undefined}
                      style={{ "--i": i } as CSSProperties}
                    />
                  ))}
                </div>
              )}
              {layer.id === "luz" && (
                <div className="truss">
                  <div className="truss-beam">
                    <span className="truss-braces" />
                  </div>
                  {[18, 50, 82].map((left, i) => (
                    <div
                      className="fixture"
                      key={left}
                      style={
                        { "--left": `${left}%`, "--i": i } as CSSProperties
                      }
                    >
                      <span className="fixture-head" />
                      <span className="fixture-beam" />
                    </div>
                  ))}
                </div>
              )}
              {layer.id === "som" && (
                <div className="arrays">
                  {["left", "right"].map((side) => (
                    <div className={`array array-${side}`} key={side}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="array-box" />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {layer.id === "infra" && (
                <div className="deck">
                  <span className="deck-plane" />
                  <span className="deck-run" />
                </div>
              )}
            </div>
            {/* O nome e a nota ficam separados só pelo gap do flex, sem
                espaço no texto — por isso o nome acessível vem explícito. */}
            <button
              type="button"
              className="layer-tag"
              aria-pressed={active === layer.id}
              aria-label={`${layer.name}: ${layer.note}`}
              onClick={() => toggle(layer.id)}
            >
              <b>{layer.name}</b>
              {layer.note}
            </button>
          </li>
        ))}
      </ul>
      {/* Numa tela estreita as etiquetas flutuantes não cabem sem serem
          cortadas. A mesma informação vira legenda abaixo da cena; só uma
          das duas existe por vez, então nada é lido em dobro. */}
      <ul className="stage-legend" aria-label="Camadas do palco">
        {resolved.map((layer) => (
          <li key={layer.id}>
            <button
              type="button"
              aria-pressed={active === layer.id}
              aria-label={`${layer.name}: ${layer.note}`}
              onClick={() => toggle(layer.id)}
            >
              <b>{layer.name}</b>
              {layer.note}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
