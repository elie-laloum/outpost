import { open } from "node:fs/promises";
import { recipeCatalogLimits } from "../domain/recipe-catalog.constants.ts";
import type { RecipeResource } from "./recipe-download.types.ts";

function requireHttps(url: URL): void {
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error(
      "Remote recipe resources require HTTPS without URL credentials",
    );
}

export async function downloadRecipeResource(
  location: URL,
  fetcher: typeof fetch = fetch,
): Promise<RecipeResource> {
  if (location.protocol === "file:") {
    const file = await open(location, "r");
    try {
      const buffer = Buffer.alloc(recipeCatalogLimits.bytes + 1);
      let offset = 0;
      while (offset < buffer.length) {
        const { bytesRead } = await file.read(
          buffer,
          offset,
          buffer.length - offset,
          null,
        );
        if (!bytesRead) break;
        offset += bytesRead;
      }
      if (offset > recipeCatalogLimits.bytes)
        throw new Error("Recipe resource exceeds 1 MiB");
      return { location, bytes: buffer.subarray(0, offset) };
    } finally {
      await file.close();
    }
  }
  let url = location;
  const signal = AbortSignal.timeout(recipeCatalogLimits.timeoutMs);
  for (
    let redirects = 0;
    redirects <= recipeCatalogLimits.redirects;
    redirects++
  ) {
    requireHttps(url);
    const response = await fetcher(url, {
      redirect: "manual",
      signal,
      credentials: "omit",
      headers: {
        accept: "application/json, application/yaml, text/yaml, text/plain",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const next = response.headers.get("location");
      if (!next)
        throw new Error("Recipe resource redirect is missing its location");
      url = new URL(next, url);
      continue;
    }
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error(`Recipe resource download failed (${response.status})`);
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body.getReader();
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.length;
        if (size > recipeCatalogLimits.bytes)
          throw new Error("Recipe resource exceeds 1 MiB");
        chunks.push(next.value);
      }
    } finally {
      await reader.cancel();
    }
    return { location: url, bytes: Buffer.concat(chunks) };
  }
  throw new Error("Too many recipe resource redirects");
}
