import { readFile, readdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";

for (const [locale, title, reference] of [
  ["", "Your first task", "API"],
  ["fr/", "Votre première tâche", "API"],
]) {
  test(`guide navigation opens the API space (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}guide/first-request/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator(".docs-navigation summary h2")).toHaveCount(12);
    await expect(page.locator(".docs-navigation details[open]")).toHaveCount(1);
    const agents = page.locator(".docs-navigation details").filter({
      has: page.getByRole("heading", { name: "Agents", exact: true }),
    });
    await agents.locator("summary").click();
    await expect(agents.getByRole("link", { name: /Codex/ })).toBeVisible();
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

for (const [locale, heading, start, copied, beat] of [
  [
    "",
    "Run coding agents",
    "Get started",
    "Copy the install command",
    "Resume",
  ],
  [
    "fr/",
    "Exécutez des agents de code",
    "Commencer",
    "Copier la commande d’installation",
    "Reprise",
  ],
]) {
  test(`landing demos and copy work (${locale || "en"})`, async ({
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
    const hero = page.locator(".landing .hero");
    await expect(hero.locator(".hero-excerpt code").first()).toContainText(
      "dispatch({",
    );
    // The ticker repeats its list for the loop; only the first one is announced.
    await expect(
      hero.locator(".hero-evidence ul:not([aria-hidden]) li"),
    ).toHaveCount(4);
    await expect(hero.locator(".hero-evidence ul")).toHaveCount(2);
    const useCases = page.locator(".landing .use-cases a");
    await expect(useCases).toHaveCount(3);
    await expect(useCases.first()).toHaveAttribute(
      "href",
      `/outpost/${locale}guide/fix-failing-ci/`,
    );
    const demo = page.locator("outpost-demo");
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toHaveAttribute("data-state", "playing");
    const toggle = demo.locator("[data-toggle]");
    await toggle.click();
    await expect(demo).toHaveAttribute("data-state", "stopped");
    await expect(demo.locator("button[data-beat]")).toHaveCount(4);
    await demo.getByRole("button", { name: beat, exact: true }).click();
    await expect(
      demo.getByRole("button", { name: beat, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(demo).toHaveAttribute("data-beat", "3");
    await expect(demo.locator(".demo-summary li")).toHaveCount(4);
    // The pains run their own carousel, one bay below the drawing.
    const problem = page.locator(".landing .problem");
    await problem.scrollIntoViewIfNeeded();
    const pager = problem.locator(".pain-pager button");
    await expect(pager).toHaveCount(4);
    await pager.nth(2).click();
    await expect(problem).toHaveAttribute("data-beat", "2");
    await expect(pager.nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(problem.locator('[data-pain="2"]')).toBeVisible();
    await expect(problem.locator('[data-pain="0"]')).toBeHidden();
    // It holds while a reader is on the bay.
    await expect(problem).toHaveAttribute("data-hold", "");
    await page.getByRole("button", { name: copied }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "npm install @elie-laloum/outpost",
    );
    // The copy button follows the selected package manager.
    const install = page.locator(".landing .install");
    await expect(install.getByRole("tab")).toHaveCount(4);
    await install.getByRole("tab", { name: "pnpm" }).click();
    await expect(install.getByRole("tab", { name: "pnpm" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.getByRole("button", { name: copied }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "pnpm add @elie-laloum/outpost",
    );
    await expect(page.locator(".landing .boundary")).toHaveCount(3);
    const verdict = page.locator("outpost-verdict");
    await verdict.scrollIntoViewIfNeeded();
    await expect(verdict.locator(".pane.code")).toContainText(
      "defineJsonResponse({",
    );
    await expect(verdict).toHaveAttribute("data-step", "3", { timeout: 5000 });
    await expect(verdict.locator(".value code")).toContainText(
      "approved: false",
    );
    await hero.getByRole("link", { name: start }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/setup/$`));
  });
}

test("landing comparison stays still with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("");
  const demo = page.locator("outpost-demo");
  await expect(demo.locator("[data-toggle]")).toBeHidden();
  await expect(demo).not.toHaveAttribute("data-state", "playing");
  await demo.getByRole("button", { name: "Order", exact: true }).click();
  await expect(demo).toHaveAttribute("data-drift", "");
  await expect(
    demo.locator('[data-lane="model"] .step').nth(3),
  ).toHaveAttribute("data-note", "early");
  const verdict = page.locator("outpost-verdict");
  await verdict.scrollIntoViewIfNeeded();
  await expect(verdict).toHaveAttribute("data-step", "3");
});

test("language switch retains the new guide page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("guide/first-request/");
  const language = page.locator(".docs-header .language");
  await expect(language).toHaveAttribute("hreflang", "fr");
  await language.click();
  await expect(page).toHaveURL(/\/fr\/guide\/first-request\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Votre première tâche",
  );
  await page.locator(".docs-header .language").click();
  await expect(page).toHaveURL(/\/outpost\/guide\/first-request\/$/);
});

test("documentation section styles leave the landing untouched", async ({
  page,
}) => {
  await page.goto("");
  const primary = page.locator(".landing .hero .button.primary");
  await expect(primary).toHaveText(/Get started/);
  const colors = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.color, style.backgroundColor];
  });
  expect(colors[0]).not.toBe(colors[1]);
  const code = await page
    .locator(".landing .install code:not([hidden])")
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
  const sources = [
    ["GitLab", "https://gitlab.elielaloum.com/elielaloum/outpost"],
    ["GitHub mirror", "https://github.com/elie-laloum/outpost"],
    ["npm", "https://www.npmjs.com/package/@elie-laloum/outpost"],
  ];
  // The repository is the adoption action, so it is reachable from the landing too.
  for (const route of ["", "reference/dispatch/"]) {
    await page.goto(route);
    for (const [name, href] of sources)
      await expect(
        page.locator(".docs-header").getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", href);
  }
  const header = page.locator(".docs-header");
  await expect(header.locator(".brand")).toHaveText("Outpost");
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
    .match(/```ts title="review\.ts"\n([\s\S]*?)```/)[1]
    .trimEnd();
  const code = page.locator("pre").filter({ hasText: "outpost/readme-review" });
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
      .filter({ hasText: /^Installation$/ });
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
  await page.goto("agents/conversations/#continue-a-conversation");
  await expect(page).toHaveURL(
    /\/guide\/conversations\/#continue-a-conversation$/,
  );
  await expect(page.locator("#continue-a-conversation")).toBeVisible();
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
      ["manual/cli", "cli"],
      ["behavior/agents/conversations", "conversations"],
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
  test(`reference map opens family overviews (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}reference/`);
    const sections = page.locator(".reference-map");
    await expect(sections.locator("h2")).toHaveText([
      "Environment",
      "Agents & models",
      "Orchestration",
      "Storage",
      "Operations",
    ]);
    const agents = sections.filter({ hasText: "Agents & models" });
    await expect(
      agents.locator(".family-name").filter({ hasText: /^Harness$/ }),
    ).toHaveCount(1);
    const providers = sections.locator("a.family").filter({
      has: page.locator(".family-name", { hasText: /^Providers$/ }),
    });
    await expect(providers.locator(".family-overview")).toHaveText(overview);
    await providers.click();
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
  for (const width of [1280, 390]) {
    test(`reference sidebar lists every symbol alphabetically (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${locale}reference/firecracker/`);
      if (width < 800)
        await page.getByRole("button", { name: "Menu", exact: true }).click();
      const panel = page.locator(".reference-navigation");
      await expect(panel.locator("h2, details, summary")).toHaveCount(0);
      await expect(
        panel.locator('a[href*="/reference/overview/"]'),
      ).toHaveCount(0);
      const families = JSON.parse(
        await readFile(
          new URL("../reference-content/navigation.json", import.meta.url),
          "utf8",
        ),
      );
      const links = panel.locator(".reference-symbols > li > a[data-api-kind]");
      await expect(links).toHaveCount(
        families.flatMap((family) => family.items.slice(1)).length,
      );
      const names = (await links.allTextContents()).map((name) => name.trim());
      const sorted = [...names].sort(
        (a, b) =>
          a.localeCompare(b, "en", { sensitivity: "base" }) ||
          a.localeCompare(b, "en"),
      );
      expect(names).toEqual(sorted);
      await expect(panel.locator('a[aria-current="page"]')).toHaveText(
        "createFirecrackerSandboxProvider",
      );
      for (const name of [
        "createFirecrackerSandboxProvider",
        "FirecrackerOptions",
        "createOpenAIModelProvider",
        "OpenAIModelProviderOptions",
        "ModelProvider",
        "ModelRequest",
        "ModelResult",
        "createAnthropicModelProvider",
        "AnthropicModelProviderOptions",
        "createHarness",
        "defineHarnessTool",
        "HarnessToolContext",
        "defineHarnessSubagent",
        "HarnessSubagentOptions",
      ]) {
        const link = panel.getByRole("link", { name, exact: true });
        await expect(link).toHaveCount(1);
        await expect(link).not.toHaveAttribute(
          "data-api-status",
          "experimental",
        );
      }
      for (const name of [
        "createClaudeHarness",
        "createCodexHarness",
        "createAntigravityHarness",
        "createCopilotHarness",
        "createKimiHarness",
        "AgentAuthentication",
        "AccountCredential",
        "UsageCredential",
      ])
        await expect(
          panel.getByRole("link", { name, exact: true }),
        ).toHaveCount(1);
      await expect(page.getByRole("tab")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
}

for (const locale of ["", "fr/"]) {
  test(`notices span the content with visible theme colors (${locale || "en"})`, async ({
    page,
  }) => {
    for (const width of [390, 800, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "guide/first-request/",
        "guide/harness-permissions/",
        "guide/host-process/",
        "reference/speculate/",
        "reference/overview/speculation/",
      ]) {
        await page.goto(`${locale}${route}`);
        const article = page.locator(".sl-markdown-content");
        const frame = page.locator(".docs-pane");
        const asides = article.locator(".starlight-aside");
        await expect(asides.first()).toBeVisible();
        for (const theme of ["light", "dark"]) {
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);
          const content = await frame.boundingBox();
          const pane = await article.boundingBox();
          expect(Math.abs(content.width - pane.width)).toBeLessThan(2);
          if (width >= 1920) {
            const rail = await page.locator(".docs-rail").boundingBox();
            expect(content.x + content.width).toBeLessThanOrEqual(rail.x + 2);
          }
          for (const aside of await asides.all()) {
            const notice = await aside.boundingBox();
            expect(Math.abs(notice.x - content.x)).toBeLessThan(2);
            expect(Math.abs(notice.width - content.width)).toBeLessThan(2);
            const colors = await aside.evaluate((element) => {
              const style = getComputedStyle(element);
              return {
                background: style.backgroundColor,
                border: style.borderInlineStartColor,
                borderWidth: style.borderInlineStartWidth,
                page: getComputedStyle(document.body).backgroundColor,
              };
            });
            expect(colors.background).not.toBe(colors.page);
            expect(colors.border).not.toBe(colors.background);
            expect(colors.borderWidth).toBe("4px");
          }
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          ).toBe(true);
        }
      }
    }
    await page.goto(`${locale}guide/first-request/`);
    const article = page.locator(".sl-markdown-content");
    await expect(article.locator("table")).toHaveCount(0);
    await article.getByRole("link", { name: "Usage", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}reference/usage/$`));
    await expect(page.locator(".prop")).not.toHaveCount(0);
  });

  test(`every documentation notice spans the content section (${locale || "en"})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1920, height: 900 });
    const root = new URL("../dist/", import.meta.url);
    let checked = 0;
    for (const file of await readdir(root, { recursive: true })) {
      if (
        !file.endsWith("/index.html") ||
        file.startsWith("fr/") !== Boolean(locale)
      )
        continue;
      const html = await readFile(new URL(file, root), "utf8");
      if (!html.includes('class="starlight-aside ')) continue;
      await page.goto(file.replace(/index\.html$/, ""));
      const results = await page.evaluate(() => {
        const frame = document
          .querySelector(".docs-pane")
          .getBoundingClientRect();
        return [...document.querySelectorAll(".starlight-aside")].map(
          (aside) => {
            const rect = aside.getBoundingClientRect();
            return {
              start: Math.abs(rect.x - frame.x),
              width: Math.abs(rect.width - frame.width),
            };
          },
        );
      });
      expect(results.length, file).toBeGreaterThan(0);
      for (const notice of results) {
        expect(notice.start, file).toBeLessThan(2);
        expect(notice.width, file).toBeLessThan(2);
        checked++;
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        file,
      ).toBe(true);
    }
    expect(checked).toBeGreaterThan(0);
  });

  test(`guide snippets have explanations beside them and above them on mobile (${locale || "en"})`, async ({
    page,
  }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const slug of [
        "speculation",
        "setup",
        "cloud-sandboxes",
        "harness-permissions",
        "harness-context",
        "concurrency-and-retries",
        "cli",
      ]) {
        await page.goto(`${locale}guide/${slug}/`);
        const rows = page.locator(
          '.sl-markdown-content .bay-row[data-bay="split"]',
        );
        expect(await rows.count(), slug).toBeGreaterThan(0);
        for (const row of await rows.all()) {
          const positions = await row.evaluate((element) => {
            const explanation = [
              ...element.querySelectorAll(".bay-say p, .bay-say li"),
            ].find((paragraph) => {
              const text = paragraph.textContent.trim();
              return (
                text && !/^(?:API(?: reference)?|Référence API)\s*:/i.test(text)
              );
            });
            const code = element.querySelector(".bay-show");
            return {
              prose: explanation?.getBoundingClientRect().toJSON(),
              code: code?.getBoundingClientRect().toJSON(),
            };
          });
          expect(positions.prose, slug).toBeDefined();
          expect(positions.code, slug).toBeDefined();
          if (width === 1440)
            expect(positions.prose.right, slug).toBeLessThanOrEqual(
              positions.code.x,
            );
          if (width === 390)
            expect(positions.prose.bottom, slug).toBeLessThanOrEqual(
              positions.code.y,
            );
        }
      }
    }
  });

  test(`pages lay code and contracts beside their prose (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${locale}guide/first-request/`);
    const split = page.locator('.bay[data-bay="split"]').first();
    await expect(split.locator(".bay-show pre").first()).toBeVisible();
    const say = await split.locator(".bay-say").first().boundingBox();
    const show = await split.locator(".bay-show").first().boundingBox();
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

for (const locale of ["", "fr/"]) {
  for (const width of [1440, 390]) {
    test(`guide card icons are visible (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const slug of [
        "introduction",
        "containers",
        "verification-loops",
        "fix-failing-ci",
      ]) {
        await page.goto(`${locale}guide/${slug}/`);
        const cards = page.locator(
          ".feature-cell, .path-cell, .canvas-node-head, .canvas-branch",
        );
        expect(await cards.count()).toBeGreaterThan(0);
        for (const card of await cards.all()) {
          const icon = card.locator("svg.guide-icon");
          await expect(icon).toHaveCount(1);
          await expect(icon).toBeVisible();
          await expect(icon).toHaveAttribute("aria-hidden", "true");
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    });

    test(`footer actions share the full width (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const count of [1, 2, 3, 4]) {
        await page.goto(
          `${locale}guide/${count === 1 ? "introduction" : "containers"}/`,
        );
        const pager = page.locator(".docs-footer .pager");
        await expect(pager.locator("a")).toHaveCount(count === 1 ? 1 : 2);
        if (count > 2) {
          await pager.evaluate((nav, count) => {
            while (nav.children.length < count)
              nav.append(nav.lastElementChild.cloneNode(true));
          }, count);
        }
        const dimensions = await pager.evaluate((nav) => ({
          width: nav.getBoundingClientRect().width,
          actions: [...nav.children].map(
            (action) => action.getBoundingClientRect().width,
          ),
        }));
        expect(dimensions.actions).toHaveLength(count);
        for (const action of dimensions.actions) {
          expect(Math.abs(action - dimensions.width / count)).toBeLessThan(1);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    });
  }

  test(`guide components render as linked cells (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}guide/introduction/`);
    const features = page.locator("ul.features").first();
    await expect(features.locator("a.feature-cell")).toHaveCount(6);
    await expect(features.locator(".feature-icon svg").first()).toBeVisible();
    await expect(page.locator("ol.path a.path-cell")).toHaveCount(3);
    await features.locator("a.feature-cell").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/briefs/$`));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/how-it-works/`);
    await expect(page.locator(".sl-markdown-content table")).toHaveCount(2);
    await expect(page.locator(".sl-markdown-content pre")).toHaveCount(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

for (const locale of ["", "fr/"]) {
  test(`code tabs support native touch scrolling without scripts (${locale || "en"})`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      javaScriptEnabled: false,
    });
    try {
      const page = await context.newPage();
      await page.goto(`${locale}guide/compete-agents/`);
      const tabs = page.locator(".code-tabs").first();
      const strip = tabs.locator(".code-tab-list");
      await strip.scrollIntoViewIfNeeded();
      const bounds = await strip.boundingBox();
      const session = await context.newCDPSession(page);
      const y = bounds.y + 15;
      for (let swipe = 0; swipe < 3; swipe++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: bounds.x + bounds.width - 20, y }],
        });
        for (let step = 1; step <= 10; step++) {
          await session.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
              {
                x:
                  bounds.x +
                  bounds.width -
                  20 -
                  ((bounds.width - 40) * step) / 10,
                y,
              },
            ],
          });
        }
        await session.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      }
      await expect
        .poll(() =>
          strip.evaluate(
            (el) => el.scrollWidth - el.clientWidth - el.scrollLeft,
          ),
        )
        .toBeLessThanOrEqual(1);
      await expect(tabs.locator(".code-tab-panel").first()).toBeVisible();
      const last = await tabs.locator(".code-tab").last().boundingBox();
      expect(last.x).toBeGreaterThanOrEqual(bounds.x);
      expect(last.x + last.width).toBeLessThanOrEqual(
        bounds.x + bounds.width + 1,
      );
      await page.touchscreen.tap(
        last.x + last.width / 2,
        last.y + last.height / 2,
      );
      await expect(tabs.locator(".code-tab-panel").last()).toBeVisible();
    } finally {
      await context.close();
    }
  });

  for (const width of [390, 1440]) {
    test(`all code files remain reachable by scrolling, dragging and keyboard (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${locale}guide/compete-agents/`);
      const tabs = page.locator(".code-tabs").first();
      const strip = tabs.locator(".code-tab-list");
      const labels = tabs.locator(".code-tab");
      const panels = tabs.locator(".code-tab-panel");
      await expect(labels).toHaveCount(5);
      await expect(strip).toHaveAttribute("data-overflow", "");
      await strip.scrollIntoViewIfNeeded();
      const isLastTabInside = () =>
        strip.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const last = element.lastElementChild.getBoundingClientRect();
          return last.left >= bounds.left - 1 && last.right <= bounds.right + 1;
        });
      expect(await isLastTabInside()).toBe(false);
      await strip.hover();
      await page.mouse.wheel(150, 0);
      await expect
        .poll(() => strip.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
      await page.mouse.wheel(0, 3000);
      await expect.poll(isLastTabInside).toBe(true);
      await expect(panels.first()).toBeVisible();
      await labels.last().click();
      await expect(panels.last()).toBeVisible();

      await page.mouse.wheel(0, -3000);
      await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBe(0);
      await labels.first().click();
      const bounds = await strip.boundingBox();
      const y = bounds.y + 15;
      await page.mouse.move(bounds.x + bounds.width - 20, y);
      await page.mouse.down();
      await page.mouse.move(bounds.x + 20, y, { steps: 12 });
      await page.mouse.up();
      await expect
        .poll(() => strip.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(50);
      await expect(panels.first()).toBeVisible();
      await expect(strip).not.toHaveAttribute("data-dragging");
      await page.mouse.wheel(0, 3000);
      await expect.poll(isLastTabInside).toBe(true);
      await labels.last().click();
      await expect(panels.last()).toBeVisible();

      await page.mouse.wheel(0, -3000);
      await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBe(0);
      await labels.first().click();
      const scrollY = await page.evaluate(() => window.scrollY);
      await page.keyboard.press("ArrowLeft");
      await expect(panels.last()).toBeVisible();
      await expect.poll(isLastTabInside).toBe(true);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }

  test(`sequential diagrams retain steps, tags and navigation in a canvas (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/verification-loops/`);
    const canvas = page.locator("[data-canvas]").first();
    await expect(page.locator(".flow")).toHaveCount(0);
    await expect(canvas.locator(".canvas-node")).toHaveCount(3);
    await expect(canvas.locator(".canvas-branch")).toHaveCount(7);
    await expect(canvas.locator(".canvas-out > li")).toHaveCount(2);
    await expect(canvas.locator(".canvas-link")).toHaveCount(5);
    await expect(canvas.locator(".canvas-branch .tags")).toContainText(
      "LoopTaskExhausted",
    );
    await canvas.locator('[data-zoom="fit"]').click();
    await expect(canvas.locator(".canvas-scale")).not.toHaveText("100 %");
    await page.goto(`${locale}guide/first-workflow/`);
    const tabs = page.locator(".code-tabs").first();
    await expect(tabs.locator(".code-tab")).toHaveCount(3);
    await tabs.locator(".code-tab").last().click();
    await expect(tabs.locator(".code-tab-panel").last()).toBeVisible();
    await expect(tabs.locator(".code-tab-panel").last()).toContainText(
      '"./fix-task.ts"',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test(`advanced guides keep diagrams, file lists and code tabs usable (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/fix-failing-ci/`);
    const canvas = page.locator("[data-canvas]");
    await expect(canvas.locator(".canvas-node")).toHaveCount(4);
    await expect(canvas.locator(".canvas-branch")).toHaveCount(4);
    await expect(canvas.locator(".canvas-label")).toHaveCount(5);
    await expect(canvas.locator(".canvas-link")).toHaveCount(6);
    const world = canvas.locator(".canvas-world");
    const before = await world.getAttribute("style");
    await canvas.locator('[data-zoom="in"]').click();
    await expect(world).not.toHaveAttribute("style", before ?? "");
    await canvas.locator('[data-zoom="fit"]').click();
    await expect(canvas.locator(".canvas-scale")).not.toHaveText("100 %");
    await page.goto(`${locale}guide/storage/`);
    await expect(page.locator("ul.files .file")).not.toHaveCount(0);
    await page.goto(`${locale}guide/development-workflow/`);
    const strip = page.locator(".code-tabs").first();
    await expect(strip.locator(".code-tab-panel:visible")).toHaveCount(1);
    await strip.locator(".code-tab").nth(1).click();
    await expect(strip.locator(".code-tab-panel").nth(1)).toBeVisible();
    await expect(strip.locator(".code-tab-panel").first()).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test(`the guide opens the current topic and keeps installation focused on scripts (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}guide/storage/`);
    const group = page.locator(".docs-navigation details").filter({
      has: page.locator('a[aria-current="page"]'),
    });
    await expect(group).toHaveAttribute("open", "");
    await expect(page.locator(".docs-navigation details[open]")).toHaveCount(2);
    await page.goto(`${locale}guide/setup/`);
    const article = page.locator(".sl-markdown-content");
    await expect(article).toContainText("npm install @elie-laloum/outpost");
    await expect(article).toContainText("npm pkg set type=module");
    await expect(article).toContainText(
      "--directory .outpost-image --image outpost:dev",
    );
    await expect(
      article.locator("pre").filter({ hasText: "export const coder" }),
    ).toHaveCount(1);
    await expect(article).not.toContainText("node run.ts");
  });
}
