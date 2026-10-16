import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

if (process.env.GITHUB_ACTIONS === "true") {
  assert.match(
    process.env.GITHUB_SHA ?? "",
    /^[a-f0-9]{40,64}$/,
    "Release commit must be explicit",
  );
  execFileSync(
    "git",
    [
      "merge-base",
      "--is-ancestor",
      process.env.GITHUB_SHA,
      "refs/remotes/origin/main",
    ],
    { stdio: "pipe", timeout: 10000 },
  );
}

const { version, name } = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(name, "@elie-laloum/outpost");
assert.match(version, /^\d+\.\d+\.\d+$/);
assert.equal(
  process.env.GITHUB_REF_NAME,
  `v${version}`,
  "Release tag must match the package version",
);

function releaseNotes(file) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const headings = [...text.matchAll(/^## (.+)$/gm)];
  const sections = new Map();
  for (const [index, heading] of headings.entries()) {
    const title = heading[1].trim();
    assert.ok(!sections.has(title), `Duplicate ${title} section in ${file}`);
    sections.set(
      title,
      text
        .slice(heading.index + heading[0].length, headings[index + 1]?.index)
        .trim(),
    );
  }
  assert.ok(
    sections.has("Unreleased"),
    `Missing Unreleased section in ${file}`,
  );
  assert.equal(
    sections.get("Unreleased"),
    "",
    `Unreleased changes remain in ${file}`,
  );
  assert.ok(sections.has(version), `Missing ${version} section in ${file}`);
  const notes = sections.get(version);
  assert.ok(notes, `Release ${version} is empty in ${file}`);
  return notes;
}

const notes = releaseNotes("CHANGELOG.md");
releaseNotes("docs/translations/changelog.fr.md");
console.error(`Validated release ${version}`);
process.stdout.write(`${notes}\n`);
