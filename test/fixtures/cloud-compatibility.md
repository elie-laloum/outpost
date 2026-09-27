# Hosted compatibility fixtures

`test/cloud-live.ts` runs the Vercel and Daytona contracts locally or through the optional CI workflow. Set `OUTPOST_CLOUD_LIVE=1` and select providers with `OUTPOST_CLOUD_PROVIDERS=vercel,daytona`; missing credentials skip allocation. `OUTPOST_CLOUD_AGENTS=1` installs and checks CLI help. `OUTPOST_CLOUD_MODELS=1` also enables authenticated model calls and can incur model charges.

Select model agents with `OUTPOST_CLOUD_MODEL_AGENTS=claude,codex` and exact models with `OUTPOST_CLAUDE_MODEL` / `OUTPOST_CODEX_MODEL`. Models are composed on `agent({ harness, model })`. Codex's headless probe skips its Git-repository check because the lease fixture is an empty temporary directory. Claude uses the explicit OAuth-token variable when provided, otherwise its API key; Codex uses its API key. No host login file is read by this fixture.

## Failure reports

The existing check names, statuses and safe reasons remain. Failed checks also include a `category`:

| Category               | Meaning                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `allocation`           | The cloud provider could not create or prepare the lease.                                |
| `agent-cli`            | CLI installation, executable or help contract failed.                                    |
| `agent-authentication` | Agent login failed, or a model call rejected agent credentials.                          |
| `model-access`         | A model turn failed, including quota refusal, unavailable models or an invalid response. |
| `network`              | A recognized connection, DNS or network failure occurred.                                |
| `contract`             | Another lease contract failed.                                                           |
| `cleanup`              | Release could not be confirmed within the cleanup window.                                |

Reasons distinguish `authentication-rejected`, `quota-exceeded`, `model-unavailable`, `network-unreachable` and `deadline-exceeded`. Unrecognized failures retain `contract-failed`; no category is inferred from arbitrary HTTP 5xx responses. The check name preserves the operation when a network failure overrides its category. Quota is a reason attached to the failing allocation or model operation.

Classification inspects bounded nested SDK errors, known HTTP statuses, native CLI JSON and recognizable diagnostics in memory. Reports contain only fixed categories/reasons, never raw exception messages, HTTP bodies or CLI output. A failed native model event remains a failure even if the process exits zero or includes the expected response marker.

If allocation exceeds its deadline, the runner waits up to `cleanupMs` for a late lease and its release. Success records `late-allocation-released`. If acquisition or release remains unresolved, cleanup is `cleanup-unconfirmed`; the late-release callback remains installed, but the report does not promise that an unknown resource was removed. An independent provider inventory is still required after failure campaigns.

## Validation scope

Keep ordinary tests offline and use injected failures for exhausted quotas; never consume a real account's credit to manufacture a quota error. Distinguish simulated cases from real provider/model runs. A provider-native network policy may require account capabilities; an unsupported network-denial case is excluded or reported as untested, never passed. The September 2026 local campaign excludes dynamic network denial on the restricted Daytona account by operator agreement, while keeping Vercel's live network-denial test.

The ignored `temp/cloud-compatibility/` campaign directory retains local run commands, reports, source identification, cleanup inventory and cost estimates. It is not included in the npm package or CI artifacts by default.
