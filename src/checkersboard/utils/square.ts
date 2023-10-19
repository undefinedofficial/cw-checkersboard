export const isWhiteSquare = (x: number, y: number) =>
  (x % 2 === 0 && y % 2 === 0) || (x % 2 !== 0 && y % 2 !== 0);
