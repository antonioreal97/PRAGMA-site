import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { getSanityClient } from "./client";
import type { SanityImage } from "./types";

const WIDE_WIDTHS = [960, 1600, 1920, 2560];
const TALL_WIDTHS = [960, 1080, 1440];
const DEFAULT_WIDTHS = [720, 960, 1280, 1600, 1920];

function builder() {
  return createImageUrlBuilder(getSanityClient());
}

export function hotspotFocus(image?: SanityImage | null) {
  const hotspot = image?.hotspot;
  if (!hotspot) return "50% 50%";
  return `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`;
}

export function sanityImage(
  source: SanityImageSource,
  widths: number[] = DEFAULT_WIDTHS,
) {
  const image = builder().image(source);
  const fallbackWidth = widths.at(-2) ?? widths.at(-1);
  if (!fallbackWidth) {
    throw new Error("sanityImage precisa de ao menos uma largura.");
  }
  const src = image.width(fallbackWidth).auto("format").url();
  const srcSet = widths
    .map((width) => `${builder().image(source).width(width).auto("format").url()} ${width}w`)
    .join(", ");
  return { src, srcSet };
}

export function wideImage(source: SanityImageSource) {
  return sanityImage(source, WIDE_WIDTHS);
}

export function tallImage(source: SanityImageSource) {
  return sanityImage(source, TALL_WIDTHS);
}

export function fileUrl(file?: { asset?: { url?: string } } | null) {
  return file?.asset?.url;
}

export function imageDimensions(image: SanityImage) {
  const width = image.asset?.metadata?.dimensions?.width;
  const height = image.asset?.metadata?.dimensions?.height;
  if (!width || !height) {
    throw new Error("Imagem do Sanity sem metadados de dimensão.");
  }
  return { width, height };
}
