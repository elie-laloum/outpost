import type { ContainerImageMountFormat } from "./container-image-mounts.types.ts";
import type { ContainerEngine } from "./container.types.ts";

export const containerImageMounts = Object.freeze({
  code: "invalid-container-image-mount",
  fields: ["image", "path", "target"] as readonly string[],
  // Both engines parse --mount as CSV: commas split fields, quotes open quoted fields.
  forbidden: /[,"\x00-\x1f\x7f]/,
  // Absolute POSIX path without empty, . or .. segments, trailing slash or CSV characters.
  path: /^(?:\/|(?:\/(?!\.\.?(?:\/|$))[^/,"\x00-\x1f\x7f]+)+)$/,
  reserved: "/outpost",
  temporary: "/tmp",
  hint: "Use an absolute target outside the workspace, such as /opt/tools, or ~/tools.",
});

export const imageMountFormats: Readonly<
  Record<ContainerEngine, ContainerImageMountFormat>
> = Object.freeze({
  // Docker requires a relative image-subpath; readonly states the forced default.
  docker: ({ image, subpath, target }) =>
    `type=image,source=${image},target=${target},readonly${subpath === undefined ? "" : `,image-subpath=${subpath.slice(1)}`}`,
  // Podman rejects ro/readonly on image mounts and requires an absolute subpath.
  podman: ({ image, subpath, target }) =>
    `type=image,source=${image},destination=${target},rw=false${subpath === undefined ? "" : `,subpath=${subpath}`}`,
});
