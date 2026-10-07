import assert from "node:assert/strict";
import { test } from "node:test";
import {
  enforceDiffGuard,
  validateDiffGuard,
} from "../../src/domain/diff-guard.ts";
import type { DiffGuard } from "../../src/domain/diff-guard.types.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import {
  collectDiffStatistics,
  parseDiffStatistics,
} from "../../src/infrastructure/git/diff-statistics.ts";
import { gitDefaults } from "../../src/infrastructure/git/git.constants.ts";

const named = { mode: "named", name: "review" } as const;
const guardFault = (error: unknown) =>
  error instanceof OutpostError && error.code === "guard";

test("diff guards validate paths, limits and branch policies before execution", () => {
  validateDiffGuard(undefined, { mode: "current" });
  validateDiffGuard({}, named);
  for (const value of [null, 7, false, []])
    assert.throws(() => validateDiffGuard(value as DiffGuard, named), /object/);
  validateDiffGuard(
    {
      protectedPaths: [".github/**", "src/**/*.ts", "file?.txt"],
      maxChangedLines: 0,
    },
    named,
  );
  for (const maxChangedLines of [
    -1,
    0.5,
    Infinity,
    NaN,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    assert.throws(
      () => validateDiffGuard({ maxChangedLines }, named),
      (error) =>
        error instanceof OutpostError && error.code === "configuration",
    );
  for (const pattern of [
    "",
    "/root",
    "../file",
    "src/../file",
    "./file",
    "C:/file",
    "src\\file",
    "a\0b",
  ])
    assert.throws(
      () => validateDiffGuard({ protectedPaths: [pattern] }, named),
      /repository-relative/,
    );
  assert.throws(
    () => validateDiffGuard({}, { mode: "current" }),
    /named or integration/,
  );
  assert.throws(
    () =>
      validateDiffGuard(
        JSON.parse('{"protectedPaths": 7}') as DiffGuard,
        named,
      ),
    /array/,
  );
  assert.throws(
    () =>
      validateDiffGuard(
        JSON.parse('{"protectedPaths": [null]}') as DiffGuard,
        named,
      ),
    /repository-relative/,
  );
});

test("diff guard reports all violated rules and both rename paths", () => {
  const changes = [
    {
      paths: [".github/build.yml", "src/build.yml"],
      added: 3,
      removed: 2,
      binary: false,
    },
    { paths: ["image.png"], added: 0, removed: 0, binary: true },
  ];
  assert.throws(
    () =>
      enforceDiffGuard(
        { protectedPaths: [".github/**", "src/*.yml"], maxChangedLines: 4 },
        changes,
      ),
    (error) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.code, "guard");
      assert.deepEqual(error.details, {
        reasons: ["protected-paths", "binary-files", "changed-lines"],
        matches: [
          { path: ".github/build.yml", pattern: ".github/**" },
          { path: "src/build.yml", pattern: "src/*.yml" },
        ],
        changedLines: 5,
        binaryPaths: ["image.png"],
        maxChangedLines: 4,
      });
      return true;
    },
  );
  enforceDiffGuard({ protectedPaths: ["*.yml", "SRC/**"] }, changes);
  enforceDiffGuard({ maxChangedLines: 5 }, changes.slice(0, 1));
  enforceDiffGuard({ maxChangedLines: 0 }, []);
  enforceDiffGuard({}, changes);
  assert.throws(
    () => enforceDiffGuard({ maxChangedLines: 0 }, changes),
    guardFault,
  );
  assert.throws(
    () => enforceDiffGuard({ protectedPaths: ["**/build.?ml"] }, changes),
    guardFault,
  );
  assert.throws(
    () =>
      enforceDiffGuard({ maxChangedLines: Number.MAX_SAFE_INTEGER }, [
        {
          paths: ["huge"],
          added: Number.MAX_SAFE_INTEGER,
          removed: 1,
          binary: false,
        },
      ]),
    guardFault,
  );
});

test("NUL statistics preserve unusual paths, rename pairs and binary records", () => {
  assert.deepEqual(parseDiffStatistics(""), []);
  assert.deepEqual(parseDiffStatistics("2\t1\ta\tb\nc.txt\0"), [
    { paths: ["a\tb\nc.txt"], added: 2, removed: 1, binary: false },
  ]);
  assert.deepEqual(
    parseDiffStatistics("0\t0\t\0old file\0new file\0-\t-\timage.png\0"),
    [
      { paths: ["old file", "new file"], added: 0, removed: 0, binary: false },
      { paths: ["image.png"], added: 0, removed: 0, binary: true },
    ],
  );
  for (const output of [
    "1\t0\tfile",
    "bad\0",
    "-\t1\tfile\0",
    "1\t-\tfile\0",
    "1\t0\t\0old\0",
    "0\t0\t\0\0new\0",
    "999999999999999999\t0\tfile\0",
  ])
    assert.throws(() => parseDiffStatistics(output), guardFault);
});

test("diff inspection refuses output limits and command failures", async () => {
  const inspect = (output: string) =>
    collectDiffStatistics("/repo", "base", "head", 1000, async (command) => {
      assert.ok(command.arguments?.includes("--no-ext-diff"));
      assert.ok(command.arguments?.includes("--no-textconv"));
      assert.ok(command.arguments?.includes("--find-renames=50%"));
      command.observe?.("stderr", "warning");
      command.observe?.("stdout", output);
      return { status: 0, stdout: output, stderr: "" };
    });
  assert.equal((await inspect("1\t0\tfile\0"))[0]?.added, 1);
  await assert.rejects(
    inspect("x".repeat(gitDefaults.retainBytes + 1)),
    guardFault,
  );
  await assert.rejects(
    inspect("x".repeat(gitDefaults.retainBytes)),
    guardFault,
  );
  await assert.rejects(inspect("1\t0\tfile"), guardFault);
  await assert.rejects(
    collectDiffStatistics("/repo", "base", "head", 1000, async () => ({
      status: 7,
      stdout: "",
      stderr: "failed",
    })),
    /status 7/,
  );
});
