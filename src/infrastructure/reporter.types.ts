import type {
  ObservationEvent,
  ObservationSink,
} from "../domain/observation.types.ts";

export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}

export type ReportPass = { readonly pass?: number };

export interface ObservationReporter extends ObservationSink {
  (event: ObservationEvent & ReportPass): void;
}
