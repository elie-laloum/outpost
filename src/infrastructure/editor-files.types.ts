export interface EditorFile {
  /** Path relative to the editor directory, with `/` separators. */
  readonly path: string;
  readonly text: string;
  /** SHA-256 of the text, used to detect changes made outside the editor. */
  readonly hash: string;
}

export interface EditorRoot {
  /** Real path of the directory the editor may read and write. */
  readonly directory: string;
  locate(file: string): Promise<string>;
  relative(path: string): string;
}
