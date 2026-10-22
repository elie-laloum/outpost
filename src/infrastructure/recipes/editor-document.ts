import {
  isCollection,
  isMap,
  isScalar,
  isSeq,
  LineCounter,
  parseDocument,
  visit,
  type Document,
  type Pair,
  type YAMLSeq,
} from "yaml";
import { configurationError } from "../../domain/configuration-diagnostic.ts";
import { recipeLimits } from "../../domain/recipe.constants.ts";
import type { DocumentMutation } from "../../domain/recipes/editor.types.ts";
import type { RecipeSourcePath } from "../../domain/recipes/expressions.types.ts";
import type {
  DocumentMutator,
  DocumentMutators,
  EditableYaml,
  FlowCollection,
  YamlContext,
} from "./editor-document.types.ts";

// Matches `key:` followed by a sequence item at the same indentation.
const unindentedSequence = /^([ \t]*)[^\s#-][^\n]*:[ \t]*\n\1- /m;

/** Parses YAML for editing; the document keeps comments, styles and flow padding. */
export function openEditableYaml(source: string): EditableYaml {
  if (Buffer.byteLength(source, "utf8") > recipeLimits.bytes)
    throw new Error("YAML document exceeds 1 MiB");
  const lineCounter = new LineCounter();
  const document = parseDocument(source, {
    version: "1.2",
    uniqueKeys: true,
    lineCounter,
  });
  const failure = document.errors[0];
  if (failure) {
    const { line, col } = lineCounter.linePos(failure.pos[0]);
    throw new Error(
      `Invalid YAML (line ${line}, column ${col}): ${failure.message}`,
    );
  }
  const padding = new WeakMap<object, string>();
  visit(document, (_, node) => {
    if (!isCollection(node) || !node.flow || !node.range || !node.items.length)
      return;
    padding.set(node, source[node.range[0] + 1] === " " ? " " : "");
  });
  return {
    document,
    padding,
    indentSequences: !unindentedSequence.test(source),
  };
}

function scalarValue(value: unknown): boolean {
  return (
    value === null || ["string", "number", "boolean"].includes(typeof value)
  );
}

function sequence(
  editable: EditableYaml,
  path: RecipeSourcePath,
): YAMLSeq | undefined {
  const node = editable.document.getIn(path, true);
  if (node === undefined) return undefined;
  if (!isSeq(node))
    throw configurationError("Expected a list", [...path], "invalid-value");
  return node;
}

function created(
  document: Document,
  value: unknown,
  flow: boolean | undefined,
) {
  const node = document.createNode(value, flow ? { flow: true } : {});
  // Component references read as one value, so they stay inline in block maps.
  visit(node, {
    Map: (_, map) => {
      const [pair] = map.items;
      if (
        map.items.length === 1 &&
        isScalar(pair?.key) &&
        pair.key.value === "$ref"
      )
        map.flow = true;
    },
  });
  return node;
}

const mutators: DocumentMutators = {
  set: (editable, { path, value, flow }) => {
    const current = editable.document.getIn(path, true);
    if (isScalar(current) && scalarValue(value)) {
      current.value = value;
      return;
    }
    editable.document.setIn(path, created(editable.document, value, flow));
  },
  delete: (editable, { path }) => {
    editable.document.deleteIn(path);
  },
  insert: (editable, { path, index, value, flow }) => {
    const list = sequence(editable, path);
    if (!list) {
      editable.document.setIn(path, created(editable.document, [value], flow));
      return;
    }
    list.items.splice(index, 0, created(editable.document, value, false));
  },
  move: (editable, { path, from, to }) => {
    const list = sequence(editable, path);
    if (!list || from >= list.items.length)
      throw configurationError(
        "Unknown list item",
        [...path, from],
        "invalid-value",
      );
    const [item] = list.items.splice(from, 1);
    list.items.splice(to, 0, item);
  },
  rename: (editable, { path, to }) => {
    const parent = editable.document.getIn(path.slice(0, -1), true);
    const key = path.at(-1);
    const keyOf = (pair: Pair) =>
      isScalar(pair.key) ? pair.key.value : pair.key;
    const pair = isMap(parent)
      ? parent.items.find((item) => keyOf(item) === key)
      : undefined;
    if (!isMap(parent) || !pair)
      throw configurationError("Unknown map entry", [...path], "invalid-value");
    if (parent.items.some((item) => keyOf(item) === to))
      throw configurationError(
        `${to} already exists`,
        [...path.slice(0, -1), to],
        "duplicate-key",
      );
    if (isScalar(pair.key)) pair.key.value = to;
    else pair.key = editable.document.createNode(to);
  },
};

export function applyDocumentMutations(
  editable: EditableYaml,
  mutations: readonly DocumentMutation[],
): void {
  for (const mutation of mutations) {
    const mutate = mutators[mutation.op] as DocumentMutator;
    mutate(editable, mutation);
  }
}

function pad(node: FlowCollection, padding: string): void {
  const base = Object.getPrototypeOf(node) as FlowCollection;
  Object.defineProperty(node, "toString", {
    configurable: true,
    value: (
      context: YamlContext,
      onComment?: () => void,
      onChompKeep?: () => void,
    ) =>
      base.toString.call(
        node,
        context && { ...context, flowCollectionPadding: padding },
        onComment,
        onChompKeep,
      ),
  });
}

/** Serializes with each flow collection's original padding; new lists use `[a]` and maps `{ a: b }`. */
export function serializeEditableYaml(editable: EditableYaml): string {
  const padded: FlowCollection[] = [];
  visit(editable.document, {
    Map: (_, node) => {
      if (!node.flow) return;
      pad(node, editable.padding.get(node) ?? " ");
      padded.push(node);
    },
    Seq: (_, node) => {
      if (!node.flow) return;
      pad(node, editable.padding.get(node) ?? "");
      padded.push(node);
    },
  });
  try {
    return editable.document.toString({
      lineWidth: 0,
      indentSeq: editable.indentSequences,
    });
  } finally {
    for (const node of padded) Reflect.deleteProperty(node, "toString");
  }
}

export function editableYamlValue(editable: EditableYaml): unknown {
  return editable.document.toJS({ maxAliasCount: 100 });
}
