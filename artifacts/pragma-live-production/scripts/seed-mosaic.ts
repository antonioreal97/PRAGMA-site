/**
 * Sobe só as fotos do mosaico e grava em home.hero.mosaic.
 * Não mexe no resto do documento — seguro pra produção.
 *
 * Uso:
 *   pnpm --filter @workspace/pragma-live-production seed:mosaic
 */
import { createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SanityClient } from "@sanity/client";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadDotEnv(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv(resolve(appRoot, ".env"));
loadDotEnv(resolve(appRoot, ".env.local"));

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não definida.`);
  return value;
}

async function writeClient(): Promise<SanityClient> {
  const projectId = required("VITE_SANITY_PROJECT_ID");
  const dataset = process.env.VITE_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;
  if (token) {
    return createClient({
      projectId,
      dataset,
      token,
      apiVersion: "2026-09-21",
      useCdn: false,
    });
  }
  const { getCliClient } = await import("sanity/cli");
  return getCliClient({
    apiVersion: "2026-09-21",
    projectId,
    dataset,
    useCdn: false,
  });
}

async function seedMosaic() {
  const client = await writeClient();
  const mosaicDir = resolve(appRoot, "src/assets/mosaic");
  const files = readdirSync(mosaicDir)
    .filter((name) => /^tile-\d+\.avif$/.test(name))
    .sort();

  if (files.length === 0) {
    throw new Error(`Nenhum tile-*.avif em ${mosaicDir}`);
  }

  console.log(`Enviando ${files.length} fotos do mosaico…`);
  const mosaic = [];
  for (const [index, name] of files.entries()) {
    const path = resolve(mosaicDir, name);
    const asset = await client.assets.upload("image", createReadStream(path), {
      filename: name,
    });
    mosaic.push({
      _type: "image" as const,
      _key: `mosaic-${String(index + 1).padStart(2, "0")}`,
      asset: { _type: "reference" as const, _ref: asset._id },
    });
    console.log(`  ${index + 1}/${files.length} ${name} → ${asset._id}`);
  }

  const existing = await client.fetch<{ _id?: string } | null>(
    `*[_id == "home"][0]{ _id }`,
  );
  if (!existing?._id) {
    throw new Error(
      'Documento "home" não existe no dataset. Rode o seed completo antes.',
    );
  }

  await client
    .patch("home")
    .set({ "hero.mosaic": mosaic })
    .unset(["hero.poster", "hero.video"])
    .commit();

  console.log(`Pronto: home.hero.mosaic com ${mosaic.length} fotos.`);
}

seedMosaic().catch((error) => {
  console.error(error);
  process.exit(1);
});
