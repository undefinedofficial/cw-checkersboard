<template>
  <CheckersboardMarkers :markers="markers" />
</template>

<script lang="ts" setup>
import { ref, inject, type Ref } from "vue";

import CheckersboardMarkers from "./CheckersboardMarkers.vue";
import { MouseButton, useDraggable } from "./hooks/dragable";
import type { Color } from "./types";
import { MARKER, type Marker } from "./utils/markers";
import { getPointInElement } from "./utils/getPointInElement";
import { pointToSquare, squareToString, squareValid } from "./utils/point";

const markers = ref<Marker[]>([
  {
    type: MARKER.DOT,
    square: "a6",
  },
]);

const chessboard = inject<Ref<HTMLDivElement>>("chessboard")!;
const orientation = inject<Ref<Color>>("orientation")!;

function checkMarker(type: MARKER, square: string) {
  return !!markers.value.find((marker) => marker.type == type && marker.square == square);
}

let holdPress = false;
let activeMarker: null | Marker = null;
const { onStart, onMove, onEnd } = useDraggable(chessboard);
onStart((ev) => {
  if (ev.button && ev.button !== MouseButton.RIGHT && !ev.doubleclick) {
    markers.value.splice(0);
    return true;
  }
  holdPress = false;
  //   const point = getPointInElement(chessboard.value, ev);
  //   const square = pointToSquare(point, orientation.value, point);
  //   if (!squareValid(square)) return true;
  //   if (fromSquare && pointEqual(fromSquare, square)) {
  //     onCancelMove(fromSquare);
  //     return true;
  //   }
});
onMove((ev) => {
  if (ev.button && ev.button !== MouseButton.RIGHT && !ev.doubleclick) return true;

  const point = getPointInElement(chessboard.value, ev);
  const square = pointToSquare(point, orientation.value, point);
  if (!squareValid(square)) return;

  holdPress = true;
  markers.value[markers.value.length - 1].square = squareToString(square);
});
onEnd((ev) => {
  if (ev.button && ev.button !== MouseButton.RIGHT && !ev.doubleclick) return true;

  const point = getPointInElement(chessboard.value!, ev);
  const square = pointToSquare(point, orientation.value, point);
  if (!squareValid(square)) {
    console.log("ChessboardUserMarkers: Invalid square");
    return;
  }
  const squareStr = squareToString(square);
  if (holdPress) {
    markers.value.push({
      type: MARKER.CIRCLE,
      square: squareStr,
    });
    return;
  }

  if (checkMarker(MARKER.CIRCLE, squareStr)) return;
  markers.value.push({
    type: MARKER.CIRCLE,
    square: squareStr,
  });
});
</script>
