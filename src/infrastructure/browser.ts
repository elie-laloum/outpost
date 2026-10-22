import { spawn } from "node:child_process";
import { browserLaunchers } from "./browser.constants.ts";

/** Opens a URL in the default browser when one can be launched; failures are silent. */
export function openBrowser(url: string): void {
  const candidates =
    browserLaunchers[process.platform as keyof typeof browserLaunchers] ??
    browserLaunchers.linux;
  const attempt = (index: number) => {
    const launcher = candidates[index];
    if (!launcher) return;
    const child = spawn(launcher.command, [...launcher.arguments, url], {
      stdio: "ignore",
      detached: true,
      windowsHide: true,
    });
    child.once("error", () => attempt(index + 1));
    child.unref();
  };
  attempt(0);
}
