const cleaners = new Set<() => Promise<unknown>>();
let installed = false,
  closing = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (closing) return;
  closing = true;
  await Promise.allSettled([...cleaners].map((clean) => clean()));
  process.exitCode = signal === "SIGINT" ? 130 : 143;
  closing = false;
}

const onInterrupt = () => {
  void shutdown("SIGINT");
};
const onTerminate = () => {
  void shutdown("SIGTERM");
};

export function registerCleanup(clean: () => Promise<unknown>): () => void {
  cleaners.add(clean);
  if (!installed) {
    installed = true;
    process.on("SIGINT", onInterrupt);
    process.on("SIGTERM", onTerminate);
  }
  return () => {
    cleaners.delete(clean);
    if (installed && !cleaners.size) {
      process.removeListener("SIGINT", onInterrupt);
      process.removeListener("SIGTERM", onTerminate);
      installed = false;
    }
  };
}
