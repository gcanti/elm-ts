import { some } from 'fp-ts/lib/Option'
import { task } from 'fp-ts/lib/Task'
import { EMPTY, Observable, of } from 'rxjs'
import * as cmd from '../src/Cmd'
import { Html } from '../src/Html'
import { Dispatch } from '../src/Platform'

// --- Model
export interface Model {
  x: string
}

export const init: [Model, cmd.Cmd<Msg>] = [{ x: '' }, cmd.none]

// --- Messages
export type Msg = { type: 'FOO' } | { type: 'BAR' } | { type: 'DO-THE-THING!' } | { type: 'SUB' } | { type: 'LISTEN' }

// --- Update
const withModel = (model: Model): [Model, cmd.Cmd<Msg>] => [model, cmd.none]

const withEffect = (model: Model, cmd: cmd.Cmd<Msg>): [Model, cmd.Cmd<Msg>] => [model, cmd]

const dispatchFoo = of(task.of(some<Msg>({ type: 'FOO' })))

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'FOO':
      return withModel({ ...model, x: 'foo' })

    case 'BAR':
      return withModel({ ...model, x: 'bar' })

    case 'DO-THE-THING!':
      return withEffect(model, dispatchFoo)

    case 'SUB':
      return withModel({ ...model, x: 'sub' })

    case 'LISTEN':
      return withModel({ ...model, x: 'listen' })
  }
}

// --- View
export interface Dom {
  tag: string
  text: string
  onclick: () => void
}

export type SimplerDom = Omit<Dom, 'onclick'>

export type View = Html<Dom, Msg>
type SimplerView = Html<SimplerDom, Msg>

export function view(model: Model): View {
  return button(model.x)
}

export function button(x: string): View {
  return (d: Dispatch<Msg>) => ({
    tag: 'button',
    text: x,
    onclick: () => d({ type: 'FOO' })
  })
}

export function span(x: string): SimplerView {
  return (_: Dispatch<Msg>) => ({
    tag: 'span',
    text: x
  })
}

// --- Subscription
export function subscriptions(m: Model): Observable<Msg> {
  return m.x === 'sub' ? of<Msg>({ type: 'LISTEN' }) : EMPTY
}

// --- Utilities
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
