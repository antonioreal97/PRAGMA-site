import { Cpu, Globe, Shuffle, Video } from "lucide-react";
import { useCallback, useRef, type CSSProperties, type PointerEvent } from "react";
import { motionAllowed } from "./motion";

/**
 * A cadeia de sinal em 3D: o caminho que a imagem faz do palco até a tela
 * de quem assiste de longe. Quatro estações em perspectiva, ligadas por um
 * trilho com pulsos que viajam.
 *
 * A geometria é CSS 3D. As legendas ficam contra-rotacionadas para continuar
 * de frente, como na cena do palco.
 */

const ICONS = {
  captacao: Video,
  corte: Shuffle,
  encode: Cpu,
  entrega: Globe,
} as const;

type Station = {
  id: string;
  name: string;
  note: string;
};

export function SignalChain({ stations }: { stations: Station[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const track = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !motionAllowed()) return;
    const node = ref.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.setProperty("--yaw", `${-23 + x * 12}deg`);
    node.style.setProperty("--pitch", `${9 - y * 7}deg`);
  }, []);

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.removeProperty("--yaw");
    node.style.removeProperty("--pitch");
  }, []);

  return (
    <div
      className="chain3d"
      ref={ref}
      onPointerMove={track}
      onPointerLeave={reset}
    >
      <div className="chain3d-scene">
        <span className="chain-floor" aria-hidden="true" />
        <ol className="chain-rail">
          {stations.map(({ id, name, note }, index) => {
            const Icon = ICONS[id as keyof typeof ICONS];
            if (!Icon) {
              throw new Error(
                `Estação de broadcast desconhecida: "${id}". IDs válidos: ${Object.keys(ICONS).join(", ")}.`,
              );
            }
            return (
            <li
              className="chain-node"
              key={id}
              style={{ "--i": index } as CSSProperties}
            >
              {index > 0 && (
                <span className="chain-link" aria-hidden="true">
                  <i />
                </span>
              )}
              <span className="node-stack" aria-hidden="true">
                <span className="node-face">
                  <Icon size={26} strokeWidth={1.4} />
                </span>
                <span className="node-edge" />
                <span className="node-pool" />
              </span>
              <span className="node-tag">
                <b>{name}</b>
                {note}
              </span>
            </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
