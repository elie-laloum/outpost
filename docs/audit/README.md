# Documentation migration audit

The migration inventory is [migration.json](migration.json). It records the baseline commit, every original English/French page and section, its learning destination, its complete detailed contract, source checksums, the three former executable examples, entry documents, and all 237 existing API routes per language. Generated reference pages describe 200 public symbols and 39 supporting contracts; some symbols share a route.

## Conservation and corrections

All 138 original editorial page bodies were compared with their destination. The comparison ignores frontmatter, whitespace, table separator width and link destinations; the rendered-site check validates the migrated links separately. The detailed contracts preserve the original information while the Guide teaches it with independent scenarios. Architecture, roadmaps and changelogs retain their own destinations.

Two factual corrections apply in both languages:

- The CLI already generates Codex API-key login hooks. Adding a second hook is unnecessary; handwritten API configurations still supply one. Evidence: `src/cli/init-authentication.ts`.
- `doctor --agent` also accepts Gemini. Evidence: `src/cli/doctor-command.ts`.

`sourceBodySha256` and `preservedBodySha256` match except for those four corrected pages. `docs:check` verifies the complete normalized bodies of preserved contracts, their sections, navigation destinations and the existing symbol routes. A future intentional change to a preserved contract must update the inventory after reviewing what information changed. The historical source digest remains unchanged. Roadmaps and changelogs continue to evolve from their normal sources.

The former root examples now use public package imports and complete preparation in the cookbook. Their old development-only launch paths are intentionally replaced. The README keeps the package introduction and links to the new learning path; SECURITY.md is unchanged; AGENTS.md records the new durable documentation conventions.

## Structure and reproducibility

- `guide/`: learn, run and observe. Every marked scenario embeds preparation from `docs/snippets/`; Markdown remains the source of the executable code.
- `reference/`: stable generated symbol routes, CLI/configuration/compatibility manuals and complete detailed contracts. Editorial reference sources live in `docs/reference-content/`.
- Legacy guide routes are static GitHub Pages-compatible redirects. A URL with an anchor opens the preserved detailed contract; a URL without an anchor opens the new Guide destination. Homepage anchor aliases remain on the homepage.
- Each demonstration repository contains its own initial Git commit and a deliberately failing whitespace test. Preparation refuses to overwrite an existing repository. Multi-repository recipes explicitly create both repositories.
- Firecracker, signed image publication and restoration of an actual retained remote transfer need the resources described on their pages. They are operational procedures, not claims that arbitrary cloud/hardware state can be prepared in one minute.

## Validation boundaries

`docs:test` assembles and typechecks both languages, executes offline scenarios with assertions, checks rejected approval decisions and fixture authentication configurations, and verifies the demonstration preparation. `docs:test:container` runs the documented sandbox scenarios on the selected real engine. The CI engine matrix covers Docker and Podman.

Local validation uses Node.js 24 and real Docker. Podman is unavailable on this workstation. No paid model calls, authenticated Vercel/Daytona allocations, Firecracker host provisioning or publication were performed. Compilation is not evidence of live agent/provider compatibility; those campaigns retain their own documented prerequisites.

Browser tests use a dedicated production preview and cover Guide/Reference, corresponding languages, search after navigation, keyboard preparation/copy, mobile layout, themes, long signatures and legacy anchors. The Head override keeps Starlight page loading because Celestia 0.3.2's ClientRouter leaves search uninitialized after navigation; it also makes the theme's copy controls keyboard accessible. Theme styling remains native.

No public Outpost API, runtime behavior, package version, release tag or deployment is changed by this migration.
