---
title: "SessionBundleProfile"
description: "SessionBundleProfile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleProfile } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                         | Presence | Meaning                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`    | `string`                                                                                     | Required | Persisted format name, used in bundles, transport keys and .outpost/conversations/&lt;format> host paths.                                                                                           |
| `root`      | `{ readonly variable?: string; readonly directory: string; }`                                | Required | CLI home inside the sandbox: the value of the variable environment variable when set, otherwise directory under the agent home.                                                                     |
| `sessions`  | `string`                                                                                     | Required | Directory under the CLI home that contains the session directories.                                                                                                                                 |
| `buckets`   | `boolean \| undefined`                                                                       | Optional | Whether sessions live in &lt;sessions>/&lt;bucket>/&lt;id>. Capture requires exactly one match across buckets, and restoration refuses an id already present under another bucket.                  |
| `include`   | `RegExp`                                                                                     | Required | Bundle-relative paths to capture; a directory is tested by its own path before its files. The g and y flags are rejected.                                                                           |
| `exclude`   | `RegExp \| undefined`                                                                        | Optional | Bundle-relative paths skipped even when include matches them, such as logs or lock files.                                                                                                           |
| `required`  | `readonly string[]`                                                                          | Required | Files that must be present, at least one; a session missing one is refused as incomplete.                                                                                                           |
| `relocated` | `readonly string[] \| undefined`                                                             | Optional | Files passed as text to relocate during restoration; other files are restored byte for byte.                                                                                                        |
| `validate`  | `((files: SessionBundleFiles, id: string) => string \| undefined) \| undefined`              | Optional | Self-contained function that returns an error message when the bundled session uses unsupported metadata. It runs in the sandbox during capture and on the host when an existing bundle is located. |
| `bucket`    | `((cwd: string, helpers: SessionBundleHelpers) => string) \| undefined`                      | Optional | Self-contained function that names the bucket restoration uses for the destination workspace; required when buckets is true.                                                                        |
| `relocate`  | `((path: string, text: string, relocation: SessionBundleRelocation) => string) \| undefined` | Optional | Self-contained function that rewrites one relocated file for the destination workspace and returns its new text; throwing aborts the restoration without replacing the existing session.            |

## Signature

```ts
export interface SessionBundleProfile {
  /** Persisted format name, used in bundles, transport keys and host paths. */
  readonly format: string;
  /** CLI home: `$variable` when set, otherwise `directory` under the agent home. */
  readonly root: {
    readonly variable?: string;
    readonly directory: string;
  };
  /** Directory under the CLI home that holds sessions. */
  readonly sessions: string;
  /** Sessions are grouped in `<sessions>/<bucket>/<id>` instead of `<sessions>/<id>`. */
  readonly buckets?: boolean;
  /** Bundle-relative paths to capture; a directory is tested by its own path. */
  readonly include: RegExp;
  readonly exclude?: RegExp;
  /** Files whose absence makes the session unusable. */
  readonly required: readonly string[];
  /** Files passed to `relocate` as text during restoration. */
  readonly relocated?: readonly string[];
  /** Returns an error message when the bundled session is unsupported. */
  readonly validate?: (
    files: SessionBundleFiles,
    id: string,
  ) => string | undefined;
  /** Bucket that restoration uses for a workspace; required with `buckets`. */
  readonly bucket?: (cwd: string, helpers: SessionBundleHelpers) => string;
  /** Rewrites one relocated file for the restored workspace. */
  readonly relocate?: (
    path: string,
    text: string,
    relocation: SessionBundleRelocation,
  ) => string;
}
```

## Related contracts

- [SessionBundleFiles](../sessionbundlefiles/)
- [SessionBundleHelpers](../sessionbundlehelpers/)
- [SessionBundleRelocation](../sessionbundlerelocation/)
