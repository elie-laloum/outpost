import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./test",
  timeout: 30_000,
  use: { headless: true },
  projects: [
    {
      name: "preview",
      use: { baseURL: "http://127.0.0.1:4327/outpost/" },
    },
    {
      name: "development",
      grep: /home (explains|remains)|version is|space buttons keep/,
      use: { baseURL: "http://127.0.0.1:4326/outpost/" },
    },
  ],
  webServer: [
    {
      command: "bun run preview --host 127.0.0.1 --port 4327 --ignore-lock",
      url: "http://127.0.0.1:4327/outpost/",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "astro dev --host 127.0.0.1 --port 4326 --ignore-lock",
      url: "http://127.0.0.1:4326/outpost/",
      reuseExistingServer: false,
      timeout: 90_000,
    },
  ],
  reporter: "list",
});
