import * as assert from 'assert'
import { EMPTY } from 'rxjs'
import { Cmd, none } from '../../src/Cmd'
import { programWithDebugger } from '../../src/Debug'
import { DebugData } from '../../src/Debug/commons'
import * as ConsoleDebugger from '../../src/Debug/console'
import * as DevToolDebugger from '../../src/Debug/redux-devtool'
import { Html } from '../../src/Html'
import { Sub } from '../../src/Sub'

describe('Debug', () => {
  let log: Array<DebugData<Model, Msg>> = []

  afterEach(() => {
    log = []
  })

  it('programWithDebugger() should return a Program with a Debugger (console)', () => {
    // --- Trace only console debugger
    jest
      .spyOn(ConsoleDebugger, 'consoleDebugger')
      .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))

    const program = programWithDebugger(init, update, view)

    program.dispatch({ type: 'Inc' })
    program.dispatch({ type: '__DebugUpdateModel__', payload: 10 })
    program.dispatch({ type: 'Dec' })
    program.dispatch({ type: 'Inc' })
    program.dispatch({ type: 'Inc' })

    assert.strictEqual(log.length, 5)
    assert.deepStrictEqual(log, [
      [{ type: 'INIT' }, 0],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1],
      [{ type: 'MESSAGE', payload: { type: 'Dec' } }, 9],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 10],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 11]
    ])
  })

  it('programWithDebugger() should return a Program with a Debugger (redux devtool)', () => {
    const win = window as any

    // --- Mock Redux DevTool Extension
    win.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({})
    }

    // --- Trace only devtool debugger
    jest
      .spyOn(DevToolDebugger, 'reduxDevToolDebugger')
      .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))

    const program = programWithDebugger(init, update, view, subscription)

    program.dispatch({ type: 'Inc' })
    program.dispatch({ type: '__DebugUpdateModel__', payload: 10 })
    program.dispatch({ type: 'Dec' })
    program.dispatch({ type: 'Inc' })
    program.dispatch({ type: 'Inc' })

    assert.strictEqual(log.length, 5)
    assert.deepStrictEqual(log, [
      [{ type: 'INIT' }, 0],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1],
      [{ type: 'MESSAGE', payload: { type: 'Dec' } }, 9],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 10],
      [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 11]
    ])

    delete win.__REDUX_DEVTOOLS_EXTENSION__
  })
})

// --- Fake application
type Model = number
type Msg = { type: 'Inc' } | { type: 'Dec' }

const init: [Model, Cmd<Msg>] = [0, none]

const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case 'Inc':
      return [model + 1, none]
    case 'Dec':
      return [model - 1, none]
  }
}

const view = (_: Model): Html<void, Msg> => _dispatch => undefined

const subscription = (_: Model): Sub<Msg> => EMPTY
