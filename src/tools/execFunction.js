
export function execFunction(fn, ...args) {
  if (typeof fn === 'function') {
    fn(...args)
  }
}
