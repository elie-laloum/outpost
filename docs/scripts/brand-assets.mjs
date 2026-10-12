import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const asset = (name) => new URL(`../src/assets/${name}`, import.meta.url);
const output = (name) => new URL(`../public/${name}`, import.meta.url);
const logos = {};
for (const color of ["black", "white"]) {
  logos[color] = await sharp(
    await readFile(asset(`outpost-logo-${color}-transparent.png`)),
  )
    .trim()
    .png()
    .toBuffer();
}

const icon = (color, size, background = "#00000000") => {
  const padding = Math.max(1, Math.round(size / 16));
  const source = sharp(logos[color]);
  if (background !== "#00000000") source.flatten({ background });
  return source
    .resize(size - padding * 2, size - padding * 2, {
      fit: "contain",
      background,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background,
    })
    .png()
    .toBuffer();
};

const symbol = await icon("white", 128);
const blackSymbol = await icon("black", 128);
await writeFile(asset("outpost-symbol-white.png"), symbol);
await writeFile(asset("outpost-symbol-black.png"), blackSymbol);
await writeFile(
  output("favicon-adaptive.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <style>
    .dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .light { display: none; }
      .dark { display: block; }
    }
  </style>
  <image class="light" width="128" height="128" href="data:image/png;base64,${blackSymbol.toString("base64")}"/>
  <image class="dark" width="128" height="128" href="data:image/png;base64,${symbol.toString("base64")}"/>
</svg>
`,
);
const sizes = [16, 32, 48];
const icons = await Promise.all(sizes.map((size) => icon("black", size)));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, size] of sizes.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(icons[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += icons[index].length;
}
await writeFile(output("favicon.ico"), Buffer.concat([directory, ...icons]));
for (const size of [16, 32]) {
  await writeFile(
    output(`favicon-${size}x${size}.png`),
    await icon("black", size),
  );
  await writeFile(
    output(`favicon-dark-${size}x${size}.png`),
    await icon("white", size),
  );
}
await writeFile(
  output("apple-touch-icon.png"),
  await icon("black", 180, "#ffffff"),
);

for (const locale of ["en", "fr"]) {
  const template = await readFile(asset(`social-home-${locale}.svg`), "utf8");
  const svg = template.replace(
    "./outpost-symbol-white.png",
    `data:image/png;base64,${symbol.toString("base64")}`,
  );
  await writeFile(
    output(`social/home-${locale}.png`),
    await sharp(Buffer.from(svg)).png().toBuffer(),
  );
}
const banner = (await readFile(asset("outpost-banner.svg"), "utf8")).replace(
  "./outpost-symbol-white.png",
  `data:image/png;base64,${(await icon("white", 512)).toString("base64")}`,
);
await writeFile(
  new URL("../../outpost-banner.png", import.meta.url),
  await sharp(Buffer.from(banner)).png().toBuffer(),
);
console.log(
  "Generated the Outpost symbol, favicons, README banner and bilingual social previews.",
);
