export const delayedAssert = (f: () => void, delay: number = 50): Promise<void> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        f()
        resolve()
      } catch (e) {
        reject(e)
      }
    }, delay)
  })
