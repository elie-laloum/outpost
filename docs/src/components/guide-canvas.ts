import {
  CANVAS_DRAG_THRESHOLD,
  CANVAS_GRID,
  CANVAS_LABEL_SPACING,
  CANVAS_MAX_HEIGHT_SHARE,
  CANVAS_MAX_SCALE,
  CANVAS_MIN_HEIGHT,
  CANVAS_MIN_SCALE,
  CANVAS_OVERSCROLL,
  CANVAS_PAIR_GAP,
  CANVAS_PAN_STEP,
  CANVAS_PULSE_STAGGER,
  CANVAS_READABLE_SCALE,
  CANVAS_ZOOM_STEP,
} from "./guide-canvas.constants.ts";
import type {
  CanvasBox,
  CanvasEdge,
  CanvasLabelBox,
  CanvasPoint,
  CanvasPointer,
  CanvasTrace,
  CanvasView,
} from "./guide-canvas.types.ts";

const svg = "http://www.w3.org/2000/svg";

export function mountCanvases() {
  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-canvas]:not([data-ready])",
  ))
    mountCanvas(root);
}

function mountCanvas(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>(".canvas-viewport");
  const world = root.querySelector<HTMLElement>(".canvas-world");
  const links = root.querySelector<SVGSVGElement>(".canvas-links");
  const labels = root.querySelector<HTMLElement>(".canvas-labels");
  const scale = root.querySelector<HTMLOutputElement>(".canvas-scale");
  if (!viewport || !world || !links || !labels || !scale) return;
  root.setAttribute("data-ready", "");
  const view: CanvasView = { x: 0, y: 0, scale: 1 };
  const compact = window.matchMedia("(max-width: 50rem)");
  const pointers = new Map<number, CanvasPointer>();
  // Until the reader moves the map, resizes keep re-framing the first view.
  let moved = false;
  let dragged = false;

  const apply = () => {
    if (compact.matches) {
      world.style.transform = "none";
      viewport.style.height = "auto";
      viewport.tabIndex = -1;
      return;
    }
    viewport.tabIndex = 0;
    const width = world.offsetWidth * view.scale;
    const height = world.offsetHeight * view.scale;
    view.x = within(view.x, viewport.clientWidth - width);
    view.y = within(view.y, viewport.clientHeight - height);
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    viewport.style.setProperty(
      "--canvas-grid",
      `${CANVAS_GRID * view.scale}px`,
    );
    viewport.style.backgroundPosition = `${view.x}px ${view.y}px`;
    scale.value = `${Math.round(view.scale * 100)} %`;
  };
  const center = (width: number, height: number) => {
    view.x = Math.max(0, (viewport.clientWidth - width * view.scale) / 2);
    view.y = Math.max(0, (viewport.clientHeight - height * view.scale) / 2);
    apply();
  };
  // The first view fits the map within the frame's width and tallest height, then sizes the frame to it.
  const frame = () => {
    if (compact.matches) return apply();
    const { offsetWidth: width, offsetHeight: height } = world;
    const tallest = window.innerHeight * CANVAS_MAX_HEIGHT_SHARE;
    view.scale = clampScale(
      Math.max(
        CANVAS_READABLE_SCALE,
        Math.min(viewport.clientWidth / width, tallest / height, 1),
      ),
    );
    const fitted = Math.round(
      Math.min(tallest, Math.max(CANVAS_MIN_HEIGHT, height * view.scale)),
    );
    if (Math.abs(viewport.clientHeight - fitted) > 1)
      viewport.style.height = `${fitted}px`;
    center(width, height);
  };
  const fit = () => {
    const { offsetWidth: width, offsetHeight: height } = world;
    view.scale = clampScale(
      Math.min(viewport.clientWidth / width, viewport.clientHeight / height, 1),
    );
    center(width, height);
  };
  const zoomAt = (factor: number, point: CanvasPoint) => {
    const next = clampScale(view.scale * factor);
    const ratio = next / view.scale;
    view.x = point.x - (point.x - view.x) * ratio;
    view.y = point.y - (point.y - view.y) * ratio;
    view.scale = next;
    apply();
  };
  const pan = (x: number, y: number) => {
    view.x += x;
    view.y += y;
    apply();
  };
  const middle = () => ({
    x: viewport.clientWidth / 2,
    y: viewport.clientHeight / 2,
  });
  const local = (event: { clientX: number; clientY: number }) => {
    const box = viewport.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const touch = () => {
    moved = true;
  };
  const refresh = () => (moved ? apply() : frame());
  compact.addEventListener("change", () => {
    moved = false;
    refresh();
  });

  let edges: CanvasEdge[] = [];
  let focus: HTMLElement | null = null;
  const highlight = (element: HTMLElement | null) => {
    if (element === focus) return;
    focus = element;
    paint(root, edges, element ? trace(element, edges) : null);
  };
  let resizeFrame: number | undefined;
  const observer = new ResizeObserver(() => {
    if (resizeFrame !== undefined) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = undefined;
      edges = drawLinks(world, links, labels);
      paint(root, edges, focus ? trace(focus, edges) : null);
      refresh();
    });
  });
  observer.observe(world);
  observer.observe(viewport);

  root.querySelector(".canvas-controls")?.addEventListener("click", (event) => {
    const zoom = (event.target as Element | null)
      ?.closest<HTMLElement>("[data-zoom]")
      ?.getAttribute("data-zoom");
    if (!zoom) return;
    touch();
    if (zoom === "fit") return fit();
    zoomAt(zoom === "in" ? CANVAS_ZOOM_STEP : 1 / CANVAS_ZOOM_STEP, middle());
  });

  // The pointer is captured only once the press becomes a drag, so a plain click still reaches links.
  viewport.addEventListener("pointerdown", (event) => {
    if (compact.matches) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = local(event);
    pointers.set(event.pointerId, { start: point, last: point });
    dragged = false;
  });
  viewport.addEventListener("pointermove", (event) => {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    const current = local(event);
    if (
      !viewport.hasPointerCapture(event.pointerId) &&
      distance(current, pointer.start) < CANVAS_DRAG_THRESHOLD
    )
      return;
    if (!viewport.hasPointerCapture(event.pointerId)) {
      viewport.setPointerCapture(event.pointerId);
      viewport.setAttribute("data-dragging", "");
      dragged = true;
      touch();
    }
    const previous = pointer.last;
    pointer.last = current;
    const other = [...pointers].find(([id]) => id !== event.pointerId)?.[1];
    if (!other) return pan(current.x - previous.x, current.y - previous.y);
    const before = distance(previous, other.last);
    if (before > 0)
      zoomAt(
        distance(current, other.last) / before,
        midpoint(current, other.last),
      );
  });
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (!pointers.size) viewport.removeAttribute("data-dragging");
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener(
    "click",
    (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    },
    true,
  );
  viewport.addEventListener("dblclick", (event) => {
    if (compact.matches) return;
    if ((event.target as Element | null)?.closest("a")) return;
    touch();
    zoomAt(CANVAS_ZOOM_STEP * CANVAS_ZOOM_STEP, local(event));
  });
  // Hovering or focusing a card lights every link downstream of it and dims the rest.
  const cardOf = (target: EventTarget | null) =>
    (target as Element | null)?.closest<HTMLElement>(
      ".canvas-branch, .canvas-node",
    ) ?? null;
  viewport.addEventListener("pointerover", (event) => {
    if (compact.matches) return;
    if (event.pointerType === "mouse") highlight(cardOf(event.target));
  });
  viewport.addEventListener("pointerleave", () => highlight(null));
  viewport.addEventListener("focusin", (event) =>
    highlight(cardOf(event.target)),
  );
  viewport.addEventListener("focusout", () => highlight(null));
  // Tabbing to an object's link brings that object into view.
  viewport.addEventListener("focusin", (event) => {
    if (compact.matches) return;
    const node = (event.target as Element | null)?.closest<HTMLElement>(
      ".canvas-node",
    );
    if (!node) return;
    const { left, right, top, bottom } = boxIn(world, node);
    const visible =
      view.x + left * view.scale >= 0 &&
      view.x + right * view.scale <= viewport.clientWidth &&
      view.y + top * view.scale >= 0 &&
      view.y + bottom * view.scale <= viewport.clientHeight;
    viewport.scrollTo(0, 0);
    if (visible) return;
    touch();
    view.x = viewport.clientWidth / 2 - ((left + right) / 2) * view.scale;
    view.y = viewport.clientHeight / 2 - ((top + bottom) / 2) * view.scale;
    apply();
  });

  // Plain vertical scrolling stays with the page; Ctrl, ⌘ or a pinch zooms, sideways scrolling pans.
  viewport.addEventListener(
    "wheel",
    (event) => {
      if (compact.matches) return;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        touch();
        return zoomAt(Math.exp(-event.deltaY * unit * 0.002), local(event));
      }
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      touch();
      pan(-event.deltaX * unit, 0);
    },
    { passive: false },
  );

  const keys: Record<string, () => void> = {
    ArrowLeft: () => pan(CANVAS_PAN_STEP, 0),
    ArrowRight: () => pan(-CANVAS_PAN_STEP, 0),
    ArrowUp: () => pan(0, CANVAS_PAN_STEP),
    ArrowDown: () => pan(0, -CANVAS_PAN_STEP),
    "+": () => zoomAt(CANVAS_ZOOM_STEP, middle()),
    "=": () => zoomAt(CANVAS_ZOOM_STEP, middle()),
    "-": () => zoomAt(1 / CANVAS_ZOOM_STEP, middle()),
    "0": fit,
  };
  viewport.addEventListener("keydown", (event) => {
    const action = keys[event.key];
    if (event.target !== viewport || !action) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    touch();
    action();
  });
}

// Forward links fan out to a forked target's branches; paired links between two objects are drawn apart.
function drawLinks(
  world: HTMLElement,
  links: SVGSVGElement,
  labels: HTMLElement,
) {
  const pairs = new Map<string, number>();
  const edges: CanvasEdge[] = [
    ...world.querySelectorAll<HTMLElement>(".canvas-out [data-to]"),
  ].flatMap((item) => {
    const source = item.closest<HTMLElement>(".canvas-branch, .canvas-node");
    const target = world.querySelector<HTMLElement>(
      `#${CSS.escape(item.dataset.to ?? "")}`,
    );
    if (!source || !target) return [];
    const pair = [source.id, target.id].sort().join(" ");
    const seen = pairs.get(pair) ?? 0;
    pairs.set(pair, seen + 1);
    const label = item.querySelector(".canvas-link-label");
    return [{ source, target, label, offset: seen, parts: [] }];
  });
  const shared = (edge: CanvasEdge) =>
    (pairs.get([edge.source.id, edge.target.id].sort().join(" ")) ?? 1) > 1;
  links.setAttribute(
    "viewBox",
    `0 0 ${world.offsetWidth} ${world.offsetHeight}`,
  );
  const shapes: SVGPathElement[] = [];
  const tags: HTMLElement[] = [];
  edges.forEach((edge, index) => {
    const gap = shared(edge) ? (edge.offset ? 1 : -1) * CANVAS_PAIR_GAP : 0;
    const source = boxIn(world, edge.source);
    const whole = boxIn(world, edge.target);
    const branches =
      whole.left >= source.right
        ? [...edge.target.querySelectorAll<HTMLElement>(".canvas-branch")]
        : [];
    const targets = branches.length ? branches : [edge.target];
    targets.forEach((target, position) => {
      const curve = link(
        source,
        boxIn(world, target),
        branches.length ? 0 : gap,
      );
      const drawn = curve.shapes(index);
      shapes.push(...drawn);
      edge.parts.push(...drawn);
      if (!edge.label || position !== Math.floor(targets.length / 2)) return;
      const label = tag(edge.label, curve.middle);
      tags.push(label);
      edge.parts.push(label);
    });
  });
  links.replaceChildren(...shapes);
  labels.replaceChildren(...tags);
  separate(tags);
  return edges;
}

// Follows links from a card to the last object they reach. A forked object passes on its branches'
// links; a branch passes on its own and its object's, without lighting its sibling branches.
function trace(start: HTMLElement, edges: CanvasEdge[]): CanvasTrace {
  const lit = new Set<HTMLElement>();
  const used = new Set<CanvasEdge>();
  const queue = [start];
  // Siblings of a hovered branch are alternatives, not what follows it, so its fork is never re-entered.
  const fork = start.classList.contains("canvas-branch")
    ? start.closest<HTMLElement>(".canvas-node")
    : null;
  const alternative = (target: HTMLElement) =>
    fork !== null &&
    target !== start &&
    (target === fork ||
      (target.classList.contains("canvas-branch") &&
        target.closest(".canvas-node") === fork));
  for (let element = queue.shift(); element; element = queue.shift()) {
    if (lit.has(element)) continue;
    lit.add(element);
    const owner = element.classList.contains("canvas-branch")
      ? element.closest<HTMLElement>(".canvas-node")
      : null;
    const sources = new Set<HTMLElement>([
      element,
      ...element.querySelectorAll<HTMLElement>(".canvas-branch"),
      ...(owner ? [owner] : []),
    ]);
    for (const edge of edges) {
      if (!sources.has(edge.source) || alternative(edge.target)) continue;
      used.add(edge);
      queue.push(edge.target);
    }
  }
  return { lit, used };
}

function paint(
  root: HTMLElement,
  edges: CanvasEdge[],
  found: CanvasTrace | null,
) {
  root.toggleAttribute("data-focus", found !== null);
  for (const edge of edges)
    for (const part of edge.parts)
      part.classList.toggle("is-lit", found?.used.has(edge) ?? false);
  for (const node of root.querySelectorAll<HTMLElement>(".canvas-node")) {
    const branches = [...node.querySelectorAll<HTMLElement>(".canvas-branch")];
    const whole = found?.lit.has(node) ?? false;
    for (const branch of branches)
      branch.classList.toggle(
        "is-lit",
        whole || (found?.lit.has(branch) ?? false),
      );
    const head = whole || branches.some((branch) => found?.lit.has(branch));
    if (!branches.length) node.classList.toggle("is-lit", whole);
    for (const part of node.querySelectorAll(
      ":scope > .canvas-node-head, :scope > .canvas-node-text",
    ))
      part.classList.toggle("is-lit", head);
  }
}

// Labels are placed top to bottom; one that would cover a placed label moves just below it.
function separate(tags: HTMLElement[]) {
  const placed: CanvasLabelBox[] = [];
  const ordered = [...tags].sort(
    (a, b) => parseFloat(a.style.top) - parseFloat(b.style.top),
  );
  for (const tag of ordered) {
    const x = parseFloat(tag.style.left);
    const { offsetWidth: width, offsetHeight: height } = tag;
    let y = parseFloat(tag.style.top);
    for (;;) {
      const hit = placed.find(
        (other) =>
          Math.abs(other.x - x) <
            (other.width + width) / 2 + CANVAS_LABEL_SPACING &&
          Math.abs(other.y - y) <
            (other.height + height) / 2 + CANVAS_LABEL_SPACING,
      );
      if (!hit) break;
      y = hit.y + (hit.height + height) / 2 + CANVAS_LABEL_SPACING;
    }
    tag.style.top = `${y}px`;
    placed.push({ x, y, width, height });
  }
}

// A curve leaves the source on the side facing its target, so links back to the left read right to left.
function link(source: CanvasBox, target: CanvasBox, gap: number) {
  const forward = target.left + target.right >= source.left + source.right;
  const direction = forward ? 1 : -1;
  const x1 = forward ? source.right : source.left;
  const x2 = forward ? target.left : target.right;
  const y1 = source.middle + gap;
  const y2 = target.middle + gap;
  const bend = Math.max(32, Math.abs(x2 - x1) / 2) * direction;
  const curve = `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
  const tip = x2 - 7 * direction;
  return {
    middle: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    shapes(index: number) {
      const pulse = shape("canvas-pulse", curve);
      pulse.setAttribute("pathLength", "100");
      pulse.style.animationDelay = `${index * CANVAS_PULSE_STAGGER}s`;
      return [
        shape("canvas-link", curve),
        pulse,
        shape(
          "canvas-arrow",
          `M${tip} ${y2 - 4.5} L${x2} ${y2} L${tip} ${y2 + 4.5}`,
        ),
      ];
    },
  };
}

function tag(label: Element, point: CanvasPoint) {
  const element = document.createElement("span");
  element.className = "canvas-label";
  element.style.left = `${point.x}px`;
  element.style.top = `${point.y}px`;
  element.append(...[...label.childNodes].map((node) => node.cloneNode(true)));
  return element;
}

function boxIn(world: HTMLElement, node: HTMLElement): CanvasBox {
  const frame = world.getBoundingClientRect();
  const scale = frame.width / world.offsetWidth || 1;
  const rect = node.getBoundingClientRect();
  return {
    left: (rect.left - frame.left) / scale,
    right: (rect.right - frame.left) / scale,
    top: (rect.top - frame.top) / scale,
    bottom: (rect.bottom - frame.top) / scale,
    middle: (rect.top + rect.height / 2 - frame.top) / scale,
  };
}

function shape(className: string, path: string) {
  const element = document.createElementNS(svg, "path");
  element.setAttribute("class", className);
  element.setAttribute("d", path);
  return element;
}

// Keeps some of the map in view: it may leave the frame by at most the overscroll margin.
function within(offset: number, slack: number) {
  const low = Math.min(0, slack) - CANVAS_OVERSCROLL;
  const high = Math.max(0, slack) + CANVAS_OVERSCROLL;
  return Math.min(high, Math.max(low, offset));
}

function clampScale(scale: number) {
  return Math.min(CANVAS_MAX_SCALE, Math.max(CANVAS_MIN_SCALE, scale));
}

function distance(a: CanvasPoint, b: CanvasPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: CanvasPoint, b: CanvasPoint) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
