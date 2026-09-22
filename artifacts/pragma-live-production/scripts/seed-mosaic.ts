/**
 * Sobe as fotos do mosaico e das seções (sobre, em campo, bastidores, método)
 * e grava só esses campos em `home`. Não recria o documento.
 *
 * Uso:
 *   pnpm --filter @workspace/pragma-live-production seed:mosaic
 *   pnpm --filter @workspace/pragma-live-production seed:mosaic -- --gallery-only
 *   pnpm --filter @workspace/pragma-live-production seed:mosaic -- --stills-only
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

function imageRef(assetId: string, focus?: string) {
  const image: {
    _type: "image";
    asset: { _type: "reference"; _ref: string };
    hotspot?: { _type: "sanity.imageHotspot"; x: number; y: number; height: number; width: number };
  } = {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
  if (focus) {
    const [xRaw, yRaw] = focus.split(/\s+/);
    image.hotspot = {
      _type: "sanity.imageHotspot",
      x: Number((xRaw ?? "50%").replace("%", "")) / 100,
      y: Number((yRaw ?? "50%").replace("%", "")) / 100,
      height: 0.3,
      width: 0.3,
    };
  }
  return image;
}

async function uploadImage(client: SanityClient, filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado para o seed: ${filePath}`);
  }
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename: basename(filePath),
  });
  return asset._id;
}

const galleryItems = [
  {
    key: "feira",
    file: "feira-palco-led-1920.jpg",
    caption: "Drone em campo",
    alt: "Operador de headset com o drone e o controle, entre os cases, em um evento noturno.",
  },
  {
    key: "corte",
    file: "corte-ao-vivo-1920.jpg",
    caption: "Sala de controle",
    alt: "Equipe na sala envidraçada, com o multiview aberto durante a transmissão.",
  },
  {
    key: "operador",
    file: "operador-noite-1920.jpg",
    caption: "Palco e plateia",
    alt: "Câmeras no tripé diante do palco, com a plateia sentada e o telão aceso.",
  },
  {
    key: "podcast",
    file: "podcast-estudio-1920.jpg",
    caption: "Gimbal na mão",
    alt: "Operador de headset segurando o gimbal com a câmera, pronto para gravar.",
  },
  {
    key: "show",
    file: "show-palco-1920.jpg",
    caption: "Beira de palco",
    alt: "Operador agachado com o gimbal, ao lado de um pilar florido, durante o evento.",
  },
  {
    key: "entrevista",
    file: "entrevista-set-1920.jpg",
    caption: "Equipe na tenda",
    alt: "Dois integrantes da equipe no palco da tenda, com a plateia e a treliça ao fundo.",
  },
  {
    key: "camera",
    file: "camera-fx30-1920.jpg",
    caption: "Captação",
    alt: "Operador de headset com o gimbal, e outra câmera no tripé atrás.",
  },
  {
    key: "tenda",
    file: "tenda-panorama-1920.jpg",
    caption: "De frente para a arena",
    alt: "Operador de costas, na câmera, com a plateia e a treliça à frente.",
  },
  {
    key: "externo",
    file: "camera-palco-externo-1920.jpg",
    caption: "Gimbal",
    alt: "Operador de perfil, de headset, com o gimbal e a câmera na mão.",
  },
  {
    key: "drone-mao",
    file: "bastidores-drone-1920.jpg",
    caption: "Drone na mão",
    alt: "Operador de headset segurando o drone e o controle, à noite.",
  },
  {
    key: "entrevista-mesa",
    file: "bastidores-entrevista-1920.jpg",
    caption: "Entrevista",
    alt: "Dois entrevistados à mesa, com microfones, no estande verde.",
  },
  {
    key: "grade",
    file: "bastidores-grade-1920.jpg",
    caption: "Na grade",
    alt: "Operador de headset na câmera, com a plateia atrás da grade.",
  },
  {
    key: "intervalo",
    file: "bastidores-intervalo-1920.jpg",
    caption: "No intervalo",
    alt: "Operador de headset e boné verde, sorrindo, de casaco preto.",
  },
  {
    key: "cabine",
    file: "bastidores-cabine-1920.jpg",
    caption: "Cabine",
    alt: "Equipe na cabine envidraçada, vista de cima, com os monitores acesos.",
  },
  {
    key: "estande",
    file: "bastidores-estande-1920.jpg",
    caption: "No estande",
    alt: "Operador de boné com o gimbal, entre os painéis da feira.",
  },
  {
    key: "debate",
    file: "bastidores-debate-1920.jpg",
    caption: "Mesa de debate",
    alt: "Câmera no tripé diante da mesa, com o retorno aberto no monitor.",
  },
  {
    key: "luzes",
    file: "bastidores-luzes-1920.jpg",
    caption: "Sob as luzes",
    alt: "Operador de costas, de headset, sob as bandeirinhas coloridas.",
  },
  {
    key: "equipe",
    file: "bastidores-equipe-1920.jpg",
    caption: "Equipe no gramado",
    alt: "Cinco pessoas da equipe lado a lado, à noite, com os cases ao lado.",
  },
] as const;

const methodStills = [
  {
    step: "escutar",
    shots: [
      {
        key: "cabine",
        file: "bastidores-cabine-1920.jpg",
        caption: "Cabine de corte, com a entrevista no monitor.",
        focus: "42% 58%",
      },
      {
        key: "entrevista",
        file: "bastidores-entrevista-1920.jpg",
        caption: "Conversa no estande, microfone aberto.",
        focus: "38% 42%",
      },
    ],
  },
  {
    step: "desenhar",
    shots: [
      {
        key: "estande",
        file: "bastidores-estande-1920.jpg",
        caption: "Gimbal no corredor do estande, ajustando o quadro.",
        focus: "38% 42%",
      },
      {
        key: "debate",
        file: "bastidores-debate-1920.jpg",
        caption: "Monitor com o plano do debate, câmera no tripé.",
        focus: "50% 38%",
      },
    ],
  },
  {
    step: "preparar",
    shots: [
      {
        key: "equipe",
        file: "bastidores-equipe-1920.jpg",
        caption: "Equipe alinhada, headset ligado, antes de entrar.",
        focus: "50% 42%",
      },
      {
        key: "intervalo",
        file: "bastidores-intervalo-1920.jpg",
        caption: "Operador pronto, no intervalo da transmissão.",
        focus: "62% 42%",
      },
    ],
  },
  {
    step: "executar",
    shots: [
      {
        key: "grade",
        file: "bastidores-grade-1920.jpg",
        caption: "Câmera na grade, com a plateia atrás.",
        focus: "42% 40%",
      },
      {
        key: "drone",
        file: "bastidores-drone-1920.jpg",
        caption: "Drone e controle, no meio do evento.",
        focus: "50% 42%",
      },
    ],
  },
  {
    step: "entregar",
    shots: [
      {
        key: "luzes",
        file: "bastidores-luzes-1920.jpg",
        caption: "Operador de costas, sob as luzes e as bandeirinhas.",
        focus: "48% 42%",
      },
    ],
  },
] as const;

async function patchMethodStills(client: SanityClient) {
  const photos = resolve(appRoot, "src/assets/photos");
  const set: Record<string, unknown> = {};
  console.log("Enviando fotos extras do método…");
  for (const step of methodStills) {
    const shots = [];
    for (const shot of step.shots) {
      const assetId = await uploadImage(client, resolve(photos, shot.file));
      shots.push({
        _key: shot.key,
        _type: "object" as const,
        image: imageRef(assetId, shot.focus),
        caption: shot.caption,
      });
      console.log(`  ${step.step}/${shot.key} → ${assetId}`);
    }
    set[`method.steps[_key=="${step.step}"].stills`] = shots;
  }
  await client.patch("home").set(set).commit();
  console.log("Pronto: cada etapa do método tem mais fotos.");
}

async function seedMosaic() {
  const galleryOnly = process.argv.includes("--gallery-only");
  const stillsOnly = process.argv.includes("--stills-only");
  const client = await writeClient();
  if (stillsOnly) {
    await patchMethodStills(client);
    return;
  }
  const mosaic: {
    _type: "image";
    _key: string;
    asset: { _type: "reference"; _ref: string };
  }[] = [];
  if (!galleryOnly) {
    const mosaicDir = resolve(appRoot, "src/assets/mosaic");
    const files = readdirSync(mosaicDir)
      .filter((name) => /^tile-\d+\.avif$/.test(name))
      .sort();

    if (files.length === 0) {
      throw new Error(`Nenhum tile-*.avif em ${mosaicDir}`);
    }

    console.log(`Enviando ${files.length} fotos do mosaico…`);
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
  }

  const existing = await client.fetch<{ _id?: string } | null>(
    `*[_id == "home"][0]{ _id }`,
  );
  if (!existing?._id) {
    throw new Error(
      'Documento "home" não existe no dataset. Rode o seed completo antes.',
    );
  }

  const photos = resolve(appRoot, "src/assets/photos");
  const method = resolve(appRoot, "src/assets/method");

  const existingKeys = new Set(
    await client.fetch<string[]>(`*[_id == "home"][0].gallery.photos[]._key`),
  );
  const pending = galleryOnly
    ? galleryItems.filter((item) => !existingKeys.has(item.key))
    : galleryItems;

  console.log(`Enviando ${pending.length} fotos de bastidores…`);
  const gallery = [];
  for (const item of pending) {
    const assetId = await uploadImage(client, resolve(photos, item.file));
    gallery.push({
      _key: item.key,
      _type: "object" as const,
      image: imageRef(assetId),
      caption: item.caption,
      alt: item.alt,
    });
    console.log(`  ${item.caption} → ${assetId}`);
  }

  if (galleryOnly) {
    if (gallery.length === 0) {
      console.log(`Bastidores já tem as ${existingKeys.size} fotos.`);
      return;
    }
    await client.patch("home").append("gallery.photos", gallery).commit();
    console.log(
      `Pronto: bastidores com ${existingKeys.size + gallery.length} fotos.`,
    );
    return;
  }

  const [
    teamId,
    stageId,
    streamId,
    escutarWide,
    escutarTall,
    desenharWide,
    desenharTall,
    prepararWide,
    prepararTall,
    executarWide,
    executarTall,
    entregarWide,
    entregarTall,
  ] = await Promise.all([
    uploadImage(client, resolve(photos, "equipe.jpg")),
    uploadImage(client, resolve(photos, "palco-tenda-1920.jpg")),
    uploadImage(client, resolve(photos, "streaming-mesa-1920.jpg")),
    uploadImage(client, resolve(method, "escutar-wide-1920.jpg")),
    uploadImage(client, resolve(method, "escutar-tall-1080.jpg")),
    uploadImage(client, resolve(method, "desenhar-wide-1920.jpg")),
    uploadImage(client, resolve(method, "desenhar-tall-1080.jpg")),
    uploadImage(client, resolve(method, "preparar-wide-1920.jpg")),
    uploadImage(client, resolve(method, "preparar-tall-1080.jpg")),
    uploadImage(client, resolve(method, "executar-wide-1920.jpg")),
    uploadImage(client, resolve(method, "executar-tall-1080.jpg")),
    uploadImage(client, resolve(method, "entregar-wide-1920.jpg")),
    uploadImage(client, resolve(method, "entregar-tall-1080.jpg")),
  ]);

  await client
    .patch("home")
    .set({
      "hero.mosaic": mosaic,
      "about.image": imageRef(teamId),
      "about.alt":
        "Cinco integrantes da equipe, de casaco preto, lado a lado em um evento noturno.",
      "work.cards[_key==\"summit\"].image": imageRef(stageId),
      "work.cards[_key==\"summit\"].alt":
        "Operador de headset junto de duas câmeras no tripé, no gramado do evento.",
      "work.cards[_key==\"stream\"].image": imageRef(streamId),
      "work.cards[_key==\"stream\"].alt":
        "Operador de headset no notebook, entre cases e luz de palco.",
      "gallery.photos": gallery,
      "method.steps[_key==\"escutar\"].wide.image": imageRef(escutarWide, "40% 45%"),
      "method.steps[_key==\"escutar\"].wide.caption":
        "Operador de headset conferindo o plano no celular.",
      "method.steps[_key==\"escutar\"].tall.image": imageRef(escutarTall, "60% 40%"),
      "method.steps[_key==\"escutar\"].tall.caption":
        "Operador de headset com o gimbal na mão.",
      "method.steps[_key==\"desenhar\"].wide.image": imageRef(desenharWide, "50% 55%"),
      "method.steps[_key==\"desenhar\"].wide.caption":
        "Operador agachado com o gimbal, diante do painel do evento.",
      "method.steps[_key==\"desenhar\"].tall.image": imageRef(desenharTall, "50% 30%"),
      "method.steps[_key==\"desenhar\"].tall.caption":
        "Câmera no corredor da tenda, apontada para o palco.",
      "method.steps[_key==\"preparar\"].wide.image": imageRef(prepararWide, "50% 45%"),
      "method.steps[_key==\"preparar\"].wide.caption": "Equipe reunida antes de começar.",
      "method.steps[_key==\"preparar\"].tall.image": imageRef(prepararTall, "50% 35%"),
      "method.steps[_key==\"preparar\"].tall.caption":
        "Câmera erguida para achar o enquadramento.",
      "method.steps[_key==\"executar\"].wide.image": imageRef(executarWide, "70% 40%"),
      "method.steps[_key==\"executar\"].wide.caption":
        "Operador de headset na câmera, sob a estrutura do evento.",
      "method.steps[_key==\"executar\"].tall.image": imageRef(executarTall, "50% 30%"),
      "method.steps[_key==\"executar\"].tall.caption":
        "Câmera no tripé, com o palco e o telão ao fundo.",
      "method.steps[_key==\"entregar\"].wide.image": imageRef(entregarWide, "50% 40%"),
      "method.steps[_key==\"entregar\"].wide.caption":
        "Operador de costas, sob as bandeirinhas e a luz do evento.",
      "method.steps[_key==\"entregar\"].tall.image": imageRef(entregarTall, "45% 30%"),
      "method.steps[_key==\"entregar\"].tall.caption":
        "Captação do palco, com o telão aceso e a plateia na frente.",
    })
    .unset(["hero.poster", "hero.video"])
    .commit();

  await patchMethodStills(client);
  console.log(`Pronto: mosaico com ${mosaic.length} fotos e seções atualizadas.`);
}

seedMosaic().catch((error) => {
  console.error(error);
  process.exit(1);
});
