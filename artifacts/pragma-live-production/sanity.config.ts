import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  getPreviewOrigin,
  getSanityEnv,
  getStudioBasePath,
  sanityApiVersion,
} from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

const { projectId, dataset } = getSanityEnv();

export default defineConfig({
  name: "pragma",
  title: "PRAGMA",
  projectId,
  dataset,
  basePath: getStudioBasePath(),
  apps: {
    canvas: {
      enabled: true,
      fallbackStudioOrigin: "pragma-live.sanity.studio",
    },
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      title: "Editor visual",
      allowOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        getPreviewOrigin(),
      ],
      previewUrl: {
        initial: getPreviewOrigin(),
      },
      resolve: {
        mainDocuments: defineDocuments([
          { route: "/", filter: `_type == "home"` },
        ]),
        locations: {
          home: defineLocations({
            select: {},
            resolve: () => ({
              locations: [{ title: "Página inicial", href: "/" }],
            }),
          }),
          siteSettings: defineLocations({
            message: "Usado em todas as páginas",
            tone: "caution",
          }),
        },
      },
    }),
    visionTool({ defaultApiVersion: sanityApiVersion }),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (item) =>
            item.templateId !== "home" && item.templateId !== "siteSettings",
        );
      }
      return prev;
    },
  },
});
