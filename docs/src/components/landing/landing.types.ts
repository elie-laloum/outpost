export interface CodeWindowFile {
  name: string;
  code: string;
  lang: string;
  note?: string;
  command?: boolean;
  example?: boolean;
}
