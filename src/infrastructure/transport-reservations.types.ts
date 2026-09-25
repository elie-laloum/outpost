export interface ReservationLedger {
  readonly format: 1;
  readonly reservations: Readonly<Record<string, number>>;
}
