# Guide second-pass proposal

Status: approved, implemented and validated. Ready for review.

Continue in `/tmp/outpost-guide-reorganization`, branch `docs/guide-reorganization`, preserving the first refactor. The audience, bilingual scope and Guide/API separation are unchanged. The approved expansion adds focused pages within the existing navigation groups. Article width is unchanged.

## Findings

The current inventory contains 106 Guide pages per language. Many long pages are runnable examples rather than excessive prose; line count alone is not a reason to split them. The remaining obstacles are mixed reader goals, repeated descriptions of contracts, and advanced additions placed after a page's limits or next steps.

Examples include two reporting sections in recipe configuration; recovery mixed into candidate selection and file execution; and event delivery, custom reporters and secret redaction mixed into observation. The CLI page combines recipe execution, setup, images and recovery commands.

Reviewed all 25 Guide canvases and the homepage canvas in French, with browser screenshots of verification loops and the development workflow. The development diagram mixes actors, storage, API calls and execution stages and fits at 66% on the inspected desktop viewport. The verification diagram connects grouped alternatives using generic next-step arrows without clearly showing the correction loop. These are content and relationship problems; enlarging the viewport alone would not resolve them. English diagrams must receive the same semantic review during implementation.

## Proposed page boundaries

Retain existing entry routes and introduce the following focused pages in both languages. New slugs are proposed here so the navigation and link work can be reviewed together.

| Current page           | Keep at the existing route                                                    | Extract or relocate                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `budgets`              | Limit attempts and tokens; explain an exceeded or unknown budget              | `estimating-costs`: estimate monetary cost, choose prices and preserve the price table for resume                                                                                                 |
| `observability`        | Connect a hub and follow an execution                                         | `observation-delivery`: asynchronous delivery, loss and sink failures; `redacting-secrets`: mask sensitive data before observation or storage                                                     |
| `job-queues`           | Start a worker, submit a job and inspect its result                           | `queued-workflows`: checkpoints, pauses and resume; `operating-workers`: leases, retries and effect idempotency                                                                                   |
| `recipe-configuration` | Select the repository, sandbox, agent and environment; validate configuration | `recipe-observation`: combine the two reporting sections; `recipe-harness`: configure the built-in agent loop; put secret selection beside the existing secret-source instructions and link there |
| `working-with-files`   | Run against an ephemeral, copied or mounted source                            | `resuming-file-workspaces`: preserve, resume and explicitly recover ownership; publication recovery moves beside publication in `publishing-files`; queued execution links to the queue pages     |
| `speculation`          | Run candidates, evaluate them and inspect the selected result                 | `resuming-speculation`: durable setup, quota pauses and interrupted-run recovery                                                                                                                  |
| `cli`                  | Choose a command; retain setup, diagnostics and image operations              | `recipe-cli`: recipe commands and flags; `recovery-cli`: inspect, verify, restore and prune                                                                                                       |
| `development-workflow` | Implement and review the change after planning and test preparation           | `prepare-change-tests`: write and verify tests from an approved plan; preserve explicit shared-file prerequisites and a runnable intermediate result                                              |

Expand the existing relevant navigation groups with these pages. Move CLI lookup pages beside the tasks they support, with the command chooser linking to all of them. Keep the first-task learning path intact. Review secret-manager examples for unnecessary repeated prose, but do not automatically create one page per vendor.

Keep other complete examples together where their setup only produces a useful result as a whole. Improve their introductions, code-group explanations and diagrams without turning every source file into a separate page.

## Canvas decisions

Each diagram must answer one reader question. Use user actions or observable states as nodes, meaningful conditions on edges, and one consistent meaning for lanes. Put API names and recovery contracts in adjacent prose when they distract from the flow.

- Retain and simplify real workflows: lifecycle, approvals, dialogue, verification, quotas, queues, webhooks, subagents and remote synchronization.
- In verification, show attempt to check, success to result, failed check with attempts remaining back to correction, and exhaustion to failure. Do not suggest that every branch executes.
- In development, show plan, approval, tests, implementation/review and retained branch. Explain sandbox reuse and checkpoint storage separately.
- Rebuild complete-example diagrams around their outcomes: CI correction, scheduled maintenance, review publication, independent repository changes and candidate selection. Keep partial failure and explicit integration visible.
- Replace diagrams that only repeat an ordered procedure with numbered steps where clearer: credential/key rotation, recovery authorization, skill loading and OAuth exchange. Assess harness permissions and record/replay on whether their branches or boundaries add information.
- Retain the homepage's simple review-to-result diagram if the bilingual visual review confirms it remains useful.

## Reference, links and validation

Before removing option lists or contract descriptions, compare each passage with its generated symbol page, maintained reference source and implementation. Candidate destinations include observation options/events, queue worker and workflow-job contracts, model pricing, file recovery and speculation recovery. Presence of a symbol page is not proof of complete coverage. No new coverage claim is made by this proposal. CLI flags and YAML syntax without a symbol contract stay in the Guide.

Preserve routes and historical section anchors with onward links; update the anchor manifest and redirects where required. Keep resource ownership, side effects, lost events, interrupted replay authorization and recovery consequences at the point of use.

After implementation, run build, documentation checks/build, example validation and browser tests; synchronize the reference if its sources change. Format changed files. Inspect representative canvases in both languages at desktop and mobile sizes, including branches and return edges. Automated checks do not establish that a diagram is understandable.

The initial proposal was based on inventory, content/source inspection and two desktop screenshots. The implementation and its checks are recorded below.

## Implemented changes

- Added all 12 proposed pages in each language: 118 Guide pages per language, up from 106. Existing navigation groups now expose the narrower tasks without changing the first-result path.
- Split the development example into planning, test preparation and implementation. The new test lesson has its own four-task workflow and executable entry point. Shared files and fresh checkpoint identities are explicit and checked by the snippet validator.
- Reworked every Guide diagram: 16 canvases per language remain, down from 25. Ten simple procedures use numbered steps; development has separate preparation and delivery diagrams. The homepage keeps its three-node task diagram. Conditions are short, correction edges return to the actual attempt, and nodes describe actions rather than inventories of APIs.
- Rewrote cost estimation, file resumption and secret masking around an observable result. The pricing example prints its estimate; the masking example prints a redacted string. Queue workflow setup now includes a worker with explicit imports and cleanup.
- Completed the YAML harness example with its response contract and a matching agent role. Removed internal test-history digressions and shortened or separated dense paragraphs in recipe sharing, agent profiles, run state, guard behavior and CLI instructions.
- Preserved all page URLs. The anchor manifest now checks 242 historical section routes, including the 76 added in this pass. Current inbound links target the extracted pages directly where relevant.
- Checked observation capacity/timeouts/counters against ObservationHubOptions, ObservationHub and the observation implementation; queue lease options against QueueWorkerOptions; price names against ModelPriceTable; and file recovery authorization against its API and implementation. Exact agent-profile adapter projections moved into the maintained defineAgentProfile reference source after checking the Claude/Codex adapters. Reference links now lead to the focused guides.
- Updated editorial guidance and the CLI catalog exception in the content checker. Browser checks now assert the actual correction, success and exhaustion paths rather than the previous grouped alternatives.

## Validation

- `bun run build` and `bun run docs:sync`: passed; synchronized 673 public symbols and 50 supporting contracts in both languages.
- `bun run docs:check`: passed, including 30 documentation tests.
- `bun run docs:build`: passed; 2,601 rendered pages.
- `bun run docs:test`: passed; 984 published TypeScript snippets checked, 66 offline snippets executed across both languages, and four release-channel tests passed. Rendered links, anchors, assets, language parity and search were checked.
- Extracted YAML harness/response examples: CLI validation passed in English and French without allocation or resolving credentials.
- Extracted queue workflow examples: ran a separate worker process against SQLite for each language; each job and checkpointed workflow completed with status `done`, then the worker closed on SIGINT.
- Canvas review: inspected desktop/mobile renders in both languages and checked label/card overlaps. Corrected the remaining permission-diagram and French review-label collisions. The verification and development diagrams fit at 100% on the inspected desktop viewport; mobile retains pan, zoom and fullscreen controls.
- `bun run docs:test:browser`: all 118 tests passed (preview and development, desktop and mobile).
- Final rendered-page and content checks: passed after the last diagram edits; 118 Guide pages per language, 914 legacy routes and 242 historical section routes verified.
- Prettier check: passed on all 272 changed existing files, including new files; `git diff --check` passed.
- The existing development server still serves the worktree at `http://localhost:4321/outpost/`; the new French pricing page returned HTTP 200.

No runtime source behavior changed. No live paid agent, cloud-provider or real secret-manager validation was performed. Existing unreleased and experimental qualifications remain. The branch and worktree are left uncommitted for review; nothing is merged or published.
