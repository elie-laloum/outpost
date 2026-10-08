import { open } from "node:fs/promises";
import { recipeLimits } from "../../domain/recipe.constants.ts";

export async function readRecipeFile(file: string): Promise<string> {
  const handle = await open(file, "r");
  try {
    const buffer = Buffer.alloc(recipeLimits.bytes + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > recipeLimits.bytes)
      throw new Error(`${file}: recipe exceeds 1 MiB`);
    return buffer.subarray(0, offset).toString("utf8");
  } finally {
    await handle.close();
  }
}
