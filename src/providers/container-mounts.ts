import { stat } from "node:fs/promises";
import { isAbsolute, posix, relative } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import type { SandboxContext, Volume } from "../domain/sandbox.types.ts";
import { expandPath } from "../infrastructure/files.ts";
import { inside } from "../infrastructure/files.ts";
import { canonicalWorkspacePath } from "../infrastructure/workspace-lock.ts";
import { validateIsolatedMount } from "./container-isolation.ts";
import type { ContainerMounts, ContainerOptions } from "./container.types.ts";

export async function containerMounts(
  context: SandboxContext,
  config: ContainerOptions,
  platform: NodeJS.Platform,
  root: string,
  home: string,
): Promise<ContainerMounts> {
  const env: Record<string, string> = {
    ...context.variables,
    HOME: home,
    ...(context.workspaceIdentity === undefined
      ? {
          GIT_CONFIG_COUNT: "1",
          GIT_CONFIG_KEY_0: "safe.directory",
          GIT_CONFIG_VALUE_0: "*",
        }
      : {}),
  };
  const internal: Volume[] =
    config.repositoryMode === "isolated"
      ? []
      : [{ source: context.directory, target: root }];
  if (config.repositoryMode !== "isolated" && context.gitDirectories.length) {
    const common = context.gitDirectories.at(-1)!;
    const offset = relative(common, context.gitDirectories[0]!);
    const nested =
      !isAbsolute(offset) &&
      offset !== ".." &&
      !offset.startsWith("..\\") &&
      !offset.startsWith("../");
    internal.push({
      source: common,
      target: "/outpost/git/common",
    });
    if (!nested)
      internal.push({
        source: context.gitDirectories[0]!,
        target: "/outpost/git/worktree",
      });
    env.GIT_DIR = nested
      ? posix.join("/outpost/git/common", offset.replaceAll("\\", "/"))
      : "/outpost/git/worktree";
    env.GIT_COMMON_DIR = "/outpost/git/common";
    env.GIT_WORK_TREE = root;
  }
  const volumes: string[] = [];
  const fileParents = new Set<string>();
  for (const volume of [...internal, ...(config.volumes ?? [])]) {
    const source = expandPath(volume.source, context.repository);
    const info = await stat(source).catch(() => undefined);
    if (!info)
      throw new OutpostError(
        "provider",
        `Mount source is unavailable: ${source}`,
      );
    const destination = volume.target.replaceAll("\\", "/");
    const target =
      destination === "~"
        ? home
        : destination.startsWith("~/")
          ? posix.resolve(home, destination.slice(2))
          : posix.resolve(root, destination);
    if (context.workspaceIdentity !== undefined && !internal.includes(volume)) {
      const canonicalSource = await canonicalWorkspacePath(source);
      const control = await canonicalWorkspacePath(context.repository);
      invariant(
        !inside(canonicalSource, control) && !inside(control, canonicalSource),
        "File workspace mounts cannot expose runtime control storage",
      );
      invariant(
        target !== root && !root.startsWith(`${target}/`),
        "Custom mounts cannot replace the owned workspace root",
      );
    }
    if (config.repositoryMode === "isolated")
      await validateIsolatedMount(context, source, target);
    if (info.isFile() && !internal.includes(volume)) {
      const parent = posix.dirname(target);
      invariant(
        parent === home || parent.startsWith(home + "/"),
        "File mounts must live inside the agent home; mount the containing directory for other destinations",
      );
      for (let folder = parent; folder !== home; folder = posix.dirname(folder))
        fileParents.add(folder);
    }
    invariant(
      !source.includes(",") && !target.includes(","),
      "Mount paths cannot contain commas",
    );
    if (config.label === false || platform !== "linux")
      volumes.push(
        "--mount",
        `type=bind,source=${source},target=${target}${volume.readOnly ? ",readonly" : ""}`,
      );
    else
      volumes.push(
        "--volume",
        `${source}:${target}:${volume.readOnly ? "ro," : ""}${config.label ?? "z"}`,
      );
  }

  return { env, volumes, fileParents };
}
