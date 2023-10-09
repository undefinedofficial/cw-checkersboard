<template>
  <div class="chessboard-preview">
    <Checkersboard
      :scheme="scheme"
      :orientation="orientation"
      :borderSize="borderSize"
      :roundSize="roundSize"
      :fontSize="fontSize"
      :coordOutside="coordOutside"
      :coordMode="coordMode"
      :duration="duration"
      :alphaPiece="alphaPiece"
      :boardPack="boardPack"
      :piecePack="piecesPack"
    >
      <CheckersboardMarkers :markers="markers" />
      <CheckersboardControl
        v-if="!viewonly"
        :enableColor="turn"
        :mode="moveMode"
        @beforeMove="onBeforeMove"
        @afterMove="onAfterMove"
        @cancelMove="onCancelMove($event), selectMarkers('selected'), selectMarkers('active')"
        @enterSquare="onEnterSquare($event), selectMarkers('active', MARKER.FRAME, [$event])"
        @leaveSquare="onLeaveSquare($event), selectMarkers('active')"
      />
    </Checkersboard>
  </div>
  <div>
    <div class="space-x-4">
      <input type="range" min="0" max="100" v-model.number="borderSize" />
      <input type="range" min="0" max="100" v-model.number="roundSize" />
      <input type="range" min="0" max="100" v-model.number="fontSize" />
      <input type="range" min="0" max="1000" v-model.number="duration" />
      <input type="checkbox" v-model="coordOutside" />
      <input type="checkbox" v-model="viewonly" />
      <input type="checkbox" v-model="alphaPiece" />
    </div>
    <div class="space-x-4">
      orientation
      <input type="radio" name="orientation" v-model="orientation" value="w" />
      <input type="radio" name="orientation" v-model="orientation" value="b" />
    </div>
    <div>
      board pack
      <select v-model="boardPack" class="text-black">
        <option v-for="th in boards" :value="th">{{ th }}</option>
      </select>
      pieces pack
      <select v-model="piecesPack" class="text-black">
        <option v-for="th in pieces" :value="th">{{ th }}</option>
      </select>
    </div>
    <div class="space-x-4">
      coords
      <input type="radio" name="coordMode" v-model="coordMode" value="none" />
      <input type="radio" name="coordMode" v-model="coordMode" value="left" />
      <input type="radio" name="coordMode" v-model="coordMode" value="right" />
    </div>
    <div class="space-x-4">
      move mode
      <input type="radio" name="moveMode" v-model="moveMode" value="move" />
      <input type="radio" name="moveMode" v-model="moveMode" value="press" />
      <input type="radio" name="moveMode" v-model="moveMode" value="auto" />
    </div>
    <div class="space-x-4">
      schemes
      <input type="radio" name="scheme" v-model="schemeProxy" :value="variants[0]" />
      <input type="radio" name="scheme" v-model="schemeProxy" :value="variants[1]" />

      <input type="radio" name="scheme" v-model="schemeProxy" :value="variants[2]" />

      <input type="radio" name="scheme" v-model="schemeProxy" :value="variants[3]" />
    </div>
    <div class="space-x-4">
      turn move
      <input type="radio" name="turn" v-model="turn" value="none" />
      <input type="radio" name="turn" v-model="turn" value="w" />
      <input type="radio" name="turn" v-model="turn" value="b" />
      <input type="radio" name="turn" v-model="turn" value="all" />
    </div>
    <button @click="undoMove">undo</button>
    <div>
      <div v-for="move in history">{{ move.from }}-{{ move.to }}-{{ move.flag }}</div>
    </div>
    <div v-if="isGameover">
      <p v-if="turn === 'w'">black wins</p>
      <p v-else>white wins</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import {
  type Marker,
  type InputColor,
  MARKER,
  type MarkerPoint,
  Checkersboard,
  CheckersboardMarkers,
  CheckersboardControl,
} from "cw-chessboard/index";

import { Checkers, type PieceSymbol, type Move } from "checkers-ts";
import { CheckersAI } from "checkers-ai";

const boards = ["default", "blue", "green", "sport", "wood_light"];
const pieces = ["default", "staunty", "stock"];

const boardPack = ref("default");
const piecesPack = ref("default");

const variants: (PieceSymbol | null)[][][] = [
  [
    [null, "p", null, "p", null, "p", null, "p"],
    ["p", null, "p", null, "p", null, "p", null],
    [null, "p", null, "p", null, "p", null, "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", null, "P", null, "P", null, "P", null],
    [null, "P", null, "P", null, "P", null, "P"],
    ["P", null, "P", null, "P", null, "P", null],
  ],
  [
    [null, "p", null, "p", null, "p", null, "p"],
    ["p", null, "p", null, "p", null, "p", null],
    [null, "p", null, "p", null, null, null, "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, "p", null, null, null, "P"],
    ["P", null, "P", null, "P", null, null, null],
    [null, "P", null, "P", null, "P", null, "P"],
    ["P", null, "P", null, "P", null, "P", null],
  ],
  [
    [null, "q", null, "p", null, "p", null, "p"],
    ["p", null, "p", null, "p", null, "p", null],
    [null, "p", null, "p", null, null, null, "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, "q", null, null, null, "Q"],
    ["P", null, "P", null, "P", null, null, null],
    [null, "P", null, "P", null, "P", null, "P"],
    ["Q", null, "P", null, "P", null, "P", null],
  ],
  [
    [null, "q", null, "q", null, "q", null, "q"],
    ["p", null, "p", null, "p", null, "p", null],
    [null, "p", null, "p", null, null, null, "p"],
    [null, null, null, null, "P", null, null, null],
    [null, "P", null, "p", null, null, null, null],
    ["P", null, null, null, "P", null, "P", null],
    [null, "P", null, null, null, "P", null, "P"],
    ["Q", null, "Q", null, "Q", null, "Q", null],
  ],
];

let checkers: Checkers;
const checkersAi = new CheckersAI();

const history = ref<Move[]>([]);
const turn = ref<InputColor>();
const scheme = ref<(PieceSymbol | null)[][]>();

const schemeProxy = computed({
  get: () => scheme.value!,
  set: (v) => {
    checkers = new Checkers(v, "w");
    scheme.value = v;
    turn.value = checkers.turn();
  },
});

schemeProxy.value = variants[0];

const borderSize = ref(20);
const roundSize = ref(0);
const fontSize = ref(28 * 2);
const duration = ref(300);
const coordOutside = ref(false);
const alphaPiece = ref(true);
const orientation = ref<"w" | "b">("w");
const coordMode = ref<any>("left");
const moveMode = ref<"auto" | "move" | "press">("auto");
const viewonly = ref(false);
const isGameover = ref(false);

const markers = ref<(Marker & { id?: string })[]>([
  // { type: MARKER.FRAME, color: "red", square: "a4" },
  // { type: MARKER.DOT, color: "green", square: "a5" },
  // { type: MARKER.DOT, color: "red", square: "a6" },
  // { type: MARKER.CIRCLE, color: "blue", square: "a3" },
  // { type: MARKER.SQUARE, color: "red", square: "b6" },
  // { type: MARKER.TEXT, square: "b5", text: "1.0" },
  // { type: MARKER.ARROW, color: "blue", square: "b3", toSquare: "b4" },
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAI() {
  if (checkers.turn() === orientation.value) return;

  const bestMoves = await checkersAi.ai(checkers, 1);
  console.log("BestMove: ", bestMoves);
  for (const { move } of bestMoves) {
    checkers.move(move.from, move.to);
    scheme.value = checkers.board();
    history.value = checkers.history();
    await sleep(500);
  }
  turn.value = checkers.turn();
  isGameover.value = checkers.isGameOver();
}

watch(orientation, runAI);

const selectMarkers = (
  id: string,
  marker?: MarkerPoint["type"],
  squares?: string[],
  color?: MarkerPoint["color"]
): void => {
  markers.value = markers.value.filter((m) => m.id !== id);
  if (squares)
    squares.forEach((square) => markers.value.push({ id, type: marker!, square, color }));
};

const onBeforeMove = (square: string, done: (accept: boolean) => void) => {
  console.log("BeforeMove: ", square);

  const moves = checkers.moves(square);

  if (moves.length === 0) return done(false);

  selectMarkers(
    "selected",
    MARKER.DOT,
    moves.map((m) => m.to)
  );
  done(true);
};

const onAfterMove = async (
  fromSquare: string,
  toSquare: string,
  done: (accept: boolean) => void
) => {
  console.log("AfterMove: ", fromSquare, toSquare);
  selectMarkers("selected");
  selectMarkers("active");
  const move = checkers.move(fromSquare, toSquare);

  if (move === null) return await done(false);

  await done(true);
  console.log("Move: ", move.flag);

  scheme.value = checkers.board();
  turn.value = checkers.turn();
  history.value = checkers.history();
  isGameover.value = checkers.isGameOver();

  if (turn.value === orientation.value || isGameover.value) return;

  await sleep(500);

  await runAI();
};
const onCancelMove = (square: string) => {
  // console.log("CancelMove: ", square);
  selectMarkers("selected");
};

const onEnterSquare = (square: string) => {
  // console.log("EnterSquare: ", square);
};
const onLeaveSquare = (square: string) => {
  // console.log("LeaveSquare: ", square);
};

const undoMove = () => {
  if (!checkers.undo()) return;

  scheme.value = checkers.board();
  turn.value = checkers.turn();
  history.value = checkers.history();
  isGameover.value = checkers.isGameOver();
};

onMounted(runAI);
</script>

<style>
html,
body,
#app {
  max-width: 100vw;
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chessboard-preview {
  margin: 50px;
  max-width: 100vw;
  max-height: 100vh;
}
</style>
./Checkers
