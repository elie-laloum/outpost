export const hookConfigurationScript = String.raw`
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const edit = input.edit;
const homes = { '.kimi-code': 'KIMI_CODE_HOME', '.copilot': 'COPILOT_HOME' };
const prefix = edit.path.split('/')[0];
const variable = homes[prefix];
if (variable && process.env[variable] && path.resolve(process.env[variable]) !== path.resolve(input.home, prefix)) throw new Error('Native hooks require the CLI home to match the sandbox home: ' + variable);
const parts = edit.path.split(/[\\/]/);
if (path.isAbsolute(edit.path) || parts.some(p => !p || p === '.' || p === '..')) throw new Error('Unsafe hook configuration path');
let parent = input.home;
for (const part of parts.slice(0, -1)) {
  parent = path.join(parent, part);
  try { fs.mkdirSync(parent, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const stat = fs.lstatSync(parent); if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe hook configuration directory');
}
const target = path.join(input.home, ...parts);
const lock = target + '.outpost-lock';
try { fs.mkdirSync(lock, { mode: 0o700 }); } catch { throw new Error('Hook configuration is locked; inspect it before recovery'); }
process.on('exit', () => { try { fs.rmdirSync(lock); } catch {} });
let original = ''; let exists = false; let mode = 0o600;
try { const stat = fs.lstatSync(target); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1048576) throw new Error('Unsafe hook configuration file'); mode = stat.mode & 0o777; original = fs.readFileSync(target, 'utf8'); exists = true; }
catch (error) { if (error.code !== 'ENOENT') throw error; }
let next;
if (edit.kind === 'exclusive') {
  if (input.remove) { if (!exists) process.exit(0); if (original !== edit.content) throw new Error('Hook configuration changed; preserving it for recovery'); fs.unlinkSync(target); process.exit(0); }
  fs.writeFileSync(target, edit.content, { flag: 'wx', mode: 0o600 }); process.exit(0);
}
if (edit.kind === 'append') {
  if (!input.remove && edit.rejectPattern && new RegExp(edit.rejectPattern, 'm').test(original)) throw new Error('Hook configuration uses incompatible syntax; preserve existing hooks as array tables before installation');
  if (input.remove) {
    if (!exists) process.exit(0);
    const index = original.indexOf(edit.content);
    if (index < 0 || original.indexOf(edit.content, index + 1) >= 0) throw new Error('Hook configuration changed; preserving it for recovery');
    next = original.slice(0, index) + original.slice(index + edit.content.length);
  } else next = original + edit.content;
}
if (edit.kind === 'entry') {
  const value = original.trim() ? JSON.parse(original) : {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Hook configuration must be an object');
  if (input.remove) {
    if (!(edit.key in value)) process.exit(0);
    if (JSON.stringify(value[edit.key]) !== JSON.stringify(edit.value)) throw new Error('Hook configuration changed; preserving it for recovery');
    delete value[edit.key];
  } else {
    if (Object.hasOwn(value, edit.key)) throw new Error('Hook configuration already exists');
    value[edit.key] = edit.value;
  }
  next = JSON.stringify(value, null, 2) + '\n';
}
const temporary = target + '.outpost-' + crypto.randomUUID();
try {
  fs.writeFileSync(temporary, next, { mode, flag: 'wx' });
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current !== original) throw new Error('Hook configuration changed concurrently; preserving it for recovery');
  fs.renameSync(temporary, target);
} finally { fs.rmSync(temporary, { force: true }); }
`;
