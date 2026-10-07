# Read and watch an execution by ID

Build with `bun run build`, then run `node examples/57-run-state/index.ts` using Node.js 24+. This offline example uses a simulated model and an explicitly unisolated local sandbox; no credentials or container are needed. The sample repository is created once under `examples/.repos/57-run-state` and reused.

The example assigns a unique ID, attaches a transport-backed receiver to one ObservationHub, starts a two-task workflow and follows events from a snapshot's cursor. It prints task statuses, agent, commits (empty in this summary demo) and cumulative usage. The receiver closes after execution; the stored snapshot and events remain readable by another process:

```sh
node examples/57-run-state/read.ts <printed-id>
node examples/57-run-state/read.ts <printed-id> --watch
```

`watchRun()` replays events strictly after `from`, polls while running and ends after a settled or abandoned snapshot. Ctrl+C cancels only this reader. Readers take no execution lock. For S3, both processes must use a transport targeting the same bucket and prefix.

Each execution owns its receiver and hub. Use `resume: true` with a fresh hub to append to a settled workflow projection when explicitly resuming its checkpoint. Unsettled projections cannot be taken over; after explicit recovery use a new ID. Heartbeat expiry indicates missing updates, not proof that a remote process stopped. It never releases checkpoint ownership or resources. Inspect `complete`, receiver errors and the execution's `observerErrors`: bounded observation delivery can lose events. This projection is not a checkpoint or an authorization source.
