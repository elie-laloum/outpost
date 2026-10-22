import { runCleanup } from "../../domain/cleanup.ts";
import type {
  RecipeZoneOpener,
  RecipeZoneSandbox,
  RecipeZoneSandboxes,
  RecipeZoneSlot,
} from "./zone-sandboxes.types.ts";

/** Keeps one open sandbox per workspace and replaces it when a task selects another one. */
export function createRecipeZoneSandboxes<W, S extends RecipeZoneSandbox>(
  opener: RecipeZoneOpener<W, S>,
): RecipeZoneSandboxes<W, S> {
  const slots = new Map<string, Promise<RecipeZoneSlot<W, S>>>();
  const workspaces = new Map<string, W>();
  return {
    workspaces,
    async acquire(zone, context) {
      let opening = slots.get(zone.workspace);
      if (!opening) {
        opening = opener.workspace(zone, context).then((workspace) => {
          workspaces.set(zone.workspace, workspace);
          return {
            workspace,
            current: undefined,
            switched: false,
            queue: Promise.resolve(),
          };
        });
        slots.set(zone.workspace, opening);
      }
      const slot = await opening;
      const next = slot.queue.then(async () => {
        if (slot.current?.key === zone.sandbox) return slot.current.sandbox;
        const previous = slot.current;
        slot.current = undefined;
        await previous?.sandbox.close({ preserve: true });
        const sandbox = await opener.sandbox(
          slot.workspace,
          zone,
          slot.switched,
          context,
        );
        slot.current = { key: zone.sandbox, sandbox };
        slot.switched = true;
        return sandbox;
      });
      slot.queue = next.catch(() => undefined);
      return next;
    },
    async release() {
      const opened = await Promise.allSettled(slots.values());
      await runCleanup(
        opened.map((result) => async () => {
          if (result.status !== "fulfilled") return;
          const current = result.value.current;
          result.value.current = undefined;
          await current?.sandbox.close({ preserve: true });
        }),
        [],
        { message: "Recipe sandbox release failed" },
      );
    },
  };
}
