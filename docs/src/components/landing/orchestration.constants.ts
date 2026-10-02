/** How long each owner takes on one step, in milliseconds. */
export const STEP_DURATIONS = {
  model: 600,
  agent: 900,
  code: 100,
} as const;

export type StepOwner = keyof typeof STEP_DURATIONS;

/** Elapsed time in the reader's locale, so a lane total matches its steps. */
export const seconds = (ms: number, locale: string) =>
  `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ms / 1000)} s`;

export const stepSeconds = (owner: StepOwner, locale: string) =>
  seconds(STEP_DURATIONS[owner], locale);
