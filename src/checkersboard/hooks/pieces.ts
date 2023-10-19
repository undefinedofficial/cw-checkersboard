import { type Ref, watch, onMounted } from "vue";
import { indexToPoint, schemeToSquares, type SquareType, pointToIndex } from "./squares";
import type { Color, PieceSymbol, Point } from "../types";
import { invertPoint, squareToString } from "../utils/point";

const enum CHANGE_TYPE {
  ADD,
  REMOVE,
  MOVE,
}

interface PearedList {
  piece: PieceSymbol;
  index: number;
}

interface AnimatedElement {
  type: CHANGE_TYPE;
  element: HTMLDivElement;
  atPoint?: Point;
  toPoint?: Point;
}

interface IChanged {
  piece: PieceSymbol;
  atIndex: number;
}
interface ChangeAddOrRemove extends IChanged {
  type: CHANGE_TYPE.ADD | CHANGE_TYPE.REMOVE;
  toIndex?: undefined;
}
interface ChangeMove extends IChanged {
  type: CHANGE_TYPE.MOVE;
  toIndex: number;
}

type Change = ChangeAddOrRemove | ChangeMove;

function squareDistance(index1: number, index2: number) {
  const file1 = index1 % 8;
  const rank1 = Math.floor(index1 / 8);
  const file2 = index2 % 8;
  const rank2 = Math.floor(index2 / 8);
  return Math.max(Math.abs(rank2 - rank1), Math.abs(file2 - file1));
}

const seekChanges = (fromSquares: SquareType[], toSquares: SquareType[]) => {
  const appearedList: Array<PearedList> = [];
  const disappearedList: Array<PearedList> = [];

  for (let i = 0; i < 64; i++) {
    const previousSquare = fromSquares[i];
    const newSquare = toSquares[i];
    if (newSquare === previousSquare) continue;

    if (newSquare) appearedList.push({ piece: newSquare, index: i });

    if (previousSquare) disappearedList.push({ piece: previousSquare, index: i });
  }

  const changes: Change[] = [];
  appearedList.forEach((appeared) => {
    let shortestDistance = 8;
    let foundMoved: PearedList | null = null;
    disappearedList.forEach((disappeared) => {
      if (appeared.piece !== disappeared.piece) return;

      const moveDistance = squareDistance(appeared.index, disappeared.index);
      if (moveDistance < shortestDistance) {
        foundMoved = disappeared;
        shortestDistance = moveDistance;
      }
    });
    if (foundMoved == null) {
      changes.push({
        type: CHANGE_TYPE.ADD,
        piece: appeared.piece,
        atIndex: appeared.index,
      });
      return;
    }

    disappearedList.splice(disappearedList.indexOf(foundMoved), 1); // remove from disappearedList, because it is moved now
    changes.push({
      type: CHANGE_TYPE.MOVE,
      piece: appeared.piece,
      atIndex: (foundMoved as PearedList).index,
      toIndex: appeared.index,
    });
  });
  changes.push(
    ...disappearedList.map<ChangeAddOrRemove>(({ piece, index }) => ({
      type: CHANGE_TYPE.REMOVE,
      piece,
      atIndex: index,
    }))
  );
  return changes;
};

export function usePieces(
  container: Ref<HTMLElement | null>,
  scheme: Ref<(string | null)[][]>,
  orientation: Ref<Color>,
  duration: Ref<number>,
  alphaPiece: Ref<boolean>
) {
  let squares: SquareType[] = [];
  const getPieceByIndex = (
    idx: number
  ): {
    name: PieceSymbol;
    color: Color;
  } | null => {
    const square = squares[idx];
    if (!square) return null;
    const name = square.toLowerCase() as PieceSymbol;
    return { name, color: name === square ? "b" : "w" };
  };
  const getPieceByPoint = (p: Point) => getPieceByIndex(pointToIndex(p));

  function createPieceElement(to: Point, piece: PieceSymbol) {
    const element = document.createElement("div");
    const point = invertPoint(to, orientation.value);
    const figure = piece.toLowerCase();
    const dataPiece = (figure === piece ? "b" : "w") + figure;
    element.setAttribute("data-square", squareToString(to));
    element.setAttribute("data-piece", dataPiece);
    element.classList.add("piece", dataPiece);
    element.style.transform = `translate(${point.x * 100}%, ${point.y * 100}%)`;
    element.style.zIndex = "1";
    return element;
  }
  function getPieceElement(to: Point, piece: PieceSymbol): HTMLDivElement | null {
    const figure = piece.toLowerCase();
    const stringSquare = squareToString(to);
    const dataPiece = (figure === piece ? "b" : "w") + figure;
    const element: any = container.value!.querySelector(
      `[data-piece="${dataPiece}"][data-square="${stringSquare}"]`
    );

    return element;
  }

  function setAlphaPiece(squarePoint: Point, pieceName: PieceSymbol, value: boolean) {
    const element = getPieceElement(squarePoint, pieceName);
    if (element) element.style.opacity = !value ? "1" : alphaPiece.value ? "0.5" : "0";
    else
      console.warn(
        "Invalid value for square piece: ",
        squareToString(squarePoint),
        pieceName,
        value ? "on" : "off"
      );
  }

  function redraw(newsquares = schemeToSquares(scheme.value)) {
    container.value!.innerHTML = "";

    for (let i = 0; i < newsquares.length; i++) {
      const piece = newsquares[i];
      if (!piece) continue;
      container.value!.appendChild(createPieceElement(indexToPoint(i), piece));
    }
    squares = newsquares;
  }

  watch(
    scheme,
    () => {
      runAnimate(squares, schemeToSquares(scheme.value), duration.value).then(() => redraw());
    },
    { deep: true }
  );
  watch(orientation, () =>
    runAnimate(squares, [], duration.value).then(() =>
      runAnimate([], squares, duration.value).then(() => redraw(squares))
    )
  );
  onMounted(() => redraw());

  function createAnimation(fromSquares: SquareType[], toSquares: SquareType[]) {
    const changes = seekChanges(fromSquares, toSquares);
    const animatedElements: AnimatedElement[] = [];
    changes.forEach((change) => {
      const at = indexToPoint(change.atIndex!);
      switch (change.type) {
        case CHANGE_TYPE.MOVE: {
          const element = getPieceElement(at, change.piece)!;
          container.value!.appendChild(element); // move element to top layer
          const atPoint = invertPoint(indexToPoint(change.atIndex!), orientation.value);
          const toPoint = invertPoint(indexToPoint(change.toIndex!), orientation.value);
          animatedElements.push({
            type: change.type,
            element,
            atPoint: { x: atPoint.x * 100, y: atPoint.y * 100 },
            toPoint: { x: toPoint.x * 100, y: toPoint.y * 100 },
          });
          break;
        }
        case CHANGE_TYPE.ADD:
          const element = createPieceElement(at, change.piece!);
          element.style.opacity = "0";
          container.value!.appendChild(element);
          const atPoint = invertPoint(indexToPoint(change.atIndex!), orientation.value);
          animatedElements.push({
            type: change.type,
            element,
            atPoint: { x: atPoint.x * 100, y: atPoint.y * 100 },
          });
          break;
        case CHANGE_TYPE.REMOVE:
          const piece = getPieceElement(at, change.piece)!;
          animatedElements.push({
            type: change.type,
            element: piece,
          });
          break;
      }
    });
    return animatedElements;
  }

  function runAnimate(fromSquares: SquareType[], toSquares: SquareType[], duration: number) {
    return new Promise<void>((resolve) => {
      const animatedElements = createAnimation(fromSquares, toSquares);

      let startTime: number;
      function animationStep(time: number) {
        // console.log("animationStep", time);

        if (!startTime) startTime = time;
        const timeDiff = time - startTime;
        if (timeDiff > duration) {
          cancelAnimationFrame(frameHandle);
          // console.log("ANIMATION FINISHED");
          animatedElements.forEach((animatedItem) => {
            // fix bug z-index
            animatedItem.element.style.zIndex = "1";

            if (animatedItem.type === CHANGE_TYPE.REMOVE)
              container.value!.removeChild(animatedItem.element);
          });
          return resolve();
        }

        frameHandle = requestAnimationFrame(animationStep);

        const t = Math.min(1, timeDiff / duration);
        let progress = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
        if (isNaN(progress) || progress > 0.99) progress = 1;

        animatedElements.forEach((animatedItem) => {
          // fix bug z-index
          animatedItem.element.style.zIndex = "10";

          switch (animatedItem.type) {
            case CHANGE_TYPE.MOVE:
              animatedItem.element.style.transform = `translate(${
                animatedItem.atPoint!.x +
                (animatedItem.toPoint!.x - animatedItem.atPoint!.x) * progress
              }%,
                ${
                  animatedItem.atPoint!.y +
                  (animatedItem.toPoint!.y - animatedItem.atPoint!.y) * progress
                }%`;
              break;
            case CHANGE_TYPE.ADD:
              animatedItem.element.style.opacity = (Math.round(progress * 100) / 100).toString();
              break;
            case CHANGE_TYPE.REMOVE:
              animatedItem.element.style.opacity = (
                Math.round((1 - progress) * 100) / 100
              ).toString();

              break;
          }
        });
      }
      let frameHandle = requestAnimationFrame(animationStep);
    });
  }

  async function movePiece(from: Point, to: Point, animate = false) {
    const newSquares = new Array(...squares);
    const fromCoord = pointToIndex(from);
    if (!newSquares[fromCoord]) return console.warn("no piece on", squareToString(from));

    const toCoord = pointToIndex(to);
    newSquares[toCoord] = newSquares[fromCoord];
    newSquares[fromCoord] = null;

    if (animate) await runAnimate(squares, newSquares, duration.value);
    squares = newSquares;
    return Promise.resolve(redraw(newSquares));
  }
  return { redraw, getPieceByIndex, getPieceByPoint, movePiece, setAlphaPiece };
}
