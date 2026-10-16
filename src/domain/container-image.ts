import { invariant } from "./errors.ts";

export function validateContainerImage(
  image: unknown,
): asserts image is string {
  invariant(
    typeof image === "string" &&
      image.length > 0 &&
      !image.startsWith("-") &&
      !/[\x00-\x20\x7f]/.test(image),
    "Invalid container image name",
  );
}
