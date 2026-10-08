import { createFallbackAgent } from "../../domain/fallback-agent.ts";
import { defineHarnessInstructions } from "../../domain/instructions.ts";
import { createTransportConversations } from "../conversation-stores.ts";
import { defineJsonResponse } from "../../domain/response.ts";
import { recipeJsonValidator } from "../../infrastructure/recipes/schema.ts";
import type {
  RecipeFallbackOptions,
  RecipeInstructionsOptions,
  RecipeTransportConversationsOptions,
  RecipeJsonResponseOptions,
} from "./agent-components.types.ts";

export function defineRecipeFallback(options: RecipeFallbackOptions) {
  return createFallbackAgent(options.agents, { on: options.on });
}
export function defineRecipeInstructions(options: RecipeInstructionsOptions) {
  return defineHarnessInstructions(options.source);
}
export function createRecipeConversations(
  options: RecipeTransportConversationsOptions,
) {
  const { base, ...settings } = options;
  return createTransportConversations(base, settings);
}
export function defineRecipeJsonResponse(options: RecipeJsonResponseOptions) {
  return defineJsonResponse({
    ...options,
    schema: options.schema ?? recipeJsonValidator(options.jsonSchema),
  });
}
