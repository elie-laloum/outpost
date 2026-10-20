import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateContainerImage } from "../domain/container-image.ts";
import { invariant } from "../domain/errors.ts";
import { executeProcess, requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import {
  imageRecipe,
  officialImage,
  officialImageNames,
  officialImages,
} from "./image-recipes.ts";
import {
  imageAttestation,
  imageDefaults,
  imageFiles,
  imageRegistry,
  publishedImages,
} from "./images.constants.ts";
import type {
  BuildOptions,
  ContainerEngineName,
  EjectOptions,
  ImageRecipeFile,
  ImageReference,
  OfficialImage,
} from "./images.types.ts";

const write = (channel: "stdout" | "stderr", text: string) =>
  (channel === "stdout" ? process.stdout : process.stderr).write(text);

export function selectEngine(engine: string | undefined): ContainerEngineName {
  const selected = engine ?? "docker";
  invariant(
    selected === "docker" || selected === "podman",
    "Choose --engine docker or --engine podman",
  );
  return selected;
}

export function requireOfficialImage(name: string | undefined): OfficialImage {
  invariant(name, `Select an image with --image (${officialImageNames()})`);
  const image = officialImage(name);
  invariant(
    image,
    `Unknown image ${JSON.stringify(name)}. Choose ${officialImageNames()}; run outpost image list for details.`,
  );
  return image;
}

/** Published reference: pinned digest when recorded, else the release tag. */
export function publishedReference(
  image: OfficialImage,
  version: string,
): ImageReference {
  const repository = `${imageRegistry}/${image.name}`;
  const digest = publishedImages[image.name];
  return {
    name: image.name,
    reference: digest ? `${repository}@${digest}` : `${repository}:${version}`,
  };
}

async function lockfiles(image: OfficialImage): Promise<ImageRecipeFile[]> {
  if (image.agent?.install.kind !== "npm") return [];
  const files: ImageRecipeFile[] = [];
  for (const path of ["package.json", "package-lock.json"])
    files.push({
      path,
      content: await readFile(
        new URL(`../../images/${image.name}/${path}`, import.meta.url),
        "utf8",
      ),
    });
  return files;
}

async function exists(path: string): Promise<boolean> {
  return lstat(path).then(
    () => true,
    (error: unknown) => {
      if (error && typeof error === "object" && "code" in error)
        if (error.code === "ENOENT") return false;
      throw error;
    },
  );
}

/** Writes an official image recipe and its lockfiles into a directory. */
export async function ejectImage(options: EjectOptions): Promise<string[]> {
  const image = requireOfficialImage(options.image);
  const engine = selectEngine(options.engine);
  const directory = resolve(options.directory ?? process.cwd());
  const recipe = imageRecipe(image, engine, await lockfiles(image));
  const targets = recipe.files.map((file) => resolve(directory, file.path));
  if (!options.force)
    for (const target of targets)
      invariant(
        !(await exists(target)),
        `Refusing to overwrite ${target}; pass --force to replace the generated files`,
      );
  await mkdir(directory, { recursive: true });
  for (const [index, file] of recipe.files.entries())
    await writeFile(targets[index]!, file.content, {
      flag: options.force ? "w" : "wx",
    });
  return targets;
}

function identity(value: number | undefined, fallback: number, name: string) {
  const selected = value ?? fallback;
  invariant(
    Number.isSafeInteger(selected) && selected >= 0,
    `${name} must be a nonnegative integer`,
  );
  return selected;
}

/** Builds a directory produced by eject (or any compatible recipe). */
export async function buildImage(
  options: BuildOptions,
  executor: Executor = executeProcess,
): Promise<string> {
  const engine = selectEngine(options.engine);
  const directory = resolve(options.directory ?? process.cwd());
  invariant(
    options.tag,
    "Name the built image with --tag, e.g. --tag outpost-codex:dev",
  );
  validateContainerImage(options.tag);
  const uid = identity(
    options.uid,
    process.getuid?.() ?? imageDefaults.uid,
    "--uid",
  );
  const gid = identity(
    options.gid,
    process.getgid?.() ?? imageDefaults.gid,
    "--gid",
  );
  const file = resolve(directory, options.file ?? imageFiles[engine]);
  invariant(
    await exists(file),
    `No ${file}. Run outpost image eject --image NAME --directory ${directory} first.`,
  );
  await requireSuccess(
    {
      executable: engine,
      arguments: [
        "build",
        "--tag",
        options.tag,
        "--file",
        file,
        "--build-arg",
        `AGENT_UID=${uid}`,
        "--build-arg",
        `AGENT_GID=${gid}`,
        directory,
      ],
      directory,
      deadlineMs: imageDefaults.buildMs,
      observe: write,
    },
    executor,
  );
  return options.tag;
}

export async function removeImage(
  reference: string | undefined,
  engine: ContainerEngineName,
  executor: Executor = executeProcess,
): Promise<string> {
  invariant(
    reference,
    "Select the image to remove with --image NAME_OR_REFERENCE",
  );
  validateContainerImage(reference);
  await requireSuccess(
    {
      executable: engine,
      arguments: ["image", "rm", reference],
      deadlineMs: imageDefaults.pullMs,
      observe: write,
    },
    executor,
  );
  return reference;
}

export async function pullImage(
  image: OfficialImage,
  version: string,
  engine: ContainerEngineName,
  executor: Executor = executeProcess,
): Promise<string> {
  const { reference } = publishedReference(image, version);
  const result = await executor({
    executable: engine,
    arguments: ["pull", reference],
    deadlineMs: imageDefaults.pullMs,
    observe: write,
  });
  invariant(
    result.status === 0,
    publishedImages[image.name]
      ? `Could not pull ${reference}; check the network and registry access.`
      : `Could not pull ${reference}: this release records no published digest for ${image.name}. Build it instead: outpost image eject --image ${image.name}, then outpost image build.`,
  );
  return reference;
}

/** Verifies the GitHub provenance attestation of a published image. */
export async function verifyImage(
  reference: string,
  executor: Executor = executeProcess,
): Promise<string> {
  validateContainerImage(reference);
  invariant(
    reference.includes("@sha256:"),
    "Verification requires a digest reference (REPOSITORY@sha256:...); tags can move",
  );
  const result = await executor({
    executable: "gh",
    arguments: [
      "attestation",
      "verify",
      `oci://${reference}`,
      "--repo",
      imageAttestation.repository,
      "--signer-workflow",
      imageAttestation.workflow,
      "--bundle-from-oci",
    ],
    deadlineMs: imageDefaults.verifyMs,
  }).catch((error: unknown) => {
    const missing =
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT";
    if (missing)
      throw new Error(
        "Image verification requires the GitHub CLI (gh). Install it, then rerun outpost image verify.",
      );
    throw error;
  });
  invariant(
    result.status === 0,
    `Attestation verification failed for ${reference}: ${result.stderr.trim() || result.stdout.trim()}`,
  );
  return reference;
}

export function listImages(version: string) {
  return officialImages.map((image) => ({
    name: image.name,
    description: image.description,
    ...(image.agent
      ? { agent: image.agent.name, cliVersion: image.agent.version }
      : {}),
    reference: publishedReference(image, version).reference,
    pinned: publishedImages[image.name] !== undefined,
  }));
}
