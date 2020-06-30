// --- Mocking `History` module - super tricky...
import * as history from 'history'
import { mocked } from 'ts-jest/utils'
import { createMockHistory } from './helpers/mock-history'

jest.mock('history')

const historyM = mocked(history)
const log: string[] = []

historyM.createHashHistory.mockImplementation(createMockHistory(log))
// --- /Mocking

import * as assert from 'assert'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { EMPTY, of } from 'rxjs'
import { Cmd, none } from '../src/Cmd'
import { Html } from '../src/Html'
import { Location, program, programWithFlags, push } from '../src/Navigation'
import { Sub } from '../src/Sub'
import * as App from './helpers/app'

beforeEach(() => {
  log.splice(0, log.length)
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Navigation', () => {
  describe('push()', () => {
    it('should push a new path into history and return a Cmd<msg>', done => {
      return push('/a-path').subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(result, O.none)
        assert.deepStrictEqual(log, ['/a-path'])

        done()
      })
    })
  })

  describe('program()', () => {
    it('should return a Program and listen to location changes - no subscription', () => {
      const cmds: Array<T.Task<O.Option<NavMsg>>> = []
      const views: NavView[] = []
      const subs: NavMsg[] = []

      const { dispatch, html$, cmd$, sub$ } = program(locationToMsg, initWithLocation, navUpdate, App.view)

      cmd$.subscribe(v => cmds.push(v))
      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => {
        subs.push(v)
        dispatch(v) // simulate `run()`
      })

      dispatch({ type: 'FOO' })
      dispatch({ type: 'GO_TO', path: '/bar' })

      // Assert that there is just one command
      assert.strictEqual(cmds.length, 1)

      return cmds[0]().then(() => {
        assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar'])
        assert.deepStrictEqual(subs, [{ type: 'BAR' }])
      })
    })

    it('should return a Program and listen to location changes - with subscription', () => {
      const cmds: Array<T.Task<O.Option<NavMsg>>> = []
      const views: NavView[] = []
      const subs: NavMsg[] = []

      const { dispatch, html$, cmd$, sub$ } = program(
        locationToMsg,
        initWithLocation,
        navUpdate,
        App.view,
        subscriptions
      )

      cmd$.subscribe(v => cmds.push(v))
      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => {
        subs.push(v)
        dispatch(v) // simulate `run()`
      })

      dispatch({ type: 'FOO' })
      dispatch({ type: 'GO_TO', path: '/bar' })
      dispatch({ type: 'SUB' })

      // Assert that there is just one command
      assert.strictEqual(cmds.length, 1)

      return cmds[0]().then(() => {
        // "BAR" is dispatch after "LISTEN" because it's dependent of `cmd()`
        assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'sub', 'listen', 'bar'])
        assert.deepStrictEqual(subs, [{ type: 'LISTEN' }, { type: 'BAR' }])
      })
    })
  })

  describe('programWithFlags()', () => {
    it('programWithFlags() should return a function which returns a program() with flags on `init` - no subscription', () => {
      const views: NavView[] = []
      const subs: NavMsg[] = []
      const initWithFlags = (f: string) => (_: Location): [App.Model, Cmd<NavMsg>] => [{ x: f }, none]
      const withFlags = programWithFlags(locationToMsg, initWithFlags, navUpdate, App.view)
      const { dispatch, html$, sub$ } = withFlags('start!')

      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => subs.push(v))

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['start!'])
      assert.deepStrictEqual(subs, [])
    })

    it('programWithFlags() should return a function which returns a program() with flags on `init` - with subscription', () => {
      const views: NavView[] = []
      const subs: NavMsg[] = []
      const initWithFlags = (f: string) => (_: Location): [App.Model, Cmd<NavMsg>] => [{ x: f }, none]
      const withFlags = programWithFlags(locationToMsg, initWithFlags, navUpdate, App.view, subscriptions)
      const { dispatch, html$, sub$ } = withFlags('start!')

      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['start!', 'sub'])
      assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
    })
  })
})

// --- Utilities
type NavMsg = App.Msg | { type: 'GO_TO'; path: string }
type NavView = Html<App.Dom, NavMsg>

function navUpdate(msg: NavMsg, model: App.Model): [App.Model, Cmd<NavMsg>] {
  if (msg.type === 'GO_TO') {
    return [model, push(msg.path)]
  }

  return App.update(msg, model)
}

function locationToMsg(l: Location): NavMsg {
  return {
    type: l.pathname.substring(1).toUpperCase()
  } as NavMsg
}

function initWithLocation(l: Location): [App.Model, Cmd<NavMsg>] {
  return [{ x: l.pathname }, none]
}

function subscriptions(m: App.Model): Sub<NavMsg> {
  return m.x === 'sub' ? of<NavMsg>({ type: 'LISTEN' }) : EMPTY
}
