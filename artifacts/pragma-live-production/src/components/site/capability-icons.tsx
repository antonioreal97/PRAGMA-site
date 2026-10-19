import type { CSSProperties, ReactNode } from "react";

type CapabilityIconProps = {
  className?: string;
  style?: CSSProperties;
};

function ServiceIcon({
  className,
  style,
  children,
}: CapabilityIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconSomIluminacao(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <rect x="9" y="17" width="34" height="65" rx="3" />
      <circle cx="26" cy="33" r="8" />
      <circle cx="26" cy="62" r="12" />
      <circle cx="26" cy="62" r="1.8" fill="currentColor" stroke="none" />
      <path d="M14 82v4m24-4v4M53 70v12h18M55 73l-4-12q-1-3 2-6l9-10 15 3M77 48q-10 5-13 21l-11-3" />
      <ellipse cx="76" cy="61" rx="6" ry="14" transform="rotate(22 76 61)" />
      <path d="m86 44 9-5m-8 20 9 2" />
    </ServiceIcon>
  );
}

export function IconPainelLed(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <rect x="10" y="20" width="80" height="58" rx="2" />
      <path d="M30 20v58m20-58v58m20-58v58M10 39h80M10 59h80M17 78v6h8v-6m50 0v6h8v-6" />
    </ServiceIcon>
  );
}

export function IconTransmissao(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <rect x="10" y="41" width="49" height="35" rx="6" />
      <path d="m19 41 7-12h23M30 29v12M59 51h6l18-10v35L65 65h-6M78 25a12 12 0 0 1 12 12M75 14a21 21 0 0 1 21 21" />
    </ServiceIcon>
  );
}

export function IconAudiovisual(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <path d="M21 31h11l6-12h24l6 12h11q9 0 9 9v36q0 8-8 8H65M35 84H20q-8 0-8-8V40q0-9 9-9" />
      <path d="M32 31h36m-45 9h6" />
      <circle cx="50" cy="60" r="24" />
      <circle cx="50" cy="60" r="16" />
    </ServiceIcon>
  );
}

export function IconPodcast(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <rect x="37" y="12" width="26" height="49" rx="13" />
      <path d="M37 27h13m-13 10h13m-13 10h13M28 45v8a22 22 0 0 0 44 0v-8M50 75v13M36 88h28" />
    </ServiceIcon>
  );
}

export function IconGamer(props: CapabilityIconProps) {
  return (
    <ServiceIcon {...props}>
      <rect x="15" y="14" width="70" height="44" rx="2" />
      <path d="M46 58l-2 8m10-8 2 8M40 66h20M20 74h60l9 14H11Z" />
      <circle cx="50" cy="36" r="10" />
      <path d="M50 22v8m0 12v8M36 36h8m12 0h8M23 79h3m5 0h3m5 0h3m5 0h3m5 0h3m5 0h3m5 0h3M21 84h4m6 0h4m6 0h18m6 0h4m6 0h4" />
    </ServiceIcon>
  );
}

type CapabilityIconComponent = (props: CapabilityIconProps) => ReactNode;

const CAPABILITY_ICONS: Record<string, CapabilityIconComponent> = {
  som: IconSomIluminacao,
  luz: IconSomIluminacao,
  imagem: IconPainelLed,
  "painel-led": IconPainelLed,
  streaming: IconTransmissao,
  transmissao: IconTransmissao,
  producao: IconAudiovisual,
  audiovisual: IconAudiovisual,
  podcast: IconPodcast,
  gamer: IconGamer,
};

const CAPABILITY_ICON_BY_TITLE: Record<string, CapabilityIconComponent> = {
  "som e iluminacao": IconSomIluminacao,
  "painel de led": IconPainelLed,
  "transmissao ao vivo": IconTransmissao,
  "producao audiovisual": IconAudiovisual,
  "podcasts e entrevistas": IconPodcast,
  "estrutura gamer": IconGamer,
};

function normalizeCapabilityTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function resolveCapabilityIcon(item: {
  icon: string;
  title: string;
}): CapabilityIconComponent {
  const byTitle =
    CAPABILITY_ICON_BY_TITLE[normalizeCapabilityTitle(item.title)];
  if (byTitle) return byTitle;
  const byKey = CAPABILITY_ICONS[item.icon];
  if (!byKey) {
    throw new Error(
      `Ícone de capacidade desconhecido: "${item.icon}" (serviço: "${item.title}").`,
    );
  }
  return byKey;
}
