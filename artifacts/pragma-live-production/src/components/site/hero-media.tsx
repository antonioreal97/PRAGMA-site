import { useEffect, useRef, useState } from "react";
import coverImage from "@assets/pragma-brand-cover.png";
import heroVideo from "@assets/1108328_1080p_4k_1280x720_1789673316521.mp4";

/**
 * Fundo da abertura em camadas: vídeo, escurecimento que protege a leitura,
 * brilho de palco, malha técnica e um feixe lento. O vídeo só roda quando
 * está à vista, com a aba ativa e sem preferência por menos movimento.
 */
export function HeroMedia() {
  const ref = useRef<HTMLVideoElement>(null);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !preference.matches) {
        video.play().catch((error) => {
          console.warn("Hero video autoplay blocked:", error);
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);
  return (
    <div aria-hidden="true">
      <div className="hero-media">
        {!available && <img src={coverImage} alt="" width={1536} height={1024} />}
        <video
          ref={ref}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={coverImage}
          onError={() => setAvailable(false)}
          src={heroVideo}
        />
      </div>
      <div className="hero-scrim" />
      <div className="hero-glow" />
      <div className="fx-grid" />
      <div className="hero-beam" />
    </div>
  );
}
