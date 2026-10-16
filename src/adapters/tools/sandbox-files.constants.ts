export const sandboxFilePathScript = `
const fs = require('node:fs');
const path = require('node:path');
const [root, relative] = process.argv.slice(1);
let current = root;
for (const component of relative.split('/').filter(Boolean)) {
  current = path.join(current, component);
  let info;
  try { info = fs.lstatSync(current); }
  catch (error) { if (error.code === 'ENOENT') break; throw error; }
  if (info.isSymbolicLink()) {
    process.stderr.write(relative + ' is a symbolic link or traverses one; links are not followed');
    process.exit(1);
  }
}
`;
