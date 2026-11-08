import {
  configurationError,
  configurationInvariant,
} from "../domain/configuration-diagnostic.ts";
import { isContainerImage } from "../domain/container-image.ts";
import {
  containerImageMounts,
  imageMountFormats,
} from "./container-image-mounts.constants.ts";
import type {
  ContainerImageMountPlan,
  ContainerImageMountTargetRule,
} from "./container-image-mounts.types.ts";
import { overlapsIsolatedControl } from "./container-isolation.ts";
import { containerRoot, mountTarget } from "./container-mounts.ts";
import { containerDefaults } from "./container.constants.ts";
import type {
  ContainerImageMount,
  ContainerOptions,
} from "./container.types.ts";

const { code, fields, forbidden, reserved, temporary, hint } =
  containerImageMounts;

/** True when `ancestor` is `path` itself or one of its parent directories. */
const covers = (ancestor: string, path: string): boolean =>
  ancestor === path || ancestor === "/" || path.startsWith(`${ancestor}/`);

const targetRules: readonly ContainerImageMountTargetRule[] = [
  ({ target, root, home }) => {
    const hidden = [root, home, temporary].find((path) => covers(target, path));
    return hidden && `Image mount target ${target} would hide ${hidden}`;
  },
  // The engine would create the mountpoint in the host checkout or workspace.
  ({ target, root }) =>
    covers(root, target)
      ? `Image mount target ${target} is inside the workspace root ${root}`
      : undefined,
  ({ target }) =>
    covers(target, reserved) || covers(reserved, target)
      ? `Image mount target ${target} overlaps ${reserved}, reserved for Git metadata and dependency caches`
      : undefined,
  ({ target, isolated }) =>
    isolated && overlapsIsolatedControl(target)
      ? `Isolated image mount target ${target} must not overlap /tmp or /outpost`
      : undefined,
];

function validateFields(mount: unknown, index: number): ContainerImageMount {
  const location = ["imageMounts", index];
  configurationInvariant(
    typeof mount === "object" && mount !== null && !Array.isArray(mount),
    "Each image mount must be an object with image and target",
    location,
    code,
  );
  for (const key of Object.keys(mount))
    configurationInvariant(
      fields.includes(key),
      `Unknown image mount field ${key}`,
      [...location, key],
      code,
      "Declare only image, path and target; image mounts are always read-only.",
    );
  const image: unknown = "image" in mount ? mount.image : undefined;
  const path: unknown = "path" in mount ? mount.path : undefined;
  const target: unknown = "target" in mount ? mount.target : undefined;
  configurationInvariant(
    isContainerImage(image) && !forbidden.test(image),
    "Image mount image must be a non-empty reference without a leading -, whitespace, commas or quotes",
    [...location, "image"],
    code,
  );
  configurationInvariant(
    path === undefined ||
      (typeof path === "string" && containerImageMounts.path.test(path)),
    "Image mount path must be a normalized absolute POSIX path without commas or quotes",
    [...location, "path"],
    code,
    "Write the folder from the image root, such as /usr/local/bin, without . or .. segments",
  );
  configurationInvariant(
    typeof target === "string" && target.length > 0 && !forbidden.test(target),
    "Image mount target must be a non-empty path without commas or quotes",
    [...location, "target"],
    code,
  );
  return Object.freeze({
    image,
    ...(path === undefined ? {} : { path }),
    target,
  });
}

/** Returns frozen, engine-safe copies whose targets avoid the paths Outpost mounts or uses. */
export function validateContainerImageMounts(
  mounts: unknown,
  config: ContainerOptions,
): readonly ContainerImageMount[] {
  configurationInvariant(
    Array.isArray(mounts),
    "imageMounts must be an array",
    ["imageMounts"],
    code,
  );
  const root = containerRoot(config);
  const home = containerDefaults.home;
  const isolated = config.repositoryMode === "isolated";
  return Object.freeze(
    mounts.map((mount: unknown, index) => {
      const copy = validateFields(mount, index);
      const location = ["imageMounts", index, "target"];
      const target = mountTarget(copy.target, root, home);
      for (const rule of targetRules) {
        const conflict = rule({ target, root, home, isolated });
        if (conflict) throw configurationError(conflict, location, code, hint);
      }
      return copy;
    }),
  );
}

/** Builds --mount arguments for validated image mounts without reading the caller's disk. */
export function imageMountArguments({
  engine,
  mounts,
  root,
  home,
}: ContainerImageMountPlan): string[] {
  return mounts.flatMap(({ image, path, target }) => {
    const subpath = path === undefined || path === "/" ? {} : { subpath: path };
    return [
      "--mount",
      imageMountFormats[engine]({
        image,
        target: mountTarget(target, root, home),
        ...subpath,
      }),
    ];
  });
}
