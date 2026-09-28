import type { TaskCacheMode } from "./task-cache.types.ts";

export const taskCacheFormat = 1;
export const taskCacheModes: readonly TaskCacheMode[] = ["reuse", "refresh"];
