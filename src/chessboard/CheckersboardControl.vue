<template>
  <div class="pieces move-field" :class="piecePack">
    <div
      v-if="activePiece"
      class="piece"
      :class="activePiece.color + activePiece.name"
      :style="{
        transform: `translate(${activePiece.x}px, ${activePiece.y}px)`,
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, type Ref } from "vue";
import { useDraggable } from "./hooks/dragable";
import { usePieces } from "./hooks/pieces";

import { getPointInElement } from "./utils/getPointInElement";
import { pointEqual, pointToSquare, squareToString, squareValid } from "./utils/point";

import type { Color, InputColor, Piece, Point } from "./types";

const props = withDefaults(
  defineProps<{
    mode?: "auto" | "move" | "press";
    enableColor?: InputColor;
  }>(),
  {
    mode: "auto",
    enableColor: "all",
  }
);
const emits = defineEmits<{
  beforeMove: [square: string, done: (is: boolean) => any];
  afterMove: [fromSquare: string, toSquare: string, done: (is: boolean) => any];
  cancelMove: [square: string];
  enterSquare: [square: string];
  leaveSquare: [square: string];
}>();

const DRAGGING_SENSITIVE = 32;

const checkersboard = inject<Ref<HTMLDivElement>>("checkersboard")!;
const pieces = inject<ReturnType<typeof usePieces>>("pieces")!;
const piecePack = inject<string>("piecePack")!;
const orientation = inject<Ref<Color>>("orientation")!;

let fromSquare: Piece | null = null;
const activePiece = ref<Pick<Piece, "x" | "y" | "name" | "color"> | null>(null);

const isEnabledColor = (color: Color) => props.enableColor === "all" || props.enableColor === color;

let enterSquare: Point | null = null;
const checkEnterSquare = (square: Point) => {
  if (enterSquare && pointEqual(enterSquare, square)) return;

  if (enterSquare) emits("leaveSquare", squareToString(enterSquare));
  emits("enterSquare", squareToString(square));
  enterSquare = square;
};
let holdPress = false;
const isRejectMove = () => {
  if (props.mode === "auto") return false;
  return (props.mode === "press" && holdPress) || (props.mode === "move" && !holdPress);
};

function alphaPiece(piece: Piece, is: boolean) {
  pieces.setAlphaPiece(
    piece,
    piece.color === "w" ? (piece.name.toUpperCase() as any) : piece.name,
    is
  );
}

function onCancelMove(from: Piece, emited = true) {
  // Click for cancel selected a chess piece
  if (emited) emits("cancelMove", squareToString(from));
  alphaPiece(from, false);
  activePiece.value = null;
  enterSquare = null;
  fromSquare = null;
}

const { onStart, onMove, onEnd } = useDraggable(checkersboard);
onStart((ev) => {
  //!  WARNING
  // if (ev.doubleclick && fromSquare) {
  //   onCancelMove(fromSquare!, true);
  //   return true;
  // }
  // if (ev.button && ev.button !== MouseButton.LEFT) return true;

  holdPress = false;

  const point = getPointInElement(checkersboard.value!, ev);
  const square = pointToSquare(point, orientation.value, point);

  if (!squareValid(square)) return true;

  if (fromSquare && pointEqual(fromSquare, square)) {
    onCancelMove(fromSquare);
    return true;
  }

  const piece = pieces.getPieceByPoint(square);
  // Click for selecting a chess piece
  if (!piece || !isEnabledColor(piece.color)) return;

  emits("beforeMove", squareToString(square), (done: boolean) => {
    if (!done) return;

    fromSquare = {
      x: square.x,
      y: square.y,
      name: piece.name,
      color: piece.color,
    };
    checkEnterSquare(pointToSquare(point, orientation.value, point));
  });
});
onMove((ev) => {
  if (!fromSquare || isRejectMove()) return;

  const point = getPointInElement(checkersboard.value!, ev);
  const squareWidth = point.width / 8;
  const squareHeight = point.height / 8;

  const halfX = point.x - squareWidth / 2;
  const halfY = point.y - squareHeight / 2;

  if (!holdPress && activePiece.value) {
    const alignX = fromSquare.x * squareWidth;
    const alignY = fromSquare.y * squareHeight;
    const offsetX = Math.abs(halfX - alignX);
    const offsetY = Math.abs(halfY - alignY);

    holdPress = offsetX > DRAGGING_SENSITIVE || offsetY > DRAGGING_SENSITIVE;
    alphaPiece(fromSquare, holdPress);
  }

  activePiece.value = {
    name: fromSquare.name,
    color: fromSquare.color,
    x: halfX,
    y: halfY,
  };

  const square = pointToSquare(point, orientation.value, point);
  if (!squareValid(square)) return;
  checkEnterSquare(square);
});
onEnd((ev) => {
  if (isRejectMove()) return;

  const point = getPointInElement(checkersboard.value!, ev);
  const square = pointToSquare(point, orientation.value, point);

  if (!squareValid(square)) {
    console.log("Invalid square", fromSquare);

    if (fromSquare) onCancelMove(fromSquare);
    return;
  }
  // if (activePiece.value) {
  // For alignment by center on click not dragging
  // const alignCoord = squareToPoint(normalizePoint(point, point), point);
  // activePiece.value.x = alignCoord.x - 1;
  // activePiece.value.y = alignCoord.y - 1;
  // }
  activePiece.value = null;
  if (holdPress && fromSquare && pointEqual(fromSquare, square)) {
    onCancelMove(fromSquare);
    return;
  }

  // Click for moving selected a chess piece
  const piece = pieces.getPieceByPoint(square);

  if (!fromSquare || (piece && piece.color === fromSquare.color && !holdPress)) return;

  emits("afterMove", squareToString(fromSquare), squareToString(square), async (done: boolean) => {
    if (!fromSquare) return console.warn("Cannot move from square ");

    // save the current position of the current piece in the current square before remove
    const from = fromSquare;
    // done is true if the move was successful and not emit cancel event else emit cancel event
    onCancelMove(from, !done);

    if (done) await pieces.movePiece(from, square, !holdPress);
  });
});
</script>

<style lang="scss">
.pieces.move-field .piece {
  pointer-events: all;
  cursor: move;
  z-index: 100;
}
</style>
