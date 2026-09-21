import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Photo = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
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
  }, [photos]);

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
                  srcSet={photo.srcSet}
                  sizes="(max-width: 700px) 80vw, 420px"
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
