export const enum MARKER {
  FRAME = "marker-frame",
  CIRCLE = "marker-circle",
  DOT = "marker-dot",
  SQUARE = "marker-square",
  ARROW = "arrow",
  TEXT = "marker-text",
}

interface IMarker {
  square: string;
  color?: "red" | "green" | "blue";
}

export interface MarkerPoint extends IMarker {
  type: MARKER.FRAME | MARKER.CIRCLE | MARKER.DOT | MARKER.SQUARE;
}
export interface MarkerText extends IMarker {
  type: MARKER.TEXT;
  text: string;
}
export interface MarkerArrow extends IMarker {
  type: MARKER.ARROW;
  toSquare: string;
}

export type Marker = MarkerPoint | MarkerText | MarkerArrow;
