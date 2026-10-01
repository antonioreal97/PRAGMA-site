import { createClient } from "@sanity/client";

type SectionId =
  | "about"
  | "capabilities"
  | "work"
  | "broadcast"
  | "gallery"
  | "method"
  | "contact";

type HomeDocument = {
  _id: string;
  _rev: string;
  sections?: unknown[];
  sectionOrder?: string[];
  about?: { label?: string };
  capabilities?: { label?: string };
  work?: { label?: string };
  broadcast?: { label?: string };
  gallery?: { label?: string };
  method?: { label?: string };
  contact?: { eyebrow?: string };
};

const defaults: Record<SectionId, string> = {
  about: "O que fazemos",
  capabilities: "Capacidades",
  work: "Em campo",
  broadcast: "Broadcast",
  gallery: "Bastidores",
  method: "Método",
  contact: "Contato",
};

const projectId = process.env.VITE_SANITY_PROJECT_ID;
if (!projectId) throw new Error("VITE_SANITY_PROJECT_ID não definido.");

const options = {
  projectId,
  dataset: process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2026-09-21",
  useCdn: false,
};
const client = process.env.SANITY_API_TOKEN
  ? createClient({ ...options, token: process.env.SANITY_API_TOKEN })
  : (await import("sanity/cli")).getCliClient(options);

const documents = await client.fetch<HomeDocument[]>(
  '*[_id in ["home", "drafts.home"]]{_id, _rev, sections, sectionOrder, about{label}, capabilities{label}, work{label}, broadcast{label}, gallery{label}, method{label}, contact{eyebrow}}',
);
const dryRun = process.argv.includes("--dry-run");

if (!documents.some(({ _id }) => _id === "home")) {
  throw new Error("Documento publicado home não encontrado.");
}

for (const document of documents) {
  if (Array.isArray(document.sections)) {
    console.log(`${document._id}: já migrado; nenhuma alteração.`);
    continue;
  }

  const ids = Array.isArray(document.sectionOrder)
    ? document.sectionOrder
    : Object.keys(defaults);
  const seen = new Set<string>();
  const sections = ids.flatMap((id) => {
    if (!(id in defaults) || seen.has(id)) return [];
    seen.add(id);
    const key = id as SectionId;
    const currentName =
      key === "contact" ? document.contact?.eyebrow : document[key]?.label;
    return [{
      _key: id,
      _type: "object",
      id,
      name: currentName?.trim() || defaults[key],
    }];
  });

  if (!dryRun) {
    await client
      .patch(document._id)
      .ifRevisionId(document._rev)
      .setIfMissing({ sections })
      .commit();
  }
  console.log(`${document._id}${dryRun ? " (simulação)" : ""}: ${sections.map(({ id }) => id).join(", ") || "nenhuma seção"}.`);
}
