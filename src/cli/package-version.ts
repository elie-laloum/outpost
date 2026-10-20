import { readFileSync } from "node:fs";

/** Version of the installed Outpost package, read from its manifest. */
export function packageVersion(): string {
  const manifest: unknown = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  );
  if (
    manifest &&
    typeof manifest === "object" &&
    "version" in manifest &&
    typeof manifest.version === "string"
  )
    return manifest.version;
  throw new Error("Outpost package manifest has no version");
}
