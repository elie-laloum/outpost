# Documentation design and validation

The Guide is authored from the public Reference contracts. Its editorial and visual model is [Better Auth](https://better-auth.com/docs): a direct introduction, compact setup, short snippets beside their explanation, then focused concept and integration pages. The former workshop content and organization have been replaced, not retained as a second reading path.

English and French have matching routes. `docs/scripts/navigation.mjs` defines the Guide chapters in reading order, and [guide-style.md](guide-style.md) is the editorial contract for Guide pages: reader, page types, templates, writing rules and what stays out of the Guide. GuideFrame, GuideHeader, GuideTitle and GuideSidebar implement its scoped presentation; Reference retains its existing components, navigation, icons, generated pages and explanatory sources.

## Compatibility

`migration.json` remains the historical inventory of the earlier migration. Its preserved-body hashes describe that historical snapshot, not a requirement to retain the retired Guide text. `guide-redirects.json` maps every subsequently retired Guide route to its new destination. `route-redirects.mjs` resolves both migrations and reference aliases directly to live pages, checks for cycles and preserves locale. No retired guide content is kept in the search index.

## Validation

`docs:check` validates bilingual page parity, navigation coverage, legacy destinations and generated reference consistency. `docs:test` checks rendered links, assets and anchors, compiles all Guide TypeScript snippets against the built package and executes selected offline snippets in temporary directories. Snippets importing `outpost.config.mts` use the actual configuration published on Setup, not a test-only substitute.

`docs:test:container` runs the documented command snippet against the requested Docker or Podman image without model calls. Browser tests cover both languages, navigation, search, code copying, responsive layout, legacy redirects and existing Reference behavior. Live agent, cloud and model calls require their own credentials and are not implied by documentation checks.
