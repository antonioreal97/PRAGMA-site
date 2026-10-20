import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Configurações",
  type: "document",
  options: {
    canvasApp: { exclude: true },
  },
  fields: [
    defineField({
      name: "email",
      title: "E-mail",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp",
      description:
        "Número com DDI, só dígitos ou formatado (ex.: 5561992733018 ou +55 61 99273-3018).",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          const digits = (value ?? "").replace(/\D/g, "");
          if (digits.length < 12 || digits.length > 15) {
            return "Informe um número com DDI (12 a 15 dígitos).";
          }
          return true;
        }),
    }),
    defineField({
      name: "footerTagline",
      title: "Frase do rodapé",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoTitle",
      title: "Título SEO",
      description:
        "Descreva o serviço principal e a cidade. Recomendado: até 65 caracteres.",
      type: "string",
      validation: (rule) =>
        [
          rule.required(),
          rule.max(65).warning("Prefira um título com até 65 caracteres."),
        ],
    }),
    defineField({
      name: "seoDescription",
      title: "Descrição SEO",
      description:
        "Resumo objetivo dos serviços, da região atendida e do diferencial. Recomendado: 120 a 165 caracteres.",
      type: "text",
      rows: 3,
      validation: (rule) =>
        [
          rule.required(),
          rule
            .min(100)
            .warning("A descrição pode comunicar melhor com ao menos 100 caracteres."),
          rule
            .max(165)
            .warning("Prefira uma descrição com até 165 caracteres."),
        ],
    }),
    defineField({
      name: "nav",
      title: "Navegação",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "Âncora da seção",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Rótulo",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "id" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Configurações do site" }),
  },
});
