import { createAgent } from "@elie-laloum/outpost";

export function createDemoCoder(path: string, content: string) {
  return createAgent({
    harness: {
      kind: "cli",
      bind() {
        return {
          name: "demo-coder",
          request() {
            return {
              executable: process.execPath,
              arguments: [
                "--input-type=module",
                "-e",
                `import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
const path = ${JSON.stringify(path)};
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, ${JSON.stringify(content)});
execFileSync('git', ['add', '--', path]);
execFileSync('git', ['commit', '-m', 'Demo change']);
console.log('<outpost>done</outpost>');`,
              ],
            };
          },
          events(text) {
            return [{ kind: "text", text }];
          },
        };
      },
    },
  });
}
