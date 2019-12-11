import * as assert from 'assert'
import { none, some } from 'fp-ts/lib/Option'
import { BehaviorSubject } from 'rxjs'
import { DebugData, DebuggerR, Global, MsgWithDebug } from '../../src/Debug/commons'
import { Connection, getConnection, reduxDevToolDebugger } from '../../src/Debug/redux-devtool'
import { Dispatch } from '../../src/Platform'
import { Model, Msg, STD_DEPS } from './_helpers'

describe('Debug/redux-dev-tool', () => {
  it('getConnection() should return an IO of Some<Connection> if dev-tool extension is available', () => {
    let called = false
    const spyConnect = () => {
      called = true
    }

    const noDevTool = getConnection({} as Global)
    const globalWithDevTool = ({ __REDUX_DEVTOOLS_EXTENSION__: { connect: spyConnect } } as unknown) as Global
    const withDevTool = getConnection(globalWithDevTool)

    assert.deepStrictEqual(noDevTool(), none)
    assert.deepStrictEqual(withDevTool(), some(undefined))
    assert.ok(called)
  })

  describe('reduxDevToolDebugger()', () => {
    // --- Setup
    const oriConsoleWarn = console.warn

    let connection: Connection<Model, Msg>
    let emit: Dispatch<any>

    beforeEach(() => {
      connection = {
        subscribe: listener => {
          emit = listener as Dispatch<any>
          return () => undefined
        },
        send: jest.fn(),
        init: jest.fn(),
        error: jest.fn()
      }

      console.warn = jest.fn(() => undefined)
    })

    // --- Teardown
    afterEach(() => {
      console.warn = oriConsoleWarn
    })

    // --- Tests
    it('should handle actions dispatched by application', () => {
      const send = connection.send as jest.Mock<any, any>
      const debug = reduxDevToolDebugger(connection)(STD_DEPS)

      debug([{ type: 'INIT' }, 0])

      assert.strictEqual(send.mock.calls.length, 0)

      debug([{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1])

      assertCalledWith(send, { type: 'Inc' }, 1)
    })

    it('should handle "START" message from extension', () => {
      const init = connection.init as jest.Mock<any, any>
      reduxDevToolDebugger(connection)(STD_DEPS)

      emit({ type: 'START' })

      assertCalledWith(init, 0)
    })

    it('should handle "ACTION" message from extension', () => {
      const warn = console.warn as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      // --- OK
      emit({ type: 'ACTION', payload: JSON.stringify({ type: 'Inc' }) })

      assertCalledWith(dispatch, { type: 'Inc' })

      // --- Parse error
      emit({ type: 'ACTION', payload: 'type: "Inc"' })

      assertCalledWith(warn, '[REDUX DEV TOOL]', 'Unexpected token y in JSON at position 1')
    })

    it('should handle "JUMP_TO_STATE" and "JUMP_TO_ACTION" messages from extension', () => {
      const warn = console.warn as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      // --- JUMP_TO_STATE - OK
      emit({ type: 'DISPATCH', payload: { type: 'JUMP_TO_STATE' }, state: JSON.stringify(123) })

      assertCalledNWith(1, dispatch, { type: '__DebugUpdateModel__', payload: 123 })

      // --- JUMP_TO_STATE - Parse error
      emit({ type: 'DISPATCH', payload: { type: 'JUMP_TO_STATE' } })

      assertCalledNWith(1, warn, '[REDUX DEV TOOL]', 'Unexpected token u in JSON at position 0')

      // --- JUMP_TO_ACTION - OK
      emit({ type: 'DISPATCH', payload: { type: 'JUMP_TO_ACTION' }, state: JSON.stringify(123) })

      assertCalledNWith(2, dispatch, { type: '__DebugUpdateModel__', payload: 123 })

      // --- JUMP_TO_ACTION - Parse error
      emit({ type: 'DISPATCH', payload: { type: 'JUMP_TO_ACTION' }, state: '1,23' })

      assertCalledNWith(2, warn, '[REDUX DEV TOOL]', 'Unexpected token , in JSON at position 1')
    })

    it('should handle "RESET" message from extension', () => {
      const init = connection.init as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      emit({ type: 'DISPATCH', payload: { type: 'RESET' } })

      assertCalledWith(dispatch, { type: '__DebugUpdateModel__', payload: 0 })
      assertCalledWith(init, 0)
    })

    it('should handle "ROLLBACK" message from extension', () => {
      const warn = console.warn as jest.Mock<any, any>
      const init = connection.init as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      // --- OK
      emit({ type: 'DISPATCH', payload: { type: 'ROLLBACK' }, state: JSON.stringify(123) })

      assertCalledWith(dispatch, { type: '__DebugUpdateModel__', payload: 123 })
      assertCalledWith(init, 123)

      // --- Parse error
      emit({ type: 'DISPATCH', payload: { type: 'ROLLBACK' }, state: '1,23' })

      assertCalledWith(warn, '[REDUX DEV TOOL]', 'Unexpected token , in JSON at position 1')
    })

    it('should handle "COMMIT" message from extension', () => {
      const init = connection.init as jest.Mock<any, any>
      const debug$ = new BehaviorSubject<DebugData<Model, Msg>>([{ type: 'INIT' }, 0])
      reduxDevToolDebugger(connection)({ ...STD_DEPS, debug$ })

      // Add some values in data$ stream to simulate a "living" application
      debug$.next([{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1])
      debug$.next([{ type: 'MESSAGE', payload: { type: 'Inc' } }, 2])
      debug$.next([{ type: 'MESSAGE', payload: { type: 'Inc' } }, 3])
      debug$.next([{ type: 'MESSAGE', payload: { type: 'Dec' } }, 2])

      emit({ type: 'DISPATCH', payload: { type: 'COMMIT' } })

      assertCalledWith(init, 2) // gets current value from data$
    })

    it('should handle "IMPORT_STATE" message from extension', () => {
      const warn = console.warn as jest.Mock<any, any>
      const send = connection.send as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      // --- OK
      emit({ type: 'DISPATCH', payload: { type: 'IMPORT_STATE', nextLiftedState: LIFTED_STATE } })

      assertCalledWith(dispatch, { type: '__DebugUpdateModel__', payload: 2 })
      assertCalledWith(send, null, LIFTED_STATE)

      // --- Parse error
      emit({ type: 'DISPATCH', payload: { type: 'IMPORT_STATE', foo: LIFTED_STATE } })
      assertCalledWith(warn, '[REDUX DEV TOOL]', 'IMPORT_STATE message has some bad payload...')
    })

    it('should handle "TOGGLE_ACTION" message from extension', () => {
      const warn = console.warn as jest.Mock<any, any>
      const send = connection.send as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      // --- OK
      emit({ type: 'DISPATCH', payload: { type: 'TOGGLE_ACTION', id: 2 }, state: JSON.stringify(LIFTED_STATE) })

      assertCalledNWith(1, dispatch, { type: '__DebugUpdateModel__', payload: 1 })
      assertCalledNWith(2, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Dec' } })
      assertCalledNWith(3, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Inc' } })
      assertCalledNWith(1, send, null, { ...LIFTED_STATE, skippedActionIds: [2] })

      // --- Parse error
      emit({ type: 'DISPATCH', payload: { type: 'TOGGLE_ACTION' }, state: JSON.stringify(LIFTED_STATE) })
      assertCalledNWith(1, warn, '[REDUX DEV TOOL]', 'TOGGLE_ACTION message has some bad payload...')

      emit({ type: 'DISPATCH', payload: { type: 'TOGGLE_ACTION', id: 2 }, state: 'actions: bad' })
      assertCalledNWith(1, warn, '[REDUX DEV TOOL]', 'TOGGLE_ACTION message has some bad payload...')
    })

    it('should handle "TOGGLE_ACTION" message from extension - action not staged', () => {
      const send = connection.send as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      emit({ type: 'DISPATCH', payload: { type: 'TOGGLE_ACTION', id: 5 }, state: JSON.stringify(LIFTED_STATE) })

      assert.strictEqual(dispatch.mock.calls.length, 0)

      assertCalledWith(send, null, LIFTED_STATE)
    })

    it('should handle "TOGGLE_ACTION" message from extension - action already toggled', () => {
      const send = connection.send as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      emit({
        type: 'DISPATCH',
        payload: { type: 'TOGGLE_ACTION', id: 2 },
        state: JSON.stringify({ ...LIFTED_STATE, skippedActionIds: [2] })
      })

      assertCalledNWith(1, dispatch, { type: '__DebugUpdateModel__', payload: 1 })
      assertCalledNWith(2, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Inc' } })
      assertCalledNWith(3, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Dec' } })
      assertCalledNWith(4, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Inc' } })

      assertCalledWith(send, null, LIFTED_STATE)
    })

    it('should handle "TOGGLE_ACTION" message from extension - action already toggled with others', () => {
      const send = connection.send as jest.Mock<any, any>
      const dispatch = jest.fn()
      reduxDevToolDebugger(connection)(depsWith(dispatch))

      emit({
        type: 'DISPATCH',
        payload: { type: 'TOGGLE_ACTION', id: 2 },
        state: JSON.stringify({ ...LIFTED_STATE, skippedActionIds: [2, 4] })
      })

      assertCalledNWith(1, dispatch, { type: '__DebugUpdateModel__', payload: 1 })
      assertCalledNWith(2, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Inc' } })
      assertCalledNWith(3, dispatch, { type: '__DebugApplyMsg__', payload: { type: 'Dec' } })

      assertCalledWith(send, null, {
        ...LIFTED_STATE,
        skippedActionIds: [4]
      })
    })

    it('should warn if message is not handled', () => {
      const warn = console.warn as jest.Mock<any, any>
      reduxDevToolDebugger(connection)(STD_DEPS)

      emit({ type: 'DISPATCH', payload: { type: 'UNKNOWN_TYPE' } })

      assertCalledWith(warn, '[REDUX DEV TOOL]', 'UNKNOWN_TYPE')
    })
  })
})

// --- Helpers
const depsWith = (dispatch: Dispatch<MsgWithDebug<Model, Msg>>): DebuggerR<Model, Msg> => ({
  ...STD_DEPS,
  dispatch
})

const LIFTED_STATE = {
  actionsById: {
    '0': { action: { type: '@@INIT' }, timestamp: 1574269844816, type: 'PERFORM_ACTION' },
    '1': { action: { type: 'Inc' }, timestamp: 1574269853594, type: 'PERFORM_ACTION' },
    '2': { action: { type: 'Inc' }, timestamp: 1574269853726, type: 'PERFORM_ACTION' },
    '3': { action: { type: 'Dec' }, timestamp: 1574269853888, type: 'PERFORM_ACTION' },
    '4': { action: { type: 'Inc' }, timestamp: 1574269854031, type: 'PERFORM_ACTION' }
  },
  computedStates: [{ state: 0 }, { state: 1 }, { state: 2 }, { state: 1 }, { state: 2 }],
  currentStateIndex: 4,
  nextActionId: 5,
  skippedActionIds: [],
  stagedActionIds: [0, 1, 2, 3, 4]
}

/**
 * Asserts that the mocked function was called **__1__** time with provided parameters
 */
function assertCalledWith(fn: jest.Mock<any, any[]>, ...params: any[]): void {
  const calls = fn.mock.calls

  assert.strictEqual(calls.length, 1)

  calls[0].forEach((p, i) => {
    assert.deepStrictEqual(p, params[i])
  })
}

/**
 * Asserts that the mocked function was called the **__n__** time with provided parameters
 */
function assertCalledNWith(n: number, fn: jest.Mock<any, any[]>, ...params: any[]): void {
  const calls = fn.mock.calls

  assert.ok(calls.length >= n)

  calls[n - 1].forEach((p, i) => {
    assert.deepStrictEqual(p, params[i])
  })
}
