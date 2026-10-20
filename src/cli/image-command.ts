import { invariant } from "../domain/errors.ts";
import {
  buildImage,
  ejectImage,
  listImages,
  publishedReference,
  pullImage,
  removeImage,
  requireOfficialImage,
  selectEngine,
  verifyImage,
} from "./image.ts";
import { officialImage } from "./image-recipes.ts";
import type { CliInvocation, CliValues } from "./main.types.ts";
import { packageVersion } from "./package-version.ts";

function report(values: CliValues, json: unknown, text: string): void {
  process.stdout.write(
    values.json ? `${JSON.stringify(json, null, 2)}\n` : `${text}\n`,
  );
}

function integer(value: string | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  invariant(/^\d+$/.test(value), `${name} must be a nonnegative integer`);
  return Number(value);
}

const actions: Readonly<Record<string, (values: CliValues) => Promise<void>>> =
  {
    async list(values) {
      const images = listImages(packageVersion());
      report(
        values,
        images,
        [
          ...images.map(
            (image) =>
              `${image.name.padEnd(12)} ${image.description}\n${"".padEnd(13)}${image.reference}${image.pinned ? "" : " (digest not recorded yet)"}`,
          ),
          "",
          "Pull one with: outpost image pull --image NAME",
          "Customize one with: outpost image eject --image NAME",
        ].join("\n"),
      );
    },
    async pull(values) {
      const image = requireOfficialImage(values.image);
      const reference = await pullImage(
        image,
        packageVersion(),
        selectEngine(values.engine),
      );
      report(
        values,
        { image: image.name, reference },
        `Pulled ${reference}\nUse it with createDockerSandboxProvider({ image: ${JSON.stringify(reference)} }).`,
      );
    },
    async verify(values) {
      invariant(
        values.image,
        "Select the image to verify with --image NAME_OR_REFERENCE",
      );
      const image = officialImage(values.image);
      const reference = image
        ? publishedReference(image, packageVersion()).reference
        : values.image;
      await verifyImage(reference);
      report(
        values,
        { reference, verified: true },
        `Verified build provenance for ${reference}`,
      );
    },
    async eject(values) {
      const files = await ejectImage({
        image: values.image ?? "",
        ...(values.directory !== undefined
          ? { directory: values.directory }
          : {}),
        engine: selectEngine(values.engine),
        ...(values.force ? { force: true } : {}),
      });
      report(
        values,
        { files },
        `Wrote ${files.join(", ")}\nEdit the recipe, then run: outpost image build${values.directory ? ` --directory ${values.directory}` : ""} --tag outpost-${values.image}:dev${values.engine ? ` --engine ${values.engine}` : ""}`,
      );
    },
    async build(values) {
      const uid = integer(values.uid, "--uid");
      const gid = integer(values.gid, "--gid");
      const tag = await buildImage({
        ...(values.directory !== undefined
          ? { directory: values.directory }
          : {}),
        ...(values.tag !== undefined ? { tag: values.tag } : {}),
        ...(values.file !== undefined ? { file: values.file } : {}),
        engine: selectEngine(values.engine),
        ...(uid !== undefined ? { uid } : {}),
        ...(gid !== undefined ? { gid } : {}),
      });
      report(values, { image: tag }, `Built ${tag}`);
    },
    async remove(values) {
      const reference = await removeImage(
        values.image,
        selectEngine(values.engine),
      );
      report(values, { removed: reference }, `Removed ${reference}`);
    },
  };

export async function imageCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  const action = actions[positionals[1] ?? ""];
  invariant(action, "Unknown command. Run outpost image --help.");
  await action(values);
}
