import assert from "node:assert/strict";
import { test } from "node:test";
import { rehypeBays } from "./rehype-bays.mjs";

const node = (tagName, value) => ({
  type: "element",
  tagName,
  properties: {},
  children: [{ type: "text", value }],
});
const words = (tree) =>
  tree.type === "text"
    ? tree.value
    : (tree.children ?? []).map(words).join(" ");

for (const locale of ["", "fr/"]) {
  test(`guide examples retain their introductions and following explanations (${locale || "en"})`, () => {
    const tree = {
      type: "root",
      children: [
        node("h2", "First section"),
        node("p", "Introduce first example"),
        node("pre", "First code"),
        node("p", "Explain first result"),
        node("h3", "Second example"),
        node("p", "Introduce second example"),
        node("pre", "Second code"),
        node("p", "Explain second result"),
        node("h2", "Next section"),
        node("p", "More guidance"),
      ],
    };
    rehypeBays()(tree, {
      path: `/docs/src/content/docs/${locale}guide/test.md`,
    });
    assert.equal(tree.children.length, 2);
    const rows = tree.children[0].children;
    assert.equal(rows.length, 3);
    assert.equal(rows[0].properties.dataBay, "split");
    assert.equal(rows[1].properties.dataBay, "split");
    assert.equal(rows[2].properties.dataBay, "wide");
    assert.equal(
      words(tree).replace(/\s+/g, " "),
      "First section Introduce first example First code Explain first result Second example Introduce second example Second code Explain second result Next section More guidance",
    );
    assert.match(words(rows[0].children[0]), /Introduce first example/);
    assert.match(words(rows[0].children[1]), /First code/);
    assert.match(
      words(rows[1].children[0]),
      /Explain first result.*Second example/,
    );
    assert.doesNotMatch(words(rows[0].children[0]), /Explain first result/);
  });

  for (const code of [false, true]) {
    test(`guide notices span the content and retain reading order (${locale || "en"}, code: ${code})`, () => {
      const variants = ["note", "tip", "caution", "danger"];
      const children = [node("h2", "Guidance")];
      for (const variant of variants) {
        children.push(node("p", `Before ${variant}`));
        if (code) children.push(node("pre", `Example ${variant}`));
        const aside = node("aside", `Notice ${variant}`);
        aside.properties.className = [
          "starlight-aside",
          `starlight-aside--${variant}`,
        ];
        children.push(aside, node("p", `After ${variant}`));
      }
      const tree = { type: "root", children };
      const original = words(tree);
      rehypeBays()(tree, {
        path: `/docs/src/content/docs/${locale}guide/test.md`,
      });
      assert.equal(words(tree), original);
      const notices = tree.children[0].children.filter((row) =>
        row.properties.className.includes("bay-aside"),
      );
      assert.equal(notices.length, variants.length);
      for (const [index, row] of notices.entries()) {
        assert.equal(row.children.length, 1);
        assert.equal(row.children[0].tagName, "aside");
        assert.ok(
          row.children[0].properties.className.includes(
            `starlight-aside--${variants[index]}`,
          ),
        );
      }
    });
  }
}
