import { observationDefaults } from "../domain/observation.constants.ts";
import { createObservationHub } from "../domain/observation.ts";
import { observationSessionFactory } from "../domain/observation-session.constants.ts";
import type { ObservationSessionCapability } from "../domain/observation-session.types.ts";
import { invariant } from "../domain/errors.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { RunObserver } from "../domain/run.types.ts";
import { createRunObserver } from "./run-observer.ts";
import { readRun, watchRun } from "./run-reader.ts";
import { runDefaults } from "../domain/run.constants.ts";
import { runInterval } from "./run-storage.ts";
import type {
  ObservationClient,
  ObservationClientState,
  ObservationClientAncestor,
  ObservationOptions,
} from "./observation-client.types.ts";

export function createObservation(
  options: ObservationOptions = {},
): ObservationClient {
  const heartbeatMs = runInterval(
    options.heartbeatMs ?? runDefaults.heartbeatMs,
    "heartbeatMs",
  );
  const abandonAfterMs = runInterval(
    options.abandonAfterMs ?? runDefaults.abandonAfterMs,
    "abandonAfterMs",
  );
  invariant(
    abandonAfterMs > heartbeatMs,
    "abandonAfterMs must exceed heartbeatMs",
  );
  const configuration = {
    ...options,
    heartbeatMs,
    abandonAfterMs,
    sinks: [...(options.sinks ?? [])],
    redact: [...(options.redact ?? [])],
    scope: { ...options.scope },
  };
  return client(
    createObservationHub(configuration),
    configuration,
    {
      pending: new Set(),
      errors: [],
      hubs: new Set(),
      dropped: 0,
      closed: false,
    },
    true,
  );
}

function client(
  hub: ObservationHub,
  options: ObservationOptions,
  state: ObservationClientState,
  root = false,
  ancestors: readonly ObservationClientAncestor[] = [],
): ObservationClient {
  const child = hub.child.bind(hub);
  const closeHub = hub.close.bind(hub);
  const flushHub = hub.flush.bind(hub);
  const hubErrors = hub.errors;
  const local = new Set<Promise<void>>();
  let closed = false;
  let closing: Promise<void> | undefined;
  const active = () =>
    !closed && !state.closed && ancestors.every((owner) => owner.active());
  function remember(error: unknown) {
    if (state.errors.length < observationDefaults.errorLimit)
      state.errors.push(error);
  }
  function transport() {
    invariant(
      options.transporter,
      "Run reading requires an observation transporter",
    );
    return options.transporter;
  }
  const observation: ObservationClient & ObservationSessionCapability = {
    ...hub,
    get errors() {
      return [
        ...hubErrors,
        ...state.errors,
        ...[...state.hubs].flatMap((run) => run.errors),
      ];
    },
    get dropped() {
      return (
        hub.dropped +
        state.dropped +
        [...state.hubs].reduce((sum, run) => sum + run.dropped, 0)
      );
    },
    readRun: (id: string, settings = {}) =>
      readRun({ ...settings, id, transporter: transport() }),
    watchRun: (id: string, settings = {}) =>
      watchRun({ ...settings, id, transporter: transport() }),
    child(
      scope: Parameters<ObservationHub["child"]>[0],
      sinks: Parameters<ObservationHub["child"]>[1] = [],
      redact: readonly RegExp[] = [],
    ) {
      invariant(active(), "Observation is closed");
      return client(
        child(scope, sinks, redact),
        {
          ...options,
          scope: { ...options.scope, ...scope },
          sinks: [...(options.sinks ?? []), ...sinks],
          redact: [...(options.redact ?? []), ...redact],
        },
        state,
        false,
        [...ancestors, { active, pending: local }],
      );
    },
    async flush() {
      await flushHub();
      await Promise.all([...state.hubs].map((run) => run.flush()));
    },
    close() {
      closing ??= (async () => {
        closed = true;
        if (root) state.closed = true;
        await Promise.all(root ? state.pending : local);
        await closeHub();
      })();
      return closing;
    },
    [Symbol.asyncDispose]() {
      return observation.close();
    },
    async [observationSessionFactory](settings) {
      invariant(active(), "Observation is closed");
      let release!: () => void;
      const settled = new Promise<void>((resolve) => {
        release = resolve;
      });
      local.add(settled);
      for (const owner of ancestors) owner.pending.add(settled);
      state.pending.add(settled);
      try {
        const previous =
          options.transporter && settings.resume
            ? await readRun({
                transporter: options.transporter,
                id: settings.id,
              })
            : undefined;
        invariant(
          !previous?.executionId ||
            previous.executionId === settings.executionId,
          "Run identity mismatch",
        );
        const receiver = options.transporter
          ? await createRunObserver({
              transporter: options.transporter,
              ...settings,
              resume: !!previous,
              ...(options.heartbeatMs === undefined
                ? {}
                : { heartbeatMs: options.heartbeatMs }),
              ...(options.abandonAfterMs === undefined
                ? {}
                : { abandonAfterMs: options.abandonAfterMs }),
            })
          : undefined;
        const run = receiver
          ? createObservationHub({
              ...options,
              sinks: [...(options.sinks ?? []), receiver],
            })
          : hub.child({});
        if (receiver) state.hubs.add(run);
        let completion: Promise<void> | undefined;
        return {
          observation: run,
          close() {
            completion ??= (async () => {
              try {
                await run.close();
                if (receiver)
                  await closeReceiver(
                    receiver,
                    options.deliveryTimeoutMs ??
                      observationDefaults.deliveryTimeoutMs,
                  );
              } catch (error) {
                remember(error);
              } finally {
                if (receiver) {
                  for (const error of run.errors) remember(error);
                  state.hubs.delete(run);
                  state.dropped += run.dropped;
                }
                for (const owner of ancestors) owner.pending.delete(settled);
                local.delete(settled);
                state.pending.delete(settled);
                release();
              }
            })();
            return completion;
          },
        };
      } catch (error) {
        for (const owner of ancestors) owner.pending.delete(settled);
        local.delete(settled);
        state.pending.delete(settled);
        release();
        throw error;
      }
    },
  };
  return observation;
}

async function closeReceiver(
  receiver: RunObserver,
  timeoutMs: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      receiver.close(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Run observer cleanup timed out")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
