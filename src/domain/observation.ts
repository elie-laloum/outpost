import { observationDefaults } from "./observation.constants.ts";
import type {
  Observation,
  ObservationHub,
  ObservationHubOptions,
  ObservationScope,
  ObservationSink,
  SinkDelivery,
  PendingObservation,
} from "./observation.types.ts";

export function createObservationHub(
  options: ObservationHubOptions = {},
): ObservationHub {
  const capacity = options.capacity ?? observationDefaults.capacity;
  const timeout =
    options.deliveryTimeoutMs ?? observationDefaults.deliveryTimeoutMs;
  for (const value of [capacity, timeout])
    if (!Number.isSafeInteger(value) || value <= 0)
      throw new Error(
        "Observation capacity and timeout must be positive integers",
      );
  let seq = 0,
    dropped = 0,
    emitting = false;
  const errors: unknown[] = [];
  const deliveries = new Set<SinkDelivery>();
  const emissions: PendingObservation[] = [];
  function fail(error: unknown): void {
    if (errors.length < observationDefaults.errorLimit) errors.push(error);
  }
  async function bounded(
    action: Promise<void>,
    expired: () => void,
  ): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        action,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            expired();
            reject(
              new Error("Observation sink delivery timed out; sink disabled"),
            );
          }, timeout);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  function disable(delivery: SinkDelivery): void {
    delivery.disabled = true;
    dropped += delivery.queue.length;
    delivery.queue.length = 0;
  }
  function deliver(delivery: SinkDelivery, observation: Observation): void {
    if (delivery.disabled) {
      dropped++;
      return;
    }
    if (delivery.pending) {
      if (delivery.queue.length >= capacity) {
        dropped++;
        delivery.dropped++;
        if (delivery.dropped === 1)
          fail(
            new Error("Observation sink queue overflow; newest events dropped"),
          );
        return;
      }
      delivery.queue.push(observation);
      return;
    }
    try {
      const result = delivery.sink.observe(structuredClone(observation));
      if (!result) {
        delivery.completedSeq = observation.seq;
        return;
      }
      delivery.pendingSeq = observation.seq;
      delivery.pending = bounded(result, () => disable(delivery))
        .catch(fail)
        .then(() => {
          delivery.completedSeq = observation.seq;
          delete delivery.pendingSeq;
          delete delivery.pending;
          while (!delivery.pending && delivery.queue.length)
            deliver(delivery, delivery.queue.shift()!);
        });
    } catch (error) {
      delivery.completedSeq = observation.seq;
      fail(error);
    }
  }
  async function flush(targets: Iterable<SinkDelivery>): Promise<void> {
    const snapshots = [...targets].map((delivery) => ({
      delivery,
      seq: delivery.queue.at(-1)?.seq ?? delivery.pendingSeq ?? 0,
    }));
    for (const { delivery, seq } of snapshots) {
      while (delivery.pending && (delivery.completedSeq ?? 0) < seq)
        await delivery.pending;
      if (delivery.disabled) continue;
      try {
        await bounded(Promise.resolve(delivery.sink.flush?.()), () =>
          disable(delivery),
        );
      } catch (error) {
        fail(error);
      }
    }
  }
  function hub(
    scope: ObservationScope,
    inherited: readonly SinkDelivery[],
    sinks: readonly ObservationSink[],
    parentActive: () => boolean,
    parentTrack: (delivery: SinkDelivery, add: boolean) => void,
  ): ObservationHub {
    const local: SinkDelivery[] = sinks.map((sink) => ({
      sink,
      queue: [],
      dropped: 0,
    }));
    const owned = new Set<SinkDelivery>();
    const track = (delivery: SinkDelivery, add: boolean) => {
      if (add) owned.add(delivery);
      if (!add) owned.delete(delivery);
      parentTrack(delivery, add);
    };
    for (const delivery of local) {
      deliveries.add(delivery);
      track(delivery, true);
    }
    const targets = [...inherited, ...local];
    const frozen = Object.freeze({ ...scope });
    let closed = false;
    let closing: Promise<void> | undefined;
    const active = () => !closed && parentActive();
    return {
      scope: frozen,
      errors,
      get dropped() {
        return dropped;
      },
      verbose: options.verbose ?? false,
      emit(source, event) {
        if (!active()) return;
        if (emissions.length >= capacity) {
          dropped++;
          fail(new Error("Reentrant observation queue overflow"));
          return;
        }
        const draining = !emitting;
        try {
          emissions.push({
            targets,
            observation: {
              seq: ++seq,
              at: new Date().toISOString(),
              source,
              scope: frozen,
              event: structuredClone(event),
            },
          });
          if (!draining) return;
          emitting = true;
          let processed = 0;
          for (let item = emissions.shift(); item; item = emissions.shift()) {
            if (++processed > capacity) {
              dropped +=
                item.targets.length +
                emissions.reduce((sum, value) => sum + value.targets.length, 0);
              emissions.length = 0;
              fail(new Error("Reentrant observation delivery limit exceeded"));
              break;
            }
            for (const target of item.targets)
              deliver(target, item.observation);
          }
        } catch (error) {
          fail(error);
        } finally {
          if (draining) emitting = false;
        }
      },
      child(addition, sinks = []) {
        return hub({ ...scope, ...addition }, targets, sinks, active, track);
      },
      flush: () => flush(deliveries),
      close() {
        if (closing) return closing;
        closed = true;
        closing = (async () => {
          await flush([...inherited, ...owned]);
          for (const delivery of [...owned]) {
            deliveries.delete(delivery);
            track(delivery, false);
          }
        })();
        return closing;
      },
    };
  }
  return hub(
    options.scope ?? {},
    [],
    options.sinks ?? [],
    () => true,
    () => {},
  );
}
