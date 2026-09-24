export const firecrackerFileScript = String.raw`
const fs = require('node:fs'), p = require('node:path'), { pipeline } = require('node:stream/promises');
const [op, input, extra] = process.argv.slice(1), path = p.resolve(input);
function safe(target) {
  for (let current = target; current !== '/'; current = p.dirname(current)) {
    try { if (fs.lstatSync(current).isSymbolicLink()) throw Error('Transfer destination traverses a symlink'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
(async () => {
  if (op === 'read') { safe(p.dirname(path)); await pipeline(fs.createReadStream(path, { flags: fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW }), process.stdout); return; }
  safe(path);
  if (op === 'directory') { fs.mkdirSync(path, { recursive: true }); return; }
  if (op === 'mode') { fs.chmodSync(path, Number(extra)); return; }
  fs.mkdirSync(p.dirname(path), { recursive: true });
  if (op === 'link') { fs.symlinkSync(extra, path); return; }
  if (op === 'write') { await pipeline(process.stdin, fs.createWriteStream(path, { flags: fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW, mode: 384 })); return; }
  throw Error('Unknown transfer operation');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
`;
