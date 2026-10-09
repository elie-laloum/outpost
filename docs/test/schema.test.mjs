import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { recipeSchemaNames } from "../scripts/recipe-schema-assets.constants.mjs";

test("schema URLs return the package JSON directly under the documentation base", async ({
  request,
}) => {
  for (const name of recipeSchemaNames) {
    const response = await request.get(`schemas/${name}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.text()).toBe(
      await readFile(new URL(`../../${name}`, import.meta.url), "utf8"),
    );
  }
});
