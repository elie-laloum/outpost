import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { imageRecipe } from "../src/cli/scaffold.constants.ts";
import { agentVersions } from "../src/providers/versions.constants.ts";

const [directory, base, snapshot] = process.argv.slice(2);
if (
  !directory ||
  !/^node:24-bookworm-slim@sha256:[a-f0-9]{64}$/.test(base ?? "") ||
  !/^\d{8}T\d{6}Z$/.test(snapshot ?? "")
) {
  throw new Error(
    "Usage: node scripts/prepare-agent-image.mjs DIRECTORY node:24-bookworm-slim@sha256:DIGEST YYYYMMDDTHHMMSSZ",
  );
}
const source = fileURLToPath(new URL("../images/agents/", import.meta.url));
const manifest = JSON.parse(
  await readFile(resolve(source, "package.json"), "utf8"),
);
for (const [name, version] of Object.entries({
  "@openai/codex": agentVersions.codex,
  "@anthropic-ai/claude-code": agentVersions.claude,
})) {
  if (manifest.dependencies[name] !== version)
    throw new Error(
      `Agent image lock is stale for ${name}; update images/agents/package.json and its lockfile`,
    );
}
const recipe = imageRecipe
  .replace(/^FROM .*$/m, `FROM ${base}`)
  .replace(
    "RUN apt-get update",
    `RUN rm -f /etc/apt/sources.list /etc/apt/sources.list.d/debian.sources && printf '%s\\n' 'deb [check-valid-until=no] http://snapshot.debian.org/archive/debian/${snapshot}/ bookworm main' 'deb [check-valid-until=no] http://snapshot.debian.org/archive/debian-security/${snapshot}/ bookworm-security main' > /etc/apt/sources.list\nRUN apt-get update`,
  )
  .replace(
    /^RUN npm install .*$/m,
    "COPY package.json package-lock.json /opt/outpost/agents/\nRUN npm ci --prefix /opt/outpost/agents --omit=dev && npm cache clean --force\nENV PATH=/opt/outpost/agents/node_modules/.bin:$PATH",
  );
await mkdir(directory, { recursive: true });
for (const name of ["package.json", "package-lock.json"])
  await writeFile(
    resolve(directory, name),
    await readFile(resolve(source, name)),
  );
await writeFile(resolve(directory, "Dockerfile"), recipe);
await writeFile(
  resolve(directory, ".dockerignore"),
  "*\n!Dockerfile\n!package.json\n!package-lock.json\n",
);
console.log(resolve(directory, "Dockerfile"));
