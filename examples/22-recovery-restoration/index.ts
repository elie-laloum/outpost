// Restoration — replay a preserved transfer into a NEW folder,
// without ever overwriting the host checkout.
//
// A preserved transfer appears when syncing a remote sandbox
// (Vercel, Daytona…) fails: Outpost then keeps the data in .outpost/recovery.
//
// Usage: npx tsx examples/22-recovery-restoration/index.ts [repository] [--apply]

import { join, resolve } from "node:path";
import {
  inspectRecovery,
  planRecoveryRestore,
  restoreRecoveryTransfer,
  verifyRecoveryTransfer,
} from "@elie-laloum/outpost";
import { demoRepository } from "../shared/repository.ts";


// The repository to inspect: the one passed as an argument, otherwise the demo's sample repository.
const argument = process.argv.slice(2).find((value) => !value.startsWith("--"));
const repository = argument ? resolve(argument) : demoRepository(import.meta.dirname);


// 1. Find the preserved data in the repository.
const inventory = await inspectRecovery({ repository });
const retained = inventory.categories.find((category) => category.name === "recovery")?.entries ?? [];

console.log(`${retained.length} élément(s) dans ${repository}/.outpost/recovery`);


for (const entry of retained) {
  // 2. Verify: complete structure and intact content?
  const verification = await verifyRecoveryTransfer(entry.path, { checksums: true, restorability: true, repository });

  if (!verification.complete) {
    console.log(`✗ ${entry.name} : pas un transfert restaurable`, verification.checks.map((check) => check.code));
    continue;
  }


  // 3. Plan: a reviewable plan that doesn't touch anything yet.
  const plan = await planRecoveryRestore({
    directory: entry.path,
    repository,
    destination: join(import.meta.dirname, "state", entry.name),
    side: "previous",
  });

  console.log(`✓ ${entry.name} : commit ${plan.commit}, fichiers`, plan.payloads);


  // 4. Apply, only when asked.
  if (process.argv.includes("--apply")) {
    const restored = await restoreRecoveryTransfer(plan);
    console.log("  restauré dans", restored.directory, "(la source est conservée)");
  }
}
