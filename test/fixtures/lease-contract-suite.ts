import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, suite, test } from "node:test";
import type {
  SandboxLease,
  SandboxProvider,
} from "../../src/domain/sandbox.types.ts";
import { compatibilityLimits } from "./cloud-compatibility.constants.ts";
import { leaseContractChecks } from "./lease-contract.ts";

/** Registers the shared lease checks on one lease, then releases it twice. */
export function defineLeaseContractSuite(
  name: string,
  create: () => SandboxProvider,
): void {
  suite(`${name} sandbox lease contract`, () => {
    let directory = "";
    let lease: SandboxLease | undefined;
    let signal = AbortSignal.abort();
    const current = (): SandboxLease => {
      if (!lease) throw new Error(`${name} lease was not acquired`);
      return lease;
    };
    before(async () => {
      directory = await mkdtemp(join(tmpdir(), "outpost-lease-contract-"));
      signal = AbortSignal.timeout(compatibilityLimits.deadlineMs);
      lease = await create().acquire({
        repository: directory,
        directory,
        gitDirectories: [],
        variables: {},
        signal,
      });
    });
    after(async () => {
      await lease?.release();
      await rm(directory, { recursive: true, force: true });
    });
    for (const check of leaseContractChecks)
      test(check.name, async (t) => {
        const outcome = await check.run(current(), directory, signal);
        if (outcome !== "pass") t.skip(outcome);
      });
    test("release is idempotent", async () => {
      await current().release();
      await current().release();
    });
  });
}
