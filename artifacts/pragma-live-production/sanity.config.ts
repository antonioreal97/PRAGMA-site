import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { getSanityEnv, sanityApiVersion } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

const { projectId, dataset } = getSanityEnv();

export default defineConfig({
  name: "pragma",
  title: "PRAGMA",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
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
