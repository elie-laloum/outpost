Fix `slug.ts` so all tests in `slug.test.ts` pass.

Make the smallest change you can without regular expressions. Split on spaces,
discard empty words, and join them with a single hyphen. Keep lowercase output.
Change only `slug.ts`; do not modify the tests or package manifest.

Run `node --test slug.test.ts`, then commit the fix.

End your final answer with <outpost>done</outpost>.
