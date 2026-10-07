Fix `slug.ts` so all tests in `slug.test.ts` pass.

Use an explicit loop over the characters to skip leading and trailing spaces
and collapse runs of spaces into a single hyphen. Do not use regular expressions.
Keep lowercase output.
Change only `slug.ts`; do not modify the tests or package manifest.

Run `node --test slug.test.ts`, then commit the fix.

End your final answer with <outpost>done</outpost>.
