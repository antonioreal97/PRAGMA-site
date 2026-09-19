import { useEffect, useRef, useState } from "react";
import coverImage from "@assets/pragma-brand-cover.png";
import heroVideo from "@assets/1108328_1080p_4k_1280x720_1789673316521.mp4";

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
    <div className="hero-media" aria-hidden="true">
      {!available && (
        <img src={coverImage} alt="" width={1536} height={1024} />
      )}
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
  );
}
