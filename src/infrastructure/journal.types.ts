import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type { AgentEvent } from "../domain/agent.types.ts";

export type Logging =
  | false
  | "stdout"
  | {
      readonly transporter?: Transport;
      readonly verbose?: boolean;
    };

export type Journal = {
  reference?: TransportReference;
  record(event: AgentEvent): void;
  close(): Promise<void>;
};
