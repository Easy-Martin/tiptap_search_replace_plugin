export function nextTick(fn: () => void) {
  setTimeout(fn, 0);
}
