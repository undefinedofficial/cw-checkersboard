<template>
  <div class="checkersboard-coords" v-if="coordMode !== 'none'">
    <div
      class="coords numbers"
      :class="{
        outside: coordOutside,
        'coords-right': isRight,
      }"
    >
      <span class="coord" v-for="n in 8" :class="n % 2 !== (isRight ? 1 : 0) ? 'white' : 'black'">
        <span>{{ orientation === "w" ? 9 - n : n }}</span>
      </span>
    </div>
    <div
      class="coords letters"
      :class="{
        outside: coordOutside,
        'coords-right': isRight,
      }"
    >
      <span class="coord" v-for="l in 8" :class="l % 2 === 0 ? 'white' : 'black'">
        <span>{{ String.fromCharCode(orientation === "w" ? l + 96 : 105 - l) }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Color, CoordMode } from "../types";

const props = defineProps<{
  orientation: Color;
  coordMode: CoordMode;
  coordOutside?: boolean;
}>();

const isRight = computed(() => props.coordMode === "right");
</script>

<style lang="scss">
.checkersboard-coords {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .coords {
    pointer-events: none;
    position: absolute;

    .coord {
      display: block;
      font-size: 0.6em;
      font-weight: bold;
      text-transform: uppercase;
      line-height: 100%;
    }
    &.numbers {
      display: block;
      height: 100%;
      left: 2px;
      top: 2px;
      &.outside {
        left: 0;
        transform: translateX(-140%);
        .coord {
          align-items: center;
        }
      }

      .coord {
        display: flex;
        height: 12.5%;
      }
    }
    &.coords-right.numbers {
      left: auto;
      right: 0;
      &.outside {
        transform: translateX(140%);
      }
    }
    &.coords-right.letters {
      text-align: start;
      left: 3px;
    }

    &.letters {
      display: inline-flex;
      width: 100%;
      right: 6px;
      bottom: 0;

      text-align: end;
      &.outside {
        transform: translateY(110%);
        text-align: center;
        right: 0;
      }
      .coord {
        width: 12.5%;
      }
    }
  }
}
</style>
