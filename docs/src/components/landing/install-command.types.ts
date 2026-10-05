import type { CollectionEntry } from "astro:content";

export interface InstallCommandProps {
  install: NonNullable<CollectionEntry<"docs">["data"]["landing"]>["install"];
}
