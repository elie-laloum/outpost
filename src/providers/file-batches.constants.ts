export const fileBatchLimits = {
  bytes: 8 * 1024 * 1024,
  entries: 128,
  argumentBytes: 48 * 1024,
  cleanupMs: 10_000,
  manifestBytes: 2 * 1024 * 1024,
  decodedBytes: 16 * 1024 * 1024,
} as const;

export const fileBatchScript = String.raw`
const fs = require('node:fs'), p = require('node:path'), c = require('node:crypto'), z = require('node:zlib');
const [operation, root, input, output] = process.argv.slice(1), entries = JSON.parse(input);
function safe(path) {
  if (!path || p.isAbsolute(path) || path.includes('\\') || path.includes('\0') || path.split('/').some(x => x === '..' || x.toLowerCase() === '.git')) throw Error('Unsafe transfer path');
  const target = p.resolve(root, path);
  let parent = p.dirname(target);
  while (true) {
    if (fs.lstatSync(parent).isSymbolicLink()) throw Error('Transfer path traverses symlink');
    if (parent === p.resolve(root)) break;
    parent = p.dirname(parent);
  }
  return target;
}
async function inspect(path, expected) {
  const dataRequired = expected !== undefined;
  const target = safe(path), stat = fs.lstatSync(target), hash = c.createHash('sha256');
  if (!stat.isFile() && !stat.isSymbolicLink()) throw Error('Unsupported transfer file');
  if (expected && stat.isFile() && stat.size !== expected.size) throw Error('Remote file changed during transfer');
  let data, size = stat.size;
  if (stat.isSymbolicLink()) { data = Buffer.from(fs.readlinkSync(target)); size = data.length; hash.update(data); }
  else {
    const chunks = []; let bytes = 0;
    for await (const chunk of fs.createReadStream(target)) {
      hash.update(chunk);
      if (dataRequired) {
        bytes += chunk.length;
        if (bytes > expected.size) throw Error('Remote file changed during transfer');
        chunks.push(chunk);
      }
    }
    if (dataRequired) data = Buffer.concat(chunks);
  }
  const entry = { path, kind: stat.isSymbolicLink() ? 'link' : 'file', mode: stat.mode & 511, size, sha256: hash.digest('hex') };
  return dataRequired ? { ...entry, data: data.toString('base64') } : entry;
}
(async () => {
  const result = [];
  for (const entry of entries) {
    const item = await inspect(operation === 'manifest' ? entry : entry.path, operation === 'batch' ? entry : undefined);
    if (operation === 'batch' && ['path', 'kind', 'mode', 'size', 'sha256'].some(key => item[key] !== entry[key])) throw Error('Remote file changed during transfer');
    result.push(item);
  }
  if (operation === 'manifest') { process.stdout.write(JSON.stringify(result)); return; }
  fs.writeFileSync(output, z.gzipSync(Buffer.from(JSON.stringify(result))), { mode: 384, flag: 'wx' });
})().catch(error => { console.error(error.message); process.exitCode = 1; });
`;

export const fileBatchCleanupScript = `require("node:fs").rmSync(process.argv[1], { force: true })`;
