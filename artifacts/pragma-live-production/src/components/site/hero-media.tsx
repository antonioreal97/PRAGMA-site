import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import coverImage from "@assets/pragma-brand-cover.png";
import heroVideo from "@assets/1108328_1080p_4k_1280x720_1789673316521.mp4";

export function HeroMedia() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [manualPlay, setManualPlay] = useState<boolean | null>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const requested = manualPlay ?? !preference.matches;
      if (visible && !document.hidden && requested)
        video.play().catch(() => setPlaying(false));
      else video.pause();
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
  }, [manualPlay]);
  return (
    <>
      <div className="hero-media" aria-hidden="true">
        {!available && (
          <img src={coverImage} alt="" width={1536} height={1024} />
        )}
        <video
          ref={ref}
          loop
          muted
          playsInline
          preload="none"
          poster={coverImage}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setAvailable(false);
            setPlaying(false);
          }}
          src={heroVideo}
        />
      </div>
      {available && (
        <button
          className="media-control"
          type="button"
          onClick={() => setManualPlay(!playing)}
          aria-label={
            playing ? "Pausar vídeo de fundo" : "Reproduzir vídeo de fundo"
          }
        >
          {playing ? (
            <Pause size={15} aria-hidden="true" />
          ) : (
            <Play size={15} aria-hidden="true" />
          )}
          <span>{playing ? "Pausar vídeo" : "Reproduzir vídeo"}</span>
        </button>
      )}
    </>
  );
}
