import { chapters } from "../scripts/navigation.mjs";
import { readFile, readdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";

for (const locale of ["", "fr/"]) {
  test(`mobile canvas keeps steps and loop conditions readable (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${locale}guide/development-workflow/`);
    const canvas = page.locator("[data-canvas]").first();
    await expect(canvas).toHaveAttribute("data-ready", "");
    await expect(canvas.locator(".canvas-controls")).toBeHidden();
    await expect(canvas.locator(".canvas-out").first()).toBeVisible();
    const layout = await canvas.evaluate((element) => {
      const world = element.querySelector(".canvas-world");
      const frame = element
        .querySelector(".canvas-viewport")
        .getBoundingClientRect();
      const scale = new DOMMatrixReadOnly(getComputedStyle(world).transform).a;
      return [...element.querySelectorAll(".canvas-node-text")].map((node) => ({
        font: parseFloat(getComputedStyle(node).fontSize) * scale,
        fits: node.getBoundingClientRect().right <= frame.right + 1,
      }));
    });
    expect(layout.length).toBeGreaterThan(3);
    expect(layout.every(({ font, fits }) => font >= 14 && fits)).toBe(true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(canvas.locator(".canvas-controls")).toBeVisible();
    await expect(canvas.locator(".canvas-scale")).toHaveText("100 %");
    const scale = await canvas.locator(".canvas-scale").textContent();
    await canvas.locator('[data-zoom="in"]').click();
    await expect(canvas.locator(".canvas-scale")).not.toHaveText(scale);
  });
}
import { referenceSidebar } from "../scripts/reference-navigation.mjs";

const referenceEntry = `${referenceSidebar[0].slug}/`;

for (const locale of ["", "fr/"]) {
  for (const width of [320, 800, 1440]) {
    test(`space buttons keep their size while fonts load and the active space changes (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      let releaseFonts;
      let fonts = new Promise((resolve) => {
        releaseFonts = resolve;
      });
      await page.route(/\.woff2?(?:\?|$)/, async (route) => {
        await fonts;
        await route.continue();
      });
      const buttons = page.locator(".docs-header .spaces a");
      const measure = () =>
        buttons.evaluateAll((links) =>
          links.map((link) => {
            const { x, width, height } = link.getBoundingClientRect();
            return { x, width, height };
          }),
        );
      const expectStable = (actual, expected) => {
        expect(actual).toHaveLength(2);
        expect(expected).toHaveLength(2);
        for (let index = 0; index < actual.length; index++) {
          for (const dimension of ["x", "width", "height"]) {
            expect(
              Math.abs(actual[index][dimension] - expected[index][dimension]),
            ).toBeLessThan(0.25);
          }
        }
      };
      const loadFonts = async () => {
        releaseFonts();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise(requestAnimationFrame);
        });
      };
      try {
        await page.goto(`${locale}guide/introduction/`, {
          waitUntil: "domcontentloaded",
        });
        let previous;
        for (const destination of ["API", "Guide"]) {
          await expect
            .poll(() => page.evaluate(() => document.fonts.status))
            .toBe("loading");
          const before = await measure();
          expect(Math.abs(before[0].width - before[1].width)).toBeLessThan(
            0.25,
          );
          await expect(buttons.locator("svg")).toHaveCount(before.length);
          const brand = await page
            .locator(".docs-header .docs-brand")
            .boundingBox();
          expect(Math.abs(brand.width - brand.height)).toBeLessThan(0.25);
          await expect(
            page.locator(".docs-header .docs-brand .name"),
          ).toHaveCount(0);
          if (previous) expectStable(before, previous);
          await loadFonts();
          const after = await measure();
          expectStable(after, before);
          previous = after;
          fonts = new Promise((resolve) => {
            releaseFonts = resolve;
          });
          const path =
            destination === "API" ? referenceEntry : "guide/introduction/";
          await Promise.all([
            page.waitForURL(new RegExp(`/${locale}${path}$`), {
              waitUntil: "domcontentloaded",
            }),
            page
              .locator(".docs-header .spaces")
              .getByRole("link", { name: destination, exact: true })
              .click({ noWaitAfter: true }),
          ]);
        }
        expectStable(await measure(), previous);
        await loadFonts();
        expectStable(await measure(), previous);
      } finally {
        releaseFonts();
        await page.unrouteAll({ behavior: "ignoreErrors" });
      }
    });
  }
}

for (const [locale, title, reference] of [
  ["", "Your first task", "API"],
  ["fr/", "Votre première tâche", "API"],
]) {
  test(`guide navigation opens the API space (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}guide/first-request/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator(".docs-navigation summary h2")).toHaveCount(
      chapters.length,
    );
    await expect(page.locator(".docs-navigation details[open]")).toHaveCount(1);
    const spacing = await page
      .locator(".docs-navigation")
      .evaluate((navigation) => {
        const sections = [...navigation.querySelectorAll(":scope > section")];
        const gaps = sections
          .slice(1)
          .map(
            (section, index) =>
              section.getBoundingClientRect().top -
              sections[index].getBoundingClientRect().bottom,
          );
        const links = [...navigation.querySelectorAll("details[open] a")];
        return {
          groupGap: Math.max(...gaps),
          linkGap: Math.max(
            ...links
              .slice(1)
              .map(
                (link, index) =>
                  link.getBoundingClientRect().top -
                  links[index].getBoundingClientRect().bottom,
              ),
          ),
        };
      });
    expect(spacing.groupGap).toBeLessThanOrEqual(8);
    expect(spacing.linkGap).toBeLessThanOrEqual(2);
    const agents = page.locator(".docs-navigation details").filter({
      has: page.getByRole("heading", { name: "Agents", exact: true }),
    });
    await agents.locator("summary").click();
    await expect(agents.getByRole("link", { name: /Codex/ })).toBeVisible();
    await expect(page.locator(".sl-markdown-content details")).toHaveCount(0);
    const spaces = page.locator(".docs-header nav");
    await spaces.getByRole("link", { name: reference, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}${referenceEntry}$`));
    await expect(
      spaces.getByRole("link", { name: reference, exact: true }),
    ).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      referenceSidebar[0].label,
    );
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
  ["", "Your agents.", "Try it on your project", "Copy the install command"],
  [
    "fr/",
    "Vos agents.",
    "Essayer sur mon projet",
    "Copier la commande d’installation",
  ],
]) {
  test(`home explains a task with working examples, a canvas and useful links (${locale || "en"})`, async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      window.homeRenderErrors = [];
      window.addEventListener("error", (event) => {
        window.homeRenderErrors.push(event.message);
      });
    });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(locale);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
    await expect(page.locator(".docs-header .brand")).toHaveAttribute(
      "href",
      `/outpost/${locale}`,
    );
    const hero = page.locator(".landing .hero");
    const story = page.locator(".landing .story");
    await expect(story.locator("ol a")).toHaveCount(4);
    await expect(story.locator(".step-icon svg")).toHaveCount(4);
    await expect(story.locator(".story-link")).toHaveAttribute(
      "href",
      `/outpost/${locale}guide/first-workflow/`,
    );
    await expect(page.locator(".landing .overview a")).toHaveCount(3);
    await expect(
      page.locator(".landing .overview a > svg:first-child"),
    ).toHaveCount(3);
    const install = hero.locator("outpost-install");
    await expect(install.getByRole("tab")).toHaveCount(4);
    await install.getByRole("button", { name: copied }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "npm install @elie-laloum/outpost",
    );
    await install.getByRole("tab", { name: "pnpm" }).click();
    await install.getByRole("button", { name: copied }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "pnpm add @elie-laloum/outpost",
    );
    await install.getByRole("tab", { name: "pnpm" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(install.getByRole("tab", { name: "bun" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const tabs = page.locator(".home-content .code-tabs");
    await expect(tabs.locator(".code-tab")).toHaveText([
      "outpost.config.ts",
      "task.ts",
    ]);
    await expect(tabs.locator(".code-tab-panel").first()).toContainText(
      'authentication: "account"',
    );
    await tabs.locator(".code-tab").last().click();
    await expect(tabs.locator(".code-tab-panel").last()).toBeVisible();
    await expect(tabs.locator(".code-tab-panel").last()).toContainText(
      "dispatch({",
    );
    expect(
      await page
        .locator(".home-content pre code")
        .evaluateAll((blocks) =>
          blocks.every(
            (block) => block.textContent.trimEnd().split("\n").length <= 20,
          ),
        ),
    ).toBe(true);
    const canvas = page.locator(".home-content [data-canvas]");
    await expect(canvas.locator(".canvas-node")).toHaveCount(3);
    const stages = locale
      ? ["Relire le README", "Préparer un résumé", "Examiner le résultat"]
      : ["Review the README", "Prepare a summary", "Inspect the result"];
    await expect(canvas.locator(".canvas-node-title")).toHaveText(stages);
    const edges = await canvas.evaluate((element) =>
      [...element.querySelectorAll(".canvas-node")].flatMap((node) =>
        [...node.querySelectorAll(".canvas-out [data-to]")].map((edge) => ({
          from: node.querySelector(".canvas-node-title").textContent.trim(),
          to: element
            .querySelector(`#${edge.dataset.to} .canvas-node-title`)
            .textContent.trim(),
        })),
      ),
    );
    expect(edges).toEqual([
      { from: stages[0], to: stages[1] },
      { from: stages[1], to: stages[2] },
    ]);
    await canvas.locator('[data-zoom="fit"]').click();
    await expect(canvas.locator(".canvas-link")).toHaveCount(2);
    const scale = await canvas.locator(".canvas-scale").textContent();
    await canvas.locator('[data-zoom="in"]').click();
    await expect(canvas.locator(".canvas-scale")).not.toHaveText(scale);
    const features = page.locator(".home-content a.feature-cell");
    await expect(features).toHaveCount(3);
    await expect(features.locator(".feature-icon svg")).toHaveCount(3);
    await expect(features.first()).toHaveAttribute(
      "href",
      "guide/verification-loops/",
    );
    const capabilities = page.locator(".capabilities");
    await expect(capabilities.getByRole("heading", { level: 2 })).toHaveText(
      locale
        ? "Ce que vous pouvez construire avec Outpost"
        : "What you can build with Outpost",
    );
    await expect(capabilities.locator("a.capability")).toHaveCount(3);
    await expect(
      capabilities.locator("a.capability > svg:first-child"),
    ).toHaveCount(3);
    await expect(capabilities.locator("h3")).toHaveCount(3);
    await expect(capabilities.locator("a.capability").first()).toHaveAttribute(
      "href",
      `/outpost/${locale}guide/choose-an-agent/`,
    );
    expect(await page.evaluate(() => window.homeRenderErrors)).toEqual([]);
    await story.locator(".story-link").click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}guide/first-workflow/$`),
    );
    await page.goBack();
    await hero.getByRole("link", { name: start, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}guide/setup/$`));
  });

  for (const width of [320, 390, 800, 1440, 2560]) {
    test(`home remains readable and its features fit the grid (${locale || "en"}, ${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(locale);
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (value) => (document.documentElement.dataset.theme = value),
          theme,
        );
        const dimensions = await page.evaluate(() => {
          const content = document
            .querySelector(".rail")
            .getBoundingClientRect();
          const capabilities = [
            ...document.querySelectorAll(".capability-grid li"),
          ].map((link) => {
            const box = link.getBoundingClientRect();
            return {
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom,
              width: box.width,
            };
          });
          return {
            hero: document.querySelector(".hero").getBoundingClientRect()
              .height,
            storyTop:
              document.querySelector(".story").getBoundingClientRect().top +
              window.scrollY,
            content: { left: content.left, right: content.right },
            searchLeft: document
              .querySelector(".docs-search")
              .getBoundingClientRect().left,
            capabilities,
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            storyPadding: parseFloat(
              getComputedStyle(document.querySelector(".story")).paddingLeft,
            ),
            cards: [...document.querySelectorAll(".overview a")].map((card) => {
              const box = card.getBoundingClientRect();
              return {
                left: box.left,
                right: box.right,
                top: box.top,
                bottom: box.bottom,
              };
            }),
          };
        });
        expect(dimensions.overflow).toBe(false);
        if (width === 2560)
          expect(
            Math.abs(dimensions.searchLeft - dimensions.content.left),
          ).toBeLessThanOrEqual(1);
        expect(Math.abs(dimensions.hero - 900)).toBeLessThanOrEqual(1);
        expect(
          Math.abs(dimensions.storyTop - dimensions.hero),
        ).toBeLessThanOrEqual(1);
        expect(dimensions.storyPadding).toBeGreaterThanOrEqual(16);
        for (const card of dimensions.cards) {
          expect(card.left).toBeGreaterThanOrEqual(dimensions.content.left);
          expect(card.right).toBeLessThanOrEqual(dimensions.content.right);
        }
        if (width <= 560) {
          for (let index = 1; index < dimensions.cards.length; index++) {
            expect(dimensions.cards[index].top).toBeGreaterThanOrEqual(
              dimensions.cards[index - 1].bottom,
            );
          }
        }
        if (width >= 800) {
          for (const card of dimensions.cards) {
            expect(
              Math.abs(card.top - dimensions.cards[0].top),
            ).toBeLessThanOrEqual(1);
          }
        }
        expect(dimensions.capabilities).toHaveLength(3);
        const columns = width <= 560 ? 1 : width <= 896 ? 2 : 3;
        for (const [index, card] of dimensions.capabilities.entries()) {
          expect(card.left).toBeGreaterThanOrEqual(dimensions.content.left);
          expect(card.right).toBeLessThanOrEqual(dimensions.content.right);
          expect(
            Math.abs(card.width - dimensions.capabilities[0].width),
          ).toBeLessThanOrEqual(1);
          if (index < columns) {
            expect(
              Math.abs(card.top - dimensions.capabilities[0].top),
            ).toBeLessThanOrEqual(1);
          }
          if (index >= columns) {
            expect(card.top).toBeGreaterThanOrEqual(
              dimensions.capabilities[index - columns].bottom,
            );
          }
        }
        const row = page
          .locator(".home-content .bay-row[data-bay=split]")
          .first();
        const say = await row.locator(".bay-say").boundingBox();
        const code = await row.locator(".code-tabs").boundingBox();
        if (width > 1024)
          expect(code.x).toBeGreaterThanOrEqual(say.x + say.width - 1);
        if (width <= 1024)
          expect(code.y).toBeGreaterThanOrEqual(say.y + say.height - 1);
      }
      await page.locator("a.capability").first().click();
      await expect(page).toHaveURL(
        new RegExp(`/${locale}guide/choose-an-agent/$`),
      );
    });
  }
}

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
  await expect(primary).toHaveText(/Try it on your project/);
  const colors = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.color, style.backgroundColor];
  });
  expect(colors[0]).not.toBe(colors[1]);
  const code = await page
    .locator(".landing outpost-install code:not([hidden])")
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
    [
      "GitLab",
      "https://gitlab.elielaloum.com/elielaloum/outpost",
      "rgb(252, 109, 38)",
    ],
    [
      "GitHub mirror",
      "https://github.com/elie-laloum/outpost",
      "rgb(130, 80, 223)",
    ],
    [
      "npm",
      "https://www.npmjs.com/package/@elie-laloum/outpost",
      "rgb(203, 56, 55)",
    ],
  ];
  // The repository is the adoption action, so it is reachable from the landing too.
  for (const route of ["", "reference/dispatch/"]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const [name, href, color] of sources) {
      const link = page
        .locator(".docs-header")
        .getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      await link.hover();
      await expect(link).toHaveCSS("color", color);
    }
  }
  const header = page.locator(".docs-header");
  await expect(header.locator(".brand")).toHaveAccessibleName("Outpost");
  const version = header.locator(".version");
  await expect(version).toHaveText(`v${manifest.version}`);
  await version.click();
  await expect(page).toHaveURL(/\/project\/changelog\/$/);
  const navigation = await header.locator(".spaces").boundingBox();
  const pane = await page.locator(".docs-pane").boundingBox();
  expect(Math.round(navigation.x + navigation.width)).toBe(Math.round(pane.x));
});

for (const locale of ["", "fr/"]) {
  for (const width of [320, 800, 1440]) {
    test(`version is the only changelog entry point and the roadmap is retired (${locale || "en"}, ${width}px)`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "",
        "guide/first-request/",
        "reference/dispatch/",
        "project/changelog/",
      ]) {
        await page.goto(`${locale}${route}`);
        await expect(page.locator(".docs-header .spaces a")).toHaveText([
          "Guide",
          "API",
        ]);
        const links = page.locator(
          'a[href$="/project/changelog/"]:not(.language)',
        );
        await expect(links).toHaveCount(1);
        await expect(page.locator(".docs-header .version")).toBeVisible();
        await expect(links).toHaveAttribute(
          "href",
          `/outpost/${locale}project/changelog/`,
        );
        await expect(page.locator('a[href*="/project/roadmap/"]')).toHaveCount(
          0,
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
      await page.goto(locale);
      const version = page.locator(".docs-header .version");
      const button = await version.boundingBox();
      const cell = await page.locator(".docs-header .release").boundingBox();
      expect(Math.abs(button.height - cell.height)).toBeLessThan(2);
      expect(Math.abs(button.width - cell.width)).toBeLessThan(2);
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (value) => (document.documentElement.dataset.theme = value),
          theme,
        );
        await page.mouse.move(0, 0);
        const initial = await version.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        );
        await page.mouse.move(button.x + button.width / 2, button.y + 2);
        expect(
          await version.evaluate((element) => element.matches(":hover")),
        ).toBe(true);
        await expect
          .poll(() =>
            version.evaluate(
              (element) => getComputedStyle(element).backgroundColor,
            ),
          )
          .not.toBe(initial);
      }
      await page.locator(".docs-header .version").click();
      await expect(page).toHaveURL(new RegExp(`/${locale}project/changelog/$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale ? "Historique des versions" : "Changelog",
      );
      await expect(page.locator(".crumbs")).not.toContainText(
        locale ? "Projet" : "Project",
      );
      await expect(page.locator(".docs-footer .pager")).toHaveCount(0);
      await expect(page.locator("[data-pagefind-body]")).toHaveCount(0);
      const removed = await request.get(`${locale}project/roadmap/`);
      expect(removed.status()).toBe(404);
    });
  }
}

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
  const code = page
    .locator("pre")
    .filter({ hasText: "const result = await dispatch({" });
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
    const setup = page.locator('.docs-navigation a[href$="/guide/setup/"]');
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
    await expect(page).toHaveURL(new RegExp(`/${locale}${referenceEntry}$`));
    await expect(page.locator(".reference-map")).toHaveCount(0);
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

for (const locale of ["", "fr/"]) {
  test(`reference entry opens the first API symbol and retired overviews redirect (${locale || "en"})`, async ({
    page,
  }) => {
    await page.goto(`${locale}reference/`);
    await expect(page).toHaveURL(new RegExp(`/${locale}${referenceEntry}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      referenceSidebar[0].label,
    );
    await expect(
      page.locator(".docs-navigation a[aria-current=page]"),
    ).toHaveText(referenceSidebar[0].label);
    await expect(page.locator(".reference-map")).toHaveCount(0);
    await page.goto(`${locale}reference/overview/providers/`);
    await expect(page).toHaveURL(
      new RegExp(`/${locale}guide/choose-a-sandbox/$`),
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
        families.flatMap((family) => family.items).length,
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
        "guide/working-with-files/",
        "guide/harness-hooks/",
        "guide/host-process/",
        "reference/speculate/",
        "guide/speculation/",
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
    await article
      .getByRole("link", { name: "DispatchResult", exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}reference/dispatchresult/$`),
    );
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
        !(file === "index.html" || file.endsWith("/index.html")) ||
        file.startsWith("fr/") !== Boolean(locale)
      )
        continue;
      const html = await readFile(new URL(file, root), "utf8");
      if (!html.includes('class="starlight-aside ')) continue;
      await page.goto(file.replace(/index\.html$/, ""));
      const results = await page.evaluate(() => {
        const frame = document
          .querySelector(".docs-pane, .landing .home-content")
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
    await expect(page.locator(".prop")).toHaveCount(116);
    for (const name of ["options.prices", "options.redact", "options.watchdog"])
      await expect(
        page.locator(".prop-name").filter({ hasText: name }),
      ).toHaveCount(3);
    const guard = page.locator(".prop").filter({
      has: page.locator(".prop-name").filter({ hasText: "options.guard" }),
    });
    await expect(guard).toHaveCount(2);
    await expect(guard.nth(0).locator(".prop-type")).toHaveText("undefined");
    await expect(guard.nth(1).locator(".prop-type")).toContainText("DiffGuard");
    await expect(
      page.locator(".prop").first().locator(".prop-presence"),
    ).toHaveAttribute("data-required", "");
    const pin = page.locator('.bay[data-role="contract"] .bay-pin').first();
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
    await expect(page).toHaveURL(
      new RegExp(`/${locale}guide/sandbox-sessions/$`),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/how-it-works/`);
    await expect(page.locator(".sl-markdown-content table")).toHaveCount(0);
    await expect(page.locator(".sl-markdown-content pre")).toHaveCount(0);
    await expect(page.locator("[data-canvas] .canvas-node")).toHaveCount(5);
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
      const scrolling = await strip.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          horizontal: element.scrollWidth > element.clientWidth,
          vertical: element.scrollHeight > element.clientHeight,
          overflowY: style.overflowY,
          scrollbarWidth: style.scrollbarWidth,
        };
      });
      expect(scrolling).toEqual({
        horizontal: true,
        vertical: false,
        overflowY: "hidden",
        scrollbarWidth: "none",
      });
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

  test(`verification diagrams show accepted, exhausted and correction paths (${locale || "en"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale}guide/verification-loops/`);
    const canvas = page.locator("[data-canvas]").first();
    await expect(page.locator(".flow")).toHaveCount(0);
    await expect(canvas.locator(".canvas-node")).toHaveCount(4);
    await expect(canvas.locator(".canvas-link")).toHaveCount(4);
    const edges = await canvas.evaluate((element) =>
      [...element.querySelectorAll(".canvas-node")].flatMap((node) =>
        [...node.querySelectorAll(".canvas-out [data-to]")].map((edge) => ({
          from: node.querySelector(".canvas-node-title").textContent.trim(),
          to: element
            .querySelector(`#${edge.dataset.to} .canvas-node-title`)
            .textContent.trim(),
          condition: edge.textContent.trim(),
        })),
      ),
    );
    const [attempt, check, result, failure] = locale
      ? ["Tentative", "Contrôle", "Résultat", "Échec"]
      : ["Attempt", "Check", "Result", "Failure"];
    expect(edges.map(({ from, to }) => [from, to])).toEqual([
      [attempt, check],
      [check, attempt],
      [check, result],
      [check, failure],
    ]);
    expect(
      edges.every(({ condition }) => !["then", "puis"].includes(condition)),
    ).toBe(true);
    await expect(canvas).toContainText("LoopTaskExhausted");
    await expect(canvas.locator(".canvas-controls")).toBeHidden();
    await expect(canvas.locator(".canvas-out").first()).toBeVisible();
    await page.goto(`${locale}guide/first-workflow/`);
    const tabs = page.locator(".code-tabs").first();
    await expect(tabs.locator(".code-tab")).toHaveCount(3);
    await tabs.locator(".code-tab").last().click();
    await expect(tabs.locator(".code-tab-panel").last()).toBeVisible();
    await expect(tabs.locator(".code-tab-panel").last()).toContainText(
      '"./review-task.ts"',
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
    await expect(canvas.locator(".canvas-branch")).toHaveCount(0);
    await expect(canvas.locator(".canvas-label")).toHaveCount(4);
    await expect(canvas.locator(".canvas-link")).toHaveCount(4);
    await expect(canvas.locator(".canvas-out").first()).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(canvas.locator(".canvas-controls")).toBeVisible();
    const world = canvas.locator(".canvas-world");
    const before = await world.getAttribute("style");
    await canvas.locator('[data-zoom="in"]').click();
    await expect(world).not.toHaveAttribute("style", before ?? "");
    const zoomed = await canvas.locator(".canvas-scale").textContent();
    await canvas.locator('[data-zoom="fit"]').click();
    await expect(canvas.locator(".canvas-scale")).not.toHaveText(zoomed);
    await page.setViewportSize({ width: 390, height: 844 });
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
