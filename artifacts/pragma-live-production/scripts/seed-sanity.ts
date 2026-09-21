import { createReadStream, existsSync, readFileSync } from "node:fs";
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
  const attached = resolve(repoRoot, "attached_assets");

  const [
    posterId,
    videoId,
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
  ] = await Promise.all([
    upload(client, "image", resolve(attached, "pragma-brand-cover.png")),
    upload(
      client,
      "file",
      resolve(attached, "1108328_1080p_4k_1280x720_1789673316521.mp4"),
    ),
    upload(client, "image", resolve(photos, "equipe.jpg")),
    upload(client, "image", resolve(attached, "pragma-facade-vehicle.jpg")),
    upload(client, "image", resolve(photos, "palco-tenda.jpg")),
    upload(client, "image", resolve(photos, "streaming-mesa.jpg")),
    upload(client, "image", resolve(photos, "feira-palco-led.jpg")),
    upload(client, "image", resolve(photos, "corte-ao-vivo.jpg")),
    upload(client, "image", resolve(photos, "operador-noite.jpg")),
    upload(client, "image", resolve(photos, "podcast-estudio.jpg")),
    upload(client, "image", resolve(photos, "show-palco.jpg")),
    upload(client, "image", resolve(photos, "entrevista-set.jpg")),
    upload(client, "image", resolve(photos, "camera-fx30.jpg")),
    upload(client, "image", resolve(photos, "tenda-panorama.jpg")),
    upload(client, "image", resolve(photos, "camera-palco-externo.jpg")),
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
      poster: imageField(posterId),
      video: {
        _type: "file",
        asset: { _type: "reference", _ref: videoId },
      },
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
    anatomy: {
      label: "Anatomia",
      title: "Quatro camadas.",
      titleAccent: "Um sistema só.",
      intro:
        "Um evento não é uma coisa: são camadas que precisam chegar juntas. Montamos cada uma pensando na próxima.",
      layers: [
        { _key: "imagem", id: "imagem", name: "Imagem", note: "LED e captação" },
        { _key: "luz", id: "luz", name: "Luz", note: "Truss e desenho" },
        { _key: "som", id: "som", name: "Som", note: "Line array" },
        {
          _key: "infra",
          id: "infra",
          name: "Infraestrutura",
          note: "Energia e cabo",
        },
      ],
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
          alt: "Câmera em tripé no canto do palco de um show em tenda, com painel de LED ao fundo.",
        },
        {
          _key: "stream",
          title: "Presença não tem distância.",
          copy: "Captação, realização e streaming para levar a experiência a quem acompanha de qualquer lugar.",
          testId: "card-project-stream",
          image: imageField(streamId),
          alt: "Mesa de som, notebook com software de transmissão e switcher durante a gravação de um podcast.",
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
          caption: "Palco com LED e captação",
          alt: "Câmera com monitor externo registrando uma palestra em um palco com painel de LED, diante da plateia.",
        },
        {
          _key: "corte",
          image: imageField(corteId),
          caption: "Corte ao vivo",
          alt: "Mesa de corte de vídeo com multiview das câmeras durante um show iluminado em azul.",
        },
        {
          _key: "operador",
          image: imageField(operadorId),
          caption: "Câmera e intercom",
          alt: "Operador de câmera com headset ao lado de uma câmera com teleobjetiva em um evento noturno ao ar livre.",
        },
        {
          _key: "podcast",
          image: imageField(podcastId),
          caption: "Montagem de set",
          alt: "Equipe montando um set de podcast com câmeras e mesa em um estande de feira.",
        },
        {
          _key: "show",
          image: imageField(showId),
          caption: "Beira de palco",
          alt: "Mão ajustando uma câmera em tripé ao lado do palco durante um show noturno.",
        },
        {
          _key: "entrevista",
          image: imageField(entrevistaId),
          caption: "Entrevista gravada",
          alt: "Set de entrevista com câmera, notebook e mesa de som em uma sala.",
        },
        {
          _key: "camera",
          image: imageField(cameraId),
          caption: "Captação",
          alt: "Mão segurando uma câmera Sony FX30 dentro de uma grande tenda de eventos.",
        },
        {
          _key: "tenda",
          image: imageField(tendaId),
          caption: "Evento em tenda",
          alt: "Câmera em tripé registrando uma palestra em uma grande tenda com plateia e telões.",
        },
        {
          _key: "externo",
          image: imageField(palcoExternoId),
          caption: "Show ao ar livre",
          alt: "Câmera com monitor montada em tripé, apontada para um palco ao ar livre.",
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
            image: imageField(escutarWide, "50% 60%"),
            caption:
              "Entrevista numa sala, com câmeras, luz e mesa de som prontas.",
          },
          tall: {
            image: imageField(escutarTall, "45% 50%"),
            caption: "Câmera com monitor gravando uma entrevista.",
          },
        },
        {
          _key: "desenhar",
          id: "desenhar",
          num: "02",
          phase: "Pré-produção",
          title: "Desenhar",
          copy: "Traduzir ideia em planta, timeline, rider e plano B.",
          wide: {
            image: imageField(desenharWide, "50% 45%"),
            caption: "Tenda vazia, com as cadeiras ainda sendo arrumadas.",
          },
          tall: {
            image: imageField(desenharTall, "50% 40%"),
            caption: "Tenda vazia antes do evento, com a câmera em primeiro plano.",
          },
        },
        {
          _key: "preparar",
          id: "preparar",
          num: "03",
          phase: "Montagem",
          title: "Preparar",
          copy: "Alinhar equipe, equipamento e expectativa na mesma frequência.",
          wide: {
            image: imageField(prepararWide, "50% 50%"),
            caption: "Equipe montando o set de um estande de feira.",
          },
          tall: {
            image: imageField(prepararTall, "40% 50%"),
            caption: "Câmeras posicionadas no set, antes de começar a gravar.",
          },
        },
        {
          _key: "executar",
          id: "executar",
          num: "04",
          phase: "Ao vivo",
          title: "Executar",
          copy: "Estar presente, atento e um passo à frente do momento.",
          wide: {
            image: imageField(executarWide, "45% 50%"),
            caption:
              "Show em tenda com painel de LED, acompanhado da beira do palco.",
          },
          tall: {
            image: imageField(executarTall, "50% 45%"),
            caption: "Multiview do corte ao vivo durante um show.",
          },
        },
        {
          _key: "entregar",
          id: "entregar",
          num: "05",
          phase: "Pós-evento",
          title: "Entregar",
          copy: "Fechar o ciclo com o mesmo cuidado que abriu.",
          wide: {
            image: imageField(entregarWide, "50% 50%"),
            caption: "Plateia no auditório, com a câmera acompanhando o palco.",
          },
          tall: {
            image: imageField(entregarTall, "50% 50%"),
            caption: "Plateia na tenda, com os telões acesos.",
          },
        },
      ],
    },
    contact: {
      eyebrow: "Vamos produzir",
      title: "Tem uma ideia?",
      titleAccent: "Vamos fazer.",
      note: "Conte o que está planejando. Vamos encontrar um caminho claro para colocar isso em cena.",
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
