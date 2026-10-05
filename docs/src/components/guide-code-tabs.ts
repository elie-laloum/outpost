import {
  CODE_TAB_DRAG_THRESHOLD,
  CODE_TAB_WHEEL_LINE,
} from "./guide-code-tabs.constants.ts";

function mountCodeTabGroup(group: HTMLElement): void {
  const strip = group.querySelector<HTMLElement>(".code-tab-list");
  if (!strip) return;
  group.dataset.tabsReady = "";

  const revealSelected = () => {
    const input = group.querySelector<HTMLInputElement>(
      ".code-tab-input:checked",
    );
    const label = input?.labels?.[0];
    if (!label) return;
    const bounds = strip.getBoundingClientRect();
    const tab = label.getBoundingClientRect();
    if (tab.left < bounds.left) {
      strip.scrollLeft += tab.left - bounds.left;
      return;
    }
    if (tab.right > bounds.left + strip.clientWidth)
      strip.scrollLeft += tab.right - bounds.left - strip.clientWidth;
  };
  const resize = () => {
    strip.toggleAttribute(
      "data-overflow",
      strip.scrollWidth > strip.clientWidth,
    );
    revealSelected();
  };
  new ResizeObserver(resize).observe(strip);
  group.addEventListener("change", revealSelected);
  group.addEventListener("focusin", revealSelected);

  strip.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
      let delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE)
        delta *= CODE_TAB_WHEEL_LINE;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE)
        delta *= strip.clientWidth;
      const before = strip.scrollLeft;
      strip.scrollLeft += delta;
      if (strip.scrollLeft !== before) event.preventDefault();
    },
    { passive: false },
  );

  let pointerId: number | undefined;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;
  let suppressClick = false;
  strip.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    suppressClick = false;
    if (strip.scrollWidth <= strip.clientWidth) return;
    // Leave the scrollbar's native interaction alone.
    if (event.clientY >= strip.getBoundingClientRect().top + strip.clientHeight)
      return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = strip.scrollLeft;
    dragged = false;
  });
  strip.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    const distance = event.clientX - startX;
    if (!dragged && Math.abs(distance) < CODE_TAB_DRAG_THRESHOLD) return;
    if (!dragged) {
      dragged = true;
      suppressClick = true;
      strip.setPointerCapture(event.pointerId);
      strip.dataset.dragging = "";
    }
    event.preventDefault();
    strip.scrollLeft = startScroll - distance;
  });
  const finishDrag = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = undefined;
    delete strip.dataset.dragging;
    if (strip.hasPointerCapture(event.pointerId))
      strip.releasePointerCapture(event.pointerId);
    if (event.type === "pointercancel") suppressClick = false;
  };
  strip.addEventListener("pointerup", finishDrag);
  strip.addEventListener("pointercancel", finishDrag);
  strip.addEventListener("lostpointercapture", finishDrag);
  strip.addEventListener("pointerleave", () => {
    if (!dragged) pointerId = undefined;
  });
  strip.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      if (event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true },
  );
}

export function mountCodeTabs(): void {
  for (const group of document.querySelectorAll<HTMLElement>(
    ".code-tabs:not([data-tabs-ready])",
  )) {
    mountCodeTabGroup(group);
  }
}
