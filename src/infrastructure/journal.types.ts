import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type {
  ObservationEvent,
  Observation,
} from "../domain/observation.types.ts";

export type Logging =
  | false
  | "stdout"
  | {
      readonly transporter?: Transport;
      readonly verbose?: boolean;
      readonly replayable?: boolean;
    };

export type Journal = {
  reference?: TransportReference;
  record(
    event: ObservationEvent & Partial<Omit<Observation, "event">>,
  ): void | Promise<void>;
  close(): Promise<void>;
};
