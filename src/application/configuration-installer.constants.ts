export const configurationInstaller = `
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const input = JSON.parse(fs.readFileSync(0, "utf8"));
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
for (const file of input.files) {
  const parts = String(file.path).split(/[\\\\/]/);
  if (!path.isAbsolute(input.home) || path.isAbsolute(file.path) || parts.some((part) => part === "" || part === "." || part === ".."))
    throw new Error("Unsafe configuration path: " + file.path);
  let target = path.join(input.home, ...parts);
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  let current = {};
  let mode = 0o600;
  try {
    target = fs.realpathSync(target);
    mode = fs.statSync(target).mode & 0o777;
    const text = fs.readFileSync(target, "utf8");
    current = text.trim() ? JSON.parse(text) : {};
  } catch (error) {
    if (error.code !== "ENOENT") throw new Error("Cannot merge " + file.path + ": " + error.message);
  }
  if (!isObject(current) || (current[file.section] !== undefined && !isObject(current[file.section])))
    throw new Error("Cannot merge " + file.path + ": expected a JSON object with an object " + file.section);
  current[file.section] = { ...current[file.section], ...file.entries };
  const temporary = path.join(path.dirname(target), ".outpost-" + randomUUID());
  try {
    fs.writeFileSync(temporary, JSON.stringify(current, null, 2) + "\\n", { mode, flag: "wx" });
    fs.chmodSync(temporary, mode);
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}
`;
