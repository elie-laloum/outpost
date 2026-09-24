export const cacheDefaults = Object.freeze({
  root: "/outpost/cache",
  label: "io.outpost.cache",
  version: 1,
  namePattern: /^[a-z][a-z0-9-]{0,47}$/,
  maximumKeyLength: 1024,
});
