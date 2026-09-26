export const credentialInstaller = `
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const input = JSON.parse(fs.readFileSync(0, "utf8"));
for (const file of input.files) {
  const parts = String(file.path).split(/[\\\\/]/);
  if (!path.isAbsolute(input.home) || path.isAbsolute(file.path) || parts.some((part) => part === "" || part === "." || part === ".."))
    throw new Error("Unsafe credential path: " + file.path);
  const target = path.join(input.home, ...parts);
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = path.join(path.dirname(target), ".outpost-" + randomUUID());
  try {
    fs.writeFileSync(temporary, file.content, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}
`;
