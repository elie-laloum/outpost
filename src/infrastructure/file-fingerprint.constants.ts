export const fingerprintRetainBytes = 4096;

export const fingerprintScript = `
const { createHash } = require("node:crypto");
const { createReadStream } = require("node:fs");
(async () => {
  const entries = [];
  for (const file of JSON.parse(process.argv[1])) {
    const hash = createHash("sha256");
    try {
      for await (const chunk of createReadStream(file)) hash.update(chunk);
      entries.push([file, hash.digest("hex")]);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      entries.push([file, null]);
    }
  }
  process.stdout.write(createHash("sha256").update(JSON.stringify(entries)).digest("hex"));
})().catch(error => { console.error(error); process.exitCode = 1; });
`;
