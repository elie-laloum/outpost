import { invariant } from "./errors.ts";

export function isContainerImage(image: unknown): image is string {
  return (
    typeof image === "string" &&
    image.length > 0 &&
    !image.startsWith("-") &&
    !/[\x00-\x20\x7f]/.test(image)
  );
}

export function validateContainerImage(
  image: unknown,
): asserts image is string {
  invariant(isContainerImage(image), "Invalid container image name");
}
