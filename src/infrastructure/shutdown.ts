const cleaners = new Map<() => unknown, (() => void) | undefined>();
let installed = false,
  closing = false;

function uninstall(): void {
  process.removeListener("SIGINT", onInterrupt);
  process.removeListener("SIGTERM", onTerminate);
  process.removeListener("exit", onExit);
  installed = false;
}

async function shutdown(signal?: NodeJS.Signals): Promise<void> {
  if (closing) return;
  closing = true;
  for (const clean of [...cleaners.keys()].reverse()) {
    if (!cleaners.has(clean)) continue;
    cleaners.delete(clean);
    try {
      await clean();
    } catch {
      /* Cleanup must continue for remaining resources. */
    }
  }
  uninstall();
  if (signal) process.exitCode = signal === "SIGINT" ? 130 : 143;
  closing = false;
}

const onInterrupt = () => {
  void shutdown("SIGINT");
};
const onTerminate = () => {
  void shutdown("SIGTERM");
};
const onExit = () => {
  for (const [clean, immediate] of [...cleaners.entries()].reverse()) {
    if (!cleaners.has(clean)) continue;
    cleaners.delete(clean);
    try {
      if (immediate) immediate();
      else void Promise.resolve(clean()).catch(() => undefined);
    } catch {
      /* An exit callback must not hide the original exit status. */
    }
  }
  uninstall();
};

export function registerCleanup(
  clean: () => unknown,
  immediate?: () => void,
): () => void {
  cleaners.set(clean, immediate);
  if (!installed) {
    installed = true;
    process.on("SIGINT", onInterrupt);
    process.on("SIGTERM", onTerminate);
    process.on("exit", onExit);
  }
  return () => {
    cleaners.delete(clean);
    if (installed && !cleaners.size) {
      uninstall();
    }
  };
}
