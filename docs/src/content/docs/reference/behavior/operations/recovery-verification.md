---
title: "Verify recovery data"
description: "Check transfer structure, checksums and Git objects without changing the repository."
sidebar:
  order: 2
---

Start by [inspecting retained data](../../../../guide/operations/recovery/).

## Verify a retained transfer structure

Use the `recovery verify` command, available since 3.0.0, on a specific remote transfer directory, the one containing `state.json` (normally `.outpost/recovery/<session>/<transfer>`):

```sh
node src/cli/main.ts recovery verify --directory /path/to/retained/transfer
node src/cli/main.ts recovery verify --directory /path/to/retained/transfer --json
```

The directory may have been relocated and need not belong to a Git checkout. This command checks the current transfer format produced by `backupHost`, not the parent session directory, conversation stores or orphaned workspaces. A transfer interrupted before the host backup stage can legitimately lack `state.json`; a failed check indicates incomplete or unverifiable structure, not proof of corruption.

By default the command reads only `state.json`, limited to 64 KiB. It requires `previous` and `next` commit identifiers in the same 40- or 64-character hexadecimal format, plus `previousExtras` and `incoming` arrays of at most 1,000 unique relative paths each. Empty paths/components, dot components, parent traversal, Git metadata paths and POSIX/Windows rooted paths are refused before inspecting references. Unknown additional fields are ignored and never displayed.

It then checks filesystem metadata for the three required regular files `remote.patch`, `previous.patch` and `previous-index.patch`, and for `commits.bundle` when `previous` differs from `next`. Empty patches are valid. Every referenced payload must exist under `previous-files` or `incoming` as a regular file or a leaf symlink. Leaf symlinks are reported as `SYMLINK_PRESENT` without reading their targets; parent symlinks and symlinked state/patch/bundle files are refused. Unreferenced files are outside the check.

Exit status `0` means the expected structure is present. Exit status `1` means a failed check or invalid invocation. JSON contains `directory`, `scope: "transfer-structure"`, `complete`, `integrity: "unverified"` and `checks` (`path`, `status`, `code`). Raw metadata contents, patches, payloads and bundles are not displayed. No Git command runs and no file is changed by verification.

This is an observation, not an atomic snapshot or proof that restoration will work. Patch/bundle contents, hashes, permissions, commit availability, cross-file consistency and resource activity remain unverified. Even a malformed bundle can pass this structural check when its file exists. Recorded checksum comparison is available separately below; isolated Git restorability checks are available below. Full application restoration remains outside their scope.

Try a temporary demonstration from the source checkout:

```sh
node test/fixtures/recovery-verification.ts
```

It constructs a synthetic transfer with all expected files, verifies exit status `0`, removes one referenced payload, then verifies exit status `1` with `FILE_UNAVAILABLE`. The demonstration removes only its temporary directory and exits successfully when both expected results are observed.

## Check recorded transfer checksums

Remote transfers since 3.0.0 record `checksums.json` after host backup and before host apply. It contains a versioned, unsigned SHA-256 manifest covering `state.json`, the three transfer patches, the required commit bundle and the referenced files under `previous-files` and `incoming`. File bytes are hashed in chunks; symlinks record a hash of their link text, never their target contents. The manifest also records entry kind and byte count. Parent session files such as `initial.bundle` and unrelated artifacts are outside this manifest.

Capture adds one read of each covered file during backup and atomically publishes the completed manifest. If capture fails, synchronization stops before host apply and retains its recovery files. Verification never creates or repairs a manifest for an existing backup.

Request checksum verification explicitly:

```sh
node src/cli/main.ts recovery verify --directory /path/to/retained/transfer --checksums
node src/cli/main.ts recovery verify --directory /path/to/retained/transfer --checksums --max-bytes 268435456 --json
```

Checksum verification starts only after structural checks pass. The manifest must cover exactly the expected paths without duplicates; unexpected paths are rejected before hashing. The manifest read is limited to 1 MiB. File and symlink hashes use a default aggregate budget of 1 GiB; `--max-bytes` changes it and requires `--checksums`. The separately bounded state and manifest metadata reads are outside this budget. The budget is checked against observed sizes, not trusted manifest sizes. Changed files, unsupported entries and exhausted budgets stop verification with an explicit failure. File hashing uses fixed-size buffers rather than loading whole backups into memory.

JSON `integrity` is `checksums-match` when all required entries match, `checksums-mismatch` when hashing completes with a divergence, and `unverified` when checks were not requested or could not finish. An optional `checksums` object includes its checks, integrity result, `bytesChecked` and `maxBytes`. `bytesChecked` counts successfully hashed bytes. Any mismatch, missing/unreadable/invalid manifest, unavailable source or exceeded limit makes the requested check fail with exit status `1`. Older backups without a manifest still support the default structural check; requesting checksums reports `CHECKSUMS_UNAVAILABLE`, never an assumed match.

A matching unsigned manifest detects divergence from the recorded bytes; it does not authenticate the backup or protect against someone rewriting both data and manifest. It also does not prove valid Git objects, applicable patches, correct permissions, consistent capture, inactivity or successful restoration. Checksums of symlinks say nothing about target contents. No content or digest values are printed in the verification report.

Try a same-size edit in a temporary transfer:

```sh
node test/fixtures/recovery-checksums.ts
```

Expect `checksums-match` and exit status `0`, then `CHECKSUM_MISMATCH`, `checksums-mismatch` and exit status `1` after the demonstration changes a payload without changing its size. The demonstration cleans up its own temporary directory.

## Verify Git restorability in isolation

Add explicit repository context to check objects and patch applicability:

```sh
outpost recovery verify --directory /path/to/transfer --restorability --repository /path/to/repository
outpost recovery verify --directory /path/to/transfer --restorability --repository /path/to/repository --checksums --json
```

This mode snapshots the three patches and required bundle, detects changes during copying, and creates a temporary clone with independent objects. It verifies and imports `commits.bundle`, checks the recorded commits with `git cat-file` and `git fsck --strict`, then checks and applies each patch independently against its recorded commit. `previous-index.patch` is applied to the temporary index. The selected repository's HEAD, index, reflog, dirty files and registrations are unchanged; temporary resources are removed afterward, including on failure. The source object database must supply any bundle prerequisites and recorded commits not supplied by the bundle. Partial/promisor, shallow and alternate-object repositories are refused with `SOURCE_UNSUPPORTED`. Verification clears inherited Git environment overrides, disables global/system Git configuration, hooks, fsmonitor and automatic maintenance, and copies local objects without hard links or network fetching. Host-configured smudge filters are not executed.

JSON reports `scope: "transfer-restorability"`, successful `BUNDLE_OBJECTS_VALID`, `COMMIT_OBJECTS_VALID` and `PATCH_APPLIES` checks, or a stage-specific failure. The check does not reconstruct payloads, original staged/unstaged consistency, parent-session patches, submodule repositories, external dependencies or provider state. It does not certify a complete application restore. Structure-only verification remains the default; checksum verification remains a separate unsigned integrity comparison. Git commands have deadlines, but clone/checkout temporary disk usage is not covered by the checksum byte budget. Use trusted repositories and sufficient temporary storage.

Run the self-contained demonstration from a source checkout:

```sh
node test/fixtures/recovery-storage.ts
```

It creates its own temporary repository, verifies an actual patch, demonstrates retention dry run and explicit deletion, and confirms a protected recovery artifact prevents satisfying a zero-byte quota. It removes only its temporary resources.
