import { createClient } from "@sanity/client";

const WHATSAPP = "5561992733018";

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

const formFields = [
  {
    _key: "name",
    _type: "object",
    id: "name",
    label: "Seu nome",
    placeholder: "Como podemos te chamar?",
    kind: "name",
  },
  {
    _key: "whatsapp",
    _type: "object",
    id: "whatsapp",
    label: "Seu WhatsApp",
    placeholder: "(61) 99999-9999",
    kind: "text",
  },
  {
    _key: "project",
    _type: "object",
    id: "project",
    label: "Breve descrição do projeto",
    placeholder: "Tipo de evento, data, local e o que você tem em mente…",
    hint: "Ainda não tem todos os detalhes? Comece pela ideia.",
    kind: "textarea",
  },
];

const contactForm = {
  heading: "Prefere que a gente entre em contato?",
  intro: "Deixe seu nome, WhatsApp e uma breve descrição do projeto.",
  submitLabel: "Preparar briefing",
  submitHint: "Você revisa e envia pelo WhatsApp.",
  fields: formFields,
};

const settingsIds = ["siteSettings", "drafts.siteSettings"] as const;
const homeIds = ["home", "drafts.home"] as const;

for (const id of settingsIds) {
  const doc = await client.fetch<{ _id: string; _rev: string } | null>(
    `*[_id == $id][0]{_id, _rev}`,
    { id },
  );
  if (!doc) {
    console.log(`${id}: ausente, pulando.`);
    continue;
  }
  if (!dryRun) {
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ whatsapp: WHATSAPP })
      .commit();
  }
  console.log(
    `${doc._id}${dryRun ? " (simulação)" : ""}: whatsapp → ${WHATSAPP}`,
  );
}

for (const id of homeIds) {
  const doc = await client.fetch<{ _id: string; _rev: string } | null>(
    `*[_id == $id][0]{_id, _rev}`,
    { id },
  );
  if (!doc) {
    console.log(`${id}: ausente, pulando.`);
    continue;
  }
  if (!dryRun) {
    await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({
        "contact.form": contactForm,
      })
      .commit();
  }
  console.log(
    `${doc._id}${dryRun ? " (simulação)" : ""}: form → nome + WhatsApp + projeto`,
  );
}
