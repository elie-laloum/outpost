import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

for (const [locale, title, reference] of [
  ["", "First request", "Reference"],
  ["fr/", "Première requête", "Référence"],
]) {
  test(`guide navigation opens Reference (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}guide/first-request/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator(".docs-navigation section > h2")).toHaveCount(9);
    await expect(page.locator(".docs-navigation details")).toHaveCount(0);
    await expect(page.locator(".sl-markdown-content details")).toHaveCount(0);
    const spaces = page.locator(".docs-header nav");
    await spaces.getByRole("link", { name: reference, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}reference/$`));
    await expect(
      spaces.getByRole("link", { name: reference, exact: true }),
    ).toHaveAttribute("aria-current", "true");
    await expect(page.locator(".families > li")).toHaveCount(25);
  });

  test(`search finds the new guide (${locale || "en"})`, async ({ page }) => {
    await page.goto(`${locale}guide/introduction/`);
    await page
      .getByRole("button", { name: /Search|Rechercher/ })
      .filter({ visible: true })
      .first()
      .click();
    await page.getByRole("textbox").fill(title);
    const result = page
      .locator(".pagefind-ui__result-link")
      .filter({ hasText: title })
      .first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/first-request/`));
  });
}

for (const [locale, heading, start, copied] of [
  ["", "Run an agent,", "Get started", "Copy the install command"],
  [
    "fr/",
    "Exécutez un agent,",
    "Commencer",
    "Copier la commande d’installation",
  ],
]) {
  test(`landing files, copy and workflow steps work (${locale || "en"})`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(locale);
    const brand = page.locator(".docs-header .brand");
    await expect(brand).toHaveAttribute("href", `/outpost/${locale}`);
    await expect(brand.locator(".mark")).toBeVisible();
    await expect(page.locator(".docs-header nav a").first()).toHaveAttribute(
      "href",
      `/outpost/${locale}guide/introduction/`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
    const tabs = page.getByRole("tablist").first().getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#hero-files-panel-1")).toBeVisible();
    await expect(page.locator("#hero-files-panel-0")).toBeHidden();
    await page.getByRole("button", { name: copied }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "npx @elie-laloum/outpost init",
    );
    const steps = page.locator("[data-workflow] [data-lines]");
    await expect(steps.first()).toHaveAttribute("aria-pressed", "true");
    await steps.nth(2).click();
    await expect(steps.nth(2)).toHaveAttribute("aria-pressed", "true");
    const active = page.locator("[data-workflow] .line[data-active]");
    await expect(active.first()).toContainText("defineApprovalTask");
    await page.getByRole("link", { name: start }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/setup/$`));
  });
}

test("language switch retains the new guide page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("guide/first-request/");
  const language = page.locator(".docs-header .language");
  await expect(language).toHaveAttribute("hreflang", "fr");
  await language.click();
  await expect(page).toHaveURL(/\/fr\/guide\/first-request\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Première requête",
  );
  await page.locator(".docs-header .language").click();
  await expect(page).toHaveURL(/\/outpost\/guide\/first-request\/$/);
});

test("documentation section styles leave the landing untouched", async ({
  page,
}) => {
  await page.goto("");
  const primary = page.locator(".landing .button.primary");
  await expect(primary).toHaveText(/Get started/);
  const colors = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.color, style.backgroundColor];
  });
  expect(colors[0]).not.toBe(colors[1]);
  const code = await page
    .locator(".landing .install code")
    .evaluate((element) => getComputedStyle(element).paddingTop);
  expect(parseFloat(code)).toBeGreaterThan(8);
});

test("navigation bar links the source and the released version", async ({
  page,
}) => {
  const manifest = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("reference/dispatch/");
  const header = page.locator(".docs-header");
  await expect(header.locator(".brand")).toHaveText("Outpost");
  for (const [name, href] of [
    ["GitLab", "https://gitlab.elielaloum.com/elielaloum/outpost"],
    ["GitHub mirror", "https://github.com/elie-laloum/outpost"],
    ["npm", "https://www.npmjs.com/package/@elie-laloum/outpost"],
  ])
    await expect(
      header.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  const version = header.locator(".version");
  await expect(version).toHaveText(`v${manifest.version}`);
  await version.click();
  await expect(page).toHaveURL(/\/project\/changelog\/$/);
  const brand = await header.locator(".brand-cell").boundingBox();
  const sidebar = await page.locator(".docs-sidebar").boundingBox();
  expect(Math.round(brand.x + brand.width)).toBe(
    Math.round(sidebar.x + sidebar.width),
  );
});

test("short request snippet copies exactly with the keyboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("guide/first-request/");
  const markdown = await readFile(
    new URL("../src/content/docs/guide/first-request.md", import.meta.url),
    "utf8",
  );
  const expected = markdown
    .match(/```ts title="review\.mts"\n([\s\S]*?)```/)[1]
    .trimEnd();
  const code = page.locator("pre").filter({ hasText: "import { dispatch }" });
  const copy = code.locator("..").getByRole("button", { name: "Copy code" });
  await copy.focus();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    expected,
  );
});

for (const locale of ["", "fr/"]) {
  test(`mobile guide navigation and code fit the screen (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/first-request/`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const setup = page
      .locator(".docs-navigation a")
      .filter({ hasText: locale ? /^Mise en place$/ : /^Setup$/ });
    await expect(setup).toBeVisible();
    await setup.click();
    await expect(page).toHaveURL(/\/guide\/setup\/$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("retired guide URLs resolve directly to new topics", async ({ page }) => {
  await page.goto("agents/dispatch/");
  await expect(page).toHaveURL(/\/guide\/first-request\/$/);
  await page.goto("agents/conversations/#continuation-choices");
  await expect(page).toHaveURL(/\/guide\/chat-history\/#continuation-choices$/);
  await expect(page.locator("#continuation-choices")).toBeVisible();
  for (const locale of ["", "fr/"]) {
    await page.goto(`${locale}guide/`);
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/introduction/$`));
    await page.goto(`${locale}reference/customharness/`);
    await expect(page).toHaveURL(
      new RegExp(`/${locale}reference/createharness/$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "createHarness",
    );
  }
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

for (const locale of ["", "fr/"]) {
  test(`retired manuals resolve to the rebuilt Guide (${locale || "en"})`, async ({
    page,
  }) => {
    for (const [route, target] of [
      ["manual/cli", "command-line"],
      ["behavior/agents/conversations", "chat-history"],
    ]) {
      await page.goto(`${locale}reference/${route}/`);
      await expect(page).toHaveURL(new RegExp(`/${locale}guide/${target}/$`));
      await expect(
        page
          .locator(".docs-header")
          .getByRole("link", { name: "Guide", exact: true }),
      ).toHaveAttribute("aria-current", "true");
    }
    await page.goto(`${locale}reference/`);
    await expect(page).toHaveURL(new RegExp(`/${locale}reference/$`));
    await expect(page.locator(".reference-map")).toHaveCount(5);
    await expect(
      page.getByRole("link", { name: /^(API index|Index de l’API)$/ }),
    ).toHaveCount(0);
    await page.goto(`${locale}reference/type-task/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Task");
    await expect(
      page.getByRole("heading", {
        name: /^(Purpose and behavior|Rôle et comportement)$/,
      }),
    ).toHaveCount(0);
  });
}

test("reference symbol icons retain accessible names in both languages", async ({
  page,
}) => {
  for (const locale of ["", "fr/"]) {
    const masks = new Map();
    for (const [name, kind, route] of [
      ["defineTask", "function", "task"],
      ["Task", "interface", "type-task"],
      ["TaskOptions", "type", "taskoptions"],
      ["WorkflowFailure", "class", "workflowfailure"],
      ["agentVersions", "constant", "agentversions"],
      ["createDockerSandboxProvider", "function", "docker"],
      ["createClaudeHarness", "function", "claude"],
      ["createCodexHarness", "function", "codex"],
      ["createAntigravityHarness", "function", "gemini"],
      ["createCopilotHarness", "function", "copilotharness"],
      ["QueueHandler", "type", "queuehandler"],
    ]) {
      await page.goto(`${locale}reference/${route}/`);
      const link = page
        .getByRole("link", { name, exact: true })
        .filter({ visible: true })
        .and(page.locator("a[data-api-kind]"));
      await expect(link).toHaveAttribute("data-api-kind", kind);
      const icon = await link.evaluate((element) => {
        const style = getComputedStyle(element, "::before");
        return {
          mask: style.maskImage,
          width: parseFloat(style.width),
          content: style.content,
        };
      });
      expect(icon.mask).toMatch(/^url\(/);
      expect(icon.width).toBeGreaterThan(0);
      expect(icon.content).toBe('""');
      if (masks.has(kind)) expect(icon.mask).toBe(masks.get(kind));
      masks.set(kind, icon.mask);
    }
    expect(new Set(masks.values()).size).toBe(5);
  }
});

for (const [locale, overview] of [
  ["", "Overview"],
  ["fr/", "Vue d’ensemble"],
]) {
  test(`provider overview icon is accessible and Firecracker is stable (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}reference/firecracker/`);
    const firecracker = page
      .getByRole("link", {
        name: "createFirecrackerSandboxProvider",
        exact: true,
      })
      .filter({ visible: true });
    const family = firecracker.locator("xpath=ancestor::details[1]");
    await expect(family.locator("summary").first()).toContainText("Providers");
    const overviewLink = family.locator("a").first();
    await expect(overviewLink).toHaveText(overview);
    await expect(overviewLink).toHaveAttribute("data-reference-overview", "");
    const overviewIcon = await overviewLink.evaluate((element) => {
      const style = getComputedStyle(element, "::before");
      return { mask: style.maskImage, width: parseFloat(style.width) };
    });
    expect(overviewIcon.mask).toMatch(/^url\(/);
    expect(overviewIcon.width).toBeGreaterThan(0);
    await expect(page.locator("a[data-reference-overview]")).toHaveCount(25);
    for (const name of [
      "createFirecrackerSandboxProvider",
      "FirecrackerOptions",
    ]) {
      const link = family.getByRole("link", { name, exact: true });
      await expect(link).toHaveCount(1);
      await expect(link).not.toHaveAttribute("data-api-status", "experimental");
    }
    await family.getByRole("link", { name: overview, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}reference/overview/providers/$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `Providers — ${overview}`,
    );
  });
}

for (const locale of ["", "fr/"]) {
  for (const name of [
    "firecracker",
    "firecrackeroptions",
    "openaicompatible",
    "openaicompatibleoptions",
    "modelprovider",
    "modelrequest",
    "modelresult",
    "anthropicmodelprovider",
    "anthropicmodelprovideroptions",
  ]) {
    test(`stable reference has no experimental warning (${locale}${name})`, async ({
      page,
    }) => {
      await page.goto(`${locale}reference/${name}/`);
      await expect(
        page.locator(
          ".sl-markdown-content .bay-say > .starlight-aside--caution",
        ),
      ).toHaveCount(0);
    });
  }
}

for (const locale of ["", "fr/"]) {
  test(`direct model reference icons are accessible (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}reference/openaicompatible/`);
    const factory = page
      .getByRole("link", {
        name: "createOpenAIModelProvider",
        exact: true,
      })
      .filter({ visible: true });
    const family = factory.locator("xpath=ancestor::details[1]");
    await expect(family.locator("summary").first()).toContainText("Models");
    for (const name of [
      "createOpenAIModelProvider",
      "OpenAIModelProviderOptions",
      "ModelProvider",
      "ModelRequest",
      "ModelResult",
      "createAnthropicModelProvider",
      "AnthropicModelProviderOptions",
    ]) {
      const link = family.getByRole("link", { name, exact: true });
      await expect(link).toHaveCount(1);
      await expect(link).not.toHaveAttribute("data-api-status", "experimental");
    }
  });
}

for (const locale of ["", "fr/"]) {
  for (const width of [1280, 390]) {
    test(`reference categories stay visible while families collapse (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${locale}reference/firecracker/`);
      if (width < 800)
        await page.getByRole("button", { name: "Menu", exact: true }).click();
      const panel = page.locator(".reference-navigation");
      const headings = panel.locator(".reference-section > h2");
      await expect(headings).toHaveText([
        "Environment",
        "Agents & models",
        "Orchestration",
        "Storage",
        "Operations",
      ]);
      await expect(panel.locator(".reference-section")).toHaveCount(5);
      const labels = panel.locator(
        ".reference-section > ul > li > details > summary .large",
      );
      const names = await labels.allTextContents();
      expect(names).toHaveLength(25);
      expect(names.every((name) => !/\s/.test(name.trim()))).toBe(true);
      expect(names).toEqual([
        "Workspaces",
        "Sandboxes",
        "Providers",
        "Commands",
        "Agents",
        "Harness",
        "Dispatch",
        "Prompts",
        "Conversations",
        "Models",
        "Workflows",
        "Checkpoints",
        "Gates",
        "Artifacts",
        "Queues",
        "Triggers",
        "Speculation",
        "Transports",
        "Reservations",
        "Diagnostics",
        "Observability",
        "Activity",
        "Errors",
        "Retention",
        "Recovery",
      ]);
      const styles = await headings.first().evaluate((heading) => {
        const section = heading.parentElement;
        const label = section.querySelector("summary .large");
        return {
          titleSize: parseFloat(getComputedStyle(heading).fontSize),
          labelSize: parseFloat(getComputedStyle(label).fontSize),
          titleColor: getComputedStyle(heading).color,
          labelColor: getComputedStyle(label).color,
          border: parseFloat(getComputedStyle(heading).borderBottomWidth),
          collapsible: Boolean(heading.closest("details")),
        };
      });
      expect(styles.titleSize).toBeLessThan(styles.labelSize);
      expect(styles.titleColor).not.toBe(styles.labelColor);
      expect(styles.border).toBeGreaterThan(0);
      expect(styles.collapsible).toBe(false);
      const providers = panel
        .locator("summary")
        .filter({ hasText: /^Providers$/ });
      const family = providers.locator("..");
      await expect(family).toHaveAttribute("open", "");
      await providers.focus();
      await page.keyboard.press("Enter");
      await expect(family).not.toHaveAttribute("open");
      await expect(headings.first()).toBeVisible();
      await expect(page.getByRole("tab")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
}

for (const [locale, overview] of [
  ["", "Overview"],
  ["fr/", "Vue d’ensemble"],
]) {
  test(`Harness is a first-level family in Agents & models (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}reference/codexharness/`);
    const preset = page
      .getByRole("link", { name: "createCodexHarness", exact: true })
      .filter({ visible: true });
    const family = preset.locator("xpath=ancestor::details[1]");
    await expect(family.locator("summary").first()).toHaveText("Harness");
    await expect(family.locator("xpath=ancestor::details")).toHaveCount(0);
    const section = family.locator(
      'xpath=ancestor::*[contains(@class,"reference-section")][1]',
    );
    await expect(section.locator("h2")).toHaveText("Agents & models");
    for (const name of [
      "createClaudeHarness",
      "createCodexHarness",
      "createAntigravityHarness",
      "createCopilotHarness",
      "createKimiHarness",
      "AgentAuthentication",
      "AccountCredential",
      "UsageCredential",
    ]) {
      await expect(family.getByRole("link", { name, exact: true })).toHaveCount(
        1,
      );
    }
    for (const name of [
      "createHarness",
      "defineHarnessTool",
      "HarnessToolContext",
      "defineHarnessSubagent",
      "HarnessSubagentOptions",
    ]) {
      const link = family.getByRole("link", { name, exact: true });
      await expect(link).toHaveCount(1);
      await expect(link).not.toHaveAttribute("data-api-status", "experimental");
    }
    await family.getByRole("link", { name: overview, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}reference/overview/harness/$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `Harness — ${overview}`,
    );
  });
}

for (const locale of ["", "fr/"]) {
  test(`pages lay code and contracts beside their prose (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${locale}guide/first-request/`);
    const split = page.locator('.bay[data-bay="split"]').first();
    await expect(split.locator(".bay-show pre").first()).toBeVisible();
    const say = await split.locator(".bay-say").boundingBox();
    const show = await split.locator(".bay-show").boundingBox();
    expect(show.x).toBeGreaterThanOrEqual(say.x + say.width - 1);
    await page.goto(`${locale}reference/dispatch/`);
    await expect(page.locator(".title-show")).toContainText(
      'import { dispatch } from "@elie-laloum/outpost"',
    );
    await expect(page.locator(".prop")).toHaveCount(34);
    await expect(
      page.locator(".prop").first().locator(".prop-presence"),
    ).toHaveAttribute("data-required", "");
    const pin = page.locator('.bay[data-role="contract"] .bay-pin');
    await expect(pin).toHaveAttribute("data-pinned", "");
    await page.mouse.wheel(0, 1600);
    await expect
      .poll(async () => (await pin.boundingBox()).y)
      .toBeLessThan(200);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
