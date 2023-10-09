import { type Ref, onMounted, onUnmounted, ref } from "vue";

export function useRescale(element: Ref<HTMLElement | null>) {
  const brdSize = ref<number>(1024);
  const ratioSize = ref<number>(1);
  function getClientSize(element: HTMLElement) {
    return {
      width: element.clientWidth,
      height: element.clientHeight,
    };
  }

  let hScale: any;
  function Rescale() {
    if (hScale) clearTimeout(hScale);
    hScale = setTimeout(() => {
      if (!element.value) return;

      let size;
      let field = element.value!.parentElement!;
      while (!size) {
        field = field.parentElement!;
        if (field === null) {
          size = { width: 128, height: 128 };
          break;
        } else {
          size = getClientSize(field);
        }
      }
      const { height, width } = size;
      if (width < height) {
        brdSize.value = width;
        ratioSize.value = width / 900;
        // ratioFontSize.value = height / width
      } else {
        brdSize.value = height;
        ratioSize.value = height / 900;
        // ratioFontSize.value = width / height;
      }
      if (width === 0) brdSize.value = height;
      else if (height === 0) brdSize.value = width;
    }, 10);
  }
  window.addEventListener("resize", Rescale);
  onMounted(Rescale);
  onUnmounted(() => window.removeEventListener("resize", Rescale));
  return {
    brdSize,
    ratioSize,
    Rescale,
  };
}
