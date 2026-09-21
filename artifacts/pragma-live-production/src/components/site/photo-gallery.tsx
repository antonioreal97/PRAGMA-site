import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import feiraPalcoLed from "@/assets/photos/feira-palco-led.jpg";
import corteAoVivo from "@/assets/photos/corte-ao-vivo.jpg";
import operadorNoite from "@/assets/photos/operador-noite.jpg";
import podcastEstudio from "@/assets/photos/podcast-estudio.jpg";
import cameraFx30 from "@/assets/photos/camera-fx30.jpg";
import entrevistaSet from "@/assets/photos/entrevista-set.jpg";
import cameraPalcoExterno from "@/assets/photos/camera-palco-externo.jpg";
import tendaPanorama from "@/assets/photos/tenda-panorama.jpg";
import showPalco from "@/assets/photos/show-palco.jpg";

type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

const photos: Photo[] = [
  {
    src: feiraPalcoLed,
    width: 1280,
    height: 960,
    caption: "Palco com LED e captação",
    alt: "Câmera com monitor externo registrando uma palestra em um palco com painel de LED, diante da plateia.",
  },
  {
    src: corteAoVivo,
    width: 720,
    height: 1280,
    caption: "Corte ao vivo",
    alt: "Mesa de corte de vídeo com multiview das câmeras durante um show iluminado em azul.",
  },
  {
    src: operadorNoite,
    width: 960,
    height: 1280,
    caption: "Câmera e intercom",
    alt: "Operador de câmera com headset ao lado de uma câmera com teleobjetiva em um evento noturno ao ar livre.",
  },
  {
    src: podcastEstudio,
    width: 1280,
    height: 960,
    caption: "Montagem de set",
    alt: "Equipe montando um set de podcast com câmeras e mesa em um estande de feira.",
  },
  {
    src: showPalco,
    width: 960,
    height: 1280,
    caption: "Beira de palco",
    alt: "Mão ajustando uma câmera em tripé ao lado do palco durante um show noturno.",
  },
  {
    src: entrevistaSet,
    width: 1280,
    height: 720,
    caption: "Entrevista gravada",
    alt: "Set de entrevista com câmera, notebook e mesa de som em uma sala.",
  },
  {
    src: cameraFx30,
    width: 960,
    height: 1280,
    caption: "Captação",
    alt: "Mão segurando uma câmera Sony FX30 dentro de uma grande tenda de eventos.",
  },
  {
    src: tendaPanorama,
    width: 960,
    height: 1280,
    caption: "Evento em tenda",
    alt: "Câmera em tripé registrando uma palestra em uma grande tenda com plateia e telões.",
  },
  {
    src: cameraPalcoExterno,
    width: 960,
    height: 1280,
    caption: "Show ao ar livre",
    alt: "Câmera com monitor montada em tripé, apontada para um palco ao ar livre.",
  },
];

// A native horizontal scroller: touch and trackpads get real momentum and snapping
// for free; the buttons are for mouse users and page by roughly one screen.
export function PhotoGallery() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  // Fração visível do trilho, para a barra de progresso da faixa.
  const [rail, setRail] = useState(0.25);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      setCanPrev(track.scrollLeft > 4);
      setCanNext(track.scrollLeft < max - 4);
      const window_ = track.clientWidth / track.scrollWidth;
      const travelled = max > 0 ? track.scrollLeft / max : 0;
      setRail(Math.min(1, window_ + travelled * (1 - window_)));
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="gallery">
      <div className="wrap gallery-controls">
        <div
          className="gallery-rail"
          style={{ "--rail": rail } as CSSProperties}
          aria-hidden="true"
        >
          <span />
        </div>
        <button
          type="button"
          className="gallery-button"
          onClick={() => page(-1)}
          disabled={!canPrev}
          aria-label="Fotos anteriores"
          aria-controls="gallery-track"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="gallery-button"
          onClick={() => page(1)}
          disabled={!canNext}
          aria-label="Próximas fotos"
          aria-controls="gallery-track"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <ul
        id="gallery-track"
        ref={trackRef}
        className="gallery-track"
        tabIndex={0}
        aria-label="Fotos da equipe em campo"
      >
        {photos.map((photo) => (
          <li className="gallery-item" key={photo.src}>
            <figure>
              <div className="frame">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <figcaption className="mono">{photo.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
