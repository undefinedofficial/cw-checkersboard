import type { Point } from "../types";

export function getPointInElement(el: HTMLElement, { x, y }: Point) {
  const rect = el.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top,
    width: rect.width,
    height: rect.height,
  };
}
