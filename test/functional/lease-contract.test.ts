import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { defineLeaseContractSuite } from "../fixtures/lease-contract-suite.ts";

defineLeaseContractSuite("local", () => createLocalSandboxProvider());
