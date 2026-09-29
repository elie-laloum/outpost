// Persistence — every durable object (artifacts, checkpoints, journals, cache…) goes
// through a Transport. Its writes are conditional: you say which revision you saw,
// and a writer that saw an older one is refused instead of overwriting.
// (Demo 24 shows the stores that share a transport; this one looks underneath.)

import { readdir, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { createLocalTransport, TransportConflict } from "@elie-laloum/outpost";

const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });

// The application owns the transport: closing a sandbox or a workflow never closes it.
const transporter = createLocalTransport({ directory: state });

const bytes = (text: string) => new TextEncoder().encode(text);
const text = (data: Uint8Array) => new TextDecoder().decode(data);

async function attempt(label: string, operation: () => Promise<unknown>) {
  try {
    await operation();
    console.log(`  ✓ ${label}`);
  } catch (error) {
    if (!(error instanceof TransportConflict)) throw error;
    console.log(`  ✗ ${label} → TransportConflict`);
  }
}

// 1. Create, replace, delete: each operation states the revision it expects.
console.log("1. écritures conditionnelles");
const key = "notes/release.txt";

const first = await transporter.write(key, bytes("v1"), { ifRevision: null }); // null = must not exist yet
console.log(`  ✓ création, révision ${first.revision}`);

await attempt("recréer par-dessus (ifRevision: null)", () =>
  transporter.write(key, bytes("v1 bis"), { ifRevision: null }),
);

const second = await transporter.write(key, bytes("v2"), {
  ifRevision: first.revision,
});
console.log(`  ✓ remplacement, révision ${second.revision}`);

await attempt("remplacer avec l'ancienne révision", () =>
  transporter.write(key, bytes("v3"), { ifRevision: first.revision }),
);
await attempt("supprimer avec l'ancienne révision", () =>
  transporter.remove(key, { ifRevision: first.revision }),
);

const current = await transporter.read(key);
console.log(`  contenu actuel : « ${text(current!.bytes)} »`);

// 2. Optimistic concurrency: 5 writers increment the same counter 10 times each.
//    On conflict, a writer reads again and retries — no increment is lost.
console.log("\n2. cinq écrivains, un compteur");
let conflicts = 0;

async function increment() {
  for (;;) {
    const counter = await transporter.read("counter");
    const next = String(Number(counter ? text(counter.bytes) : 0) + 1);
    try {
      await transporter.write("counter", bytes(next), {
        ifRevision: counter?.revision ?? null,
      });
      return;
    } catch (error) {
      if (!(error instanceof TransportConflict)) throw error;
      conflicts++;
    }
  }
}

const writers = Array.from({ length: 5 }, async () => {
  for (let i = 0; i < 10; i++) await increment();
});
await Promise.all(writers);

console.log(
  `  valeur finale : ${text((await transporter.read("counter"))!.bytes)} (${conflicts} conflits rattrapés)`,
);

// 3. A listing is a snapshot of metadata, not a transaction over the objects.
console.log("\n3. liste");
for await (const entry of transporter.list())
  console.log(
    `  ${entry.key.padEnd(18)} ${entry.size} o  rév. ${entry.revision}`,
  );

// 4. On disk: one file per object.
console.log("\n4. sur le disque");
for (const file of await readdir(state, {
  recursive: true,
  withFileTypes: true,
})) {
  if (file.isFile())
    console.log("  " + relative(state, join(file.parentPath, file.name)));
}
