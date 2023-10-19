import type { Color, Size2D, AbsolutePoint, Point, SquarePoint } from "../types";

/**
 * square to orientation
 * @param param0 Point
 * @param orientation Color
 */
export const invertPoint = ({ x, y }: SquarePoint, orientation: Color): SquarePoint =>
  orientation === "b" ? { x: 7 - x, y: 7 - y } : { x, y };

/**
 * absolute point to square point
 * @param param0 Point
 * @param orientation Color
 */
export const normalizePoint = (
  { x, y }: SquarePoint,
  { height, width }: Size2D
): AbsolutePoint => ({
  x: Math.floor(x / (width / 8)),
  y: Math.floor(y / (height / 8)),
});

/**
 * square to position  on chessboard
 * @param param0 Point
 * @param orientation Color
 */
export const pointToSquare = (
  point: AbsolutePoint,
  orientation: Color,
  size: Size2D
): SquarePoint => invertPoint(normalizePoint(point, size), orientation);

/**
 * multiply point on size the square
 * @param param0 Point
 */
export const squareToPoint = ({ x, y }: SquarePoint, { height, width }: Size2D): AbsolutePoint => ({
  x: x * (width / 8),
  y: y * (height / 8),
});

/**
 * square coordinates to string representation
 * @param param0 Point
 */
export const squareToString = ({ x, y }: SquarePoint): string =>
  String.fromCharCode(x + 97) + (8 - y).toString();

/**
 * string representation to square coordinates
 * @param square Point
 */
export const stringToSquare = (square: string): SquarePoint => ({
  x: square.charCodeAt(0) - 97,
  y: 8 - parseInt(square[1]),
});

/**
 * point equals to point
 * @param param0 a Point
 * @param point b Point
 */
export const pointEqual = ({ x, y }: Point, point: Point): boolean =>
  x === point.x && y === point.y;

/**
 * point equals to point
 * @param param0 a Point
 * @param point b Point
 */
export const squareValid = ({ x, y }: SquarePoint): boolean => x > -1 && x < 8 && y > -1 && y < 8;

export const squareJoinNS = ({ x, y }: AbsolutePoint) => `${x},${y}`;
export const squareToPointNS = ({ x, y }: SquarePoint) => ({ x: x * 128, y: y * 128 });
/**
 * increase half of the point's square size
 * @param param0 Point
 */
export const pointHalfSquareNS = ({ x, y }: AbsolutePoint): AbsolutePoint => ({
  x: x + 64,
  y: y + 64,
});
