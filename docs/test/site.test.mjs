import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("Guide and Reference have separate navigation", async ({ page }) => {
  await page.goto("guide/agents/dispatch/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Give an agent one task",
  );
  const reference = page
    .getByRole("tab", { name: "Reference", exact: true })
    .filter({ visible: true });
  await reference.click();
  await page
    .getByRole("link", { name: "API index", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/reference\/$/);
  await expect(
    page
      .getByRole("tab", { name: "Reference", exact: true })
      .filter({ visible: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("language switch retains the corresponding page", async ({ page }) => {
  await page.goto("guide/agents/dispatch/");
  const select = page
    .locator("starlight-lang-select select")
    .filter({ visible: true });
  const value = await select
    .locator("option")
    .filter({ hasText: "Français" })
    .getAttribute("value");
  await select.selectOption(value);
  await expect(page).toHaveURL(/\/fr\/guide\/agents\/dispatch\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("preparation opens with the keyboard and main code copies exactly", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("guide/agents/dispatch/");
  const summary = page.locator(".sl-markdown-content summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".sl-markdown-content details").first(),
  ).toHaveAttribute("open", "");
  const code = page
    .locator("pre")
    .filter({ hasText: "import { dispatch }" })
    .last();
  const markdown = await readFile(
    new URL("../src/content/docs/guide/agents/dispatch.md", import.meta.url),
    "utf8",
  );
  const expected = markdown
    .match(/```ts file=example\.mts\n([\s\S]*?)```/)[1]
    .trimEnd();
  const copy = code.locator("..").getByRole("button", { name: "Copy code" });
  await copy.focus();
  await page.keyboard.press("Enter");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(expected);
});

test("search finds a runnable guide", async ({ page }) => {
  await page.goto("guide/agents/dispatch/");
  await page
    .getByRole("link", { name: "Learn Outpost", exact: true })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("button", { name: /Search/ })
    .filter({ visible: true })
    .first()
    .click();
  const input = page.getByRole("textbox", { name: "Search", exact: true });
  await input.fill("Give an agent one task");
  await expect(page.locator(".pagefind-ui__result-link").first()).toBeVisible();
  await expect(page.locator(".pagefind-ui__results")).toContainText(
    "Give an agent one task",
  );
});

test("mobile navigation works without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("guide/agents/dispatch/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    page
      .getByRole("tab", { name: "Reference", exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "Reference", exact: true })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("link", { name: "API index", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/reference\/$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("theme changes and long API signatures remain within the page", async ({
  page,
}) => {
  await page.goto("reference/sandboxoptions/");
  const toggle = page
    .getByRole("button", { name: /Toggle theme|Theme:/ })
    .filter({ visible: true })
    .first();
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Parameters and properties" }),
  ).toBeVisible();
});

test("legacy URLs and anchors still find their content", async ({ page }) => {
  await page.goto("agents/dispatch/");
  await expect(page).toHaveURL(/\/guide\/agents\/dispatch\/$/);
  await page.goto("agents/conversations/#continuation-choices");
  await expect(page).toHaveURL(
    /\/reference\/behavior\/agents\/conversations\/#continuation-choices$/,
  );
  await expect(page.locator("#continuation-choices")).toBeVisible();
});

test("French search opens the matching translated guide", async ({ page }) => {
  await page.goto("fr/guide/");
  await page
    .locator("site-search button[data-open-modal]")
    .filter({ visible: true })
    .click();
  await page.getByRole("textbox").fill("Confier une tâche à un agent");
  const result = page
    .locator(".pagefind-ui__result-link")
    .filter({ hasText: "Confier une tâche à un agent" })
    .first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/fr\/guide\/agents\/dispatch\//);
});
