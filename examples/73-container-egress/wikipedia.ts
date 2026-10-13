import { defineHarnessTool } from "@elie-laloum/outpost";

export const wikipedia = defineHarnessTool({
  name: "read_wikipedia",
  description: "Read the French Wikipedia introduction about Abraham Lincoln.",
  readOnly: true,
  input: { type: "object", properties: {}, additionalProperties: false },
  async execute(_input, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "node",
      arguments: [
        "-e",
        `
        (async () => {
          const url = new URL('https://fr.wikipedia.org/w/api.php');
          url.search = new URLSearchParams({
            action: 'query', prop: 'extracts', titles: 'Abraham_Lincoln',
            exintro: '1', explaintext: '1', exchars: '1200',
            format: 'json', formatversion: '2',
          });
          const response = await fetch(url, {
            headers: { 'User-Agent': 'OutpostEgressExample/1.0 (https://github.com/elie-laloum/outpost)' },
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error('Wikipedia HTTP ' + response.status);
          const data = await response.json();
          const extract = data.query?.pages?.[0]?.extract;
          if (typeof extract !== 'string' || !extract.trim())
            throw new Error('Wikipedia returned no article extract');
          console.log('Source: https://fr.wikipedia.org/wiki/Abraham_Lincoln');
          console.log(extract);
        })().catch(error => { console.error(error.message); process.exitCode = 1; });
        `,
      ],
      deadlineMs: 15_000,
      signal,
    });
    if (result.status !== 0)
      return {
        content: result.stderr || "Wikipedia request failed",
        isError: true,
      };
    return result.stdout;
  },
});
