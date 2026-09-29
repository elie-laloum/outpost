/** Text of the bundled files a profile hook may read, by bundle-relative path. */
export interface SessionBundleFiles {
  text(path: string): string | undefined;
}

export interface SessionBundleHelpers {
  /** Joins sandbox path segments with the sandbox platform separator. */
  join(...segments: string[]): string;
  /** Hex SHA-256 digest of a UTF-8 string. */
  sha256(text: string): string;
}

export interface SessionBundleRelocation {
  readonly id: string;
  /** Sandbox workspace the restored session must point to. */
  readonly cwd: string;
  /** Sandbox directory the session is restored into. */
  readonly target: string;
  readonly helpers: SessionBundleHelpers;
}

/**
 * How a CLI stores one session as a directory. Hooks run inside the sandbox
 * from their source text, so they must be self-contained function expressions.
 */
export interface SessionBundleProfile {
  /** Persisted format name, used in bundles, transport keys and host paths. */
  readonly format: string;
  /** CLI home: `$variable` when set, otherwise `directory` under the agent home. */
  readonly root: { readonly variable?: string; readonly directory: string };
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
