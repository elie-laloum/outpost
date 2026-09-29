// Guide components: an HTML comment such as `<!-- features -->` turns the next Markdown list into a drawn component.
import { icon, iconForHref } from "./guide-icons.mjs";

const builders = { features, path, flow, files };

export const componentClasses = ["features", "path", "flow", "files"];

export function applyComponents(nodes) {
  const output = [];
  let pending;
  for (const node of nodes) {
    const marker = markerName(node);
    if (marker) {
      pending = marker;
      continue;
    }
    if (pending && isBlank(node)) continue;
    if (pending) {
      if (!isList(node))
        throw new Error(`<!-- ${pending} --> must precede a Markdown list`);
      output.push(builders[pending](node));
      pending = undefined;
      continue;
    }
    output.push(node);
  }
  if (pending)
    throw new Error(`<!-- ${pending} --> must precede a Markdown list`);
  return output;
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
      const body = [element("span", { className: ["feature-title"] }, title)];
      if (href)
        body.unshift(
          element("span", { className: ["feature-icon"] }, [
            icon(iconForHref(href)),
          ]),
        );
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
        element("span", { className: ["path-icon"] }, [
          icon(iconForHref(href)),
        ]),
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

// Phases in sequence, each listing its steps; nested lists under a step become tags.
function flow(list) {
  return element(
    "ol",
    { className: ["flow"], role: "list" },
    items(list).map((phase) => {
      const { title, text, nested } = parseItem(phase);
      const head = [
        element("span", { className: ["flow-phase-title"] }, title),
      ];
      if (text.length)
        head.push(element("span", { className: ["flow-phase-text"] }, text));
      const steps = nested
        ? items(nested).map((step) => {
            const parsed = parseItem(step);
            const content = [
              element("span", { className: ["flow-step-title"] }, parsed.title),
            ];
            if (parsed.text.length)
              content.push(
                element("span", { className: ["flow-step-text"] }, parsed.text),
              );
            if (parsed.nested) content.push(tags(parsed.nested));
            return element("li", { className: ["flow-step"] }, content);
          })
        : [];
      return element("li", { className: ["flow-phase"] }, [
        element("div", { className: ["flow-phase-head"] }, head),
        element("ol", { className: ["flow-steps"], role: "list" }, steps),
      ]);
    }),
  );
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

function markerName(node) {
  const value =
    node.type === "comment"
      ? node.value
      : node.type === "raw"
        ? node.value.match(/^\s*<!--([\s\S]*?)-->\s*$/)?.[1]
        : undefined;
  const name = value?.trim();
  return name && builders[name] !== undefined ? name : undefined;
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
