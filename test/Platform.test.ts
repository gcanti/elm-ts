import { some } from 'fp-ts/lib/Option'
import { task } from 'fp-ts/lib/Task'
import { EMPTY, Observable, of } from 'rxjs'
import * as cmd from '../src/Cmd'
import { program, run } from '../src/Platform'

type Msg = { type: 'FOO' } | { type: 'BAR' } | { type: 'DO-THE-THING!' } | { type: 'SUB' } | { type: 'LISTEN' }

interface Model {
  x: string
}
const init: [Model, cmd.Cmd<Msg>] = [{ x: '' }, cmd.none]

const withModel = (model: Model): [Model, cmd.Cmd<Msg>] => [model, cmd.none]

const withEffect = (model: Model, cmd: cmd.Cmd<Msg>): [Model, cmd.Cmd<Msg>] => [model, cmd]

const dispatchFoo = of(task.of(some<Msg>({ type: 'FOO' })))

function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
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

function subscriptions(m: Model): Observable<Msg> {
  return m.x === 'sub' ? of<Msg>({ type: 'LISTEN' }) : EMPTY
}

const delayedAssert = (f: () => void, delay: number = 50): Promise<void> =>
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

test('run() should run the Program', () => {
  // setup
  const log: Array<Model> = []
  const p = program(init, update, subscriptions)
  p.model$.subscribe(model => log.push(model))

  // run
  run(p)

  // dispatch
  p.dispatch({ type: 'FOO' })
  p.dispatch({ type: 'SUB' })
  p.dispatch({ type: 'BAR' })
  p.dispatch({ type: 'DO-THE-THING!' })

  // assert
  return delayedAssert(() => {
    expect(log).toEqual([{ x: '' }, { x: 'foo' }, { x: 'sub' }, { x: 'listen' }, { x: 'bar' }, { x: 'foo' }])
  })
})
