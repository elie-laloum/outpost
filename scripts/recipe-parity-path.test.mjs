import assert from "node:assert/strict";
import { posix, win32 } from "node:path";
import { test } from "node:test";
import { isSourceFile } from "./recipe-parity-path.mjs";

test("Windows recipe parity includes TypeScript's slash-separated source files", () => {
  assert.equal(
    isSourceFile(
      "D:\\a\\outpost\\src",
      "D:/a/outpost/src/domain/watchdog.types.ts",
      win32,
    ),
    true,
  );
  assert.equal(
    isSourceFile(
      "D:\\a\\outpost\\src",
      "d:/a/outpost/src/domain/watchdog.types.ts",
      win32,
    ),
    true,
  );
});

test("source membership excludes sibling directories, parent traversal and other drives", () => {
  for (const paths of [posix, win32]) {
    const directory = paths.resolve("outpost", "src");
    assert.equal(
      isSourceFile(directory, paths.join(directory, "domain/a.ts"), paths),
      true,
    );
    assert.equal(
      isSourceFile(directory, paths.join(directory, "../src-copy/a.ts"), paths),
      false,
    );
    assert.equal(
      isSourceFile(
        directory,
        paths.join(directory, "../node_modules/a.ts"),
        paths,
      ),
      false,
    );
  }
  assert.equal(isSourceFile("D:\\a\\src", "E:/a/src/a.ts", win32), false);
});
