import * as assert from 'assert'
import { array } from 'fp-ts/lib/Array'
import { Option, some } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { Subject } from 'rxjs'
import { Cmd, none } from '../src/Cmd'
import { program, programWithFlags, run, withStop } from '../src/Platform'
import { Model, Msg, delayedAssert, init, subscriptions, update } from './_helpers'

const sequenceTask = array.sequence(task)

describe('Platform', () => {
  describe('program()', () => {
    it('should return the Model/Cmd/Sub streams and Dispatch function - no subscription', async () => {
      const models: Model[] = []
      const cmds: Array<Task<Option<Msg>>> = []
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

      assert.deepStrictEqual(commands, [some({ type: 'FOO' })])
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

  it('withStop() should stop the Program when a signal is emitted', async () => {
    const signal = new Subject<any>()

    const models: Model[] = []
    const cmds: Array<Task<Option<Msg>>> = []
    const subs: Msg[] = []
    const { model$, cmd$, sub$, dispatch } = withStop(signal)(program(init, update, subscriptions))

    cmd$.subscribe(v => cmds.push(v))
    model$.subscribe(v => models.push(v))
    sub$.subscribe(v => subs.push(v))

    dispatch({ type: 'FOO' })
    dispatch({ type: 'BAR' })
    dispatch({ type: 'DO-THE-THING!' })
    dispatch({ type: 'SUB' })

    // Emit stop signal and the other changes are bypassed
    signal.next('stop me!')

    dispatch({ type: 'FOO' })
    dispatch({ type: 'BAR' })
    dispatch({ type: 'DO-THE-THING!' })
    dispatch({ type: 'SUB' })

    const commands = await sequenceTask(cmds)()

    assert.deepStrictEqual(models, [{ x: '' }, { x: 'foo' }, { x: 'bar' }, { x: 'sub' }])
    assert.deepStrictEqual(commands, [some({ type: 'FOO' })])
    assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
  })

  describe('run()', () => {
    it('should run the Program', () => {
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

    it('should stop the Program when signal is emitted', () => {
      // setup
      const signal = new Subject<any>()
      const models: Model[] = []
      const p = withStop(signal)(program(init, update, subscriptions))
      p.model$.subscribe(model => models.push(model))

      // run
      run(p)

      // dispatch
      p.dispatch({ type: 'FOO' })
      p.dispatch({ type: 'SUB' })
      p.dispatch({ type: 'BAR' })
      p.dispatch({ type: 'DO-THE-THING!' })

      // Emit stop signal and the other changes are bypassed
      signal.next('stop me!')

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
          { x: 'bar' }
          // the last "foo" would be generated by the "DO-THE-THING!" command
          // but is bypassed because the "stop" signal is emitted before the command's message is consumed
          // { x: 'foo' }
        ])
      })
    })
  })
})
