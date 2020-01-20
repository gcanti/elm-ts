// --- Helpers
import * as H from '../_helpers'

// --- Mocking `History` module - super tricky...
import { mocked } from 'ts-jest/utils'
jest.mock('history')
import * as history from 'history'
const historyM = mocked(history)

const historyLog: string[] = []

historyM.createHashHistory.mockImplementation(H.createMockHistory(historyLog))
// --- /Mocking

import * as assert from 'assert'
import { take } from 'rxjs/operators'
import { Cmd, none } from '../../src/Cmd'
import { programWithDebugger, programWithDebuggerWithFlags } from '../../src/Debug/Navigation'
import { DebugData } from '../../src/Debug/commons'
import * as ConsoleDebugger from '../../src/Debug/console'
import * as DevToolDebugger from '../../src/Debug/redux-devtool'
import { Html, run } from '../../src/Html'
import { push } from '../../src/Navigation'
import * as Sub from '../../src/Sub'
import { mockDebugger } from './_helpers'

beforeEach(() => {
  historyLog.splice(0, historyLog.length)
})

describe('Debug', () => {
  it('programWithDebugger() should return a Program with a Debugger (console)', done => {
    const log: Array<DebugData<Model, Msg>> = []

    // --- Trace only console debugger
    jest.spyOn(ConsoleDebugger, 'consoleDebugger').mockReturnValueOnce(mockDebugger(log))

    const program = programWithDebugger(locationToMsg, init, update, view)
    const updates = run(program, _ => undefined)

    // the difference between the number of Model and the length of the debug log
    // is due to `__DebugUpdateModel__` and `__DebugApplyMsg__` messages
    // that generate a new Model update but are not tracked by the debugger
    updates.pipe(take(9)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 7)
        assert.deepStrictEqual(log, [
          [{ type: 'INIT' }, ''],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/a' } }, ''],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/a' } }, '/a'],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/c' } }, '/b'],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/c' } }, '/c'],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/e' } }, '/d'],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/e' } }, '/e']
        ])

        done()
      }
    })

    program.dispatch({ type: 'GoTo', path: '/a' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugUpdateModel__', payload: '/b' } as any)
    program.dispatch({ type: 'GoTo', path: '/c' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugApplyMsg__', payload: { type: 'Route', path: '/d' } } as any)
    program.dispatch({ type: 'GoTo', path: '/e' })
  })

  it('programWithDebugger() should return a Program with a Debugger (redux devtool)', done => {
    const log: Array<DebugData<Model, Msg>> = []
    const win = window as any

    // --- Mock Redux DevTool Extension
    win.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({})
    }

    // --- Trace only devtool debugger
    jest.spyOn(DevToolDebugger, 'reduxDevToolDebugger').mockReturnValueOnce(mockDebugger(log))

    const program = programWithDebugger(locationToMsg, init, update, view, () => Sub.none)
    const updates = run(program, _ => undefined)

    // the difference between the number of Model and the length of the debug log
    // is due to `__DebugUpdateModel__` and `__DebugApplyMsg__` messages
    // that generate a new Model update but are not tracked by the debugger
    updates.pipe(take(8)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 7)
        assert.deepStrictEqual(log, [
          [{ type: 'INIT' }, ''],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/a' } }, ''],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/a' } }, '/a'],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/c' } }, '/b'],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/c' } }, '/c'],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/d' } }, '/c'],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/d' } }, '/d']
        ])

        delete win.__REDUX_DEVTOOLS_EXTENSION__

        done()
      }
    })

    program.dispatch({ type: 'GoTo', path: '/a' })
    // we need to cast as any to test internal handling of this "special" message
    program.dispatch({ type: '__DebugUpdateModel__', payload: '/b' } as any)
    program.dispatch({ type: 'GoTo', path: '/c' })
    program.dispatch({ type: 'GoTo', path: '/d' })
  })

  it('programWithDebuggerWithFlags() should return a function that returns a Program with a Debugger and flags on `init`', () => {
    const log: Array<DebugData<Model, Msg>> = []

    // --- Trace only console debugger
    jest.spyOn(ConsoleDebugger, 'consoleDebugger').mockReturnValueOnce(mockDebugger(log))

    const initWithFlags = (flag: string) => (_: history.Location): [Model, Cmd<Msg>] => [flag, none]
    const program = programWithDebuggerWithFlags(locationToMsg, initWithFlags, update, view)('/start')
    const runs = run(program, _ => undefined)

    runs.pipe(take(3)).subscribe({
      complete: () => {
        assert.strictEqual(log.length, 3)
        assert.deepStrictEqual(log, [
          [{ type: 'INIT' }, '/start'],
          [{ type: 'MESSAGE', payload: { type: 'GoTo', path: '/a' } }, '/start'],
          [{ type: 'MESSAGE', payload: { type: 'Route', path: '/a' } }, '/a']
        ])
      }
    })

    program.dispatch({ type: 'GoTo', path: '/a' })
  })
})

// --- Fake application
type Model = string
type Msg = { type: 'GoTo'; path: string } | { type: 'Route'; path: string }

function locationToMsg(l: history.Location): Msg {
  return {
    type: 'Route',
    path: l.pathname
  }
}

const init = (l: history.Location): [Model, Cmd<Msg>] => [l.pathname, none]

const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case 'GoTo':
      return [model, push(msg.path)]
    case 'Route':
      return [msg.path, none]
  }
}

const view = (_: Model): Html<void, Msg> => _dispatch => undefined
