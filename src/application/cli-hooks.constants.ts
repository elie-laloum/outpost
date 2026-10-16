export const hookBridgeScript = String.raw`
const http = require('node:http');
const readline = require('node:readline');
const max = 1048576;
const pending = new Map();
let sequence = 0;
const server = http.createServer((request, response) => {
  if (request.method !== 'POST' || request.headers.authorization !== process.env.OUTPOST_HOOK_BRIDGE_TOKEN) { response.writeHead(403); response.end(); return; }
  if (pending.size >= 32) { response.writeHead(429); response.end(); return; }
  let body = ''; let oversized = false;
  request.setEncoding('utf8');
  request.on('data', chunk => { body += chunk; if (Buffer.byteLength(body) > max) { oversized = true; request.destroy(); } });
  request.on('end', () => {
    if (oversized) return;
    try {
      const value = JSON.parse(body);
      const id = ++sequence;
      pending.set(id, response);
      response.on('close', () => pending.delete(id));
      process.stdout.write(JSON.stringify({ id, hook: value.hook, event: value.event }) + '\n');
    } catch { response.writeHead(400); response.end(); }
  });
});
const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on('line', line => {
  try { const value = JSON.parse(line); const response = pending.get(value.id); if (response) { pending.delete(value.id); response.end(JSON.stringify(value)); } }
  catch { process.exitCode = 1; lines.close(); }
});
lines.on('close', () => {
  for (const response of pending.values()) { response.writeHead(503); response.end(); }
  server.close(); server.closeAllConnections();
});
server.listen(0, '127.0.0.1', () => process.stdout.write(JSON.stringify({ port: server.address().port }) + '\n'));
`;

export const hookClientScript = String.raw`
const http = require('node:http');
const { spawn } = require('node:child_process');
const config = JSON.parse(Buffer.from(process.argv[1], 'base64').toString());
const connection = process.env[config.variable];
if (!connection) process.exit(0);
let input = ''; const max = 1048576;
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; if (Buffer.byteLength(input) > max) { console.error('Hook input exceeds its size limit'); process.exit(2); } });
process.stdin.on('end', () => {
  if (config.command) {
    const command = config.command;
    const child = spawn(command.executable, command.arguments || [], { cwd: command.directory || process.cwd(), env: { ...process.env, ...command.variables }, stdio: ['pipe', 'inherit', 'inherit'] });
    child.on('error', () => { console.error('Cannot start hook command'); process.exitCode = 2; });
    child.stdin.on('error', () => {}); child.stdin.end(input);
    child.on('exit', (code, signal) => { process.exitCode = code === null ? 2 : code; });
    return;
  }
  let event;
  try { event = JSON.parse(input); } catch { console.error('Invalid hook input'); process.exitCode = 2; return; }
  const { port, token } = JSON.parse(connection);
  const request = http.request({ host: '127.0.0.1', port, method: 'POST', headers: { authorization: token, 'content-type': 'application/json' } }, response => {
    let output = ''; response.setEncoding('utf8');
    response.on('data', chunk => { output += chunk; if (Buffer.byteLength(output) > max * 2) request.destroy(new Error('Hook response too large')); });
    response.on('end', () => {
      try { if (response.statusCode !== 200) throw new Error('Hook bridge unavailable'); const value = JSON.parse(output); if (value.error) throw new Error(value.error); process.stdout.write(value.output || ''); }
      catch (error) { console.error(error.message); process.exitCode = 2; }
    });
  });
  request.setTimeout(config.timeoutMs, () => request.destroy(new Error('Hook bridge timed out')));
  request.on('error', error => { console.error(error.message); process.exitCode = 2; });
  request.end(JSON.stringify({ hook: config.index, event }));
});
`;
