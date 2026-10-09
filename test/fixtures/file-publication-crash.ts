import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createWorkspace,
  createLocalTransport,
  publishWorkspaceOutputs,
} from "../../src/index.ts";
import type { Transport } from "../../src/domain/transport.types.ts";

const [root, boundary, timing] = process.argv.slice(2);
if (!root || !boundary) throw new Error("Missing crash fixture arguments");
const runtime = { directory: join(root, "control"), namespace: "crash" };
const workspace = await createWorkspace({
  source: {
    kind: "directory",
    directory: join(root, "source"),
    access: { mode: "copy" },
  },
  runtime,
});
await writeFile(join(workspace.directory, "value.json"), "new");
writeFileSync(
  join(root, "workspace.json"),
  JSON.stringify({ id: workspace.id, runtime }),
);
const local = createLocalTransport({
  directory: join(runtime.directory, "storage"),
});
const transporter: Transport = {
  ...local,
  async write(key, bytes, options) {
    const value = JSON.parse(Buffer.from(bytes).toString("utf8"));
    const selected =
      value.state === boundary || value.operations?.[0]?.phase === boundary;
    if (selected && timing === "before") process.kill(process.pid, "SIGKILL");
    const reference = await local.write(key, bytes, options);
    if (selected && timing !== "before") process.kill(process.pid, "SIGKILL");
    return reference;
  },
};
await publishWorkspaceOutputs(
  workspace,
  {
    paths: ["value.json"],
    destination: join(root, "source"),
    policy: "update",
  },
  transporter,
);
throw new Error("Crash boundary was not reached");
