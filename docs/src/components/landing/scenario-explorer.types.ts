import type { CollectionEntry } from "astro:content";

export interface ScenarioExplorerProps {
  scenarios: NonNullable<
    CollectionEntry<"docs">["data"]["landing"]
  >["scenarios"];
}
