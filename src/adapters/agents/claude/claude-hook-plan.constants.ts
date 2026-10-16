export const claudeGuardedHook = String.raw`
const fs = require('node:fs'); const { spawnSync } = require('node:child_process');
const config = CONFIG;
const input = fs.readFileSync(0, 'utf8');
function guard(value) {
  const checked = spawnSync(process.execPath, ['-e', config.guard], { input: value, encoding: 'utf8', timeout: config.timeoutMs, maxBuffer: 1048576 });
  if (checked.status !== 0) { process.stderr.write('Denied by agent profile allowedTools'); process.exit(2); }
}
guard(input);
const result = spawnSync(config.command, { input, shell: true, encoding: 'utf8', timeout: config.timeoutMs, maxBuffer: 1048576 });
if (result.status !== 0) { process.stderr.write(result.stderr || 'Hook command failed'); process.exit(2); }
try {
  const output = JSON.parse(result.stdout || '{}');
  if (output.hookSpecificOutput && Object.hasOwn(output.hookSpecificOutput, 'updatedInput')) {
    guard(JSON.stringify({ ...JSON.parse(input), tool_input: output.hookSpecificOutput.updatedInput }));
  }
} catch { process.stderr.write('Invalid hook output'); process.exit(2); }
process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
`;
