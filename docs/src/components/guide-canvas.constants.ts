export const CANVAS_MIN_SCALE = 0.3;
export const CANVAS_MAX_SCALE = 2;
// Below this, object text is too small to read, so the first view pans instead of shrinking further.
export const CANVAS_READABLE_SCALE = 1;
// The frame takes the map's height at its first scale, within these bounds.
export const CANVAS_MIN_HEIGHT = 320;
export const CANVAS_MAX_HEIGHT_SHARE = 0.8;
export const CANVAS_ZOOM_STEP = 1.25;
export const CANVAS_PAN_STEP = 48;
export const CANVAS_OVERSCROLL = 64;
// A press that moves less than this stays a click, so object links keep working.
export const CANVAS_DRAG_THRESHOLD = 4;
export const CANVAS_GRID = 24;
// Two links between the same objects leave and arrive this far apart.
export const CANVAS_PAIR_GAP = 14;
export const CANVAS_PULSE_STAGGER = 0.3;
// Labels closer than this are pushed apart.
export const CANVAS_LABEL_SPACING = 3;
