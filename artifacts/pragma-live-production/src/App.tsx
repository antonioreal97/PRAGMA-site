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
import { useEffect, type CSSProperties } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/site/brand";
import { CmsError, CmsLoading } from "@/components/site/cms-status";
import { Header } from "@/components/site/header";
import { HeroMosaic } from "@/components/site/hero-mosaic";
import { SinceCounter } from "@/components/site/since-counter";
import { ContactForm } from "@/components/site/contact-form";
import { useSiteMotion, useSpotlight } from "@/components/site/motion";
import { StageLayers } from "@/components/site/stage-layers";
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
  return { src, srcSet, width, height, alt, caption };
}

function mappedStep(step: HomePage["method"]["steps"][number]): MethodStep {
  const wideAsset = requireImage(step.wide?.image, `método ${step.id} wide`);
  const tallAsset = step.tall?.image?.asset ? step.tall.image : undefined;
  return {
    id: step.id,
    num: step.num,
    phase: step.phase,
    title: step.title,
    copy: step.copy,
    wide: {
      ...wideImage(wideAsset),
      caption: step.wide.caption,
      focus: hotspotFocus(wideAsset),
    },
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
    ...home.method.steps.flatMap((step) => [step.wide?.image, step.tall?.image]),
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

  return (
    <div className="pragma-page">
      <a className="skip-link" href="#top">
        Pular para o conteúdo
      </a>
      <Header links={settings.nav} />
      <main id="top" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <HeroMosaic tiles={mosaicTiles} />
          <div className="wrap hero-grid">
            <div className="hero-content">
              <p className="eyebrow mono">
                <span className="live-dot" aria-hidden="true" />
                <SinceCounter eyebrow={home.hero.eyebrow} />
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
                <Button asChild size="lg">
                  <a href={home.hero.primaryCtaHref} data-testid="link-hero-contact">
                    {home.hero.primaryCtaLabel}{" "}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
                <a className="text-link" href={home.hero.secondaryCtaHref}>
                  {home.hero.secondaryCtaLabel}{" "}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
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

        <section className="section intro" id="about" tabIndex={-1}>
          <div className="wrap intro-layout">
            <div data-reveal>
              <div className="section-label">{home.about.label}</div>
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

        <section
          className="section anatomy"
          id="anatomy"
          aria-labelledby="anatomy-title"
          tabIndex={-1}
        >
          <div className="wrap anatomy-head" data-reveal>
            <div>
              <div className="section-label">{home.anatomy.label}</div>
              <h2 className="section-title" id="anatomy-title">
                <AccentTitle
                  title={home.anatomy.title}
                  accent={home.anatomy.titleAccent}
                />
              </h2>
            </div>
            <p>{home.anatomy.intro}</p>
          </div>
          <div className="wrap" data-reveal style={stagger(1, 120)}>
            <StageLayers layers={home.anatomy.layers} />
          </div>
        </section>

        <section
          className="section capabilities"
          id="capabilities"
          tabIndex={-1}
        >
          <div className="fx-grid" aria-hidden="true" />
          <div className="wrap">
            <div className="cap-head" data-reveal>
              <div>
                <div className="section-label">{home.capabilities.label}</div>
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

        <section className="section work" id="work" tabIndex={-1}>
          <div className="wrap">
            <div data-reveal>
              <div className="section-label">{home.work.label}</div>
              <h2 className="section-title">
                <AccentTitle
                  title={home.work.title}
                  accent={home.work.titleAccent}
                />
              </h2>
            </div>
            <div className="work-grid">
              <WorkCard card={feature} featured />
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

        <section
          className="section signal"
          id="signal"
          aria-labelledby="signal-title"
          tabIndex={-1}
        >
          <div className="fx-grid" aria-hidden="true" />
          <div className="wrap signal-head" data-reveal>
            <div>
              <div className="section-label">{home.broadcast.label}</div>
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

        <section
          className="section gallery-section"
          id="bastidores"
          aria-labelledby="gallery-title"
          tabIndex={-1}
        >
          <div className="wrap" data-reveal>
            <div className="section-label">{home.gallery.label}</div>
            <h2 className="section-title" id="gallery-title">
              <AccentTitle
                title={home.gallery.title}
                accent={home.gallery.titleAccent}
              />
            </h2>
          </div>
          <PhotoGallery photos={galleryPhotos} />
        </section>

        <MethodStory
          method={{
            ...home.method,
            steps: methodSteps,
          }}
        />

        <section className="section contact" id="contact" tabIndex={-1}>
          <div className="wrap contact-layout">
            <div data-reveal>
              <div className="eyebrow mono">{home.contact.eyebrow}</div>
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
              <ContactForm email={settings.email} />
            </div>
          </div>
        </section>
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
  delay = 0,
  spotlight,
}: {
  card: HomePage["work"]["cards"][number];
  featured?: boolean;
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
