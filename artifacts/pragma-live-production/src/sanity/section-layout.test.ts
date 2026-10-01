import assert from "node:assert/strict";
import test from "node:test";
import { resolveHomeSections } from "./section-layout";

test("uma seção removida da ordem antiga não reaparece", () => {
  assert.deepEqual(
    resolveHomeSections(undefined, ["about", "work", "contact"]).map(({ id }) => id),
    ["about", "work", "contact"],
  );
  assert.deepEqual(resolveHomeSections(undefined, []), []);
});

test("a nova lista preserva exclusões, ordem e nomes", () => {
  assert.deepEqual(
    resolveHomeSections(
      [
        { id: "work", name: "  Projetos especiais  " },
        { id: "about", name: "Nossa equipe" },
      ],
      ["about", "broadcast", "work"],
    ),
    [
      { id: "work", name: "Projetos especiais" },
      { id: "about", name: "Nossa equipe" },
    ],
  );
  assert.deepEqual(resolveHomeSections([], ["broadcast"]), []);
});
