import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import { posix } from "node:path";
import { invariant } from "../domain/errors.ts";
import { cacheDefaults } from "./container-cache.constants.ts";
import type {
  DependencyCache,
  ContainerCacheMount,
} from "./container-cache.types.ts";
import type { ContainerOptions, ContainerUser } from "./container.types.ts";

export function validateCaches(config: ContainerOptions): void {
  const names = new Set<string>();
  for (const cache of config.caches ?? []) {
    invariant(
      typeof cache.name === "string" &&
        cacheDefaults.namePattern.test(cache.name),
      "Cache names must start with a lowercase letter and contain at most 48 lowercase letters, digits or hyphens",
    );
    invariant(!names.has(cache.name), `Duplicate cache name: ${cache.name}`);
    invariant(
      typeof cache.key === "string" &&
        cache.key.trim().length > 0 &&
        cache.key.length <= cacheDefaults.maximumKeyLength,
      "Cache keys must be nonempty strings of at most 1024 characters",
    );
    names.add(cache.name);
  }
  if (!names.size) return;
  for (const volume of config.volumes ?? []) {
    const target = posix.resolve(
      "/workspace",
      volume.target.replaceAll("\\", "/"),
    );
    invariant(
      !(
        target === cacheDefaults.root ||
        target.startsWith(cacheDefaults.root + "/") ||
        cacheDefaults.root.startsWith(target.replace(/\/$/, "") + "/")
      ),
      "Explicit volumes must not overlap dependency caches",
    );
  }
}

export async function cacheMounts(
  caches: readonly DependencyCache[],
  repository: string,
  image: string,
  user: ContainerUser,
): Promise<ContainerCacheMount[]> {
  if (!caches.length) return [];
  const canonical = await realpath(repository);
  return caches.map(({ name, key }) => {
    const digest = createHash("sha256")
      .update(
        JSON.stringify([
          cacheDefaults.version,
          canonical,
          image,
          user.uid,
          user.gid,
          name,
          key,
        ]),
      )
      .digest("hex");
    return {
      volume: `outpost-cache-${name}-${digest}`,
      target: `${cacheDefaults.root}/${name}`,
    };
  });
}
