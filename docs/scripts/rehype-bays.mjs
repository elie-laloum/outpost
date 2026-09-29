// Lays documentation pages out as bays: each h2 section splits prose (left) from its proof (right).
import { applyComponents, isComponent } from "./guide-components.mjs";

const symbolRoles = new Map([
  ["import", "import"],
  ["purpose and behavior", "say"],
  ["rôle et comportement", "say"],
  ["parameters and properties", "say"],
  ["paramètres et propriétés", "say"],
  ["returns", "show"],
  ["retour", "show"],
  ["signature", "show"],
  ["related contracts", "wide"],
  ["contrats associés", "wide"],
]);
const entryHeadings = new Set(["entry points", "points d’entrée"]);
const pageKinds = [
  ["reference/index", "guide"],
  ["reference/overview/", "overview"],
  ["reference/", "symbol"],
  ["guide/", "guide"],
  ["project/", "project"],
];
const placements = {
  guide: [
    [isComponent, "wide"],
    [isCode, "show"],
    [isTable, "wide"],
  ],
};
const requiredLabels = new Set(["Required", "Requis"]);

export function rehypeBays() {
  return (tree, file) => {
    const kind = pageKind(file.path ?? file.history?.[0] ?? "");
    if (!kind) return;
    if (kind === "guide") tree.children = applyComponents(tree.children);
    const sections = splitSections(tree.children);
    const bays = layouts[kind](sections);
    tree.children = bays;
  };
}

function pageKind(path) {
  const page = path
    .replaceAll("\\", "/")
    .match(/src\/content\/docs\/(?:fr\/)?(.+)\.md$/)?.[1];
  if (!page) return undefined;
  return pageKinds.find(([prefix]) => page.startsWith(prefix))?.[1];
}

const layouts = {
  guide: (sections) =>
    sections.map((section) => bay(section, placements.guide)),
  project: (sections) =>
    sections.map((section) =>
      section.heading
        ? assemble(
            "split",
            "log",
            [section.heading],
            section.nodes.filter(isContent),
            [],
          )
        : assemble("wide", undefined, section.nodes, [], []),
    ),
  overview: (sections) =>
    sections.map((section) =>
      entryHeadings.has(headingText(section))
        ? assemble(
            "wide",
            "overview",
            sectionNodes(section).map(asCells),
            [],
            [],
          )
        : bay(section, placements.guide),
    ),
  symbol(sections) {
    const byRole = { say: [], show: [], wide: [], lead: [] };
    for (const section of sections) {
      const role = section.heading
        ? (symbolRoles.get(headingText(section)) ?? "say")
        : "lead";
      if (role === "import") continue;
      byRole[role].push(...sectionNodes(section).map(propertyRows));
    }
    const bays = [];
    if (byRole.lead.length)
      bays.push(assemble("wide", "lead", byRole.lead, [], []));
    if (byRole.say.length && byRole.show.length)
      bays.push(assemble("split", "contract", byRole.say, byRole.show, []));
    else if (byRole.say.length || byRole.show.length)
      bays.push(
        assemble("wide", "contract", [...byRole.say, ...byRole.show], [], []),
      );
    if (byRole.wide.length)
      bays.push(assemble("wide", "related", byRole.wide.map(asCells), [], []));
    return bays;
  },
};

function splitSections(nodes) {
  const sections = [{ heading: undefined, nodes: [] }];
  for (const node of nodes) {
    if (isH2(node)) sections.push({ heading: node, nodes: [] });
    else sections.at(-1).nodes.push(node);
  }
  return sections.filter(
    (section) => section.heading || section.nodes.some(isContent),
  );
}

function bay(section, rules) {
  const columns = { say: [], show: [], wide: [] };
  for (const node of section.nodes) {
    const column = rules.find(
      ([matches]) => isContent(node) && matches(node),
    )?.[1];
    columns[column ?? "say"].push(node);
  }
  const heading = section.heading ? [section.heading] : [];
  if (!columns.show.length)
    return assemble("wide", undefined, [...heading, ...section.nodes], [], []);
  return assemble(
    "split",
    undefined,
    [...heading, ...columns.say],
    columns.show,
    columns.wide,
  );
}

function assemble(layout, role, say, show, wide) {
  const children = [element("div", { className: ["bay-say"] }, say)];
  if (show.length)
    children.push(
      element("div", { className: ["bay-show"] }, [
        element("div", { className: ["bay-pin"] }, show),
      ]),
    );
  if (wide.length)
    children.push(element("div", { className: ["bay-wide"] }, wide));
  const properties = { className: ["bay"], dataBay: layout };
  if (role) properties.dataRole = role;
  return element("section", properties, children);
}

function sectionNodes(section) {
  return section.heading ? [section.heading, ...section.nodes] : section.nodes;
}

// Parameter tables become rows: name and presence, then the full type, then the meaning.
function propertyRows(node) {
  if (!isTable(node)) return node;
  const rows = descendants(node, "tr").filter(
    (row) => descendants(row, "td").length,
  );
  const items = rows.map((row) => {
    const [name, type, presence, meaning] = descendants(row, "td");
    const label = textOf(presence).trim();
    const depth = (textOf(name).match(/\./g) ?? []).length;
    return element("li", { className: ["prop"], dataDepth: String(depth) }, [
      element("div", { className: ["prop-head"] }, [
        element("span", { className: ["prop-name"] }, name.children),
        element(
          "span",
          {
            className: ["prop-presence"],
            dataRequired: requiredLabels.has(label) ? "" : undefined,
          },
          [{ type: "text", value: label }],
        ),
      ]),
      element("div", { className: ["prop-type"] }, type.children),
      element("div", { className: ["prop-meaning"] }, meaning?.children ?? []),
    ]);
  });
  return element("ul", { className: ["props"] }, items);
}

function asCells(node) {
  return isList(node) ? withClass(node, "cells") : node;
}

function withClass(node, name) {
  const className = [...(node.properties?.className ?? []), name];
  return { ...node, properties: { ...node.properties, className } };
}

function isH2(node) {
  if (node.type !== "element") return false;
  if (node.tagName === "h2") return true;
  return (
    classes(node).includes("level-h2") &&
    node.children.some((child) => child.tagName === "h2")
  );
}

function headingText(section) {
  return textOf(section.heading).trim().toLowerCase();
}

function isContent(node) {
  return (
    node.type === "element" ||
    (node.type === "text" && node.value.trim() !== "")
  );
}

function isCode(node) {
  if (node.type !== "element") return false;
  if (node.tagName === "pre" || classes(node).includes("code-tabs"))
    return true;
  if (node.properties?.dataCelestiaCodeContainer !== undefined) return true;
  return node.tagName !== "table" && descendants(node, "pre").length > 0;
}

function isTable(node) {
  return node.type === "element" && node.tagName === "table";
}

function isList(node) {
  return (
    node.type === "element" && (node.tagName === "ul" || node.tagName === "ol")
  );
}

function classes(node) {
  const value = node.properties?.className ?? [];
  return Array.isArray(value) ? value : String(value).split(" ");
}

function descendants(node, tagName) {
  const found = [];
  for (const child of node.children ?? []) {
    if (child.type !== "element") continue;
    if (child.tagName === tagName) found.push(child);
    found.push(...descendants(child, tagName));
  }
  return found;
}

function textOf(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function element(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}
