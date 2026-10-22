import { useCallback, useMemo } from "react";
import { recipeEditorPlacement } from "../../../src/domain/recipes/editor-scene.ts";
import { recipeEditorSandboxActions } from "../../../src/domain/recipes/editor-scene.constants.ts";
import {
  featureTemplate,
  sandboxTemplate,
  workspaceTemplates,
  componentName,
  componentTemplate,
} from "./scene-templates.ts";
import { layoutEntries, placeScene, uniqueName } from "./scene-layout.ts";
import { useEditor } from "./store.ts";
import {
  configurationNames,
  taskTemplates,
  uniqueTaskKey,
} from "./templates.ts";
import type {
  Position,
  RecipeEditorAction,
  RecipeEditorFeature,
  RecipeEditorPlacementItem,
  RecipeEditorZone,
} from "./types.ts";

/** Where a palette item lands: a zone, and a position relative to it, or the root when absent. */
export interface Drop {
  readonly zone?: string;
  readonly position?: Position;
}

const round = ({ x, y }: Position) => ({ x: Math.round(x), y: Math.round(y) });

/** The opened drafts, their scene and the actions shared by the canvas, the palette and the inspector. */
export function useRecipe() {
  const state = useEditor((store) => store.state);
  const info = useEditor((store) => store.info);
  const selected = useEditor((store) => store.selected);
  const edit = useEditor((store) => store.edit);
  const editScene = useEditor((store) => store.editScene);
  const moveNodes = useEditor((store) => store.moveNodes);
  const select = useEditor((store) => store.select);
  const notify = useEditor((store) => store.notify);
  const recipe = state?.recipe;
  const graph = recipe?.graph;
  const scene = state?.scene;
  const layout = state?.layout;
  const compatibility = info?.compatibility;
  const places = useMemo(
    () => (scene && layout ? placeScene(scene, layout) : {}),
    [scene, layout],
  );
  const names = useMemo(
    () => configurationNames(state?.config?.value),
    [state?.config?.value],
  );
  const keys = useMemo(
    () => graph?.nodes.flatMap((node) => (node.key ? [node.key] : [])) ?? [],
    [graph],
  );
  const editable = !!state?.editable.recipe;
  const configEditable = !!state?.editable.config;
  const selectedZone = scene?.zones.find(
    (zone) => `zone:${zone.id}` === selected,
  );

  const place = useCallback(
    (item: RecipeEditorPlacementItem, zone: string | undefined) => {
      if (!scene || !compatibility) return false;
      const placement = recipeEditorPlacement(
        scene,
        compatibility,
        item,
        zone ? { type: "zone", id: zone } : { type: "root" },
      );
      if (!placement.allowed) notify(placement.reason);
      return placement.allowed;
    },
    [compatibility, notify, scene],
  );

  /** Keeps every drawn node in place once one of them gets a saved position. */
  const entries = useCallback(
    (id: string, drop: Drop | undefined) =>
      drop?.position && layout
        ? { ...layoutEntries(places, layout), [id]: round(drop.position) }
        : {},
    [layout, places],
  );

  const addTask = useCallback(
    async (action: RecipeEditorAction, drop?: Drop) => {
      if (drop && !place({ type: "action", action }, drop.zone)) return;
      const clicked =
        selectedZone?.kind === "sandbox" ? selectedZone.id : undefined;
      const zone = drop ? drop.zone : clicked;
      const key = uniqueTaskKey(action, keys);
      const previous = selected?.startsWith("task:")
        ? selected.slice("task:".length)
        : undefined;
      const after =
        previous && keys.includes(previous) ? { after: [previous] } : {};
      const runs = recipeEditorSandboxActions.some((item) => item === action);
      const sandbox =
        runs && zone?.startsWith("sandboxes.")
          ? { sandbox: zone.slice("sandboxes.".length) }
          : {};
      const task = {
        key,
        ...after,
        ...taskTemplates[action].body(names),
        ...sandbox,
      };
      if (!(await edit("recipe", [{ type: "add-task", task }]))) return;
      const id = `task:${key}`;
      if (drop?.position) await moveNodes(entries(id, drop), true);
      select(id);
    },
    [
      edit,
      entries,
      keys,
      moveNodes,
      names,
      place,
      select,
      selected,
      selectedZone,
    ],
  );

  const addZone = useCallback(
    async (kind: RecipeEditorZone["kind"], type: string, drop?: Drop) => {
      if (!scene) return;
      if (drop && !place({ type: "new-zone", kind }, drop.zone)) return;
      const opened =
        selectedZone?.kind === "workspace"
          ? selectedZone.id
          : selectedZone?.parent;
      const workspace = drop ? drop.zone : (opened ?? "workspace");
      const name = uniqueName(
        type,
        scene.zones.flatMap((zone) =>
          zone.kind === kind && zone.name ? [zone.name] : [],
        ),
      );
      const id = `zone:${kind === "workspace" ? "workspaces" : "sandboxes"}.${name}`;
      const workspaceTemplate = workspaceTemplates[type];
      const declaration =
        kind === "workspace"
          ? (workspaceTemplate?.(name) ?? { kind: type })
          : sandboxTemplate(type);
      if (
        await editScene(
          [
            {
              type: "add-zone",
              kind,
              name,
              declaration,
              ...(kind === "sandbox" && workspace ? { workspace } : {}),
            },
          ],
          entries(id, drop),
        )
      )
        select(id);
    },
    [editScene, entries, place, scene, select, selectedZone],
  );

  const addFeature = useCallback(
    async (feature: RecipeEditorFeature, zone = selectedZone?.id) => {
      const target = scene?.zones.find((item) => item.id === zone);
      if (!target) return notify("Select a zone, or drop the feature on one.");
      if (!place({ type: "feature", feature }, target.id)) return;
      if (
        await editScene([
          {
            type: "set-feature",
            zone: target.id,
            feature,
            value: featureTemplate(feature, target),
          },
        ])
      )
        select(`zone:${target.id}`);
    },
    [editScene, notify, place, scene, select, selectedZone],
  );

  const addComponent = useCallback(
    async (family: string, drop?: Drop) => {
      if (!scene) return;
      const name = uniqueName(
        componentName(family),
        scene.entities.flatMap((entity) =>
          entity.family === family ? [entity.name] : [],
        ),
      );
      const id = `entity:${family}.${name}`;
      if (
        await editScene(
          [
            {
              type: "add-entity",
              family,
              name,
              declaration: componentTemplate(family, compatibility),
            },
          ],
          entries(id, drop),
        )
      )
        select(id);
    },
    [compatibility, editScene, entries, scene, select],
  );

  return {
    state,
    recipe,
    graph,
    scene,
    layout,
    places,
    compatibility,
    names,
    keys,
    editable,
    configEditable,
    selected,
    select,
    edit,
    editScene,
    moveNodes,
    notify,
    place,
    addTask,
    addZone,
    addFeature,
    addComponent,
  };
}
