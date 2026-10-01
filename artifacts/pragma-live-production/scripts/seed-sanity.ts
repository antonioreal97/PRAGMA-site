import { createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SanityClient } from "@sanity/client";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(appRoot, "../..");

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
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida.`);
  }
  return value;
}

function hotspot(focus: string) {
  const [xRaw, yRaw] = focus.split(/\s+/);
  const x = Number((xRaw ?? "50%").replace("%", "")) / 100;
  const y = Number((yRaw ?? "50%").replace("%", "")) / 100;
  return { _type: "sanity.imageHotspot", x, y, height: 0.3, width: 0.3 };
}

function imageField(
  assetId: string,
  focus?: string,
): {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  hotspot?: ReturnType<typeof hotspot>;
} {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    ...(focus ? { hotspot: hotspot(focus) } : {}),
  };
}

function still(key: string, assetId: string, caption: string, focus: string) {
  return {
    _key: key,
    image: imageField(assetId, focus),
    caption,
  };
}

async function upload(
  client: SanityClient,
  kind: "image" | "file",
  filePath: string,
) {
  if (!existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado para o seed: ${filePath}`);
  }
  const asset = await client.assets.upload(kind, createReadStream(filePath), {
    filename: basename(filePath),
  });
  return asset._id;
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

async function seed() {
  const client = await writeClient();

  const photos = resolve(appRoot, "src/assets/photos");
  const method = resolve(appRoot, "src/assets/method");
  const mosaicDir = resolve(appRoot, "src/assets/mosaic");
  const attached = resolve(repoRoot, "attached_assets");

  const mosaicFiles = readdirSync(mosaicDir)
    .filter((name) => /^tile-\d+\.avif$/.test(name))
    .sort()
    .map((name) => resolve(mosaicDir, name));

  const [
    teamId,
    facadeId,
    stageId,
    streamId,
    feiraId,
    corteId,
    operadorId,
    podcastId,
    showId,
    entrevistaId,
    cameraId,
    tendaId,
    palcoExternoId,
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
    escutarCabine,
    escutarEntrevista,
    desenharEstande,
    desenharDebate,
    prepararEquipe,
    prepararIntervalo,
    executarGrade,
    executarDrone,
    entregarLuzes,
    ...mosaicIds
  ] = await Promise.all([
    upload(client, "image", resolve(photos, "equipe.jpg")),
    upload(client, "image", resolve(attached, "pragma-facade-vehicle.jpg")),
    upload(client, "image", resolve(photos, "palco-tenda-1920.jpg")),
    upload(client, "image", resolve(photos, "streaming-mesa-1920.jpg")),
    upload(client, "image", resolve(photos, "feira-palco-led-1920.jpg")),
    upload(client, "image", resolve(photos, "corte-ao-vivo-1920.jpg")),
    upload(client, "image", resolve(photos, "operador-noite-1920.jpg")),
    upload(client, "image", resolve(photos, "podcast-estudio-1920.jpg")),
    upload(client, "image", resolve(photos, "show-palco-1920.jpg")),
    upload(client, "image", resolve(photos, "entrevista-set-1920.jpg")),
    upload(client, "image", resolve(photos, "camera-fx30-1920.jpg")),
    upload(client, "image", resolve(photos, "tenda-panorama-1920.jpg")),
    upload(client, "image", resolve(photos, "camera-palco-externo-1920.jpg")),
    upload(client, "image", resolve(method, "escutar-wide-1920.jpg")),
    upload(client, "image", resolve(method, "escutar-tall-1080.jpg")),
    upload(client, "image", resolve(method, "desenhar-wide-1920.jpg")),
    upload(client, "image", resolve(method, "desenhar-tall-1080.jpg")),
    upload(client, "image", resolve(method, "preparar-wide-1920.jpg")),
    upload(client, "image", resolve(method, "preparar-tall-1080.jpg")),
    upload(client, "image", resolve(method, "executar-wide-1920.jpg")),
    upload(client, "image", resolve(method, "executar-tall-1080.jpg")),
    upload(client, "image", resolve(method, "entregar-wide-1920.jpg")),
    upload(client, "image", resolve(method, "entregar-tall-1080.jpg")),
    upload(client, "image", resolve(photos, "bastidores-cabine-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-entrevista-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-estande-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-debate-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-equipe-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-intervalo-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-grade-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-drone-1920.jpg")),
    upload(client, "image", resolve(photos, "bastidores-luzes-1920.jpg")),
    ...mosaicFiles.map((file) => upload(client, "image", file)),
  ]);

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    email: "ola@pragma.live",
    footerTagline: "Fazer acontecer é o nosso método.",
    seoTitle: "PRAGMA Live Production",
    seoDescription:
      "Som, luz, imagem, streaming e produção para eventos. A PRAGMA coordena cada camada para que a sua ideia aconteça — antes, durante e depois do palco.",
    nav: [
      { _key: "capabilities", id: "capabilities", label: "Capacidades" },
      { _key: "work", id: "work", label: "Projetos" },
      { _key: "method", id: "method", label: "Método" },
      { _key: "contact", id: "contact", label: "Falar com a PRAGMA" },
    ],
  });

  await client.createOrReplace({
    _id: "home",
    _type: "home",
    sections: [
      { _key: "about", _type: "object", id: "about", name: "O que fazemos" },
      { _key: "capabilities", _type: "object", id: "capabilities", name: "Soluções" },
      { _key: "work", _type: "object", id: "work", name: "Em campo" },
      { _key: "broadcast", _type: "object", id: "broadcast", name: "Broadcast" },
      { _key: "gallery", _type: "object", id: "gallery", name: "Bastidores" },
      { _key: "method", _type: "object", id: "method", name: "Método" },
      { _key: "contact", _type: "object", id: "contact", name: "Contato" },
    ],
    sectionOrder: [
      "about",
      "capabilities",
      "work",
      "broadcast",
      "gallery",
      "method",
      "contact",
    ],
    hero: {
      eyebrow: "Live production / desde 2016",
      titleLine1: "A ideia entra.",
      titleLine2: "A experiência acontece.",
      copy: "Som, luz, imagem e pessoas. Uma operação integrada para transformar a sua ideia em um evento que marca.",
      primaryCtaLabel: "Começar uma conversa",
      primaryCtaHref: "#contact",
      secondaryCtaLabel: "Conheça nossas capacidades",
      secondaryCtaHref: "#capabilities",
      consoleLocation: "Brasília, DF",
      mosaic: mosaicIds.map((assetId, index) => ({
        ...imageField(assetId),
        _key: `mosaic-${String(index + 1).padStart(2, "0")}`,
      })),
    },
    about: {
      label: "O que fazemos",
      title: "Produção é parte da",
      titleAccent: "ideia.",
      copy: [
        "A PRAGMA entra cedo. Antes da primeira luz, existe uma conversa, um mapa, uma decisão. Trabalhamos ao lado de marcas, agências e criadores para transformar intenção em uma experiência que pode ser sentida.",
        "Do briefing ao último cabo recolhido, existe método. E existe gente.",
      ],
      points: [
        "Leitura precisa do que você quer dizer.",
        "Desenho técnico que não aparece, mas funciona.",
        "Execução humana, atenta e sem ruído.",
      ],
      image: imageField(teamId),
      alt: "Cinco integrantes da equipe, de casaco preto, lado a lado em um evento noturno.",
      caption: "A equipe em campo",
    },
    capabilities: {
      label: "Capacidades",
      title: "Tudo conectado.",
      titleAccent: "Nada por acaso.",
      intro:
        "Uma operação integrada para quando a complexidade não pode aparecer. Você vê o resultado. A gente cuida do sistema.",
      items: [
        {
          _key: "som",
          num: "01",
          title: "Som",
          copy: "Clareza para cada palavra, impacto para cada momento. Sistemas pensados para a sala e para quem está em cena.",
          icon: "som",
        },
        {
          _key: "luz",
          num: "02",
          title: "Luz",
          copy: "Desenhamos atmosferas que acompanham o ritmo da ideia, do primeiro foco ao último blackout.",
          icon: "luz",
        },
        {
          _key: "imagem",
          num: "03",
          title: "Imagem",
          copy: "LED walls, captação e transmissão: o que acontece no espaço, chega inteiro a qualquer lugar.",
          icon: "imagem",
        },
        {
          _key: "infra",
          num: "04",
          title: "Infraestrutura",
          copy: "A camada invisível que segura tudo. Logística, rigging e energia coordenados no detalhe.",
          icon: "infraestrutura",
        },
        {
          _key: "streaming",
          num: "05",
          title: "Streaming",
          copy: "A mesma presença, dentro e fora do espaço. Realização, distribuição e contingência em tempo real.",
          icon: "streaming",
        },
        {
          _key: "producao",
          num: "06",
          title: "Produção",
          copy: "Pessoas certas, no lugar certo, antes mesmo de alguém pedir. A operação como extensão do seu time.",
          icon: "producao",
        },
      ],
    },
    work: {
      label: "Em campo",
      title: "O cuidado começa",
      titleAccent: "nos bastidores.",
      statementLine1: "O plano é importante.",
      statementLine2: "O momento é tudo.",
      cards: [
        {
          _key: "base",
          kicker: "Base PRAGMA / Brasília, DF",
          title: "O lugar também faz parte do show.",
          copy: "Uma casa para preparar, testar e fazer sair do papel.",
          testId: "card-project-pragma-base",
          image: imageField(facadeId),
          alt: "Fachada da base PRAGMA, com a van da equipe estacionada em frente",
        },
        {
          _key: "summit",
          title: "O palco é só uma parte.",
          copy: "Planejamento, equipe e infraestrutura conectados para cuidar de cada detalhe do encontro.",
          testId: "card-project-summit",
          image: imageField(stageId),
          alt: "Operador de headset junto de duas câmeras no tripé, no gramado do evento.",
        },
        {
          _key: "stream",
          title: "Presença não tem distância.",
          copy: "Captação, realização e streaming para levar a experiência a quem acompanha de qualquer lugar.",
          testId: "card-project-stream",
          image: imageField(streamId),
          alt: "Operador de headset no notebook, entre cases e luz de palco.",
        },
      ],
    },
    broadcast: {
      label: "Broadcast",
      title: "Do palco",
      titleAccent: "até a tela.",
      intro:
        "Quem assiste de longe não deveria sentir a distância. Entre a câmera e a tela existe uma cadeia — e cada elo tem plano B.",
      stations: [
        {
          _key: "captacao",
          id: "captacao",
          name: "Captação",
          note: "Câmeras e microfones",
        },
        { _key: "corte", id: "corte", name: "Corte", note: "Switcher ao vivo" },
        {
          _key: "encode",
          id: "encode",
          name: "Encode",
          note: "Compressão e redundância",
        },
        {
          _key: "entrega",
          id: "entrega",
          name: "Entrega",
          note: "Quem assiste de longe",
        },
      ],
    },
    gallery: {
      label: "Bastidores",
      title: "Gente de verdade,",
      titleAccent: "fazendo acontecer.",
      photos: [
        {
          _key: "feira",
          image: imageField(feiraId),
          caption: "Drone em campo",
          alt: "Operador de headset com o drone e o controle, entre os cases, em um evento noturno.",
        },
        {
          _key: "corte",
          image: imageField(corteId),
          caption: "Sala de controle",
          alt: "Equipe na sala envidraçada, com o multiview aberto durante a transmissão.",
        },
        {
          _key: "operador",
          image: imageField(operadorId),
          caption: "Palco e plateia",
          alt: "Câmeras no tripé diante do palco, com a plateia sentada e o telão aceso.",
        },
        {
          _key: "podcast",
          image: imageField(podcastId),
          caption: "Gimbal na mão",
          alt: "Operador de headset segurando o gimbal com a câmera, pronto para gravar.",
        },
        {
          _key: "show",
          image: imageField(showId),
          caption: "Beira de palco",
          alt: "Operador agachado com o gimbal, ao lado de um pilar florido, durante o evento.",
        },
        {
          _key: "entrevista",
          image: imageField(entrevistaId),
          caption: "Equipe na tenda",
          alt: "Dois integrantes da equipe no palco da tenda, com a plateia e a treliça ao fundo.",
        },
        {
          _key: "camera",
          image: imageField(cameraId),
          caption: "Captação",
          alt: "Operador de headset com o gimbal, e outra câmera no tripé atrás.",
        },
        {
          _key: "tenda",
          image: imageField(tendaId),
          caption: "De frente para a arena",
          alt: "Operador de costas, na câmera, com a plateia e a treliça à frente.",
        },
        {
          _key: "externo",
          image: imageField(palcoExternoId),
          caption: "Gimbal",
          alt: "Operador de perfil, de headset, com o gimbal e a câmera na mão.",
        },
      ],
    },
    method: {
      label: "Método",
      title: "Do primeiro rascunho ao",
      titleAccent: "último aplauso.",
      intro:
        "Um bom evento parece simples. É porque cada camada foi pensada antes.",
      cue: "Role para acompanhar",
      steps: [
        {
          _key: "escutar",
          id: "escutar",
          num: "01",
          phase: "Pré-produção",
          title: "Escutar",
          copy: "Entender o que precisa ser dito, e o que não pode dar errado.",
          wide: {
            image: imageField(escutarWide, "40% 45%"),
            caption: "Operador de headset conferindo o plano no celular.",
          },
          tall: {
            image: imageField(escutarTall, "60% 40%"),
            caption: "Operador de headset com o gimbal na mão.",
          },
          stills: [
            still(
              "cabine",
              escutarCabine,
              "Cabine de corte, com a entrevista no monitor.",
              "42% 58%",
            ),
            still(
              "entrevista",
              escutarEntrevista,
              "Conversa no estande, microfone aberto.",
              "38% 42%",
            ),
          ],
        },
        {
          _key: "desenhar",
          id: "desenhar",
          num: "02",
          phase: "Pré-produção",
          title: "Desenhar",
          copy: "Traduzir ideia em planta, timeline, rider e plano B.",
          wide: {
            image: imageField(desenharWide, "50% 55%"),
            caption: "Operador agachado com o gimbal, diante do painel do evento.",
          },
          tall: {
            image: imageField(desenharTall, "50% 30%"),
            caption: "Câmera no corredor da tenda, apontada para o palco.",
          },
          stills: [
            still(
              "estande",
              desenharEstande,
              "Gimbal no corredor do estande, ajustando o quadro.",
              "38% 42%",
            ),
            still(
              "debate",
              desenharDebate,
              "Monitor com o plano do debate, câmera no tripé.",
              "50% 38%",
            ),
          ],
        },
        {
          _key: "preparar",
          id: "preparar",
          num: "03",
          phase: "Montagem",
          title: "Preparar",
          copy: "Alinhar equipe, equipamento e expectativa na mesma frequência.",
          wide: {
            image: imageField(prepararWide, "50% 45%"),
            caption: "Equipe reunida antes de começar.",
          },
          tall: {
            image: imageField(prepararTall, "50% 35%"),
            caption: "Câmera erguida para achar o enquadramento.",
          },
          stills: [
            still(
              "equipe",
              prepararEquipe,
              "Equipe alinhada, headset ligado, antes de entrar.",
              "50% 42%",
            ),
            still(
              "intervalo",
              prepararIntervalo,
              "Operador pronto, no intervalo da transmissão.",
              "62% 42%",
            ),
          ],
        },
        {
          _key: "executar",
          id: "executar",
          num: "04",
          phase: "Ao vivo",
          title: "Executar",
          copy: "Estar presente, atento e um passo à frente do momento.",
          wide: {
            image: imageField(executarWide, "70% 40%"),
            caption: "Operador de headset na câmera, sob a estrutura do evento.",
          },
          tall: {
            image: imageField(executarTall, "50% 30%"),
            caption: "Câmera no tripé, com o palco e o telão ao fundo.",
          },
          stills: [
            still(
              "grade",
              executarGrade,
              "Câmera na grade, com a plateia atrás.",
              "42% 40%",
            ),
            still(
              "drone",
              executarDrone,
              "Drone e controle, no meio do evento.",
              "50% 42%",
            ),
          ],
        },
        {
          _key: "entregar",
          id: "entregar",
          num: "05",
          phase: "Pós-evento",
          title: "Entregar",
          copy: "Fechar o ciclo com o mesmo cuidado que abriu.",
          wide: {
            image: imageField(entregarWide, "50% 40%"),
            caption: "Operador de costas, sob as bandeirinhas e a luz do evento.",
          },
          tall: {
            image: imageField(entregarTall, "45% 30%"),
            caption: "Captação do palco, com o telão aceso e a plateia na frente.",
          },
          stills: [
            still(
              "luzes",
              entregarLuzes,
              "Operador de costas, sob as luzes e as bandeirinhas.",
              "48% 42%",
            ),
          ],
        },
      ],
    },
    contact: {
      eyebrow: "Vamos produzir",
      title: "Tem uma ideia?",
      titleAccent: "Vamos fazer.",
      note: "Conte o que está planejando. Vamos encontrar um caminho claro para colocar isso em cena.",
      form: {
        heading: "Conte sobre o seu projeto",
        intro:
          "Preencha o briefing para preparar seu e-mail. Todos os campos são obrigatórios.",
        submitLabel: "Preparar briefing",
        submitHint: "Você revisa e envia pelo seu aplicativo de e-mail.",
        fields: [
          {
            _key: "name",
            _type: "object",
            id: "name",
            label: "Seu nome",
            placeholder: "Como podemos te chamar?",
            kind: "name",
          },
          {
            _key: "email",
            _type: "object",
            id: "email",
            label: "Seu e-mail",
            placeholder: "voce@empresa.com",
            kind: "email",
          },
          {
            _key: "project",
            _type: "object",
            id: "project",
            label: "O que vamos colocar de pé?",
            placeholder: "Tipo de evento, data, local e o que você tem em mente…",
            hint: "Ainda não tem todos os detalhes? Comece pela ideia.",
            kind: "textarea",
          },
        ],
      },
    },
  });

  const projectId = required("VITE_SANITY_PROJECT_ID");
  const dataset = process.env.VITE_SANITY_DATASET || "production";
  console.log(`Seed concluído no projeto ${projectId}/${dataset}.`);
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  if (error instanceof Error && error.stack) console.error(error.stack);
  process.exit(1);
});
