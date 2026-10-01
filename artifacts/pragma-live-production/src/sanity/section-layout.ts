export const DEFAULT_SECTION_ORDER = [
  "about",
  "capabilities",
  "work",
  "broadcast",
  "gallery",
  "method",
  "contact",
] as const;

export type HomeSectionId = (typeof DEFAULT_SECTION_ORDER)[number];
export type HomeSection = { id: HomeSectionId; name?: string };

const isHomeSectionId = (value: string): value is HomeSectionId =>
  (DEFAULT_SECTION_ORDER as readonly string[]).includes(value);

export const SECTION_ANCHORS: Record<HomeSectionId, string> = {
  about: "about",
  capabilities: "capabilities",
  work: "work",
  broadcast: "signal",
  gallery: "bastidores",
  method: "method",
  contact: "contact",
};

export function resolveHomeSections(
  sections?: { id: string; name?: string }[],
  sectionOrder?: string[],
): HomeSection[] {
  const items: { id: string; name?: string }[] = Array.isArray(sections)
    ? sections
    : Array.isArray(sectionOrder)
      ? sectionOrder.map((id) => ({ id }))
      : DEFAULT_SECTION_ORDER.map((id) => ({ id }));
  const seen = new Set<HomeSectionId>();
  const result: HomeSection[] = [];

  for (const item of items) {
    if (!item || !isHomeSectionId(item.id) || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push({
      id: item.id,
      name: typeof item.name === "string" ? item.name.trim() || undefined : undefined,
    });
  }

  return result;
}
