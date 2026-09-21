import { useEffect, useRef, useState } from "react";

export function HeroMedia({
  poster,
  videoUrl,
}: {
  poster: string;
  videoUrl?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [available, setAvailable] = useState(Boolean(videoUrl));
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
  }, [videoUrl]);
  return (
    <div aria-hidden="true">
      <div className="hero-media">
        {(!available || !videoUrl) && (
          <img src={poster} alt="" width={1536} height={1024} />
        )}
        {videoUrl && (
          <video
            ref={ref}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={poster}
            onError={() => setAvailable(false)}
            src={videoUrl}
          />
        )}
      </div>
      <div className="hero-scrim" />
      <div className="hero-glow" />
      <div className="fx-grid" />
      <div className="hero-beam" />
    </div>
  );
}
