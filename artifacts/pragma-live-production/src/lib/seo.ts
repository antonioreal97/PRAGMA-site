import type { HomePage, SiteSettings } from "@/sanity/types";

export const DEFAULT_SITE_URL = "https://pragmasite.vercel.app";
export const DEFAULT_SEO_TITLE =
  "Produção de eventos, som, luz e LED em Brasília | PRAGMA";
export const DEFAULT_SEO_DESCRIPTION =
  "Produção técnica e audiovisual para eventos em Brasília: som, iluminação, painel de LED, transmissão ao vivo, captação e estrutura.";

function compact(value?: string) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function normalizeSiteUrl(value?: string) {
  return compact(value || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function resolveSeoTitle(value?: string) {
  const title = compact(value);
  if (!title || title === "PRAGMA Live Production") return DEFAULT_SEO_TITLE;
  if (/bras[ií]lia/i.test(title)) return title;
  const suffix = " | Produção de eventos em Brasília";
  return title.length + suffix.length <= 65 ? `${title}${suffix}` : title;
}

export function resolveSeoDescription(value?: string) {
  const description = compact(value);
  if (!description) return DEFAULT_SEO_DESCRIPTION;
  if (/bras[ií]lia/i.test(description)) return description;
  const suffix = " Atendimento em Brasília, DF.";
  return description.length + suffix.length <= 165
    ? `${description.replace(/[.]?$/, ".")}${suffix}`
    : description;
}

export function socialImageUrl(home: HomePage) {
  const source =
    home.about.image?.asset?.url || home.hero.mosaic?.[0]?.asset?.url || "";
  if (!source) return "";
  const separator = source.includes("?") ? "&" : "?";
  return `${source}${separator}w=1200&h=630&fit=crop&auto=format`;
}

export type FaqEntry = { question: string; answer: string };

export function faqEntries(home: HomePage): FaqEntry[] {
  const services = home.capabilities.items
    .map(({ title }) => compact(title))
    .filter(Boolean);
  const location = compact(home.hero.consoleLocation) || "Brasília, DF";
  const eventFormats = home.method.steps
    .map(({ title }) => compact(title))
    .filter((title) =>
      /evento|show|festival|casamento|celebra|podcast|online|campeonato|gamer/i.test(
        title,
      ),
    );

  return [
    {
      question: "Quais serviços a PRAGMA oferece?",
      answer: services.length
        ? `A PRAGMA oferece ${services.join(", ")}. A equipe integra planejamento, equipamentos e operação técnica em uma única produção.`
        : compact(home.hero.copy),
    },
    ...(eventFormats.length
      ? [
          {
            question: "Que tipos de eventos a PRAGMA atende?",
            answer: `A PRAGMA atende ${eventFormats.join(", ")}, além de projetos técnicos e audiovisuais personalizados.`,
          },
        ]
      : []),
    {
      question: "Onde fica a PRAGMA Live Production?",
      answer: `A PRAGMA tem base em ${location}. Para confirmar disponibilidade e atendimento no local do seu evento, fale diretamente com a equipe.`,
    },
    {
      question: "Como solicitar um orçamento para um evento?",
      answer: `Use o formulário do site ou fale com a PRAGMA pelo WhatsApp. ${compact(home.contact.note)}`,
    },
  ];
}

function phoneNumber(value?: string) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits ? `+${digits}` : undefined;
}

export function buildStructuredData(
  home: HomePage,
  settings: SiteSettings,
  siteUrlValue?: string,
) {
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  const image = socialImageUrl(home);
  const telephone = phoneNumber(settings.whatsapp);
  const services = home.capabilities.items.map(({ title, copy }) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: compact(title),
      description: compact(copy),
      areaServed: "Brasília, Distrito Federal, Brasil",
      provider: { "@id": `${siteUrl}/#organization` },
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "PRAGMA Live Production",
        url: `${siteUrl}/`,
        logo: `${siteUrl}/favicon.svg`,
        ...(image ? { image } : {}),
        description: resolveSeoDescription(settings.seoDescription),
        foundingDate: "2016",
        email: settings.email,
        ...(telephone
          ? {
              telephone,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                telephone,
                availableLanguage: "Portuguese",
              },
            }
          : {}),
        location: {
          "@type": "Place",
          name: compact(home.hero.consoleLocation) || "Brasília, DF",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Brasília",
            addressRegion: "DF",
            addressCountry: "BR",
          },
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Distrito Federal, Brasil",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Serviços de produção técnica e audiovisual",
          itemListElement: services,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "PRAGMA Live Production",
        inLanguage: "pt-BR",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: resolveSeoTitle(settings.seoTitle),
        description: resolveSeoDescription(settings.seoDescription),
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faqEntries(home).map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

function setMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function applySeoHead(home: HomePage, settings: SiteSettings) {
  const siteUrl = normalizeSiteUrl(window.location.origin);
  const title = resolveSeoTitle(settings.seoTitle);
  const description = resolveSeoDescription(settings.seoDescription);
  const image = socialImageUrl(home);
  document.title = title;

  setMeta('meta[name="description"]', "name", "description", description);
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  setMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    description,
  );
  setMeta('meta[property="og:url"]', "property", "og:url", `${siteUrl}/`);
  setMeta('meta[property="og:site_name"]', "property", "og:site_name", "PRAGMA Live Production");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  setMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    description,
  );
  if (image) {
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta(
      'meta[property="og:image:alt"]',
      "property",
      "og:image:alt",
      "Equipe da PRAGMA Live Production em um evento",
    );
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
    setMeta(
      'meta[name="twitter:image:alt"]',
      "name",
      "twitter:image:alt",
      "Equipe da PRAGMA Live Production em um evento",
    );
  }

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = `${siteUrl}/`;

  let structuredData = document.head.querySelector<HTMLScriptElement>(
    "#pragma-structured-data",
  );
  if (!structuredData) {
    structuredData = document.createElement("script");
    structuredData.id = "pragma-structured-data";
    structuredData.type = "application/ld+json";
    document.head.appendChild(structuredData);
  }
  structuredData.textContent = JSON.stringify(
    buildStructuredData(home, settings, siteUrl),
  );
}
