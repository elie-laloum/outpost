import { dirname, relative, resolve } from "node:path";
import {
  ConfigurationError,
  configurationError,
} from "../../domain/configuration-diagnostic.ts";
import { OutpostError } from "../../domain/errors.ts";
import { recipeLimits } from "../../domain/recipe.constants.ts";
import {
  planRecipeEdit,
  recipeEditorGraph,
  recipeEditorLayout,
  updateRecipeEditorLayout,
  updateRecipeEditorSceneLayout,
} from "../../domain/recipes/editor.ts";
import { planRecipeSceneEdit } from "../../domain/recipes/editor-scene-edit.ts";
import {
  recipeEditorScene,
  recipeEditorSceneNode,
} from "../../domain/recipes/editor-scene.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import {
  readEditorFile,
  writeEditorFile,
} from "../../infrastructure/editor-files.ts";
import { parseRecipe } from "../../infrastructure/recipe.ts";
import {
  applyDocumentMutations,
  editableYamlValue,
  openEditableYaml,
  serializeEditableYaml,
} from "../../infrastructure/recipes/editor-document.ts";
import { inspectRecipeExecution } from "../recipes/plan.ts";
import { validateRecipeProject } from "../recipes/project.ts";
import { recipeEditorCompatibility } from "./compatibility.ts";
import {
  recipeEditorDefaults,
  recipeEditorStarters,
} from "./starters.constants.ts";
import type {
  RecipeEditorLayout,
  RecipeEditorOperation,
} from "../../domain/recipes/editor.types.ts";
import type {
  RecipeEditorCompatibility,
  RecipeEditorSceneOperation,
} from "../../domain/recipes/editor-scene.types.ts";
import type {
  RecipeEditorDiagnostic,
  RecipeEditorDraft,
  RecipeEditorDraftState,
  RecipeEditorOpenOptions,
  RecipeEditorProject,
  RecipeEditorRole,
  RecipeEditorSession,
  RecipeEditorSessionOptions,
  RecipeEditorSnapshot,
  RecipeEditorState,
} from "./session.types.ts";

const emptyLayout: RecipeEditorLayout = { version: 2, nodes: {} };

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parse(draft: RecipeEditorDraft): void {
  try {
    draft.editable = openEditableYaml(draft.text);
    draft.parseError = undefined;
  } catch (error) {
    draft.editable = undefined;
    draft.parseError = message(error);
  }
}

function draft(
  path: string,
  text: string,
  base: string | null,
): RecipeEditorDraft {
  const created: RecipeEditorDraft = {
    path,
    base,
    text,
    saved: base === null ? undefined : text,
    editable: undefined,
    parseError: undefined,
    changedOnDisk: false,
  };
  parse(created);
  return created;
}

function yamlPath(file: string, role: RecipeEditorRole): string {
  if (!/\.ya?ml$/i.test(file))
    throw new OutpostError(
      "configuration",
      `The ${role === "recipe" ? "recipe" : "configuration"} file must use .yaml or .yml`,
    );
  return file;
}

export function recipeEditorLayoutPath(recipe: string): string {
  return `${recipe.replace(/\.ya?ml$/i, "")}.editor.json`;
}

function serializeLayout(layout: RecipeEditorLayout): string {
  const nodes = Object.fromEntries(
    Object.entries(layout.nodes)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, { x, y, width, height, collapsed }]) => [
        key,
        {
          x: Math.round(x),
          y: Math.round(y),
          ...(width && height
            ? { width: Math.round(width), height: Math.round(height) }
            : {}),
          ...(collapsed ? { collapsed } : {}),
        },
      ]),
  );
  return `${JSON.stringify({ version: 2, nodes }, null, 2)}\n`;
}

/** Removes the location the engine appends or prepends, which the diagnostic carries separately. */
function plainMessage(text: string): string {
  return text
    .replace(/^.*?:\d+:\d+: /s, "")
    .replace(/ \(line \d+, column \d+\)$/, "");
}

function fileDiagnostic(
  role: RecipeEditorRole,
  code: string,
  text: string,
): RecipeEditorDiagnostic {
  const position = /\(line (\d+), column (\d+)\)/.exec(text);
  return {
    file: role,
    code,
    message: plainMessage(text),
    path: [],
    ...(position
      ? { line: Number(position[1]), column: Number(position[2]) }
      : {}),
  };
}

function versionOf(value: unknown): unknown {
  return recipeObject(value) ? value.version : undefined;
}

/** Holds the unsaved recipe, configuration and layout drafts edited by one editor server. */
export function createRecipeEditorSession(
  options: RecipeEditorSessionOptions,
): RecipeEditorSession {
  const { root } = options;
  let opened: RecipeEditorOpenOptions | undefined;
  let recipe: RecipeEditorDraft | undefined;
  let config: RecipeEditorDraft | undefined;
  let layout = emptyLayout;
  let layoutSaved: string | undefined;
  let layoutBase: string | null = null;
  let revision = 0;
  let diagnostics: readonly RecipeEditorDiagnostic[] = [];
  let compatibility: RecipeEditorCompatibility | undefined;
  const compatibilityMap = () =>
    (compatibility ??= recipeEditorCompatibility(options.registry));
  const undoStack: RecipeEditorSnapshot[] = [];
  const redoStack: RecipeEditorSnapshot[] = [];
  const listeners = new Set<(state: RecipeEditorState) => void>();
  let queue: Promise<unknown> = Promise.resolve();

  function exclusive<T>(run: () => Promise<T>): Promise<T> {
    const next = queue.then(run, run);
    queue = next.catch(() => undefined);
    return next;
  }

  function absolute(path: string): string {
    return resolve(root.directory, path);
  }

  function roleOf(file: string | undefined): RecipeEditorRole | undefined {
    if (file === undefined) return undefined;
    const path = root.relative(file);
    if (path === config?.path) return "config";
    if (path === recipe?.path) return "recipe";
    return undefined;
  }

  function diagnosticOf(
    error: unknown,
    fallback: RecipeEditorRole,
  ): RecipeEditorDiagnostic {
    if (!(error instanceof ConfigurationError)) {
      const text = message(error);
      const located = /^(.*?):(\d+):(\d+): /s.exec(text);
      return {
        file: roleOf(located?.[1]) ?? fallback,
        code: "invalid-configuration",
        message: plainMessage(text),
        path: [],
        ...(located
          ? { line: Number(located[2]), column: Number(located[3]) }
          : {}),
      };
    }
    const found = error.diagnostic;
    return {
      file: roleOf(found.file) ?? fallback,
      code: found.code,
      message: plainMessage(found.message),
      path: found.path,
      ...(found.hint === undefined ? {} : { hint: found.hint }),
      ...(found.line === undefined ? {} : { line: found.line }),
      ...(found.column === undefined ? {} : { column: found.column }),
    };
  }

  async function validate(): Promise<readonly RecipeEditorDiagnostic[]> {
    const found = [recipe, config].flatMap((item) =>
      item?.parseError === undefined
        ? []
        : [
            fileDiagnostic(
              item === recipe ? "recipe" : "config",
              "invalid-yaml",
              item.parseError,
            ),
          ],
    );
    if (found.length || !recipe) return found;
    try {
      parseRecipe(recipe.text);
    } catch (error) {
      return [diagnosticOf(error, "recipe")];
    }
    if (!config) return [];
    try {
      await validateRecipeProject(
        {
          file: absolute(recipe.path),
          config: absolute(config.path),
          ...(options.registry ? { registry: options.registry } : {}),
        },
        { recipe: recipe.text, config: config.text },
      );
    } catch (error) {
      return [diagnosticOf(error, "config")];
    }
    return [];
  }

  function draftState(item: RecipeEditorDraft): RecipeEditorDraftState {
    const value = item.editable ? editableYamlValue(item.editable) : undefined;
    return {
      path: item.path,
      text: item.text,
      dirty: item.text !== item.saved,
      exists: item.base !== null,
      changedOnDisk: item.changedOnDisk,
      ...(item.editable ? { value, version: versionOf(value) } : {}),
    };
  }

  function editable(item: RecipeEditorDraft | undefined): boolean {
    return (
      !!item?.editable && versionOf(editableYamlValue(item.editable)) === 3
    );
  }

  function state(): RecipeEditorState {
    const recipeState = recipe && draftState(recipe);
    const configState = config && draftState(config);
    const scene =
      recipeState && recipeEditorScene(recipeState.value, configState?.value);
    return {
      revision,
      directory: root.directory,
      ...(recipeState
        ? {
            recipe: {
              ...recipeState,
              graph: recipeEditorGraph(recipeState.value),
            },
          }
        : {}),
      ...(configState ? { config: configState } : {}),
      ...(scene ? { scene } : {}),
      layout,
      layoutDirty: !!recipe && serializeLayout(layout) !== layoutSaved,
      editable: { recipe: editable(recipe), config: editable(config) },
      diagnostics: diagnostics.map((diagnostic) => {
        const node =
          scene &&
          recipeEditorSceneNode(scene, diagnostic.file, diagnostic.path);
        return node ? { ...diagnostic, node } : diagnostic;
      }),
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
    };
  }

  async function commit(revalidate = true): Promise<RecipeEditorState> {
    revision++;
    if (revalidate) diagnostics = await validate();
    const current = state();
    for (const listener of listeners) {
      try {
        listener(current);
      } catch {
        /* A failing subscriber must not change the edit outcome. */
      }
    }
    return current;
  }

  function snapshot(): RecipeEditorSnapshot {
    return {
      ...(recipe ? { recipe: recipe.text } : {}),
      ...(config ? { config: config.text } : {}),
      layout,
    };
  }

  function restore(saved: RecipeEditorSnapshot): void {
    for (const [item, text] of [
      [recipe, saved.recipe],
      [config, saved.config],
    ] as const) {
      if (!item || text === undefined) continue;
      item.text = text;
      parse(item);
    }
    layout = saved.layout;
  }

  function expectRevision(seen: number): void {
    if (seen !== revision)
      throw new OutpostError(
        "conflict",
        "The draft changed in another window; reload it before editing",
        { revision },
      );
  }

  function change(
    seen: number,
    apply: () => void,
    { record = true, revalidate = true } = {},
  ): Promise<RecipeEditorState> {
    return exclusive(async () => {
      expectRevision(seen);
      const before = snapshot();
      try {
        apply();
      } catch (error) {
        restore(before);
        throw error;
      }
      if (record) {
        undoStack.push(before);
        if (undoStack.length > recipeEditorDefaults.history) undoStack.shift();
        redoStack.length = 0;
      }
      return commit(revalidate);
    });
  }

  function target(role: RecipeEditorRole): RecipeEditorDraft {
    const item = role === "recipe" ? recipe : config;
    if (!item)
      throw new OutpostError("configuration", `No ${role} file is open`);
    return item;
  }

  function editableTarget(role: RecipeEditorRole): RecipeEditorDraft {
    const item = target(role);
    if (!item.editable)
      throw configurationError(
        `Fix the YAML syntax of ${item.path} before editing it visually`,
        [],
        "invalid-yaml",
      );
    if (!editable(item))
      throw configurationError(
        role === "recipe"
          ? "Visual editing requires recipe format 3"
          : "Visual editing requires configuration version 3",
        ["version"],
        "unsupported-version",
        "Edit the YAML text directly, or declare version: 3 after converting the file.",
      );
    return item;
  }

  function editScene(
    operations: readonly RecipeEditorSceneOperation[],
    positions: RecipeEditorLayout["nodes"],
  ): void {
    const drafts = {
      recipe: editableTarget("recipe"),
      config: editableTarget("config"),
    };
    for (const operation of operations) {
      const planned = planRecipeSceneEdit(
        {
          recipe: editableYamlValue(drafts.recipe.editable!),
          config: editableYamlValue(drafts.config.editable!),
        },
        operation,
        compatibilityMap(),
      );
      for (const role of ["recipe", "config"] as const) {
        if (!planned[role].length) continue;
        const item = drafts[role];
        applyDocumentMutations(item.editable!, planned[role]);
        item.text = serializeEditableYaml(item.editable!);
        parse(item);
      }
      layout = updateRecipeEditorSceneLayout(layout, operation);
    }
    layout = { version: 2, nodes: { ...layout.nodes, ...positions } };
  }

  function editDraft(
    role: RecipeEditorRole,
    operations: readonly RecipeEditorOperation[],
  ): void {
    const item = editableTarget(role);
    for (const operation of operations) {
      if (role === "config" && operation.type !== "set")
        throw configurationError(
          `Configuration edits only accept set operations, not ${operation.type}`,
          [],
          "invalid-value",
        );
      const document = item.editable!;
      applyDocumentMutations(
        document,
        planRecipeEdit(editableYamlValue(document), operation),
      );
      item.text = serializeEditableYaml(document);
      parse(item);
      if (role === "recipe")
        layout = updateRecipeEditorLayout(layout, operation);
    }
  }

  async function readDraft(
    file: string,
    role: RecipeEditorRole,
    starter: string | undefined,
    schema: string | undefined,
  ): Promise<RecipeEditorDraft> {
    const path = root.relative(await root.locate(yamlPath(file, role)));
    const existing = await readEditorFile(root, path, recipeLimits.bytes);
    if (existing) return draft(path, existing.text, existing.hash);
    if (starter === undefined)
      throw new OutpostError("configuration", `${path} does not exist`);
    const header = schema
      ? `# yaml-language-server: $schema=${relative(dirname(absolute(path)), schema).replaceAll("\\", "/")}\n`
      : "";
    return draft(path, header + starter, null);
  }

  async function load(selection: RecipeEditorOpenOptions): Promise<void> {
    const starter = selection.starter
      ? recipeEditorStarters[selection.starter]
      : undefined;
    const nextRecipe = await readDraft(
      selection.recipe,
      "recipe",
      starter?.recipe,
      options.schemas?.recipe,
    );
    const nextConfig =
      selection.config === undefined
        ? undefined
        : await readDraft(
            selection.config,
            "config",
            starter?.config,
            options.schemas?.configuration,
          );
    if (nextConfig?.path === nextRecipe.path)
      throw new OutpostError(
        "configuration",
        "Recipe and configuration require separate files",
      );
    const saved = await readEditorFile(
      root,
      recipeEditorLayoutPath(nextRecipe.path),
      recipeEditorDefaults.layoutBytes,
    );
    let parsed: unknown;
    try {
      parsed = saved ? JSON.parse(saved.text) : undefined;
    } catch {
      parsed = undefined;
    }
    recipe = nextRecipe;
    config = nextConfig;
    layout = recipeEditorLayout(parsed);
    layoutSaved = saved
      ? serializeLayout(layout)
      : serializeLayout(emptyLayout);
    layoutBase = saved?.hash ?? null;
    opened = selection;
    undoStack.length = 0;
    redoStack.length = 0;
  }

  function project(): RecipeEditorProject {
    if (!opened || !recipe)
      throw new OutpostError("configuration", "No recipe is open");
    return { selection: opened, recipe };
  }

  async function diskHash(path: string, limit: number) {
    return (await readEditorFile(root, path, limit))?.hash ?? null;
  }

  return {
    root,
    state,
    open: (selection) =>
      exclusive(async () => {
        await load(selection);
        return commit();
      }),
    edit: (role, operations, seen) =>
      change(seen, () => editDraft(role, operations)),
    compatibility: compatibilityMap,
    editScene: (operations, seen, positions = {}) =>
      change(seen, () => editScene(operations, positions)),
    replaceText: (role, text, seen) =>
      change(seen, () => {
        if (Buffer.byteLength(text, "utf8") > recipeLimits.bytes)
          throw new OutpostError(
            "configuration",
            "YAML documents are limited to 1 MiB",
          );
        const item = target(role);
        item.text = text;
        parse(item);
      }),
    setLayout: (next, seen) =>
      change(
        seen,
        () => {
          if (!recipe)
            throw new OutpostError("configuration", "No recipe is open");
          layout = recipeEditorLayout(next);
        },
        { record: false, revalidate: false },
      ),
    undo: (seen) =>
      exclusive(async () => {
        expectRevision(seen);
        const previous = undoStack.pop();
        if (!previous) return state();
        redoStack.push(snapshot());
        restore(previous);
        return commit();
      }),
    redo: (seen) =>
      exclusive(async () => {
        expectRevision(seen);
        const next = redoStack.pop();
        if (!next) return state();
        undoStack.push(snapshot());
        restore(next);
        return commit();
      }),
    save: (settings = {}) =>
      exclusive(async () => {
        const current = project().recipe;
        const items = [recipe, config].filter(
          (item): item is RecipeEditorDraft =>
            !!item && (item.text !== item.saved || item.base === null),
        );
        const layoutText = serializeLayout(layout);
        const layoutPath = recipeEditorLayoutPath(current.path);
        // An empty layout is only written to clear a file that already exists.
        const writeLayout =
          layoutText !== layoutSaved &&
          (Object.keys(layout.nodes).length > 0 || layoutBase !== null);
        const conflicts: string[] = [];
        for (const item of items)
          if ((await diskHash(item.path, recipeLimits.bytes)) !== item.base)
            conflicts.push(item.path);
        if (
          writeLayout &&
          (await diskHash(layoutPath, recipeEditorDefaults.layoutBytes)) !==
            layoutBase
        )
          conflicts.push(layoutPath);
        if (conflicts.length && !settings.overwrite)
          throw new OutpostError(
            "conflict",
            `${conflicts.join(", ")} changed on disk since the editor opened ${conflicts.length > 1 ? "them" : "it"}`,
            { files: conflicts },
          );
        for (const item of items) {
          const expected = settings.overwrite
            ? await diskHash(item.path, Number.MAX_SAFE_INTEGER)
            : item.base;
          const written = await writeEditorFile(
            root,
            item.path,
            item.text,
            expected,
          );
          item.base = written.hash;
          item.saved = item.text;
          item.changedOnDisk = false;
        }
        if (writeLayout) {
          const expected = settings.overwrite
            ? await diskHash(layoutPath, Number.MAX_SAFE_INTEGER)
            : layoutBase;
          layoutBase = (
            await writeEditorFile(root, layoutPath, layoutText, expected)
          ).hash;
        }
        layoutSaved = layoutText;
        return commit();
      }),
    reload: () =>
      exclusive(async () => {
        await load(project().selection);
        return commit();
      }),
    checkDisk: () =>
      exclusive(async () => {
        let changed = false;
        for (const item of [recipe, config]) {
          if (!item) continue;
          const current = await readEditorFile(
            root,
            item.path,
            recipeLimits.bytes,
          );
          const hash = current?.hash ?? null;
          if (hash === item.base) continue;
          if (item.text === item.saved && current) {
            item.text = current.text;
            item.saved = current.text;
            item.base = current.hash;
            item.changedOnDisk = false;
            parse(item);
            changed = true;
            continue;
          }
          if (!item.changedOnDisk && item.base !== null) {
            item.changedOnDisk = true;
            changed = true;
          }
        }
        if (changed) await commit();
        return changed;
      }),
    plan: () =>
      exclusive(async () => {
        if (!recipe || !config)
          throw new OutpostError(
            "configuration",
            "Planning requires a recipe and a configuration",
          );
        return inspectRecipeExecution(
          { file: absolute(recipe.path), config: absolute(config.path) },
          { recipe: recipe.text, config: config.text },
        );
      }),
    files: () => ({
      ...(recipe ? { recipe: absolute(recipe.path) } : {}),
      ...(config ? { config: absolute(config.path) } : {}),
    }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
