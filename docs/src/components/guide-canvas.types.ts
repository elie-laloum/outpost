export interface CanvasView {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

// A node's edges and vertical middle, in unscaled map coordinates.
export interface CanvasBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  middle: number;
}

export interface CanvasPointer {
  start: CanvasPoint;
  last: CanvasPoint;
}

export interface CanvasEdge {
  source: HTMLElement;
  target: HTMLElement;
  label: Element | null;
  offset: number;
  // The drawn curves, arrows and label, toggled together when the link is lit.
  parts: Element[];
}

export interface CanvasTrace {
  lit: Set<HTMLElement>;
  used: Set<CanvasEdge>;
}

// A placed label: its center and size, in unscaled map coordinates.
export interface CanvasLabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
