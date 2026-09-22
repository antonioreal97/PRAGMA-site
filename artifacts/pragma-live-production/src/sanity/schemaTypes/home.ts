import { defineArrayMember, defineField, defineType } from "sanity";

const titlePair = [
  defineField({
    name: "title",
    title: "Título",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "titleAccent",
    title: "Ênfase do título",
    type: "string",
  }),
];

const captionedImage = [
  defineField({
    name: "image",
    title: "Imagem",
    type: "image",
    options: { hotspot: true },
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "alt",
    title: "Texto alternativo",
    type: "string",
    validation: (rule) => rule.required(),
  }),
];

const sectionOrderOptions = [
  { title: "O que fazemos", value: "about" },
  { title: "Capacidades", value: "capabilities" },
  { title: "Em campo", value: "work" },
  { title: "Broadcast", value: "broadcast" },
  { title: "Bastidores", value: "gallery" },
  { title: "Método", value: "method" },
  { title: "Contato", value: "contact" },
];

export const homeType = defineType({
  name: "home",
  title: "Página inicial",
  type: "document",
  options: {
    canvasApp: {
      purpose:
        "Landing PRAGMA. Singleton com _id home — ao enviar para o Studio, atualize esse documento.",
    },
  },
  groups: [
    { name: "layout", title: "Ordem das seções" },
    { name: "hero", title: "Abertura" },
    { name: "about", title: "O que fazemos" },
    { name: "anatomy", title: "Anatomia" },
    { name: "capabilities", title: "Capacidades" },
    { name: "work", title: "Em campo" },
    { name: "broadcast", title: "Broadcast" },
    { name: "gallery", title: "Bastidores" },
    { name: "method", title: "Método" },
    { name: "contact", title: "Contato" },
  ],
  fields: [
    defineField({
      name: "sectionOrder",
      title: "Ordem das seções",
      description:
        "Arraste para reorganizar as seções abaixo da abertura. A abertura permanece sempre no topo.",
      type: "array",
      group: "layout",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: sectionOrderOptions,
            layout: "dropdown",
          },
        }),
      ],
      initialValue: sectionOrderOptions.map((section) => section.value),
      validation: (rule) =>
        rule
          .unique()
          .custom((value) => {
            if (!Array.isArray(value) || !value.length) return true;
            const validValues = new Set(
              sectionOrderOptions.map((section) => section.value),
            );
            const unknown = value.find(
              (item) => typeof item !== "string" || !validValues.has(item),
            );
            if (unknown) return `Seção desconhecida: ${unknown}`;
            return true;
          }),
    }),
    defineField({
      name: "hero",
      title: "Abertura",
      type: "object",
      group: "hero",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Linha acima do título",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "titleLine1",
          title: "Título — linha 1",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "titleLine2",
          title: "Título — linha 2",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "copy",
          title: "Texto",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "primaryCtaLabel",
          title: "CTA principal",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "primaryCtaHref",
          title: "Link do CTA principal",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "secondaryCtaLabel",
          title: "CTA secundário",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "secondaryCtaHref",
          title: "Link do CTA secundário",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "consoleLocation",
          title: "Local na faixa de operação",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "mosaic",
          title: "Mosaico da abertura",
          description:
            "Parede de fotos atrás do título. A ordem importa: as fotos são distribuídas em colunas. Ideal 12–40 imagens, lado maior ≥ 960px. Se vazio, o site usa o mosaico padrão.",
          type: "array",
          of: [
            defineArrayMember({
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
          ],
          options: {
            layout: "grid",
          },
          validation: (rule) =>
            rule
              .min(8)
              .warning("Com menos de 8 fotos a parede fica rala.")
              .max(60),
        }),
      ],
    }),
    defineField({
      name: "about",
      title: "O que fazemos",
      type: "object",
      group: "about",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "copy",
          title: "Parágrafos",
          type: "array",
          of: [defineArrayMember({ type: "text" })],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "points",
          title: "Lista numerada",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          validation: (rule) => rule.required().min(1),
        }),
        ...captionedImage,
        defineField({
          name: "caption",
          title: "Legenda da foto",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "anatomy",
      title: "Anatomia",
      type: "object",
      group: "anatomy",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "intro",
          title: "Introdução",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "layers",
          title: "Camadas",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "id",
                  title: "ID",
                  type: "string",
                  options: {
                    list: [
                      { title: "Captação", value: "imagem" },
                      { title: "Direção", value: "luz" },
                      { title: "Mix", value: "som" },
                      { title: "Streaming", value: "infra" },
                    ],
                    canvasApp: { exclude: true },
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "name",
                  title: "Nome",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "note",
                  title: "Nota",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "note" },
              },
            }),
          ],
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "capabilities",
      title: "Capacidades",
      type: "object",
      group: "capabilities",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "intro",
          title: "Introdução",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "items",
          title: "Itens",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "num",
                  title: "Número",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "title",
                  title: "Título",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "copy",
                  title: "Texto",
                  type: "text",
                  rows: 3,
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "icon",
                  title: "Ícone",
                  type: "string",
                  options: {
                    list: [
                      { title: "Som", value: "som" },
                      { title: "Luz", value: "luz" },
                      { title: "Imagem", value: "imagem" },
                      { title: "Infraestrutura", value: "infraestrutura" },
                      { title: "Streaming", value: "streaming" },
                      { title: "Produção", value: "producao" },
                    ],
                    canvasApp: { exclude: true },
                  },
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "num" },
              },
            }),
          ],
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "work",
      title: "Em campo",
      type: "object",
      group: "work",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "statementLine1",
          title: "Frase — linha 1",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "statementLine2",
          title: "Frase — linha 2",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "cards",
          title: "Cards",
          description: "O primeiro vira o destaque; os demais, tiles.",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "kicker",
                  title: "Linha acima do título",
                  type: "string",
                }),
                defineField({
                  name: "title",
                  title: "Título",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "copy",
                  title: "Texto",
                  type: "text",
                  rows: 2,
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "testId",
                  title: "data-testid",
                  type: "string",
                  options: { canvasApp: { exclude: true } },
                }),
                ...captionedImage,
              ],
              preview: {
                select: { title: "title", media: "image" },
              },
            }),
          ],
          options: { layout: "grid" },
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "broadcast",
      title: "Broadcast",
      type: "object",
      group: "broadcast",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "intro",
          title: "Introdução",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "stations",
          title: "Estações",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "id",
                  title: "ID",
                  type: "string",
                  options: {
                    list: [
                      { title: "Captação", value: "captacao" },
                      { title: "Corte", value: "corte" },
                      { title: "Encode", value: "encode" },
                      { title: "Entrega", value: "entrega" },
                    ],
                    canvasApp: { exclude: true },
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "name",
                  title: "Nome",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "note",
                  title: "Nota",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "note" },
              },
            }),
          ],
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Bastidores",
      type: "object",
      group: "gallery",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "photos",
          title: "Fotos",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                ...captionedImage,
                defineField({
                  name: "caption",
                  title: "Legenda",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: "caption", media: "image" },
              },
            }),
          ],
          options: { layout: "grid" },
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "method",
      title: "Método",
      type: "object",
      group: "method",
      fields: [
        defineField({
          name: "label",
          title: "Rótulo",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "intro",
          title: "Introdução",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "cue",
          title: "Dica de rolagem",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "steps",
          title: "Etapas",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "id",
                  title: "ID",
                  type: "string",
                  options: { canvasApp: { exclude: true } },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "num",
                  title: "Número",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "phase",
                  title: "Fase",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "title",
                  title: "Título",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "copy",
                  title: "Texto",
                  type: "text",
                  rows: 2,
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "wide",
                  title: "Foto deitada",
                  type: "object",
                  fields: [
                    defineField({
                      name: "image",
                      title: "Imagem",
                      type: "image",
                      options: { hotspot: true },
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "caption",
                      title: "Legenda",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: { title: "caption", media: "image" },
                  },
                }),
                defineField({
                  name: "tall",
                  title: "Foto em pé",
                  type: "object",
                  fields: [
                    defineField({
                      name: "image",
                      title: "Imagem",
                      type: "image",
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: "caption",
                      title: "Legenda",
                      type: "string",
                    }),
                  ],
                  preview: {
                    select: { title: "caption", media: "image" },
                  },
                }),
                defineField({
                  name: "stills",
                  title: "Mais fotos",
                  description:
                    "Entram depois da foto deitada, enquanto a etapa é lida.",
                  type: "array",
                  of: [
                    defineArrayMember({
                      type: "object",
                      fields: [
                        defineField({
                          name: "image",
                          title: "Imagem",
                          type: "image",
                          options: { hotspot: true },
                          validation: (rule) => rule.required(),
                        }),
                        defineField({
                          name: "caption",
                          title: "Legenda",
                          type: "string",
                          validation: (rule) => rule.required(),
                        }),
                      ],
                      preview: {
                        select: { title: "caption", media: "image" },
                      },
                    }),
                  ],
                  options: { layout: "grid" },
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "phase", media: "wide.image" },
              },
            }),
          ],
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contato",
      type: "object",
      group: "contact",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Linha acima do título",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        ...titlePair,
        defineField({
          name: "note",
          title: "Texto",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "form",
          title: "Formulário",
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Título do formulário",
              type: "string",
              validation: (rule) => rule.required(),
              initialValue: "Conte sobre o seu projeto",
            }),
            defineField({
              name: "intro",
              title: "Texto de apoio",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required(),
              initialValue:
                "Preencha o briefing para preparar seu e-mail. Todos os campos são obrigatórios.",
            }),
            defineField({
              name: "fields",
              title: "Perguntas",
              description:
                "A ordem aqui é a ordem do formulário. Nome e e-mail entram no assunto e no rodapé do e-mail. As demais perguntas formam o briefing.",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "id",
                      title: "Identificador",
                      description: "Sem espaços. Ex.: name, email, project.",
                      type: "string",
                      validation: (rule) =>
                        rule.required().regex(/^[a-z][a-z0-9]*$/, {
                          name: "identificador",
                          invert: false,
                        }),
                    }),
                    defineField({
                      name: "label",
                      title: "Pergunta",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "placeholder",
                      title: "Texto de exemplo",
                      type: "string",
                    }),
                    defineField({
                      name: "hint",
                      title: "Dica",
                      type: "string",
                    }),
                    defineField({
                      name: "kind",
                      title: "Tipo",
                      type: "string",
                      options: {
                        list: [
                          { title: "Nome", value: "name" },
                          { title: "E-mail", value: "email" },
                          { title: "Texto curto", value: "text" },
                          { title: "Texto longo", value: "textarea" },
                        ],
                        layout: "radio",
                      },
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "kind" },
                  },
                }),
              ],
              validation: (rule) =>
                rule.required().min(1).custom((fields) => {
                  if (!Array.isArray(fields)) return true;
                  const ids = fields
                    .map((field) =>
                      field && typeof field === "object" && "id" in field
                        ? field.id
                        : undefined,
                    )
                    .filter((id): id is string => typeof id === "string");
                  const duplicate = ids.find(
                    (id, index) => ids.indexOf(id) !== index,
                  );
                  if (duplicate) return `Identificador duplicado: ${duplicate}`;
                  const kinds = new Set(
                    fields.map((field) =>
                      field && typeof field === "object" && "kind" in field
                        ? field.kind
                        : undefined,
                    ),
                  );
                  if (!kinds.has("name")) return "Inclua uma pergunta do tipo Nome.";
                  if (!kinds.has("email"))
                    return "Inclua uma pergunta do tipo E-mail.";
                  return true;
                }),
            }),
            defineField({
              name: "submitLabel",
              title: "Botão",
              type: "string",
              validation: (rule) => rule.required(),
              initialValue: "Preparar briefing",
            }),
            defineField({
              name: "submitHint",
              title: "Texto abaixo do botão",
              type: "string",
              initialValue:
                "Você revisa e envia pelo seu aplicativo de e-mail.",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Página inicial" }),
  },
});
