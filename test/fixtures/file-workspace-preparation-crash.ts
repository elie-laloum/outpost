import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileWorkspace } from "../../src/application/file-workspace.ts";

const [root, boundary] = process.argv.slice(2);
if (!root || !boundary)
  throw new Error("Missing preparation fixture arguments");
let registrations = 0;
await createFileWorkspace(
  {
    source: {
      kind: "directory",
      directory: join(root, "source"),
      access: { mode: "copy" },
    },
    runtime: { directory: join(root, "control"), namespace: "preparation" },
    hooks: {
      workspaceReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "require('node:fs').writeFileSync('partial.txt', 'retained'); process.kill(process.ppid, 'SIGKILL');",
          ],
        },
      ],
    },
  },
  async (record) => {
    await writeFile(join(root, "resource.json"), JSON.stringify(record));
    registrations++;
    if (
      (boundary === "registered" && registrations === 1) ||
      (boundary === "captured" && registrations === 2)
    )
      process.kill(process.pid, "SIGKILL");
  },
);
throw new Error("Preparation crash boundary was not reached");
