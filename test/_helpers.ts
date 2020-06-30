import { some } from 'fp-ts/lib/Option'
import { task } from 'fp-ts/lib/Task'
import { History, LocationDescriptorObject, LocationListener, UnregisterCallback } from 'history'
import { EMPTY, Observable, of } from 'rxjs'
import * as cmd from '../src/Cmd'
import { Html } from '../src/Html'

type State = [Model, cmd.Cmd<Msg>]

const withModel = (model: Model): State => [model, cmd.none]

const withEffect = (model: Model, cmd: cmd.Cmd<Msg>): State => [model, cmd]

const doFoo = of(task.of(some<Msg>({ type: 'FOO' })))

const doBaz = of(task.of(some<Msg>({ type: 'BAZ' })))

// ---------
// --- MODEL
// ---------
export interface Model {
  x: string
}

export const init: State = withModel({ x: '' })

export const initWithCmd: State = withEffect({ x: '' }, doBaz)

// ------------
// --- MESSAGES
// ------------
export type Msg =
  | { type: 'FOO' }
  | { type: 'BAR' }
  | { type: 'BAZ' }
  | { type: 'DO-THE-THING!' }
  | { type: 'SUB' }
  | { type: 'LISTEN' }

// ----------
// --- UPDATE
// ----------
export function update(msg: Msg, model: Model): State {
  switch (msg.type) {
    case 'FOO':
    case 'BAR':
    case 'BAZ':
    case 'SUB':
    case 'LISTEN':
      return withModel({ x: msg.type.toLowerCase() })

    case 'DO-THE-THING!':
      return withEffect(model, doFoo)
  }
}

// --------
// --- VIEW
// --------
export interface Dom {
  tag: string
  text: string
  onclick: () => void
}

export type View = Html<Dom, Msg>

export function view(model: Model): View {
  return button(model.x)
}

export function button(x: string): View {
  return d => ({ tag: 'button', text: x, onclick: () => d({ type: 'FOO' }) })
}

export function span(x: string): View {
  return () => ({ tag: 'span', text: x, onclick: () => undefined })
}

// -----------------
// --- SUBSCRIPTIONS
// -----------------
export function subscriptions(m: Model): Observable<Msg> {
  return m.x === 'sub' ? of<Msg>({ type: 'LISTEN' }) : EMPTY
}

// -------------
// --- UTILITIES
// -------------
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

// -----------
// --- HISTORY
// -----------
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
