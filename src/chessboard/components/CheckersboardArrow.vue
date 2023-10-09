<template>
  <g class="marker arrow" :class="color">
    <defs>
      <marker
        id="arrow"
        class="arrow-head"
        refX="20"
        refY="20"
        markerWidth="7"
        markerHeight="7"
        viewBox="0 0 40 40"
        orient="auto"
      >
        <use :href="`${MarkersDefault}#marker-arrow`" />
      </marker>
    </defs>
    <line
      class="arrow-line"
      :x1="from.x"
      :y1="from.y"
      :x2="to.x"
      :y2="to.y"
      marker-end="url(#arrow)"
    />
  </g>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import MarkersDefault from "../assets/markers/default.svg";
import type { Point } from "../types";
import { pointHalfSquareNS, squareToPointNS } from "../utils/point";

const props = defineProps<{
  from: Point;
  to: Point;
  color: string;
}>();

const from = computed(() =>
  pointHalfSquareNS(squareToPointNS({ x: props.from.x, y: props.from.y }))
);
const to = computed(() => pointHalfSquareNS(squareToPointNS({ x: props.to.x, y: props.to.y })));
</script>
