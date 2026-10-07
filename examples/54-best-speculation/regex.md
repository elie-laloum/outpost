Fix `slug.ts` so all tests in `slug.test.ts` pass.

Use a compact regular expression to collapse runs of spaces, trimming leading
and trailing spaces. Keep lowercase output.
Change only `slug.ts`; do not modify the tests or package manifest.

Run `node --test slug.test.ts`, then commit the fix.

End your final answer with <outpost>done</outpost>.
