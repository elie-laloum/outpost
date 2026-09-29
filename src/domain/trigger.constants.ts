export const triggerDeliveryPattern = /^[\x21-\x7e]{1,200}$/;
export const triggerPathPattern = /^\/[A-Za-z0-9._~/-]{0,127}$/;
export const triggerDefaultToleranceMs = 300_000;
export const triggerDefaultMaxBytes = 1_048_576;
export const triggerMaxBytes = 26_214_400;
