import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function files(root: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await readdir(root, { withFileTypes: true }).catch(
    (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    },
  );
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await files(path)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".jsonl")) result.push(path);
  }
  return result;
}
