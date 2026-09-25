import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type { AgentEvent } from "../domain/agent.types.ts";

export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly transporter?: Transport;
      readonly verbose?: boolean;
    };

export type Journal = {
  file?: string;
  reference?: TransportReference;
  record(event: AgentEvent): void;
  close(): Promise<void>;
};
