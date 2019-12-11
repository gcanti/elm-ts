import * as assert from 'assert'
import { BehaviorSubject } from 'rxjs'
import { DebugData, debugInit, debugMsg, runDebugger } from '../../src/Debug/commons'
import * as ConsoleDebugger from '../../src/Debug/console'
import * as DevToolDebugger from '../../src/Debug/redux-devtool'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('Debug/commons', () => {
  it('debugInit() should return a `DebugInit` object', () => {
    assert.deepStrictEqual(debugInit(), { type: 'INIT' })
  })

  it('debugMsg() should return a `DebugMsg` object', () => {
    assert.deepStrictEqual(debugMsg({ type: 'MyMessage', some: 'data' }), {
      type: 'MESSAGE',
      payload: {
        type: 'MyMessage',
        some: 'data'
      }
    })
  })

  describe('runDebugger()', () => {
    it('should run a standard console debugger when redux dev-tool is not available', () => {
      const log: Array<DebugData<Model, Msg>> = []

      // --- Mock debuggers
      jest.spyOn(DevToolDebugger, 'reduxDevToolDebugger').mockReturnValueOnce(() => _ => undefined)
      jest
        .spyOn(ConsoleDebugger, 'consoleDebugger')
        .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))
      // ---

      const Debugger = runDebugger<Model, Msg>(window)
      const init = 0
      const debug$ = new BehaviorSubject<DebugData<Model, Msg>>([debugInit(), init])
      const dispatch = () => undefined

      Debugger({ init, debug$, dispatch })()

      debug$.next([debugMsg({ tag: 'Inc' }), 1])

      assert.deepStrictEqual(log, [[debugInit(), 0], [debugMsg({ tag: 'Inc' }), 1]])

      assert.strictEqual((DevToolDebugger.reduxDevToolDebugger as any).mock.calls.length, 0)
    })

    it('should run a redux dev-toll debugger when is available', () => {
      const log: Array<DebugData<Model, Msg>> = []

      // --- Mock debuggers
      jest.spyOn(ConsoleDebugger, 'consoleDebugger').mockReturnValueOnce(() => _ => undefined)
      jest
        .spyOn(DevToolDebugger, 'reduxDevToolDebugger')
        .mockReturnValueOnce(() => data => log.push(data as DebugData<Model, Msg>))
      // ---

      const win = window as any

      // --- Mock Redux DevTool Extension
      win.__REDUX_DEVTOOLS_EXTENSION__ = {
        connect: () => ({})
      }

      const Debugger = runDebugger<Model, Msg>(win)
      const init = 0
      const debug$ = new BehaviorSubject<DebugData<Model, Msg>>([debugInit(), init])
      const dispatch = () => undefined

      Debugger({ init, debug$, dispatch })()

      debug$.next([debugMsg({ tag: 'Inc' }), 1])

      assert.deepStrictEqual(log, [[debugInit(), 0], [debugMsg({ tag: 'Inc' }), 1]])

      assert.strictEqual((ConsoleDebugger.consoleDebugger as any).mock.calls.length, 0)
    })
  })
})

// --- Helpers
type Model = number
type Msg = { tag: 'Inc' } | { tag: 'Dec' }
