import * as assert from 'assert'
import { take } from 'rxjs/operators'
import { Cmd, none } from '../../src/Cmd'
import { programWithDebugger, programWithDebuggerWithFlags } from '../../src/Debug/Html'
import { DebugData } from '../../src/Debug/commons'
import * as ConsoleDebugger from '../../src/Debug/console'
import * as DevToolDebugger from '../../src/Debug/redux-devtool'
import { Html, run } from '../../src/Html'
import * as Sub from '../../src/Sub'
import { Model, Msg } from './_helpers'

describe('Debug', () => {
  it('programWithDebugger() should return a Program with a Debugger (console)', done => {
    const log: Array<DebugData<Model, Msg>> = []

    // --- Trace only console debugger
    jest
      .spyOn(ConsoleDebugger, 'consoleDebugger')
      .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))

    const program = programWithDebugger(init, update, view)
    const updates = run(program, _ => undefined)

    // the difference between the number of Model and the length of the debug log
    // is due to `__DebugUpdateModel__` and `__DebugApplyMsg__` messages
    // that generate a new Model update but are not tracked by the debugger
    updates.pipe(take(7)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 5)
        assert.deepStrictEqual(log, [
          [{ type: 'INIT' }, 0],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1],
          [{ type: 'MESSAGE', payload: { type: 'Dec' } }, 9],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 10],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 12]
        ])

        done()
      }
    })

    program.dispatch({ type: 'Inc' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugUpdateModel__', payload: 10 } as any)
    program.dispatch({ type: 'Dec' })
    program.dispatch({ type: 'Inc' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugApplyMsg__', payload: { type: 'Inc' } } as any)
    program.dispatch({ type: 'Inc' })
  })

  it('programWithDebugger() should return a Program with a Debugger (redux devtool)', done => {
    const log: Array<DebugData<Model, Msg>> = []
    const win = window as any

    // --- Mock Redux DevTool Extension
    win.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({})
    }

    // --- Trace only devtool debugger
    jest
      .spyOn(DevToolDebugger, 'reduxDevToolDebugger')
      .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))

    const program = programWithDebugger(init, update, view, () => Sub.none)
    const updates = run(program, _ => undefined)

    // the difference between the number of Model and the length of the debug log
    // is due to `__DebugUpdateModel__` and `__DebugApplyMsg__` messages
    // that generate a new Model update but are not tracked by the debugger
    updates.pipe(take(6)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 5)
        assert.deepStrictEqual(log, [
          [{ type: 'INIT' }, 0],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1],
          [{ type: 'MESSAGE', payload: { type: 'Dec' } }, 9],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 10],
          [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 11]
        ])

        delete win.__REDUX_DEVTOOLS_EXTENSION__

        done()
      }
    })

    program.dispatch({ type: 'Inc' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugUpdateModel__', payload: 10 } as any)
    program.dispatch({ type: 'Dec' })
    program.dispatch({ type: 'Inc' })
    program.dispatch({ type: 'Inc' })
  })

  it('programWithDebuggerWithFlags() should return a function that returns a Program with a Debugger and flags on `init`', done => {
    const log: Array<DebugData<Model, Msg>> = []

    // --- Trace only console debugger
    jest
      .spyOn(ConsoleDebugger, 'consoleDebugger')
      .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))

    const initWithFlags = (v: number): [Model, Cmd<Msg>] => [v, none]
    const program = programWithDebuggerWithFlags(initWithFlags, update, view)(10)
    const updates = run(program, _ => undefined)

    updates.pipe(take(2)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 2)
        assert.deepStrictEqual(log, [[{ type: 'INIT' }, 10], [{ type: 'MESSAGE', payload: { type: 'Inc' } }, 11]])

        done()
      }
    })

    program.dispatch({ type: 'Inc' })
  })
})

// --- Fake application
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
