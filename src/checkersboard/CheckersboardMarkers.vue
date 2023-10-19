<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    width="100%"
    height="100%"
    class="markers"
  >
    <g class="marker">
      <template v-for="marker of markers">
        <g
          v-if="marker.type === MARKER.TEXT"
          :transform="`translate(${squareJoinNS(
            squareToPointNS(invertPoint(stringToSquare(marker.square), orientation))
          )})`"
        >
          <text
            class="marker-text"
            :class="marker.color || 'default'"
            transform="scale(3.2) translate(20, 26)"
            text-anchor="middle"
            fill="black"
            stroke="black"
          >
            {{ marker.text }}
          </text>
        </g>
        <ArrowMarker
          v-else-if="marker.type === MARKER.ARROW"
          :from="invertPoint(stringToSquare(marker.square), orientation)"
          :to="invertPoint(stringToSquare(marker.toSquare), orientation)"
          :color="marker.color || 'default'"
        />
        <g
          v-else
          :transform="`translate(${squareJoinNS(
            squareToPointNS(invertPoint(stringToSquare(marker.square), orientation))
          )})`"
        >
          <use
            :href="`${MarkersDefault}#${marker.type}`"
            :class="[marker.type, marker.color || 'default']"
            transform="scale(3.2)"
          />
        </g>
      </template>
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { inject, type Ref } from "vue";
import MarkersDefault from "./assets/markers/default.svg";
import ArrowMarker from "./components/CheckersboardArrow.vue";

import type { Color } from "./types";
import { MARKER, type Marker } from "./utils/markers";
import { invertPoint, stringToSquare, squareToPointNS, squareJoinNS } from "./utils/point";

defineProps<{
  markers: Marker[];
}>();

const orientation = inject<Ref<Color>>("orientation")!;
</script>

<style lang="scss">
.markers {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .marker {
    user-select: none;
    pointer-events: none;
    will-change: transform, opacity;
    z-index: 10;

    .marker-frame {
      stroke-opacity: 0.8;
      stroke-width: 2px;
    }
    .marker-circle {
      stroke-opacity: 0.8;
      stroke-width: 2px;
    }
    .marker-dot {
      fill-opacity: 0.8;
    }
    .marker-square {
      stroke-opacity: 0.8;
      stroke-width: 2px;
    }
    .arrow {
      fill-rule: nonzero;
      fill-opacity: 1;
      .arrow-line {
        opacity: 0.5;
        stroke-width: 9;
        stroke-linecap: round;
      }
    }
  }
}
</style>
./utils/Markers
