import type { Transport } from "../../domain/transport.types.ts";

/** Publications a file workspace declares, and the Transport that keeps their journals. */
export interface RecipePublicationExpectation {
  readonly outputs: number;
  readonly transporter?: Transport;
}
