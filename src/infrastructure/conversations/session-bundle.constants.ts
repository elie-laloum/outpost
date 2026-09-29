export const sessionBundleLimits = Object.freeze({
  bytes: 64 * 1024 * 1024,
  files: 4096,
});

export const sessionBundleScript = String.raw`
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const [mode, profileText, id, home, cwd, bundleFile, maxBytesText, maxFilesText] = process.argv.slice(1);
const maxBytes = Number(maxBytesText), maxFiles = Number(maxFilesText);
function check(ok, message) { if (!ok) throw new Error(message); }
const profile = JSON.parse(profileText);
const format = profile.format;
function hook(source) { return source === undefined ? undefined : new Function('return (' + source + ')')(); }
const hooks = { validate: hook(profile.validate), bucket: hook(profile.bucket), relocate: hook(profile.relocate) };
const include = new RegExp(profile.include.source, profile.include.flags);
const exclude = profile.exclude && new RegExp(profile.exclude.source, profile.exclude.flags);
const helpers = { join: (...segments) => path.join(...segments), sha256: text => createHash('sha256').update(text).digest('hex') };
check(typeof format === 'string' && format.length > 0, 'Unsupported native session format');
check(!profile.buckets || hooks.bucket, 'Bucketed native sessions require a bucket function');
check(/^[A-Za-z0-9_-]+$/.test(id), 'Invalid conversation identifier');
const base = (profile.root.variable && process.env[profile.root.variable]) || path.join(home, profile.root.directory);
const sessions = path.join(base, profile.sessions);
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
async function bucketed() {
  const found = [];
  for (const bucket of await entries(sessions)) {
    if (!bucket.isDirectory()) continue;
    const candidate = path.join(sessions, bucket.name, id);
    const info = await fs.lstat(candidate).catch(error => { if (error.code === 'ENOENT') return; throw error; });
    if (info) { check(info.isDirectory(), 'Invalid native session directory'); found.push(candidate); }
  }
  return found;
}
async function locate() {
  await safe(sessions);
  if (!profile.buckets) return path.join(sessions, id);
  const found = await bucketed();
  check(found.length === 1, 'Native ' + format + ' session is missing or ambiguous');
  return found[0];
}
function selected(name) {
  return include.test(name) && !(exclude && exclude.test(name));
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
  const names = new Map();
  for (const file of bundle.files) {
    check(file && validName(file.path) && selected(file.path) && !names.has(file.path) && typeof file.data === 'string', 'Invalid native session entry');
    const data = Buffer.from(file.data, 'base64');
    check(data.toString('base64') === file.data, 'Invalid native session encoding');
    bytes += data.length;
    check(bytes <= maxBytes, 'Native session byte limit exceeded');
    names.set(file.path, file.data);
  }
  check(profile.required.every(name => names.has(name)), 'Native session is incomplete or uses an unsupported format');
  const problem = hooks.validate?.({ text: name => names.has(name) ? Buffer.from(names.get(name), 'base64').toString('utf8') : undefined }, id);
  check(!problem, problem);
  return bundle;
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
  const target = profile.buckets ? path.join(sessions, hooks.bucket(cwd, helpers), id) : path.join(sessions, id);
  await safe(target);
  if (profile.buckets)
    for (const candidate of await bucketed())
      if (candidate !== target)
        throw new Error('Native ' + format + ' session already exists under another workspace; restore in a private sandbox home');
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = await fs.mkdtemp(path.join(path.dirname(target), '.outpost-session-'));
  const relocated = new Set(profile.relocated ?? []);
  let backup;
  try {
    for (const entry of bundle.files) {
      const file = path.join(temporary, entry.path);
      await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
      const data = Buffer.from(entry.data, 'base64');
      const moved = hooks.relocate && relocated.has(entry.path)
        ? hooks.relocate(entry.path, data.toString('utf8'), { id, cwd, target, helpers })
        : data;
      await fs.writeFile(file, moved, { mode: 0o600, flag: 'wx' });
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
