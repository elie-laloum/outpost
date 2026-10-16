import { OutpostError } from "../domain/errors.ts";

export function validateRemotePaths(paths: Iterable<string>): void {
  for (const file of paths)
    if (file.split("/")[0]!.toLowerCase() === ".outpost")
      throw new OutpostError(
        "workspace",
        "Remote file overlaps Outpost runtime state",
        { file },
      );
}
