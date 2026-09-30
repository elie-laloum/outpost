const HOLD = 1300;

// Plays a figure's beats once in view; subclasses schedule and settle each beat.
export abstract class DemoPlayer extends HTMLElement {
  #timers: number[] = [];

  protected abstract reset(beat: number): void;
  protected abstract timeline(beat: number): number;
  protected abstract settle(beat: number): void;
  protected selected(_beat: number): void {}

  connectedCallback() {
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const toggle = this.querySelector<HTMLButtonElement>("[data-toggle]");
    this.querySelectorAll<HTMLButtonElement>("button[data-beat]").forEach(
      (button, beat) =>
        button.addEventListener("click", () => {
          this.#stop();
          if (still.matches) this.#show(beat);
          else this.#play(beat, false);
        }),
    );
    this.#show(Number(this.dataset.beat ?? 0));
    if (still.matches || !toggle) return;
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      if (this.dataset.state !== "playing") return this.#play(0, true);
      this.#stop();
      this.#show(Number(this.dataset.beat));
    });
    new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        this.#play(0, true);
      },
      { threshold: 0.35 },
    ).observe(this);
  }

  protected at(ms: number, action: () => void) {
    this.#timers.push(window.setTimeout(action, ms));
  }

  #stop() {
    this.#timers.forEach((timer) => clearTimeout(timer));
    this.#timers = [];
    this.#setState("stopped");
  }

  #setState(state: "playing" | "stopped") {
    this.dataset.state = state;
    const toggle = this.querySelector<HTMLButtonElement>("[data-toggle]");
    if (!toggle) return;
    const label =
      state === "playing" ? toggle.dataset.pause : toggle.dataset.replay;
    toggle.setAttribute("aria-label", label ?? "");
    toggle.title = label ?? "";
  }

  #select(beat: number, duration = 0) {
    this.dataset.beat = String(beat);
    this.querySelectorAll("button[data-beat]").forEach((button, index) =>
      button.setAttribute("aria-pressed", String(index === beat)),
    );
    this.style.setProperty("--beat-ms", `${duration}ms`);
    this.toggleAttribute("data-timed", false);
    if (duration)
      requestAnimationFrame(() => this.toggleAttribute("data-timed", true));
    this.selected(beat);
  }

  #instant(apply: () => void) {
    this.toggleAttribute("data-instant", true);
    apply();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => this.toggleAttribute("data-instant", false)),
    );
  }

  #play(beat: number, chain: boolean) {
    this.#stop();
    this.#instant(() => this.reset(beat));
    this.#setState("playing");
    const end = this.timeline(beat) + HOLD;
    this.#select(beat, end);
    this.at(end, () => {
      const last = this.querySelectorAll("button[data-beat]").length - 1;
      if (chain && beat < last) this.#play(beat + 1, true);
      else this.#setState("stopped");
    });
  }

  #show(beat: number) {
    this.#select(beat);
    this.#instant(() => this.settle(beat));
  }
}
