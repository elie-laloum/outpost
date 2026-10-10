import path from "node:path";

export function isSourceFile(directory, filename, paths = path) {
  const relative = paths.relative(directory, filename);
  return (
    relative !== ".." &&
    !relative.startsWith(`..${paths.sep}`) &&
    !paths.isAbsolute(relative)
  );
}
