import type { RecipeDialogueOptions } from "./recipe-dialogue.types.ts";

export async function selectRecipeActor(
  actors: readonly string[],
  key: string,
  { actor, prompts, signal }: RecipeDialogueOptions,
): Promise<string | undefined> {
  if (actor !== undefined) {
    if (!actor.trim() || (actors.length && !actors.includes(actor)))
      throw new Error(`Actor ${actor} is not authorized to answer task ${key}`);
    return actor;
  }
  if (actors.length === 1) return actors[0];
  if (!actors.length)
    throw new Error(`Cannot infer an actor for task ${key}; pass --actor`);
  const choice = await prompts.select(`Answer ${key} as`, actors, signal);
  return choice === undefined ? undefined : actors[choice];
}
