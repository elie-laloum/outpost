export const networkProbeScript = `
const https = require('node:https');
const tls = require('node:tls');
const probe = JSON.parse(process.argv[1]);
let finished = false;
function finish(outcome) {
  if (finished) return;
  finished = true;
  console.log(JSON.stringify({ outcome }));
}
if (probe.host) {
  const socket = tls.connect({ host: probe.host, port: probe.port ?? 443, rejectUnauthorized: false });
  socket.setTimeout(probe.timeoutMs ?? 5000, () => { finish('blocked'); socket.destroy(); });
  socket.on('secureConnect', () => socket.write('GET / HTTP/1.1\\r\\nHost: one.one.one.one\\r\\nConnection: close\\r\\n\\r\\n'));
  socket.on('data', () => { finish('reachable'); socket.destroy(); });
  socket.on('end', () => finish('blocked'));
  socket.on('error', () => finish('blocked'));
} else {
  function request(url, follow) {
    const req = https.get(url, res => {
      res.resume();
      if (!follow) { finish('reachable'); return; }
      if (res.statusCode < 300 || res.statusCode > 399 || !res.headers.location) {
        finish('invalid-redirect'); return;
      }
      request(new URL(res.headers.location, url), false);
    });
    req.setTimeout(5000, () => { finish('blocked'); req.destroy(); });
    req.on('error', () => finish('blocked'));
  }
  request(probe.url, probe.redirect);
}
`;
