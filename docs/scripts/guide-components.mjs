// Guide components: an HTML comment such as `<!-- features -->` turns the next Markdown list into a drawn component.
import { icon, iconForHref, iconForTitle } from "./guide-icons.mjs";

const builders = {
  features,
  path,
  canvas,
  files,
  compare,
  pairs,
  cards,
};
const grouped = { tabs };
const maximumTabs = 5;
const canvasLabels = {
  en: {
    region: "Diagram you can move and zoom",
    hint: "Drag to move · Ctrl + scroll to zoom",
    out: "Zoom out",
    in: "Zoom in",
    fit: "Fit to view",
  },
  fr: {
    region: "Schéma déplaçable et zoomable",
    hint: "Glissez pour vous déplacer · Ctrl + molette pour zoomer",
    out: "Dézoomer",
    in: "Zoomer",
    fit: "Tout afficher",
  },
};
let tabGroups = 0;
let canvases = 0;
let locale = "en";

export const componentClasses = [
  "features",
  "path",
  "canvas",
  "files",
  "compare",
  "pairs",
  "cards",
];

export function applyComponents(nodes, options = {}) {
  const output = [];
  const code = [];
  let pending;
  tabGroups = 0;
  canvases = 0;
  locale = options.locale === "fr" ? "fr" : "en";
  for (const node of nodes) {
    const marker = markerName(node);
    if (marker) {
      closeGroup(pending, code, output);
      pending = marker;
      continue;
    }
    if (pending && isBlank(node)) continue;
    if (isGrouped(pending) && isCodeBlock(node)) {
      code.push(node);
      continue;
    }
    if (isGrouped(pending)) {
      closeGroup(pending, code, output);
      pending = undefined;
    }
    if (pending) {
      if (!isList(node))
        throw new Error(`<!-- ${pending} --> must precede a Markdown list`);
      output.push(builders[pending](node));
      pending = undefined;
      continue;
    }
    output.push(node);
  }
  if (isGrouped(pending)) closeGroup(pending, code, output);
  else if (pending)
    throw new Error(`<!-- ${pending} --> must precede a Markdown list`);
  return output;
}

function closeGroup(name, code, output) {
  if (!isGrouped(name)) return;
  if (!code.length)
    throw new Error(`<!-- ${name} --> must precede titled code blocks`);
  output.push(grouped[name](code.splice(0)));
}

export function isComponent(node) {
  return (
    node.type === "element" &&
    componentClasses.some((name) => classes(node).includes(name))
  );
}

// Cells with an icon, a title, one line of text and optional tags from a nested list.
function features(list) {
  return element(
    "ul",
    { className: ["features"], role: "list" },
    items(list).map((item) => {
      const { title, href, text, nested } = parseItem(item);
      const body = [
        cardIcon("feature-icon", title, href),
        element("span", { className: ["feature-title"] }, title),
      ];
      if (text.length)
        body.push(element("span", { className: ["feature-text"] }, text));
      if (nested) body.push(tags(nested));
      const cell = href
        ? element("a", { className: ["feature-cell"], href }, body)
        : element("div", { className: ["feature-cell"] }, body);
      return element("li", { className: ["feature"] }, [cell]);
    }),
  );
}

// Linked stages joined by drawn connectors; the order is the reading path.
function path(list) {
  return element(
    "ol",
    { className: ["path"], role: "list" },
    items(list).map((item) => {
      const { title, href, text } = parseItem(item);
      const body = [
        cardIcon("path-icon", title, href),
        element("span", { className: ["path-title"] }, title),
      ];
      if (text.length)
        body.push(element("span", { className: ["path-text"] }, text));
      return element("li", { className: ["path-stage"] }, [
        href
          ? element("a", { className: ["path-cell"], href }, body)
          : element("div", { className: ["path-cell"] }, body),
      ]);
    }),
  );
}

// Objects on a pannable, zoomable map. Plain sub-items name lanes, `→ **Target**: label` items link to
// an object or branch, and other titled items fork an object into branches that may carry links too.
function canvas(list) {
  const labels = canvasLabels[locale];
  const id = `canvas-${canvases++}`;
  const nodes = items(list).map((item, index) => {
    const parsed = parseItem(item);
    const children = subItems(parsed);
    return {
      ...parsed,
      id: `${id}-node-${index}`,
      name: textOf({ children: parsed.title }).trim(),
      lanes: children
        .filter((child) => !isTitled(child))
        .map((child) => textOf(child).trim()),
      links: children.filter(isLink).map(parseItem),
      branches: children
        .filter((child) => isTitled(child) && !isLink(child))
        .map(parseItem)
        .map((branch, position) => ({
          ...branch,
          id: `${id}-node-${index}-${position}`,
          name: textOf({ children: branch.title }).trim(),
          links: subItems(branch).filter(isLink).map(parseItem),
        })),
    };
  });
  const byName = new Map(
    nodes.flatMap((node, index) => [
      [node.name, { index, id: node.id }],
      ...node.branches.map((branch) => [branch.name, { index, id: branch.id }]),
    ]),
  );
  const resolve = (link) => {
    const name = textOf({ children: link.title }).trim();
    if (!byName.has(name))
      throw new Error(`<!-- canvas --> links to unknown object ${name}`);
    return { ...byName.get(name), name, label: link.text };
  };
  const targets = nodes.map((node) =>
    [node, ...node.branches].flatMap((source) => source.links.map(resolve)),
  );
  const lanes = [...new Set(nodes.flatMap((node) => node.lanes))];
  if (nodes.some((node) => !node.lanes.length))
    throw new Error("<!-- canvas --> objects need a lane tag");
  // Links to a later object push it one column right; links back to an earlier one keep the order.
  const columns = nodes.map(() => 0);
  nodes.forEach((_, from) =>
    targets[from]
      .map((target) => target.index)
      .filter((to) => to > from)
      .forEach(
        (to) => (columns[to] = Math.max(columns[to], columns[from] + 1)),
      ),
  );
  const cell = (index) =>
    `${lanes.indexOf(nodes[index].lanes[0])}:${columns[index]}`;
  const stacks = new Map();
  nodes.forEach((_, index) =>
    stacks.set(cell(index), [...(stacks.get(cell(index)) ?? []), index]),
  );
  const depth = lanes.map((_, lane) =>
    Math.max(
      ...[...stacks]
        .filter(([key]) => key.startsWith(`${lane}:`))
        .map(([, stack]) => stack.length),
    ),
  );
  const firstRow = depth.map((_, lane) =>
    depth.slice(0, lane).reduce((sum, rows) => sum + rows, 1),
  );
  const nodeItems = nodes.map((node, index) => {
    const lane = lanes.indexOf(node.lanes[0]);
    const stack = stacks.get(cell(index));
    const row =
      stack.length === 1
        ? `${firstRow[lane]} / span ${depth[lane]}`
        : `${firstRow[lane] + stack.indexOf(index)}`;
    const title = node.href
      ? element(
          "a",
          {
            className: ["canvas-node-title"],
            href: node.href,
            draggable: "false",
          },
          node.title,
        )
      : element("span", { className: ["canvas-node-title"] }, node.title);
    const content = [
      element("span", { className: ["canvas-node-head"] }, [
        cardIcon("canvas-node-icon", node.title, node.href),
        title,
      ]),
    ];
    if (node.text.length)
      content.push(
        element("span", { className: ["canvas-node-text"] }, node.text),
      );
    if (node.branches.length)
      content.push(
        element(
          "ol",
          { className: ["canvas-branches"], role: "list" },
          node.branches.map((branch) =>
            element("li", { className: ["canvas-branch"], id: branch.id }, [
              cardIcon("canvas-branch-icon", branch.title),
              element(
                "span",
                { className: ["canvas-branch-title"] },
                branch.title,
              ),
              ...(branch.text.length
                ? [
                    element(
                      "span",
                      { className: ["canvas-branch-text"] },
                      branch.text,
                    ),
                  ]
                : []),
              ...(subItems(branch).some((item) => !isLink(item))
                ? [
                    tags({
                      ...branch.nested,
                      children: subItems(branch).filter(
                        (item) => !isLink(item),
                      ),
                    }),
                  ]
                : []),
              ...outgoing(branch.links.map(resolve)),
            ]),
          ),
        ),
      );
    content.push(
      element("span", { className: ["sr-only"] }, [
        { type: "text", value: ` (${node.lanes.join(", ")})` },
      ]),
    );
    content.push(...outgoing(node.links.map(resolve)));
    return element(
      "li",
      {
        className: node.branches.length
          ? ["canvas-node", "canvas-fork"]
          : ["canvas-node"],
        id: node.id,
        style: `grid-column: ${columns[index] + 1}; grid-row: ${row}`,
      },
      content,
    );
  });
  const bands = lanes.map((name, lane) =>
    element(
      "div",
      {
        className: ["canvas-lane"],
        ariaHidden: "true",
        style: `grid-row: ${firstRow[lane]} / span ${depth[lane]}`,
      },
      [
        element("span", { className: ["canvas-lane-name"] }, [
          { type: "text", value: name },
        ]),
      ],
    ),
  );
  const control = (zoom, name) =>
    element(
      "button",
      {
        className: ["canvas-control"],
        type: "button",
        dataZoom: zoom,
        ariaLabel: labels[zoom],
        title: labels[zoom],
      },
      [icon(name)],
    );
  return element("div", { className: ["canvas"], dataCanvas: "" }, [
    element("div", { className: ["canvas-bar"] }, [
      element("span", { className: ["canvas-hint"], id: `${id}-hint` }, [
        { type: "text", value: labels.hint },
      ]),
      element("div", { className: ["canvas-controls"] }, [
        control("out", "minus"),
        element("output", { className: ["canvas-scale"] }, [
          { type: "text", value: "100 %" },
        ]),
        control("in", "plus"),
        control("fit", "fit"),
      ]),
    ]),
    element(
      "div",
      {
        className: ["canvas-viewport"],
        tabIndex: 0,
        role: "region",
        ariaLabel: labels.region,
        ariaDescribedBy: `${id}-hint`,
      },
      [
        element(
          "div",
          {
            className: ["canvas-world"],
            style: `--canvas-columns: ${Math.max(...columns) + 1}; --canvas-rows: ${depth.reduce((sum, rows) => sum + rows, 0)}`,
          },
          [
            ...bands,
            element(
              "svg",
              { className: ["canvas-links"], ariaHidden: "true" },
              [],
            ),
            element(
              "div",
              { className: ["canvas-labels"], ariaHidden: "true" },
              [],
            ),
            element(
              "ul",
              { className: ["canvas-nodes"], role: "list" },
              nodeItems,
            ),
          ],
        ),
      ],
    ),
  ]);
}

// Links stay in the page as a visually hidden list; the script draws them from its targets and labels.
function outgoing(links) {
  if (!links.length) return [];
  return [
    element(
      "ul",
      { className: ["canvas-out", "sr-only"], role: "list" },
      links.map((link) =>
        element("li", { dataTo: link.id }, [
          { type: "text", value: `→ ${link.name} : ` },
          element("span", { className: ["canvas-link-label"] }, link.label),
        ]),
      ),
    ),
  ];
}

function subItems(item) {
  return item.nested ? items(item.nested) : [];
}

function isTitled(item) {
  return inlineOf(item).some(
    (node) =>
      node.type === "element" && ["a", "strong", "code"].includes(node.tagName),
  );
}

function isLink(item) {
  const first = inlineOf(item)[0];
  return first?.type === "text" && first.value.trimStart().startsWith("→");
}

// Titled code blocks behind one tab strip; radio inputs keep it working without scripts.
function tabs(blocks) {
  if (blocks.length > maximumTabs)
    throw new Error(`<!-- tabs --> holds at most ${maximumTabs} code blocks`);
  const group = `code-tabs-${tabGroups++}`;
  const titles = blocks.map((block) => {
    const title = codeTitle(block);
    if (!title) throw new Error("Every <!-- tabs --> code block needs a title");
    return title;
  });
  return element("div", { className: ["code-tabs"] }, [
    ...titles.map((title, index) =>
      element(
        "input",
        {
          className: ["code-tab-input"],
          type: "radio",
          name: group,
          id: `${group}-${index}`,
          checked: index === 0,
        },
        [],
      ),
    ),
    element(
      "div",
      { className: ["code-tab-list"] },
      titles.map((title, index) =>
        element(
          "label",
          { className: ["code-tab"], htmlFor: `${group}-${index}` },
          [{ type: "text", value: title }],
        ),
      ),
    ),
    element(
      "div",
      { className: ["code-tab-panels"] },
      blocks.map((block) =>
        element("div", { className: ["code-tab-panel"] }, [block]),
      ),
    ),
  ]);
}

// Columns that answer the same rows side by side; subgrid rows keep each row level across columns.
function compare(list) {
  const sides = items(list).map(parseItem);
  const heights = sides.map(({ nested }) =>
    nested ? items(nested).length : 0,
  );
  if (new Set(heights).size > 1)
    throw new Error("<!-- compare --> columns need the same number of rows");
  return element(
    "ul",
    {
      className: ["compare"],
      role: "list",
      style: `--compare-rows: ${heights[0] + 1}`,
    },
    sides.map(({ title, href, text, nested }) => {
      const head = [
        cardIcon("compare-icon", title, href),
        element("span", { className: ["compare-title"] }, title),
      ];
      if (text.length)
        head.push(element("span", { className: ["compare-text"] }, text));
      const rows = nested ? items(nested).map(parseItem) : [];
      return element("li", { className: ["compare-side"] }, [
        element("div", { className: ["compare-head"] }, head),
        ...rows.map((row) =>
          element("div", { className: ["compare-row"] }, [
            element("span", { className: ["compare-label"] }, row.title),
            element("span", { className: ["compare-value"] }, row.text),
          ]),
        ),
      ]);
    }),
  );
}

// Rows that read left to right: the name on the left, an arrow, then what follows from it.
function pairs(list) {
  return element(
    "ul",
    { className: ["pairs"], role: "list" },
    items(list).map((item) => {
      const { title, text } = parseItem(item);
      return element("li", { className: ["pair"] }, [
        element("span", { className: ["pair-from"] }, title),
        element("span", { className: ["pair-arrow"], ariaHidden: "true" }, []),
        element("span", { className: ["pair-to"] }, text),
      ]);
    }),
  );
}

// Numbered cards that are read, not followed: a title, its text with inline links and optional tags.
function cards(list) {
  return element(
    "ol",
    { className: ["cards"], role: "list" },
    items(list).map((item, index) => {
      const { title, href, text, nested } = parseItem(item);
      const body = [
        element("span", { className: ["card-head"] }, [
          cardIcon("card-icon", title, href),
          element("span", { className: ["card-index"], ariaHidden: "true" }, [
            { type: "text", value: String(index + 1).padStart(2, "0") },
          ]),
        ]),
        element("span", { className: ["card-title"] }, title),
      ];
      if (text.length)
        body.push(element("span", { className: ["card-text"] }, text));
      if (nested) body.push(tags(nested));
      return element("li", { className: ["card"] }, body);
    }),
  );
}

function cardIcon(className, title, href) {
  return element("span", { className: [className] }, [
    icon(href ? iconForHref(href) : iconForTitle(title.map(textOf).join(" "))),
  ]);
}

// A file tree: names ending with `/` are folders and may nest their entries.
function files(list) {
  return element(
    "ul",
    { className: ["files"], role: "list" },
    fileEntries(list),
  );
}

function fileEntries(list) {
  return items(list).map((item) => {
    const { title, text, nested } = parseItem(item);
    const name = textOf({ children: title }).trim();
    const folder = name.endsWith("/");
    const row = [
      element("span", { className: ["file-icon"] }, [
        icon(folder ? "folder" : "file"),
      ]),
      element("span", { className: ["file-name"] }, title),
    ];
    if (text.length)
      row.push(element("span", { className: ["file-text"] }, text));
    const children = [element("div", { className: ["file-row"] }, row)];
    if (nested)
      children.push(
        element(
          "ul",
          { className: ["files-children"], role: "list" },
          fileEntries(nested),
        ),
      );
    return element(
      "li",
      { className: ["file"], dataKind: folder ? "folder" : "file" },
      children,
    );
  });
}

function tags(list) {
  return element(
    "span",
    { className: ["tags"] },
    items(list).map((item) => {
      const inline = inlineOf(item);
      const code = inline.length === 1 && inline[0].tagName === "code";
      return element(
        "span",
        { className: ["tag"], dataCode: code ? "" : undefined },
        code ? inline[0].children : inline,
      );
    }),
  );
}

// An item is a title (its first link, strong or inline code) followed by text; a nested list is kept apart.
function parseItem(item) {
  const nested = (item.children ?? []).find(isList);
  const inline = inlineOf(item);
  const index = inline.findIndex(
    (node) =>
      node.type === "element" && ["a", "strong", "code"].includes(node.tagName),
  );
  if (index === -1)
    return { title: trimText(inline), href: undefined, text: [], nested };
  const lead = inline[index];
  const title = lead.tagName === "a" ? unwrapStrong(lead.children) : [lead];
  return {
    title: lead.tagName === "strong" ? lead.children : title,
    href: lead.tagName === "a" ? lead.properties?.href : undefined,
    text: trimText(inline.slice(index + 1)),
    nested,
  };
}

function inlineOf(item) {
  const children = (item.children ?? []).filter((node) => !isList(node));
  const paragraph = children.find(
    (node) => node.type === "element" && node.tagName === "p",
  );
  const inline = paragraph ? paragraph.children : children;
  return inline;
}

function unwrapStrong(nodes) {
  return nodes.length === 1 && nodes[0].tagName === "strong"
    ? nodes[0].children
    : nodes;
}

function trimText(nodes) {
  const copy = nodes.map((node) => ({ ...node }));
  while (copy.length && copy[0].type === "text") {
    const value = copy[0].value.replace(/^[\s:—–-]+/, "");
    if (value) {
      copy[0] = { ...copy[0], value };
      break;
    }
    copy.shift();
  }
  if (copy.length && copy.at(-1).type === "text")
    copy[copy.length - 1] = {
      ...copy.at(-1),
      value: copy.at(-1).value.trimEnd(),
    };
  return copy.filter((node) => node.type !== "text" || node.value !== "");
}

function items(list) {
  return (list.children ?? []).filter(
    (node) => node.type === "element" && node.tagName === "li",
  );
}

function isGrouped(name) {
  return name !== undefined && Object.hasOwn(grouped, name);
}

function isCodeBlock(node) {
  if (node.type !== "element") return false;
  if (node.tagName === "pre") return true;
  return (
    node.properties?.dataCelestiaCodeContainer !== undefined ||
    codeTitle(node) !== undefined
  );
}

function codeTitle(node) {
  const title = node.properties?.dataCelestiaCodeTitle;
  if (title) return String(title);
  for (const child of node.children ?? []) {
    if (child.type !== "element") continue;
    const nested = codeTitle(child);
    if (nested) return nested;
  }
  return undefined;
}

function markerName(node) {
  const value =
    node.type === "comment"
      ? node.value
      : node.type === "raw"
        ? node.value.match(/^\s*<!--([\s\S]*?)-->\s*$/)?.[1]
        : undefined;
  const name = value?.trim();
  return name && (Object.hasOwn(builders, name) || Object.hasOwn(grouped, name))
    ? name
    : undefined;
}

function isBlank(node) {
  return node.type === "text" && node.value.trim() === "";
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

function textOf(node) {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function element(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}
