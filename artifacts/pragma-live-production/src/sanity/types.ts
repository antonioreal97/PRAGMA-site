export type SanityImage = {
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
  hotspot?: {
    x: number;
    y: number;
  };
};

export type NavLink = {
  id: string;
  label: string;
};

export type SiteSettings = {
  email: string;
  footerTagline: string;
  seoTitle: string;
  seoDescription: string;
  nav: NavLink[];
};

export type HomePage = {
  sectionOrder?: string[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    copy: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    consoleLocation: string;
    mosaic?: SanityImage[];
  };
  about: {
    label: string;
    title: string;
    titleAccent?: string;
    copy: string[];
    points: string[];
    image: SanityImage;
    alt: string;
    caption: string;
  };
  capabilities: {
    label: string;
    title: string;
    titleAccent?: string;
    intro: string;
    items: { num: string; title: string; copy: string; icon: string }[];
  };
  work: {
    label: string;
    title: string;
    titleAccent?: string;
    statementLine1: string;
    statementLine2: string;
    cards: {
      kicker?: string;
      title: string;
      copy: string;
      testId?: string;
      image: SanityImage;
      alt: string;
    }[];
  };
  broadcast: {
    label: string;
    title: string;
    titleAccent?: string;
    intro: string;
    stations: { id: string; name: string; note: string }[];
  };
  gallery: {
    label: string;
    title: string;
    titleAccent?: string;
    photos: {
      image: SanityImage;
      alt: string;
      caption: string;
    }[];
  };
  method: {
    label: string;
    title: string;
    titleAccent?: string;
    intro: string;
    cue: string;
    steps: {
      id: string;
      num: string;
      phase: string;
      title: string;
      copy: string;
      wide: { image: SanityImage; caption: string };
      tall?: { image?: SanityImage; caption?: string };
      stills?: { image?: SanityImage; caption?: string }[];
    }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    titleAccent?: string;
    note: string;
  };
};

export type HomePayload = {
  home: HomePage;
  settings: SiteSettings;
};
