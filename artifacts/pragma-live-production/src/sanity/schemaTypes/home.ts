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

export const homeType = defineType({
  name: "home",
  title: "Página inicial",
  type: "document",
  groups: [
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
          name: "poster",
          title: "Poster do vídeo",
          type: "image",
          options: { hotspot: true },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "video",
          title: "Vídeo",
          type: "file",
          options: { accept: "video/*" },
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
                      { title: "Imagem", value: "imagem" },
                      { title: "Luz", value: "luz" },
                      { title: "Som", value: "som" },
                      { title: "Infraestrutura", value: "infra" },
                    ],
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
                }),
                ...captionedImage,
              ],
              preview: {
                select: { title: "title", media: "image" },
              },
            }),
          ],
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
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "phase" },
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
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Página inicial" }),
  },
});
