export const containerLabels = Object.freeze({
  keyPattern: /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,
  reservedPrefix: "io.outpost.",
  maximumKeyLength: 255,
  maximumValueLength: 1024,
  controlCharacters: /[\u0000-\u001f\u007f]/,
});
