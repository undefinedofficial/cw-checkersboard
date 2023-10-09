import type { PieceSymbol, SquarePoint } from "../types";
export type SquareType = PieceSymbol | null;

export const schemeToSquares = (scheme: (string | null)[][]): SquareType[] => {
  return scheme.reduce<SquareType[]>((acc, row) => {
    return acc.concat(row as SquareType[]);
  }, []);
};
export const squaresToScheme = (squares: SquareType[]): string[][] => {
  const result: any[][] = [];
  for (let i = 0; i < 8; i++) result.push(squares.slice(i * 8, (i + 1) * 8));

  return result;
};

export const indexToPoint = (index: number): SquarePoint => ({
  x: index % 8,
  y: Math.floor(index / 8),
});
export const pointToIndex = ({ x, y }: SquarePoint): number => 8 * y + x;
