import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { useScrollProgress } from "./motion";

type NavLink = {
  id: string;
  label: string;
};

export function Header({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const { progress, stuck } = useScrollProgress();
  const ref = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // A narrow reading band gives one current section without a scroll listener.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else
            setActive((current) =>
              current === entry.target.id ? "" : current,
            );
        }
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    links.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const navigate = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.focus({ preventScroll: true });
  };

  return (
    <header
      ref={ref}
      className="topbar"
      data-stuck={stuck}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <div className="wrap topbar-inner">
        <a
          className="brand"
          href="#top"
          onClick={() => navigate("top")}
          data-testid="link-home"
        >
          <Brand />
        </a>
        <button
          ref={trigger}
          className="menu-button"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          data-testid="button-menu"
        >
          {open ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
        <nav
          id="site-nav"
          className={`nav ${open ? "open" : ""}`}
          aria-label="Navegação principal"
        >
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => navigate(id)}
              aria-current={active === id ? "location" : undefined}
              className={id === "contact" ? "nav-cta" : undefined}
              data-testid={`link-${id}`}
            >
              {label}
              {id === "contact" && (
                <ArrowUpRight size={16} aria-hidden="true" />
              )}
            </a>
          ))}
        </nav>
      </div>
      <div
        className="topbar-progress"
        style={{ "--progress": progress } as CSSProperties}
        aria-hidden="true"
      />
    </header>
  );
}
