import type { GlobMode } from "./glob.types.ts";

const stars: Readonly<Record<GlobMode, string>> = {
  path: "[^/]*",
  text: "[^]*",
};

const tokens: Readonly<Record<string, (mode: GlobMode) => string>> = {
  "*": (mode) => stars[mode],
  "?": () => "[^/]",
};

export function glob(pattern: string, mode: GlobMode): RegExp {
  let source = "";
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index]!;
    if (character === "*" && pattern[index + 1] === "*") {
      const directory = pattern[index + 2] === "/";
      source += directory ? "(?:[^]*/)?" : "[^]*";
      index += directory ? 2 : 1;
      continue;
    }
    source +=
      tokens[character]?.(mode) ??
      character.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}
