# Two agents, two Wikipedia access policies

Two independent agents receive the same instruction: consult Wikipedia about Abraham Lincoln and summarize who he was in exactly two French lines. Both use the same model. The first sandbox allows `fr.wikipedia.org`; the second uses `deny-all`. Each agent receives the standard shell tool and writes its own Node.js `fetch` command to consult Wikipedia. If the request fails, it must report the failure in two lines instead of inventing a Wikipedia-backed summary.

Run from this repository with Node.js 24+ and Docker or Podman. Like the other agent examples, this imports `examples/shared/model.ts`, which explicitly loads the root `.env` file. Configure `OPENAPI_URL`, `OPENAPI_KEY`, `OPENAPI_MODEL` and `OPENAPI_REASONING` there for your OpenAI-compatible model service. Running the example makes real model requests and may incur charges.

```sh
bun install --frozen-lockfile
mise exec node -- bun run build
docker pull docker.io/library/node:24-slim
mise exec node -- node examples/73-container-egress/index.ts docker
```

Rebuild after updating the repository: the public package imports load `dist/`. For Podman, use `podman pull` and pass `podman` to the script. The engine automatically downloads the companion image pinned by digest. `OUTPOST_CONTAINER_IMAGE` and `OUTPOST_EGRESS_IMAGE` override the sandbox and companion images; the offline sandbox needs no companion.

`index.ts` owns the two successive runs and prints each shell outcome, its output preview and the final answer. `agent.ts` creates separate agents with the standard `createHarnessShellTools()`, bounded steps and a required shell call before the two-line response. `brief.md` asks each agent to write and execute its own `fetch` command against the [MediaWiki TextExtracts API](https://www.mediawiki.org/wiki/Extension:TextExtracts), using Node.js **inside the borrowed sandbox**. There is no custom Wikipedia tool. The model API stays on the host, so the blocked agent can still explain its failed lookup. Model credentials are not passed to either container.

Expected behavior: the first agent reads the article and returns a two-line biography; the second reports the failed lookup in two lines. The displayed shell status and output show what the command actually did; a successful shell command alone does not prove that Wikipedia was consulted. Wording depends on the model. Wikipedia or DNS outages can also fail the allowed request; the example does not treat every network failure as proof of policy enforcement. Each ephemeral workspace, sandbox and companion is disposed before the next run. No Git repository or agent CLI image is required.

Read the [English network guide](../../docs/src/content/docs/guide/network-restrictions.md), [French network guide](../../docs/src/content/docs/fr/guide/network-restrictions.md) and [image publication procedure](../../images/egress/README.md) for policy semantics and remaining platform-validation limits. Raw TCP/UDP filtering remains covered by `test/container-egress.test.ts`.
