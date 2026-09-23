import { resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { imageName } from "../providers/container.ts";
import { imageDefaults, imageFiles } from "./image.constants.ts";
import type { ImageOptions } from "./image.types.ts";

export async function manageImage(
  action: "build" | "remove",
  options: ImageOptions = {},
  executor?: Executor,
): Promise<string> {
  const root = resolve(options.directory ?? process.cwd()),
    engine = options.engine ?? "docker",
    image = options.image ?? imageName(root);
  invariant(
    engine === "docker" || engine === "podman",
    "Image engine must be docker or podman",
  );
  const uid = options.uid ?? process.getuid?.() ?? imageDefaults.uid,
    gid = options.gid ?? process.getgid?.() ?? imageDefaults.gid;
  invariant(
    Number.isSafeInteger(uid) &&
      uid >= 0 &&
      Number.isSafeInteger(gid) &&
      gid >= 0,
    "UID and GID must be nonnegative integers",
  );
  const args =
    action === "remove"
      ? ["image", "rm", image]
      : [
          "build",
          "--tag",
          image,
          "--file",
          resolve(root, options.file ?? `.outpost/${imageFiles[engine]}`),
          "--build-arg",
          `AGENT_UID=${uid}`,
          "--build-arg",
          `AGENT_GID=${gid}`,
          root,
        ];
  await requireSuccess(
    {
      executable: engine,
      arguments: args,
      directory: root,
      deadlineMs: imageDefaults.buildMs,
      observe(channel, text) {
        (channel === "stdout" ? process.stdout : process.stderr).write(text);
      },
    },
    executor,
  );
  return image;
}
