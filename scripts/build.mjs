import { execFileSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const editorOutput = new URL("../editor/dist", import.meta.url);
rmSync(new URL("../dist", import.meta.url), { recursive: true, force: true });
execFileSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"],
  {
    cwd: root,
    stdio: "inherit",
  },
);
// The editor shell is prerendered by Start's server build; only the client files ship.
rmSync(editorOutput, { recursive: true, force: true });
execFileSync(
  process.execPath,
  ["../node_modules/vite/bin/vite.js", "build", "--logLevel", "warn"],
  // Start's prerender step resolves its server bundle from the working directory.
  {
    cwd: fileURLToPath(new URL("../editor/", import.meta.url)),
    stdio: "inherit",
  },
);
cpSync(
  new URL("client", `${editorOutput}/`),
  new URL("../dist/editor", import.meta.url),
  {
    recursive: true,
  },
);
rmSync(editorOutput, { recursive: true, force: true });
