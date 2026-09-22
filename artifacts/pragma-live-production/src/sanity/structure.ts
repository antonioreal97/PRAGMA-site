import type { StructureResolver } from "sanity/structure";
import { ImagesView } from "./images-view";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Conteúdo")
    .items([
      S.listItem()
        .title("Página inicial")
        .id("home")
        .child(
          S.document()
            .schemaType("home")
            .documentId("home")
            .views([
              S.view.form().title("Conteúdo"),
              S.view.component(ImagesView).title("Imagens"),
            ]),
        ),
      S.listItem()
        .title("Configurações")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
