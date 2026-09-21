import { ArrowDown, Camera } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { motionAllowed } from "./motion";

const PORTRAIT = "(orientation: portrait)";

export type MethodShot = {
  src: string;
  srcSet: string;
  caption: string;
  focus: string;
};

export type MethodStep = {
  id: string;
  num: string;
  phase: string;
  title: string;
  copy: string;
  wide: MethodShot;
  tall?: MethodShot;
};

export type MethodContent = {
  label: string;
  title: string;
  titleAccent?: string;
  intro: string;
  cue: string;
  steps: MethodStep[];
};

function Photo({ step }: { step: MethodStep }) {
  return (
    <picture>
      {step.tall && (
        <source
          media={PORTRAIT}
          srcSet={step.tall.srcSet}
          sizes="160vw"
        />
      )}
      <img
        src={step.wide.src}
        srcSet={step.wide.srcSet}
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function MethodStory({ method }: { method: MethodContent }) {
  const { steps } = method;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [reached, setReached] = useState(1);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    let frame = 0;
    let current = -1;

    const measure = () => {
      frame = 0;
      let next = -1;
      let local = 0;
      stepRefs.current.forEach((step, index) => {
        const card = cardRefs.current[index];
        if (!step || !card) return;
        const block = step.getBoundingClientRect();
        const box = card.getBoundingClientRect();
        const offset = box.top - block.top;
        if (offset > 1) {
          next = index;
          local = Math.min(1, offset / Math.max(1, block.height - box.height));
        }
      });
      stage.style.setProperty("--local", local.toFixed(4));
      stage.style.setProperty(
        "--progress",
        next < 0 ? "0" : ((next + local) / steps.length).toFixed(4),
      );
      if (next !== current) {
        current = next;
        setActive(next);
        setReached((far) => Math.max(far, next + 1));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const listen = (on: boolean) => {
      const methodName = on ? "addEventListener" : "removeEventListener";
      window[methodName]("scroll", schedule, { passive: true });
      window[methodName]("resize", schedule);
    };
    const observer = new IntersectionObserver(([entry]) => {
      listen(entry.isIntersecting);
      if (entry.isIntersecting) schedule();
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const step = stepRefs.current[index];
    const card = cardRefs.current[index];
    if (!step || !card) return;
    event.preventDefault();
    const bottom = parseFloat(getComputedStyle(card).bottom) || 0;
    const land = window.innerHeight - bottom - card.offsetHeight;
    window.scrollTo({
      top: window.scrollY + step.getBoundingClientRect().top - land + 24,
      behavior: motionAllowed() ? "smooth" : "auto",
    });
    card.focus({ preventScroll: true });
  };

  const shown = Math.max(active, 0);
  const current = steps[shown];
  if (!current) {
    throw new Error("Método no Sanity não tem etapas.");
  }
  const phase = current.phase;

  return (
    <section
      ref={sectionRef}
      className="method"
      id="method"
      aria-labelledby="method-title"
      tabIndex={-1}
    >
      <div
        ref={stageRef}
        className="method-stage"
        data-intro={active < 0 || undefined}
        style={{ "--count": steps.length } as CSSProperties}
      >
        <div className="method-frames" aria-hidden="true">
          {steps.map((step, index) => (
            <figure
              key={step.id}
              className="method-frame"
              data-state={
                index < shown ? "past" : index === shown ? "active" : "future"
              }
              style={
                {
                  "--focus-wide": step.wide.focus,
                  "--focus-tall": (step.tall ?? step.wide).focus,
                } as CSSProperties
              }
            >
              {index <= reached && <Photo step={step} />}
            </figure>
          ))}
        </div>
        <div className="method-scrim" aria-hidden="true" />
        <div className="method-veil" aria-hidden="true" />
        <div className="method-corners" aria-hidden="true" />
        <div className="method-hud" aria-hidden="true">
          <p className="method-hud-pill mono">
            <span
              className="live-dot"
              data-still={phase !== "Ao vivo" || undefined}
            />
            {phase}
          </p>
          <p className="method-hud-pill mono">
            {pad(shown + 1)} / {pad(steps.length)}
          </p>
        </div>
        <nav className="method-rail" aria-label="Etapas do método">
          <ol>
            {steps.map((step, index) => (
              <li key={step.id}>
                <a
                  href={`#metodo-${step.id}`}
                  aria-current={index === active ? "step" : undefined}
                  style={{ "--i": index } as CSSProperties}
                  onClick={(event) => jump(event, index)}
                >
                  <span className="method-rail-label">{step.title}</span>
                  <span className="method-rail-bar" aria-hidden="true">
                    <i />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="method-track">
        <header className="method-intro">
          <div className="wrap">
            <div className="section-label">{method.label}</div>
            <h2 className="section-title" id="method-title">
              {method.title}
              {method.titleAccent ? (
                <>
                  {" "}
                  <em>{method.titleAccent}</em>
                </>
              ) : null}
            </h2>
            <p>{method.intro}</p>
            <p className="method-cue mono" aria-hidden="true">
              <ArrowDown size={14} />
              {method.cue}
            </p>
          </div>
        </header>
        <ol className="method-steps">
          {steps.map((step, index) => (
            <li
              key={step.id}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              id={`metodo-${step.id}`}
              className="method-step"
              data-active={index === active || undefined}
              data-testid={`step-method-${step.num}`}
            >
              <div className="wrap method-step-inner">
                <article
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="method-card"
                  tabIndex={-1}
                  aria-labelledby={`metodo-${step.id}-title`}
                >
                  <p className="method-card-meta mono">
                    <span>{step.num}</span>
                    {step.phase}
                  </p>
                  <h3 id={`metodo-${step.id}-title`}>{step.title}</h3>
                  <p className="method-card-copy">{step.copy}</p>
                  <p className="method-card-caption mono">
                    <Camera size={13} aria-hidden="true" />
                    <span
                      className={
                        step.tall ? "caption-wide" : "caption-wide caption-tall"
                      }
                    >
                      {step.wide.caption}
                    </span>
                    {step.tall && (
                      <span className="caption-tall">{step.tall.caption}</span>
                    )}
                  </p>
                </article>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
