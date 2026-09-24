---
title: Remote file transfers
description: Incremental file manifests, compressed batches and synchronization recovery.
sidebar:
  order: 5
---

Vercel and Daytona synchronize untracked workspace files with SHA-256 manifests and compressed batches. This is automatic for their built-in providers. Custom providers can opt in through `SandboxLease.fileTransfers`; leases without this optional capability keep individual file downloads.

## What is transferred

The first synchronization downloads every untracked file selected by Git. Each successful synchronization remembers its manifest for the lifetime of that sandbox. Later synchronizations compare path, file kind, permission bits, byte length and SHA-256. An unchanged entry reuses the host file only after hashing its current bytes and checking all metadata against the previous successful manifest. Changed files are downloaded; entries absent from the next manifest are removed through the existing synchronization transaction. There is no persistent payload cache to invalidate or prune.

Git's `ls-files --others --exclude-standard` selects the files, including nested files and symbolic links. Empty directories and ignored files are not synchronization inputs. The optimization does not change these Git selection rules. Explicit `copies` still upload their requested inputs independently. Incoming untracked paths that overlap ignored or protected host files cause a conflict; they are not silently skipped or overwritten.

Tracked changes still use binary Git patches, and new commits still use self-contained Git bundles. Initial repository seeding, requested copies and initial uncommitted uploads use their existing transfer paths. These operations are not incremental compressed file batches. An unchanged pull still downloads its Git patch and performs Git validation and host backups.

## Compression and limits

Changed untracked files are grouped into gzip-compressed batches of at most **8 MiB of file data** and **128 entries**. Long path metadata may produce smaller batches to keep command arguments bounded. The binary payload is base64-encoded inside the compressed envelope, separately from manifest metadata. There is no binary conversion through command stdout. Files larger than 8 MiB use the provider's ordinary download path and are checked against their manifest after downloading.

Permission bits and literal symbolic-link targets are preserved where the host supports them. Symbolic links are never followed when hashing or copying payloads. Replacing a file, directory or symlink is supported; only empty obsolete directories are removed. Nonempty directories containing ignored host data remain protected.

Batches bound serialization memory and network request counts; they do not promise compression gains for already compressed files. Manifests require reading and hashing remote files on every pull, and host reuse also reads the host bytes. This trades local and remote I/O for fewer payload downloads. The defaults are fixed; there is currently no public compression-level or batch-size setting. `limits.copyMs` bounds manifest and batch transfer operations. Synchronization after an interrupted agent turn remains an independent recovery stage.

## Failure and recovery

Every incoming file, including reused files, is materialized into the current recovery attempt before host application. SHA-256 checks reject changed remote files and damaged payloads. Host fingerprint checks still reject concurrent host edits. Traversal through parent symlinks, Git metadata paths and Outpost runtime paths is rejected.

The transaction keeps the same order: download, validate, back up the host, capture recovery checksums, apply. A failed batch leaves the host unchanged and retains the downloaded portion and `manifest.json` under the attempt's recovery directory. An incomplete download does not have a complete restorable state yet. A failure after backup retains the complete incoming and previous file trees with the existing checksum format, even when files were reused. Failed attempts remain available after a successful retry. Temporary transport archives are cleaned up; remote cleanup is best effort when the provider is unavailable.

The manifest advances only after successful application. Deleted files cannot reappear from a stale manifest. See [Recovery](../recovery/) for inspecting and verifying retained attempts.

## Custom provider contract

`FileTransfers.manifest(source, paths, options)` returns one `FileManifestEntry` for each requested relative path, in order. Entries describe regular files or symlinks with `path`, `kind`, `mode`, `size` and lowercase hexadecimal `sha256`. A symlink's size and digest describe its UTF-8 target text. Directory contents are represented by their individual file paths.

`FileTransfers.downloadBatch(source, entries, destination, options)` must materialize the requested entries beneath the destination, preserve metadata, verify the supplied digests and reject unsafe paths. The destination is fresh per attempt. Implementations must honor cancellation and deadlines and reject source changes during transfer. This capability is optional and must not silently fall back to host execution. The built-in cloud implementation requires Node.js in the remote environment, as their existing file transfers already do.
