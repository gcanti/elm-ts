import { History, LocationDescriptorObject, LocationListener, UnregisterCallback } from 'history'

/**
 * Creates a mocked implementation of the `history.createHashHistory()` function that tracks location changes through the `log` parameter
 */
export function createMockHistory(log: string[]): () => History {
  let listener: LocationListener

  return () => ({
    location: {
      pathname: log.length > 0 ? log[log.length - 1] : '',
      search: '',
      state: null,
      hash: ''
    },

    push: (path: string | LocationDescriptorObject): void => {
      const p = typeof path === 'string' ? path : typeof path.pathname !== 'undefined' ? path.pathname : ''
      log.push(p)

      listener(
        {
          pathname: p,
          search: '',
          state: null,
          hash: ''
        },
        'PUSH'
      )
    },

    listen: (fn: History.LocationListener): UnregisterCallback => {
      listener = fn
      return () => undefined
    },

    // These are needed by `history` types declaration
    length: log.length,
    action: 'PUSH',
    replace: () => undefined,
    go: () => undefined,
    goBack: () => undefined,
    goForward: () => undefined,
    block: () => () => undefined,
    createHref: () => ''
  })
}
