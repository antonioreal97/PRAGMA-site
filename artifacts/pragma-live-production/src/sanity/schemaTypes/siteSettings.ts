import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Configurações",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "E-mail",
      type: "string",
      validation: (rule) => rule.required().email(),
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
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Descrição SEO",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
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
