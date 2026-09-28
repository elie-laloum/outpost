export const sessionBundleLimits = Object.freeze({
  bytes: 64 * 1024 * 1024,
  files: 4096,
});

export const sessionBundleScript = String.raw`
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const [mode, format, id, home, cwd, bundleFile, maxBytesText, maxFilesText] = process.argv.slice(1);
const maxBytes = Number(maxBytesText), maxFiles = Number(maxFilesText);
function check(ok, message) { if (!ok) throw new Error(message); }
check(format === 'copilot' || format === 'kimi', 'Unsupported native session format');
check(/^[A-Za-z0-9_-]+$/.test(id), 'Invalid conversation identifier');
const base = format === 'kimi'
  ? (process.env.KIMI_CODE_HOME || path.join(home, '.kimi-code'))
  : (process.env.COPILOT_HOME || path.join(home, '.copilot'));
const sessions = path.join(base, format === 'kimi' ? 'sessions' : 'session-state');
async function entries(dir) {
  try { return await fs.readdir(dir, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
async function safe(file) {
  for (let at = file;; at = path.dirname(at)) {
    const info = await fs.lstat(at).catch(error => { if (error.code === 'ENOENT') return; throw error; });
    check(!info?.isSymbolicLink(), 'Native session paths must not traverse symlinks');
    if (at === path.dirname(at)) break;
  }
}
async function locate() {
  await safe(sessions);
  if (format === 'copilot') return path.join(sessions, id);
  const found = [];
  for (const bucket of await entries(sessions)) {
    if (!bucket.isDirectory()) continue;
    const candidate = path.join(sessions, bucket.name, id);
    const info = await fs.lstat(candidate).catch(error => { if (error.code === 'ENOENT') return; throw error; });
    if (info) { check(info.isDirectory(), 'Invalid native session directory'); found.push(candidate); }
  }
  check(found.length === 1, 'Kimi session is missing or ambiguous');
  return found[0];
}
function selected(name) {
  if (format === 'copilot') return /^(?:(?:events\.jsonl|workspace\.yaml|plan\.md)$|(?:checkpoints|files)(?:\/|$))/.test(name);
  return !/^(logs|tasks|cron|notify)(\/|$)/.test(name) && !/(^|\/)[^/]*\.lock$/.test(name);
}
function validName(name) {
  return typeof name === 'string' && name.length > 0 && !name.includes('\\') && !name.includes('\0') &&
    !path.isAbsolute(name) && !name.split('/').some(p => !p || p === '.' || p === '..' || p.toLowerCase() === '.git');
}
function validate(bundle) {
  check(bundle && bundle.version === 1 && bundle.format === format && bundle.id === id && typeof bundle.source === 'string' && Array.isArray(bundle.files), 'Invalid native session bundle');
  check(bundle.files.length > 0, 'Native session is missing or incomplete');
  check(bundle.files.length <= maxFiles, 'Native session file limit exceeded');
  let bytes = 0;
  const names = new Set();
  for (const file of bundle.files) {
    check(file && validName(file.path) && selected(file.path) && !names.has(file.path) && typeof file.data === 'string', 'Invalid native session entry');
    const data = Buffer.from(file.data, 'base64');
    check(data.toString('base64') === file.data, 'Invalid native session encoding');
    bytes += data.length;
    check(bytes <= maxBytes, 'Native session byte limit exceeded');
    names.add(file.path);
  }
  const required = format === 'kimi' ? ['state.json', 'agents/main/wire.jsonl'] : ['events.jsonl', 'workspace.yaml'];
  check(required.every(name => names.has(name)), 'Native session is incomplete or uses an unsupported format');
  if (format === 'kimi') {
    const meta = JSON.parse(Buffer.from(bundle.files.find(f => f.path === 'state.json').data, 'base64'));
    check(meta.version === 2 && meta.id === id && typeof meta.cwd === 'string' && meta.agents && typeof meta.agents === 'object', 'Unsupported Kimi session metadata');
  }
  return bundle;
}
function workDirKey(dir) {
  const normalized = dir.replace(/\\/g, '/').replace(/\/+$/, '');
  let slug = normalized.split('/').pop().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/^-+|-+$/g, '');
  if (!slug || slug === '.' || slug === '..') slug = 'workspace';
  return 'wd_' + slug + '_' + createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}
async function capture() {
  const source = await locate();
  await safe(source);
  const files = [];
  let bytes = 0;
  async function walk(dir, prefix = '') {
    for (const entry of await entries(dir)) {
      const name = prefix + entry.name;
      if (!selected(name)) continue;
      check(validName(name) && !entry.isSymbolicLink(), 'Unsafe native session entry');
      if (entry.isDirectory()) { await walk(path.join(dir, entry.name), name + '/'); continue; }
      check(entry.isFile(), 'Unsupported native session entry');
      const file = path.join(dir, entry.name);
      const before = await fs.stat(file);
      bytes += before.size;
      check(bytes <= maxBytes && files.length < maxFiles, 'Native session limits exceeded');
      const data = await fs.readFile(file);
      const after = await fs.stat(file);
      check(before.size === data.length && before.mtimeMs === after.mtimeMs, 'Native session changed during capture');
      files.push({ path: name, data: data.toString('base64') });
    }
  }
  await walk(source);
  const bundle = validate({ version: 1, format, id, source, files });
  await safe(bundleFile);
  await fs.mkdir(path.dirname(bundleFile), { recursive: true, mode: 0o700 });
  await fs.writeFile(bundleFile, JSON.stringify(bundle), { mode: 0o600, flag: 'wx' });
}
async function readBundle() {
  const info = await fs.stat(bundleFile);
  check(info.size <= maxBytes * 2, 'Native session bundle exceeds byte limit');
  return validate(JSON.parse(await fs.readFile(bundleFile, 'utf8')));
}
async function restore() {
  const bundle = await readBundle();
  const target = format === 'kimi' ? path.join(sessions, workDirKey(cwd), id) : path.join(sessions, id);
  await safe(target);
  if (format === 'kimi') {
    for (const bucket of await entries(sessions)) {
      if (!bucket.isDirectory()) continue;
      const candidate = path.join(sessions, bucket.name, id);
      if (candidate !== target && await fs.lstat(candidate).catch(error => { if (error.code === 'ENOENT') return; throw error; }))
        throw new Error('Kimi session already exists under another workspace; restore in a private sandbox home');
    }
  }
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = await fs.mkdtemp(path.join(path.dirname(target), '.outpost-session-'));
  function relocate(text, name) {
    if (format === 'copilot' && name === 'workspace.yaml')
      return text.replace(/^(cwd|git_root):.*$/gm, (_, key) => key + ': ' + JSON.stringify(cwd));
    if (format === 'kimi' && name === 'state.json') {
      const meta = JSON.parse(text);
      meta.cwd = cwd;
      for (const [agent, value] of Object.entries(meta.agents)) {
        check(/^[A-Za-z0-9_-]+$/.test(agent) && value && typeof value === 'object', 'Invalid Kimi agent metadata');
        value.homedir = path.join(target, 'agents', agent);
      }
      return JSON.stringify(meta);
    }
    if (format === 'copilot' && name === 'events.jsonl')
      return text.split('\n').map(line => {
        if (!line.trim()) return line;
        const event = JSON.parse(line);
        if (event.type === 'session.start' && event.data?.context) {
          event.data.context.cwd = cwd;
          if (event.data.context.gitRoot) event.data.context.gitRoot = cwd;
        }
        return JSON.stringify(event);
      }).join('\n');
    return undefined;
  }
  let backup;
  try {
    for (const entry of bundle.files) {
      const file = path.join(temporary, entry.path);
      await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
      const data = Buffer.from(entry.data, 'base64');
      const textFile = format === 'kimi' ? entry.path === 'state.json' : ['events.jsonl', 'workspace.yaml'].includes(entry.path);
      const moved = textFile ? relocate(data.toString('utf8'), entry.path) : undefined;
      await fs.writeFile(file, moved === undefined ? data : moved, { mode: 0o600, flag: 'wx' });
    }
    if (await fs.lstat(target).catch(error => { if (error.code === 'ENOENT') return; throw error; })) {
      backup = path.join(base, '.outpost-recovery', id + '-' + randomUUID());
      await fs.mkdir(path.dirname(backup), { recursive: true, mode: 0o700 });
      await safe(backup);
      await fs.rename(target, backup);
    }
    await fs.rename(temporary, target);
  } catch (error) {
    if (backup) await fs.rename(backup, target);
    throw error;
  } finally { await fs.rm(temporary, { recursive: true, force: true }); }
}
({ capture, restore, validate: readBundle }[mode]()).catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
`;
