import type { Plugin } from "vite";
import { homePageQuery } from "./src/sanity/queries";
import type { HomePayload } from "./src/sanity/types";
import {
  DEFAULT_SITE_URL,
  buildStructuredData,
  faqEntries,
  normalizeSiteUrl,
  resolveSeoDescription,
  resolveSeoTitle,
  socialImageUrl,
} from "./src/lib/seo";

const projectId = process.env.VITE_SANITY_PROJECT_ID || "cy9xfpoq";
const dataset = process.env.VITE_SANITY_DATASET || "production";
const apiVersion = "2026-09-21";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

async function fetchHomePayload() {
  const endpoint = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
  );
  endpoint.searchParams.set("query", homePageQuery);
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Sanity respondeu ${response.status} ao gerar o SEO.`);
  }
  const body = (await response.json()) as { result?: HomePayload };
  if (!body.result?.home || !body.result.settings) {
    throw new Error("Conteúdo SEO ausente no Sanity.");
  }
  return body.result;
}

function headMarkup(payload: HomePayload, siteUrlValue: string) {
  const { home, settings } = payload;
  const siteUrl = normalizeSiteUrl(siteUrlValue);
  const title = resolveSeoTitle(settings.seoTitle);
  const description = resolveSeoDescription(settings.seoDescription);
  const image = socialImageUrl(home);
  return `<!-- seo:head:start -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${escapeHtml(siteUrl)}/" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="PRAGMA Live Production" />
    <meta property="og:url" content="${escapeHtml(siteUrl)}/" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Equipe da PRAGMA Live Production em um evento" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta name="twitter:image:alt" content="Equipe da PRAGMA Live Production em um evento" />` : ""}
    <script id="pragma-structured-data" type="application/ld+json">${jsonLd(
      buildStructuredData(home, settings, siteUrl),
    )}</script>
    <!-- seo:head:end -->`;
}

function snapshotMarkup(payload: HomePayload) {
  const { home, settings } = payload;
  const whatsapp = settings.whatsapp?.replace(/\D/g, "");
  const title = `${home.hero.titleLine1} ${home.hero.titleLine2}`;
  return `<!-- seo:snapshot:start -->
      <div class="seo-snapshot">
        <header><p>PRAGMA Live Production · ${escapeHtml(home.hero.consoleLocation)}</p></header>
        <main>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(home.hero.copy)}</p>
          <section aria-labelledby="seo-about-title">
            <h2 id="seo-about-title">${escapeHtml(`${home.about.title} ${home.about.titleAccent ?? ""}`)}</h2>
            ${home.about.copy.map((copy) => `<p>${escapeHtml(copy)}</p>`).join("")}
          </section>
          <section aria-labelledby="seo-services-title">
            <h2 id="seo-services-title">Serviços de produção para eventos</h2>
            ${home.capabilities.items
              .map(
                (item) =>
                  `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></article>`,
              )
              .join("")}
          </section>
          <section aria-labelledby="seo-method-title">
            <h2 id="seo-method-title">${escapeHtml(`${home.method.title} ${home.method.titleAccent ?? ""}`)}</h2>
            <p>${escapeHtml(home.method.intro)}</p>
            ${home.method.steps
              .map(
                (step) =>
                  `<article><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.copy)}</p></article>`,
              )
              .join("")}
          </section>
          <section aria-labelledby="seo-faq-title">
            <h2 id="seo-faq-title">Dúvidas frequentes</h2>
            ${faqEntries(home)
              .map(
                ({ question, answer }) =>
                  `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`,
              )
              .join("")}
          </section>
          <section aria-labelledby="seo-contact-title">
            <h2 id="seo-contact-title">Fale com a PRAGMA</h2>
            <p>${escapeHtml(home.contact.note)}</p>
            ${whatsapp ? `<a href="https://wa.me/${whatsapp}">Solicitar orçamento pelo WhatsApp</a>` : ""}
          </section>
        </main>
      </div>
      <!-- seo:snapshot:end -->`;
}

export function seoPrerender(): Plugin {
  return {
    name: "pragma-seo-prerender",
    apply: "build",
    enforce: "pre",
    async transformIndexHtml(html, context) {
      if (!context.filename.endsWith("index.html")) return html;
      try {
        const payload = await fetchHomePayload();
        const siteUrl = normalizeSiteUrl(
          process.env.VITE_SITE_URL || DEFAULT_SITE_URL,
        );
        return html
          .replace(
            /<!-- seo:head:start -->[\s\S]*?<!-- seo:head:end -->/,
            headMarkup(payload, siteUrl),
          )
          .replace(
            /<!-- seo:snapshot:start -->[\s\S]*?<!-- seo:snapshot:end -->/,
            snapshotMarkup(payload),
          );
      } catch (error) {
        console.warn(
          "SEO: não foi possível atualizar o snapshot com o Sanity; usando o fallback do index.html.",
          error,
        );
        return html;
      }
    },
  };
}
