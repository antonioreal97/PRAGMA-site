import {
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  Cable,
  Lightbulb,
  type LucideIcon,
  MonitorPlay,
  RadioTower,
  Users,
} from "lucide-react";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/site/brand";
import { CmsError, CmsLoading } from "@/components/site/cms-status";
import { Header } from "@/components/site/header";
import { HeroMosaic } from "@/components/site/hero-mosaic";
import { ContactForm } from "@/components/site/contact-form";
import { useSiteMotion, useSpotlight } from "@/components/site/motion";
import { SignalChain } from "@/components/site/signal-chain";
import { MethodStory, type MethodStep } from "@/components/site/method-story";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { PhotoGallery } from "@/components/site/photo-gallery";
import {
  hotspotFocus,
  imageDimensions,
  sanityImage,
  tallImage,
  wideImage,
} from "@/sanity/image";
import type { HomePage, SanityImage, SiteSettings } from "@/sanity/types";
import { useHomePage } from "@/sanity/use-home-page";
import { SanityVisualEditing } from "@/sanity/visual-editing";
import { resolveHomeSections, SECTION_ANCHORS } from "@/sanity/section-layout";
import type { HomeSectionId } from "@/sanity/section-layout";

const queryClient = new QueryClient();

const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  som: AudioLines,
  luz: Lightbulb,
  imagem: MonitorPlay,
  infraestrutura: Cable,
  streaming: RadioTower,
  producao: Users,
};

const stagger = (index: number, step = 70): CSSProperties =>
  ({ "--reveal-delay": `${index * step}ms` }) as CSSProperties;

function AccentTitle({
  title,
  accent,
  stacked,
}: {
  title: string;
  accent?: string;
  stacked?: boolean;
}) {
  if (!accent) return title;
  const mark = <em>{accent}</em>;
  return stacked ? (
    <>
      {title}
      <br />
      {mark}
    </>
  ) : (
    <>
      {title} {mark}
    </>
  );
}

function requireImage(image: SanityImage | undefined, label: string) {
  if (!image?.asset) {
    throw new Error(`Imagem ausente no Sanity: ${label}.`);
  }
  return image;
}

function mappedPhoto(image: SanityImage, alt: string, caption: string) {
  const { src, srcSet } = sanityImage(image);
  const { width, height } = imageDimensions(image);
  return { src, srcSet, width, height, alt, caption, focus: hotspotFocus(image) };
}

type MappedPhoto = ReturnType<typeof mappedPhoto>;

const MOODBOARD_SIZES = [
  "(max-width: 900px) 62vw, 36vw",
  "(max-width: 900px) 28vw, 16vw",
  "(max-width: 900px) 28vw, 16vw",
  "(max-width: 900px) 30vw, 18vw",
  "(max-width: 900px) 30vw, 16vw",
  "(max-width: 900px) 30vw, 18vw",
];

const MOODBOARD_CELLS = 6;
const MOODBOARD_HOLD_MS = 5000;
/** Igual à animação em `.work-moodboard-cell`: o corte espera o fade terminar. */
const MOODBOARD_FADE_MS = 1800;
const MOODBOARD_PHASE_MS = [0, 700, 1400, 2100, 2800, 3500];

function workMoodboard(feature: MappedPhoto, gallery: MappedPhoto[]) {
  const field = gallery.filter((photo) => photo.src !== feature.src);
  if (field.length < MOODBOARD_CELLS) return null;
  const first = [
    field[0],
    field[1],
    field[5],
    field[2],
    field[3],
    field[4],
  ].filter((photo): photo is MappedPhoto => Boolean(photo));
  const shown = new Set(first.map((photo) => photo.src));
  return [...first, ...field.filter((photo) => !shown.has(photo.src))];
}

function moodboardLane(photos: MappedPhoto[], index: number) {
  const lane: MappedPhoto[] = [];
  for (let cursor = index; cursor < photos.length; cursor += MOODBOARD_CELLS) {
    const photo = photos[cursor];
    if (photo) lane.push(photo);
  }
  return lane;
}

function MoodboardPhoto({
  shot,
  sizes,
  phase,
}: {
  shot: MappedPhoto;
  sizes: string;
  phase: "steady" | "entering" | "leaving";
}) {
  return (
    <img
      src={shot.src}
      srcSet={shot.srcSet}
      sizes={sizes}
      alt={phase === "leaving" ? "" : shot.alt}
      width={shot.width}
      height={shot.height}
      style={{ objectPosition: shot.focus }}
      data-entering={phase === "entering" || undefined}
      data-leaving={phase === "leaving" || undefined}
      decoding="async"
    />
  );
}

function MoodboardCell({
  lane,
  index,
}: {
  lane: MappedPhoto[];
  index: number;
}) {
  const laneRef = useRef(lane);
  laneRef.current = lane;
  const cursor = useRef(0);
  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const sizes = MOODBOARD_SIZES[index] ?? "16vw";
  const phase = MOODBOARD_PHASE_MS[index] ?? 0;
  const signature = lane.map((photo) => photo.src).join("|");

  useEffect(() => {
    const photos = laneRef.current;
    const next = photos[(cursor.current + 1) % photos.length];
    if (!next) return;
    const preload = new Image();
    preload.src = next.src;
  }, [current, signature]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const photos = laneRef.current;
    if (media.matches || photos.length < 2) return;
    let interval = 0;
    const start = window.setTimeout(() => {
      const advance = () => {
        const count = laneRef.current.length;
        if (count < 2) return;
        const previous = cursor.current;
        const next = (previous + 1) % count;
        cursor.current = next;
        setLeaving(previous);
        setCurrent(next);
      };
      advance();
      interval = window.setInterval(advance, MOODBOARD_HOLD_MS);
    }, MOODBOARD_HOLD_MS + phase);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [signature, phase]);

  useEffect(() => {
    if (leaving == null) return;
    const clear = window.setTimeout(() => setLeaving(null), MOODBOARD_FADE_MS);
    return () => window.clearTimeout(clear);
  }, [leaving]);

  const shot = lane[current];
  const outgoing = leaving == null ? undefined : lane[leaving];
  if (!shot) return null;
  const fading = Boolean(outgoing && outgoing.src !== shot.src);

  return (
    <div className="work-moodboard-cell">
      {fading && outgoing ? (
        <MoodboardPhoto shot={outgoing} sizes={sizes} phase="leaving" />
      ) : null}
      <MoodboardPhoto
        key={shot.src}
        shot={shot}
        sizes={sizes}
        phase={fading ? "entering" : "steady"}
      />
    </div>
  );
}

function WorkMoodboard({ photos }: { photos: MappedPhoto[] }) {
  const lanes = useMemo(
    () =>
      Array.from({ length: MOODBOARD_CELLS }, (_, index) =>
        moodboardLane(photos, index),
      ),
    [photos],
  );
  return (
    <div className="work-moodboard">
      {lanes.map((lane, index) => (
        <MoodboardCell key={index} index={index} lane={lane} />
      ))}
    </div>
  );
}

function mappedShot(image: SanityImage, caption: string) {
  return {
    ...wideImage(image),
    caption,
    focus: hotspotFocus(image),
  };
}

function mappedStep(step: HomePage["method"]["steps"][number]): MethodStep {
  const wideAsset = requireImage(step.wide?.image, `método ${step.id} wide`);
  const tallAsset = step.tall?.image?.asset ? step.tall.image : undefined;
  const wide = mappedShot(wideAsset, step.wide.caption);
  const stills = (step.stills ?? []).flatMap((still) => {
    if (!still.image?.asset || !still.caption) return [];
    return [mappedShot(still.image, still.caption)];
  });
  if (stills.length !== (step.stills ?? []).length) {
    throw new Error(`Foto extra incompleta no método ${step.id}.`);
  }
  return {
    id: step.id,
    num: step.num,
    phase: step.phase,
    title: step.title,
    copy: step.copy,
    wide,
    frames: [wide, ...stills],
    tall:
      tallAsset && step.tall?.caption
        ? {
            ...tallImage(tallAsset),
            caption: step.tall.caption,
            focus: hotspotFocus(tallAsset),
          }
        : undefined,
  };
}

function bootPhotoUrls(home: HomePage) {
  const images: SanityImage[] = [
    ...(home.hero.mosaic ?? []),
    home.about.image,
    ...home.work.cards.map((card) => card.image),
    ...home.gallery.photos.map((photo) => photo.image),
    ...home.method.steps.flatMap((step) => [
      step.wide?.image,
      step.tall?.image,
      ...(step.stills ?? []).map((still) => still.image),
    ]),
  ].filter((image): image is SanityImage => Boolean(image?.asset));

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const image of images) {
    const id = image.asset?._id || image.asset?.url;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    urls.push(sanityImage(image, [1280]).src);
  }
  return urls;
}

function releaseBoot(photos: string[]) {
  document.dispatchEvent(new CustomEvent("pragma-boot", { detail: { photos } }));
}

function Home() {
  const page = useHomePage();
  useEffect(() => {
    if (page.isPending) return;
    releaseBoot(page.data ? bootPhotoUrls(page.data.home) : []);
  }, [page.isPending, page.data]);
  if (page.isPending) return <CmsLoading />;
  if (page.isError) {
    const error =
      page.error instanceof Error
        ? page.error
        : new Error(String(page.error));
    return <CmsError error={error} onRetry={() => void page.refetch()} />;
  }
  return <HomeLoaded home={page.data.home} settings={page.data.settings} />;
}

function HomeLoaded({
  home,
  settings,
}: {
  home: HomePage;
  settings: SiteSettings;
}) {
  useSiteMotion();
  const spotlight = useSpotlight();
  const visibleSections = resolveHomeSections(home.sections, home.sectionOrder);
  const sectionNames = Object.fromEntries(
    visibleSections.map(({ id, name }) => [id, name]),
  ) as Partial<Record<HomeSectionId, string>>;
  const visibleAnchors = new Set(visibleSections.map(({ id }) => SECTION_ANCHORS[id]));
  const navLinks = settings.nav
    .filter(({ id }) => visibleAnchors.has(id))
    .map((link) => {
      const section = visibleSections.find(({ id }) => SECTION_ANCHORS[id] === link.id);
      return { ...link, label: section?.name || link.label };
    });
  const showHeroLink = (href: string) =>
    !href.startsWith("#") || href === "#top" || visibleAnchors.has(href.slice(1));

  useEffect(() => {
    document.title = settings.seoTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", settings.seoDescription);
  }, [settings.seoDescription, settings.seoTitle]);

  const aboutImage = requireImage(home.about.image, "about");
  const aboutPhoto = mappedPhoto(aboutImage, home.about.alt, home.about.caption);
  const galleryPhotos = home.gallery.photos.map((photo, index) =>
    mappedPhoto(
      requireImage(photo.image, `galeria ${index + 1}`),
      photo.alt,
      photo.caption,
    ),
  );
  const mosaicTiles = (home.hero.mosaic ?? [])
    .filter((image): image is SanityImage => Boolean(image?.asset))
    .map((image) => {
      const { src, srcSet } = sanityImage(image, [480, 720, 960]);
      const { width, height } = imageDimensions(image);
      return { src, srcSet, width, height };
    });
  const methodSteps = home.method.steps.map(mappedStep);
  const [feature, ...tiles] = home.work.cards;
  if (!feature) {
    throw new Error("Seção Em campo no Sanity precisa de ao menos um card.");
  }
  const featureImage = requireImage(feature.image, feature.title);
  const moodboard = workMoodboard(
    mappedPhoto(featureImage, feature.alt, feature.title),
    galleryPhotos,
  );
  const contentSections: Record<HomeSectionId, () => ReactNode> = {
    about: () => (
      <section className="section intro" id="about" tabIndex={-1}>
        <div className="wrap intro-layout">
          <div data-reveal>
            <div className="section-label">{sectionNames.about || home.about.label}</div>
            <h2 className="section-title">
              <AccentTitle
                title={home.about.title}
                accent={home.about.titleAccent}
              />
            </h2>
            <figure className="intro-photo">
              <div className="frame frame-corners">
                <img
                  src={aboutPhoto.src}
                  srcSet={aboutPhoto.srcSet}
                  sizes="(max-width: 900px) 92vw, 42vw"
                  alt={aboutPhoto.alt}
                  width={aboutPhoto.width}
                  height={aboutPhoto.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="mono">{home.about.caption}</figcaption>
            </figure>
          </div>
          <div className="intro-copy" data-reveal style={stagger(1, 120)}>
            {home.about.copy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="number-list">
              {home.about.points.map((copy, index) => (
                <div className="number-item" key={copy}>
                  <span className="num">/ 0{index + 1}</span>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    capabilities: () => (
      <section className="section capabilities" id="capabilities" tabIndex={-1}>
        <div className="fx-grid" aria-hidden="true" />
        <div className="wrap">
          <div className="cap-head" data-reveal>
            <div>
              <div className="section-label">{sectionNames.capabilities || home.capabilities.label}</div>
              <h2 className="section-title">
                <AccentTitle
                  title={home.capabilities.title}
                  accent={home.capabilities.titleAccent}
                  stacked
                />
              </h2>
            </div>
            <p>{home.capabilities.intro}</p>
          </div>
          <div className="cap-grid">
            {home.capabilities.items.map((item, position) => {
              const Icon = CAPABILITY_ICONS[item.icon];
              if (!Icon) {
                throw new Error(
                  `Ícone de capacidade desconhecido: "${item.icon}".`,
                );
              }
              return (
                <article
                  className="panel cap-card"
                  key={item.num}
                  data-reveal
                  style={stagger(position % 3)}
                  {...spotlight}
                  data-testid={`card-capability-${item.num}`}
                >
                  <div className="cap-top">
                    <span className="cap-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                    <span className="cap-index" aria-hidden="true">
                      {item.num}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ),
    work: () => (
      <section className="section work" id="work" tabIndex={-1}>
        <div className="wrap">
          <div data-reveal>
            <div className="section-label">{sectionNames.work || home.work.label}</div>
            <h2 className="section-title">
              <AccentTitle
                title={home.work.title}
                accent={home.work.titleAccent}
              />
            </h2>
          </div>
          <div className="work-grid">
            <WorkCard card={feature} featured moodboard={moodboard} />
            <div className="work-stack">
              {tiles.map((card, index) => (
                <WorkCard
                  key={card.title}
                  card={card}
                  delay={index + 1}
                  spotlight={spotlight}
                />
              ))}
              <p
                className="work-statement"
                data-reveal
                style={stagger(tiles.length + 1, 110)}
              >
                {home.work.statementLine1}
                <br />
                <span>{home.work.statementLine2}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    ),
    broadcast: () => (
      <section
        className="section signal"
        id="signal"
        aria-labelledby="signal-title"
        tabIndex={-1}
      >
        <div className="fx-grid" aria-hidden="true" />
        <div className="wrap signal-head" data-reveal>
          <div>
            <div className="section-label">{sectionNames.broadcast || home.broadcast.label}</div>
            <h2 className="section-title" id="signal-title">
              <AccentTitle
                title={home.broadcast.title}
                accent={home.broadcast.titleAccent}
              />
            </h2>
          </div>
          <p>{home.broadcast.intro}</p>
        </div>
        <div className="wrap" data-reveal style={stagger(1, 120)}>
          <SignalChain stations={home.broadcast.stations} />
        </div>
      </section>
    ),
    gallery: () => (
      <section
        className="section gallery-section"
        id="bastidores"
        aria-labelledby="gallery-title"
        tabIndex={-1}
      >
        <div className="wrap" data-reveal>
          <div className="section-label">{sectionNames.gallery || home.gallery.label}</div>
          <h2 className="section-title" id="gallery-title">
            <AccentTitle
              title={home.gallery.title}
              accent={home.gallery.titleAccent}
            />
          </h2>
        </div>
        <PhotoGallery photos={galleryPhotos} />
      </section>
    ),
    method: () => (
      <MethodStory
        method={{
          ...home.method,
          label: sectionNames.method || home.method.label,
          steps: methodSteps,
        }}
      />
    ),
    contact: () => (
      <section className="section contact" id="contact" tabIndex={-1}>
        <div className="wrap contact-layout">
          <div data-reveal>
            <div className="eyebrow mono">{sectionNames.contact || home.contact.eyebrow}</div>
            <h2>
              {home.contact.title}
              {home.contact.titleAccent ? (
                <>
                  <br />
                  <span className="accent-gradient">
                    {home.contact.titleAccent}
                  </span>
                </>
              ) : null}
            </h2>
            <p className="contact-note">{home.contact.note}</p>
            <a
              className="contact-email text-link"
              href={`mailto:${settings.email}`}
            >
              {settings.email} <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div data-reveal style={stagger(1, 120)}>
            <ContactForm email={settings.email} form={home.contact.form} />
          </div>
        </div>
      </section>
    ),
  };
  return (
    <div className="pragma-page">
      <a className="skip-link" href="#top">
        Pular para o conteúdo
      </a>
      <Header links={navLinks} />
      <main id="top" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <HeroMosaic tiles={mosaicTiles} />
          <div className="wrap hero-grid">
            <div className="hero-content">
              <p className="eyebrow mono">
                <span className="live-dot" aria-hidden="true" />
                <span>
                  {home.hero.eyebrow.split("/")[0]?.trim() || home.hero.eyebrow}
                </span>
                <span className="since-slash" aria-hidden="true">
                  /
                </span>
                <span>desde 2016</span>
              </p>
              <h1 id="hero-title">
                <span className="hero-line">
                  <span style={{ "--line-delay": "80ms" } as CSSProperties}>
                    {home.hero.titleLine1}
                  </span>
                </span>
                <span className="hero-line">
                  <span
                    className="accent-gradient"
                    style={{ "--line-delay": "220ms" } as CSSProperties}
                  >
                    {home.hero.titleLine2}
                  </span>
                </span>
              </h1>
              <p className="hero-copy">{home.hero.copy}</p>
              <div className="hero-actions">
                {showHeroLink(home.hero.primaryCtaHref) ? (
                  <Button asChild size="lg">
                    <a href={home.hero.primaryCtaHref} data-testid="link-hero-contact">
                      {home.hero.primaryCtaLabel}{" "}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                ) : null}
                {showHeroLink(home.hero.secondaryCtaHref) ? (
                  <a className="text-link" href={home.hero.secondaryCtaHref}>
                    {home.hero.secondaryCtaLabel}{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="hero-console" aria-hidden="true">
            <div className="wrap">
              <ul className="mono">
                {home.capabilities.items.map((item, position) => (
                  <li key={item.num} className={position > 2 ? "optional" : ""}>
                    {item.title}
                  </li>
                ))}
                <li className="hero-console-now">{home.hero.consoleLocation}</li>
              </ul>
            </div>
          </div>
        </section>

        {visibleSections.map(({ id }) => (
          <Fragment key={id}>{contentSections[id]()}</Fragment>
        ))}
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <Brand />
            <p>{settings.footerTagline}</p>
          </div>
          <nav className="footer-links" aria-label="Navegação do rodapé">
            <a href={`mailto:${settings.email}`} data-testid="link-email">
              {settings.email} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="#top" data-testid="link-back-top">
              Voltar ao topo <ArrowUp size={16} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </footer>
      <div className="fx-grain" aria-hidden="true" />
    </div>
  );
}

function WorkCard({
  card,
  featured,
  moodboard,
  delay = 0,
  spotlight,
}: {
  card: HomePage["work"]["cards"][number];
  featured?: boolean;
  moodboard?: MappedPhoto[] | null;
  delay?: number;
  spotlight?: ReturnType<typeof useSpotlight>;
}) {
  const image = requireImage(card.image, card.title);
  const photo = mappedPhoto(image, card.alt, card.title);
  if (featured) {
    return (
      <article
        className="work-feature"
        data-reveal
        data-testid={card.testId ?? "card-project-feature"}
      >
        <div className="frame frame-corners work-media">
          {moodboard ? (
            <WorkMoodboard photos={moodboard} />
          ) : (
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(max-width: 900px) 92vw, 56vw"
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className="work-bottom">
          {card.kicker ? <p className="section-label">{card.kicker}</p> : null}
          <h3>{card.title}</h3>
          <p>{card.copy}</p>
        </div>
      </article>
    );
  }
  return (
    <article
      className="panel work-tile"
      data-reveal
      style={stagger(delay, 110)}
      {...spotlight}
      data-testid={card.testId ?? `card-project-${delay}`}
    >
      <div className="frame work-tile-media">
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="(max-width: 900px) 92vw, 28vw"
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div>
        <h3>{card.title}</h3>
        <p>{card.copy}</p>
      </div>
    </article>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
        <SanityVisualEditing />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
