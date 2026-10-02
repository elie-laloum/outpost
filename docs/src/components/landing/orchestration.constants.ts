/** How long each owner takes on one step, in milliseconds. */
export const STEP_DURATIONS = {
  model: 640,
  agent: 900,
  code: 100,
} as const;

export type StepOwner = keyof typeof STEP_DURATIONS;

/** The elapsed time a finished step reports, in the reader's locale. */
export const stepSeconds = (owner: StepOwner, locale: string) =>
  `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(STEP_DURATIONS[owner] / 1000)} s`;
