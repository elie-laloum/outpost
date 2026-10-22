import { useCallback, useMemo } from "react";
import { useEditor } from "./store.ts";
import {
  configurationNames,
  taskTemplates,
  uniqueTaskKey,
} from "./templates.ts";
import type { Position, RecipeEditorAction } from "./types.ts";

/** The opened recipe draft with the names and actions shared by the canvas and the inspector. */
export function useRecipe() {
  const state = useEditor((store) => store.state);
  const selected = useEditor((store) => store.selected);
  const edit = useEditor((store) => store.edit);
  const moveNodes = useEditor((store) => store.moveNodes);
  const select = useEditor((store) => store.select);
  const recipe = state?.recipe;
  const graph = recipe?.graph;
  const names = useMemo(
    () => configurationNames(state?.config?.value),
    [state?.config?.value],
  );
  const keys = useMemo(
    () => graph?.nodes.flatMap((node) => (node.key ? [node.key] : [])) ?? [],
    [graph],
  );
  const editable = !!state?.editable.recipe;

  const addTask = useCallback(
    async (action: RecipeEditorAction, position?: Position) => {
      const key = uniqueTaskKey(action, keys);
      const after =
        selected && keys.includes(selected) ? { after: [selected] } : {};
      const task = { key, ...after, ...taskTemplates[action].body(names) };
      if (!(await edit("recipe", [{ type: "add-task", task }]))) return;
      if (position)
        await moveNodes({
          [key]: { x: Math.round(position.x), y: Math.round(position.y) },
        });
      select(key);
    },
    [edit, keys, moveNodes, names, select, selected],
  );

  return {
    state,
    recipe,
    graph,
    names,
    keys,
    editable,
    selected,
    select,
    edit,
    moveNodes,
    addTask,
  };
}
