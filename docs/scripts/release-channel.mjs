import { appendFile } from "node:fs/promises";

const {
  GITHUB_REF_NAME: tag,
  GITHUB_REPOSITORY: repository,
  GITHUB_OUTPUT: output,
  GH_TOKEN: token,
} = process.env;
if (!tag || !repository || !output || !token)
  throw new Error("Missing release workflow context");
const stable = /^v(\d+)\.(\d+)\.(\d+)$/;
const releases = [];
for (let page = 1; ; page++) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok)
    throw new Error(`Release lookup failed: ${response.status}`);
  const batch = await response.json();
  releases.push(
    ...batch.filter(
      (release) =>
        !release.draft && !release.prerelease && stable.test(release.tag_name),
    ),
  );
  if (batch.length < 100) break;
}
const version = (name) => name.slice(1).split(".").map(Number);
releases.sort((left, right) => {
  const a = version(left.tag_name),
    b = version(right.tag_name);
  return b[0] - a[0] || b[1] - a[1] || b[2] - a[2];
});
const deploy = stable.test(tag) && releases[0]?.tag_name === tag;
await appendFile(output, `deploy=${deploy}\n`);
console.log(
  deploy
    ? `Deploy documentation for ${tag}`
    : `Skip ${tag}; the latest stable release is ${releases[0]?.tag_name ?? "absent"}`,
);
