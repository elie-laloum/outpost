import type {
  RecipeComponentDefinition,
  RecipeRegistry,
  RecipeRegistryOptions,
} from "./component.types.ts";

export function defineRecipeComponent(
  definition: RecipeComponentDefinition,
): RecipeComponentDefinition {
  if (!definition.name.trim() || !definition.kind.trim())
    throw new Error("Recipe component name and kind must be nonempty");
  if (
    typeof definition.create !== "function" ||
    typeof definition.accepts !== "function"
  )
    throw new Error(
      "Recipe components require a factory and a result validator",
    );
  return Object.freeze({ ...definition });
}

export function createRecipeRegistry(
  options: RecipeRegistryOptions = {},
): RecipeRegistry {
  const entries = new Map<string, RecipeComponentDefinition>();
  for (const definition of options.components ?? []) {
    const component = defineRecipeComponent(definition);
    if (entries.has(component.name))
      throw new Error(`Duplicate recipe component: ${component.name}`);
    entries.set(component.name, component);
  }
  return Object.freeze({
    components: Object.freeze([...entries.values()]),
    get(name: string) {
      const component = entries.get(name);
      if (!component) throw new Error(`Unknown recipe component: ${name}`);
      return component;
    },
  });
}
