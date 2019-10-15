import { some } from 'fp-ts/lib/Option'
import { task } from 'fp-ts/lib/Task'
import { EMPTY, Observable, of } from 'rxjs'
import * as cmd from '../src/Cmd'

export type Msg = { type: 'FOO' } | { type: 'BAR' } | { type: 'DO-THE-THING!' } | { type: 'SUB' } | { type: 'LISTEN' }

export interface Model {
  x: string
}

export const init: [Model, cmd.Cmd<Msg>] = [{ x: '' }, cmd.none]

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

export function subscriptions(m: Model): Observable<Msg> {
  return m.x === 'sub' ? of<Msg>({ type: 'LISTEN' }) : EMPTY
}

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
