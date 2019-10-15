import * as assert from 'assert'
import { program, run } from '../src/Platform'
import { Model, delayedAssert, init, subscriptions, update } from './_helpers'

describe('Platform', () => {
  it('run() should run the Program', () => {
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
      assert.deepEqual(log, [{ x: '' }, { x: 'foo' }, { x: 'sub' }, { x: 'listen' }, { x: 'bar' }, { x: 'foo' }])
    })
  })
})
