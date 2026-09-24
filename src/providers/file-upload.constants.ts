export const fileUploadScript = String.raw`
const f = require('node:fs'), p = require('node:path'), c = require('node:crypto'), z = require('node:zlib');
const [operation, root, input, staging] = process.argv.slice(1);
const keys = ['path', 'kind', 'mode', 'size', 'sha256'];
function safe(path) {
  if (!path || p.isAbsolute(path) || path.includes('\\') || path.includes('\0') || path.split('/').some(x => !x || x === '.' || x === '..' || x.toLowerCase() === '.git')) throw Error('Unsafe upload path');
  const target = p.resolve(root, path);
  let parent = p.dirname(target);
  while (true) {
    let stat;
    try { stat = f.lstatSync(parent); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) throw Error('Upload path traverses non-directory');
    if (parent === p.resolve(root)) break;
    parent = p.dirname(parent);
  }
  return target;
}
async function inspect(target, path) {
  const stat = f.lstatSync(target), hash = c.createHash('sha256');
  if (!stat.isFile() && !stat.isSymbolicLink()) throw Error('Unsupported upload destination');
  let size = stat.size;
  if (stat.isSymbolicLink()) { const data = Buffer.from(f.readlinkSync(target)); size = data.length; hash.update(data); }
  else for await (const chunk of f.createReadStream(target)) hash.update(chunk);
  return { path, kind: stat.isSymbolicLink() ? 'link' : 'file', mode: stat.mode & 511, size, sha256: hash.digest('hex') };
}
function same(left, right) { return keys.every(key => left[key] === right[key]); }
(async () => {
  if (operation === 'cleanup') { f.rmSync(input, { recursive: true, force: true }); return; }
  if (operation === 'stage') { f.mkdirSync(input, { mode: 448 }); process.stdout.write(input); return; }
  const entries = JSON.parse(input);
  if (operation === 'missing') {
    const missing = [];
    for (const entry of entries) {
      const target = safe(entry.path);
      let actual;
      try { actual = await inspect(target, entry.path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (!actual || !same(actual, entry)) missing.push(entry.path);
    }
    process.stdout.write(JSON.stringify(missing)); return;
  }
  const records = operation === 'batch' ? JSON.parse(z.gunzipSync(f.readFileSync(p.join(staging, 'payload')), { maxOutputLength: 16777216 }).toString('utf8')) : undefined;
  if (records && (!Array.isArray(records) || records.length !== entries.length)) throw Error('Invalid upload batch');
  for (const [index, entry] of entries.entries()) {
    safe(entry.path);
    const temporary = p.join(staging, 'entry-' + index);
    if (records) {
      const record = records[index];
      if (!record || !same(record, entry) || typeof record.data !== 'string') throw Error('Invalid upload batch');
      const data = Buffer.from(record.data, 'base64');
      if (data.length !== entry.size || c.createHash('sha256').update(data).digest('hex') !== entry.sha256) throw Error('Upload checksum mismatch');
      if (entry.kind === 'link') f.symlinkSync(data.toString('utf8'), temporary);
      else { f.writeFileSync(temporary, data, { flag: 'wx', mode: entry.mode }); f.chmodSync(temporary, entry.mode); }
    } else {
      if (entry.kind !== 'file') throw Error('Invalid large upload');
      const actual = await inspect(p.join(staging, 'payload'), entry.path);
      if (actual.kind !== entry.kind || actual.size !== entry.size || actual.sha256 !== entry.sha256) throw Error('Upload checksum mismatch');
      f.renameSync(p.join(staging, 'payload'), temporary); f.chmodSync(temporary, entry.mode);
    }
  }
  for (const [index, entry] of entries.entries()) {
    const target = safe(entry.path);
    f.mkdirSync(p.dirname(target), { recursive: true });
    f.renameSync(p.join(staging, 'entry-' + index), target);
    if (!same(await inspect(target, entry.path), entry)) throw Error('Upload verification failed');
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
`;
