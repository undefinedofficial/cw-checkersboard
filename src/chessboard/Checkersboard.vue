<template>
  <div
    class="cw-checkersboard checkersboard-theme"
    :class="boardPack"
    :style="{
      width: boardSize,
      height: boardSize,
      fontSize: fontScale,
    }"
  >
    <div
      ref="wrapper"
      class="cw-wrapper"
      :style="{
        borderRadius: boardRoundScale,
        borderWidth: borderScale,
      }"
    >
      <div ref="checkersboard" class="cw-container" :class="{ outside: coordOutside }">
        <div ref="piecesContainer" class="pieces" :class="piecePack"></div>
        <slot />
      </div>
    </div>
    <CheckersboardCoords
      :style="{
        margin: borderScale,
      }"
      :coordMode="coordMode"
      :orientation="orientation"
      :coordOutside="coordOutside"
    />
  </div>
</template>

<script lang="ts" setup>
import "./style/main.scss";
import { ref, computed, toRef, provide } from "vue";

import type { Color, CoordMode } from "./types";
import { useRescale } from "./hooks/rescale";
import { usePieces } from "./hooks/pieces";
import CheckersboardCoords from "./components/CheckersboardCoords.vue";

const props = withDefaults(
  defineProps<{
    scheme: (string | null)[][];
    orientation?: Color;
    duration?: number;
    borderSize?: number;
    roundSize?: number;
    fontSize?: number;
    coordOutside?: boolean;
    coordMode?: CoordMode;
    alphaPiece?: boolean;
    boardPack?: string;
    piecePack?: string;
  }>(),
  {
    scheme: [] as any,
    orientation: "w",
    duration: 300,
    borderSize: 12,
    roundSize: 0,
    fontSize: 24,
    coordMode: "left",
    boardPack: "default",
    piecePack: "default",
  }
);
const wrapper = ref<HTMLElement | null>(null);
const checkersboard = ref<HTMLElement | null>(null);
const { brdSize, ratioSize } = useRescale(wrapper);

const boardSize = computed(() => `${brdSize.value}px`);
const boardRoundScale = computed(() => `${props.roundSize * ratioSize.value}px`);
const borderScale = computed(() => `${props.borderSize * ratioSize.value}px`);
const fontScale = computed(() => `${props.fontSize * ratioSize.value}px`);

const color = toRef(props, "orientation");
const piecesContainer = ref<HTMLElement | null>(null);
const pieces = usePieces(
  piecesContainer,
  toRef(props, "scheme"),
  color,
  toRef(props, "duration"),
  toRef(props, "alphaPiece")
);

const boardPack = toRef(props, "boardPack");
const piecePack = toRef(props, "piecePack");
provide("checkersboard", checkersboard);
provide("orientation", color);
provide("pieces", pieces);
provide("boardPack", boardPack);
provide("piecePack", piecePack);
</script>

<style lang="scss">
.cw-checkersboard {
  user-select: none;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-style: solid;
  border-color: transparent;
  background-color: transparent;
  box-sizing: border-box;
  // transition: width 0.1s linear, height 10ms linear;

  .cw-wrapper {
    display: inline-block;
    width: 100%;
    height: 100%;
    border-style: solid;
    overflow: hidden;
    box-sizing: border-box;

    .cw-container {
      display: inline-block;
      position: relative;
      cursor: pointer;
      width: 100%;
      height: 100%;
      box-sizing: border-box;

      &::before {
        content: " ";
        background-color: #fff;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        transition: none;
      }

      .pieces {
        pointer-events: none;
        will-change: transform, opacity;

        position: absolute;
        top: -1px;
        left: 0;
        width: 100%;
        height: 100%;
        transition: none !important;
        .piece {
          position: absolute;
          display: block;
          height: 12.5%;
          width: 12.5%;
          background-repeat: no-repeat;
          background-size: contain;

          transition: none !important;
        }
      }
    }
  }
}
</style>
