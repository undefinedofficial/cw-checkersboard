import { type Ref, onMounted, onUnmounted } from "vue";

export const enum MouseButton {
  LEFT = 1,
  MIDDLE = 4,
  RIGHT = 2,
}

export enum EventMode {
  START = "start",
  MOVE = "move",
  END = "end",
  // DOUBLE_CLICK = "dblclick",
}

interface DetailInputEvent {
  x: number;
  y: number;
  mode: EventMode;
  target: EventTarget | null;
  doubleclick: boolean;
  altclick: boolean;
  ctrlclick: boolean;
  [key: string]: any;
}
interface MouseInputEvent extends DetailInputEvent {
  type: "mouse";
  button: MouseButton;
}
interface TouchInputEvent extends DetailInputEvent {
  type: "touch";
}
export type DraggableInputEvent = MouseInputEvent | TouchInputEvent;

function touchToInputEvent(
  event: TouchEvent,
  mode: EventMode,
  isDoubleClick: boolean
): TouchInputEvent {
  return {
    type: "touch",
    mode,
    x: event.changedTouches[0].clientX,
    y: event.changedTouches[0].clientY,
    target: event.target,
    doubleclick: isDoubleClick,
    altclick: false,
    ctrlclick: false,
  };
}
function mouseToInputEvent(
  event: MouseEvent,
  mode: EventMode,
  isDoubleClick: boolean
): MouseInputEvent {
  return {
    type: "mouse",
    button: event.buttons as MouseButton,
    mode,
    x: event.clientX,
    y: event.clientY,
    target: event.target,
    doubleclick: isDoubleClick,
    altclick: event.altKey,
    ctrlclick: event.ctrlKey,
  };
}
type EventCallback = ((ev: DraggableInputEvent) => void | boolean) | null;

const DOUBLE_CLICK_SENSITIVE = 300;

export function useDraggable<T extends HTMLElement>(el: Ref<T>) {
  let startHandler: EventCallback = null;
  let moveHandler: EventCallback = null;
  let endHandler: EventCallback = null;

  const onStart = (handler: EventCallback) => (startHandler = handler);
  const onMove = (handler: EventCallback) => (moveHandler = handler);
  const onEnd = (handler: EventCallback) => (endHandler = handler);

  const emit = (handler: EventCallback, event: DraggableInputEvent) => {
    if (handler) return handler(event);
  };

  let prevMouseDown = 0;
  const onSquareMouseDown = (ev: MouseEvent) => {
    ev.preventDefault();

    const nowMouseDown = Date.now();
    const isDoubleClick = nowMouseDown - prevMouseDown < DOUBLE_CLICK_SENSITIVE;
    prevMouseDown = nowMouseDown;

    if (emit(startHandler, mouseToInputEvent(ev, EventMode.START, isDoubleClick))) return;

    const onSquareMouseMove = (ev: MouseEvent) =>
      emit(moveHandler, mouseToInputEvent(ev, EventMode.MOVE, isDoubleClick));

    const onSquareMouseUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onSquareMouseMove);
      document.removeEventListener("mouseup", onSquareMouseUp);
      emit(endHandler, mouseToInputEvent(ev, EventMode.END, isDoubleClick));
    };

    document.addEventListener("mousemove", onSquareMouseMove, { passive: true });
    document.addEventListener("mouseup", onSquareMouseUp, { passive: true });
  };

  let prevTouchDown = 0;
  const onSquareTouchStart = (ev: TouchEvent) => {
    ev.preventDefault();

    const nowTouchDown = Date.now();
    const isDoubleClick = nowTouchDown - prevTouchDown > DOUBLE_CLICK_SENSITIVE;
    prevTouchDown = nowTouchDown;

    emit(startHandler, touchToInputEvent(ev, EventMode.START, isDoubleClick));

    const onSquareTouchMove = (ev: TouchEvent) =>
      emit(moveHandler, touchToInputEvent(ev, EventMode.MOVE, isDoubleClick));

    const onSquareTouchEnd = (ev: TouchEvent) => {
      emit(endHandler, touchToInputEvent(ev, EventMode.END, isDoubleClick));

      document.removeEventListener("touchmove", onSquareTouchMove);
      document.removeEventListener("touchend", onSquareTouchEnd);
    };

    document.addEventListener("touchmove", onSquareTouchMove, { passive: true });
    document.addEventListener("touchend", onSquareTouchEnd, { passive: true });
  };

  const onContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
  };
  onMounted(() => {
    if (!el.value) return console.warn("No element found for mound in useDraggable");
    el.value.addEventListener("contextmenu", onContextMenu);
    el.value.addEventListener("mousedown", onSquareMouseDown);
    el.value.addEventListener("touchstart", onSquareTouchStart);
  });
  onUnmounted(() => {
    if (!el.value) return console.warn("No element found for unmound in useDraggable");
    el.value.removeEventListener("contextmenu", onContextMenu);
    el.value.removeEventListener("mousedown", onSquareMouseDown);
    el.value.removeEventListener("touchstart", onSquareTouchStart);
  });

  return { onStart, onMove, onEnd };
}
