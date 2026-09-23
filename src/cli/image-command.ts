import { manageImage } from "./image.ts";
import type { CliInvocation } from "./main.types.ts";

export async function imageCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  if (!["build", "remove"].includes(positionals[1] ?? ""))
    throw new Error("Unknown command. Run outpost --help.");
  const options = Object.fromEntries(
    Object.entries(values).filter(([key]) =>
      ["directory", "engine", "file", "image"].includes(key),
    ),
  );
  const image = await manageImage(positionals[1] as "build" | "remove", {
    ...options,
    ...(values.uid ? { uid: Number(values.uid) } : {}),
    ...(values.gid ? { gid: Number(values.gid) } : {}),
  });
  process.stdout.write(`${positionals[1]}: ${image}\n`);
}
