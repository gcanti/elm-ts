import * as assert from 'assert'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { Cmd, none } from '../src/Cmd'
import { program, programWithFlags, run } from '../src/Platform'
import { Model, Msg, delayedAssert, init, subscriptions, update } from './_helpers'

const sequenceTask = A.array.sequence(T.task)

describe('Platform', () => {
  describe('program()', () => {
    it('should return the Model/Cmd/Sub streams and Dispatch function - no subscription', async () => {
      const models: Model[] = []
      const cmds: Array<T.Task<O.Option<Msg>>> = []
      const subs: Msg[] = []
      const { model$, cmd$, sub$, dispatch } = program(init, update)

      cmd$.subscribe(v => cmds.push(v))
      model$.subscribe(v => models.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'DO-THE-THING!' })

      assert.deepStrictEqual(models, [{ x: '' }, { x: 'foo' }, { x: 'bar' }])
      assert.deepStrictEqual(subs, [])

      const commands = await sequenceTask(cmds)()

      assert.deepStrictEqual(commands, [O.some({ type: 'FOO' })])
    })

    it('should return the Model/Cmd/Sub streams and Dispatch function - with subscription', () => {
      const models: Model[] = []
      const subs: Msg[] = []
      const { model$, sub$, dispatch } = program(init, update, subscriptions)

      model$.subscribe(v => models.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(models, [{ x: '' }, { x: 'foo' }, { x: 'bar' }, { x: 'sub' }])
      assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
    })
  })

  describe('programWithFlags()', () => {
    it('should return a function which returns a program() with flags on `init` - no subscription', () => {
      const models: Model[] = []
      const subs: Msg[] = []

      const initWithFlags = (f: string): [Model, Cmd<Msg>] => [{ x: f }, none]
      const withFlags = programWithFlags(initWithFlags, update)
      const { model$, sub$ } = withFlags('start!')

      model$.subscribe(v => models.push(v))
      sub$.subscribe(v => subs.push(v))

      assert.deepStrictEqual(models, [{ x: 'start!' }])
      assert.deepStrictEqual(subs, [])
    })

    it('should return a function which returns a program() with flags on `init` - with subscription', () => {
      const models: Model[] = []
      const subs: Msg[] = []

      const initWithFlags = (f: string): [Model, Cmd<Msg>] => [{ x: f }, none]
      const withFlags = programWithFlags(initWithFlags, update, subscriptions)
      const { model$, sub$, dispatch } = withFlags('start!')

      model$.subscribe(v => models.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(models, [{ x: 'start!' }, { x: 'sub' }])
      assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
    })
  })

  it('run() should run the Program', () => {
    // setup
    const models: Model[] = []
    const p = program(init, update, subscriptions)
    p.model$.subscribe(model => models.push(model))

    // run
    run(p)

    // dispatch
    p.dispatch({ type: 'FOO' })
    p.dispatch({ type: 'SUB' })
    p.dispatch({ type: 'BAR' })
    p.dispatch({ type: 'DO-THE-THING!' })

    // assert
    return delayedAssert(() => {
      assert.deepStrictEqual(models, [
        { x: '' },
        { x: 'foo' },
        { x: 'sub' },
        { x: 'listen' },
        { x: 'bar' },
        { x: 'foo' }
      ])
    })
  })
})
