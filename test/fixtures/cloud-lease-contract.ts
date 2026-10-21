import type { CompatibilityOptions } from "./cloud-compatibility.types.ts";
import { leaseContractChecks } from "./lease-contract.ts";

export const verifyCloudLease: NonNullable<
  CompatibilityOptions["verify"]
> = async (lease, directory, signal, record) => {
  for (const check of leaseContractChecks) {
    const outcome = await check.run(lease, directory, signal);
    record(
      outcome === "pass"
        ? { name: check.name, status: "pass" }
        : { name: check.name, status: "skipped", reason: outcome },
    );
  }
};
