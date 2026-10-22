import assert from "node:assert/strict";
import { test } from "node:test";
import { planFileWorkspace } from "../../src/application/recipes/execution-plan.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import { createDockerSandboxProvider } from "../../src/providers/docker.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { createPodmanSandboxProvider } from "../../src/providers/podman.ts";
import { nativeSandboxCapabilities } from "../../src/providers/sandbox-capabilities.ts";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";

test("static sandbox capabilities match the providers they describe", () => {
  for (const [type, options, provider] of [
    ["local", {}, createLocalSandboxProvider()],
    ["docker", {}, createDockerSandboxProvider({ image: "fixture" })],
    [
      "docker",
      { repositoryMode: "isolated" },
      createDockerSandboxProvider({
        image: "fixture",
        repositoryMode: "isolated",
      }),
    ],
    ["podman", {}, createPodmanSandboxProvider({ image: "fixture" })],
    ["vercel", {}, createVercelSandboxProvider({})],
    ["daytona", {}, createDaytonaSandboxProvider({})],
  ] as const) {
    const capabilities = nativeSandboxCapabilities(type, options);
    assert.equal(capabilities?.placement, provider.placement, type);
    assert.deepEqual(
      capabilities?.bindings,
      provider.workspaces?.bindings,
      type,
    );
  }
  assert.equal(nativeSandboxCapabilities("extension", {}), undefined);
  assert.equal(nativeSandboxCapabilities("toString", {}), undefined);
});

test("file workspace plans report bindings and refuse undemonstrated ones before allocation", () => {
  const mount = {
    kind: "directory",
    directory: "/source",
    access: { mode: "mount", target: "/work", readOnly: true },
  } as const;
  assert.deepEqual(
    planFileWorkspace({ kind: "ephemeral" }, { provider: "local" }),
    {
      binding: "ephemeral",
      sandbox: {
        provider: "local",
        placement: "host",
        bindings: ["copy", "ephemeral"],
      },
      diagnostics: [],
    },
  );
  assert.deepEqual(
    planFileWorkspace(mount, { provider: "vercel" }).diagnostics,
    [
      {
        code: "unsupported-binding",
        path: ["sandbox"],
        message: "Sandbox provider cannot mount workspace sources",
        hint: "vercel supports copy, ephemeral; change workspace.access or the sandbox provider.",
      },
    ],
  );
  assert.deepEqual(
    planFileWorkspace(mount, { provider: "docker", image: "fixture" })
      .diagnostics,
    [],
  );
  assert.deepEqual(
    planFileWorkspace(mount, {
      provider: "podman",
      image: "fixture",
      repositoryMode: "isolated",
    }).diagnostics.map((diagnostic) => diagnostic.message),
    ["Sandbox provider cannot mount workspace sources"],
  );
  assert.deepEqual(
    planFileWorkspace(
      { kind: "ephemeral" },
      { type: "docker" },
    ).diagnostics.map((diagnostic) => [
      diagnostic.code,
      diagnostic.path,
      diagnostic.message,
    ]),
    [
      [
        "missing-field",
        ["sandbox", "image"],
        "File workspaces require an explicit container image",
      ],
    ],
  );
  const extension = planFileWorkspace(mount, {
    $ref: "extensions.sandbox",
  });
  assert.deepEqual(extension.diagnostics, []);
  assert.equal(extension.binding, "mount-readonly");
  assert.equal(extension.sandbox.provider, "extensions.sandbox");
  assert.equal(extension.sandbox.bindings, undefined);
});
