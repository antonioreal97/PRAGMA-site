import { createClient } from "@sanity/client";

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

const dryRun = process.argv.includes("--dry-run");

function normalizeTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Título do serviço → key de ícone no schema. */
const ICON_BY_TITLE: Record<string, string> = {
  "som e iluminacao": "som",
  "painel de led": "painel-led",
  "transmissao ao vivo": "transmissao",
  "producao audiovisual": "audiovisual",
  "podcasts e entrevistas": "podcast",
  "estrutura gamer": "gamer",
};

type CapItem = {
  _key: string;
  num?: string;
  title?: string;
  copy?: string;
  icon?: string;
};

const homeIds = ["home", "drafts.home"] as const;

for (const id of homeIds) {
  const doc = await client.fetch<{
    _id: string;
    _rev: string;
    capabilities?: { items?: CapItem[] };
  } | null>(`*[_id == $id][0]{_id, _rev, capabilities{items[]{_key,num,title,copy,icon}}}`, {
    id,
  });
  if (!doc?.capabilities?.items?.length) {
    console.log(`${id}: sem itens de capacidades, pulando.`);
    continue;
  }

  const items = doc.capabilities.items.map((item) => {
    const title = item.title?.trim() ?? "";
    const nextIcon = ICON_BY_TITLE[normalizeTitle(title)];
    if (!nextIcon) {
      console.warn(
        `  ${item.num ?? "?"} "${title}": sem mapeamento de ícone, mantendo "${item.icon ?? ""}"`,
      );
      return item;
    }
    if (item.icon === nextIcon) {
      console.log(`  ${item.num ?? "?"} "${title}": já está ${nextIcon}`);
      return item;
    }
    console.log(
      `  ${item.num ?? "?"} "${title}": ${item.icon ?? "(vazio)"} → ${nextIcon}`,
    );
    return { ...item, icon: nextIcon };
  });

  if (!dryRun) {
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ "capabilities.items": items })
      .commit();
  }
  console.log(`${doc._id}${dryRun ? " (simulação)" : ""}: ícones sincronizados.`);
}
