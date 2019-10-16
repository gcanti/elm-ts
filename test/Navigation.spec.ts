// --- Mocking `History` module - super tricky...
import { mocked } from 'ts-jest/utils'
jest.mock('history')
import * as history from 'history'
const historyM = mocked(history)

let log: string[] = []
let listener: history.LocationListener

historyM.createHashHistory.mockImplementation(() => ({
  location: {
    pathname: log.length > 0 ? log[log.length - 1] : '',
    search: '',
    state: null,
    hash: ''
  },

  push: (path: string | history.LocationDescriptorObject): void => {
    const p = typeof path === 'string' ? path : typeof path.pathname !== 'undefined' ? path.pathname : ''
    log.push(p)

    listener(
      {
        pathname: p,
        search: '',
        state: null,
        hash: ''
      },
      'PUSH'
    )
  },

  listen: (fn: history.History.LocationListener): history.UnregisterCallback => {
    listener = fn
    return () => undefined
  },

  // These are needed by `history` types declaration
  length: log.length,
  action: 'PUSH',
  replace: () => undefined,
  go: () => undefined,
  goBack: () => undefined,
  goForward: () => undefined,
  block: () => () => undefined,
  createHref: () => ''
}))
// --- /Mocking

import * as assert from 'assert'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { EMPTY, of } from 'rxjs'
import { Cmd, none } from '../src/Cmd'
import { Html } from '../src/Html'
import { Location, program, programWithFlags, push } from '../src/Navigation'
import { Sub } from '../src/Sub'
import * as H from './_helpers'

beforeEach(() => {
  log = []
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Navigation', () => {
  it('push() should push a new path into history and return a Cmd<msg>', done => {
    return push('/a-path').subscribe(async to => {
      const result = await to()

      assert.deepStrictEqual(result, O.none)
      assert.deepStrictEqual(log, ['/a-path'])

      done()
    })
  })

  describe('program()', () => {
    it('should return a Program and listen to location changes - no subscription', () => {
      const subs: NavMsg[] = []
      const views: NavView[] = []
      const cmds: Array<T.Task<O.Option<NavMsg>>> = []

      const { dispatch, html$, cmd$, sub$ } = program(locationToMsg, initWithLocation, navUpdate, H.view)

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
        assert.deepStrictEqual(subs, [{ type: 'BAR' }])
        assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar'])
      })
    })

    it('should return a Program and listen to location changes - with subscription', () => {
      const subs: NavMsg[] = []
      const views: NavView[] = []
      const cmds: Array<T.Task<O.Option<NavMsg>>> = []

      const { dispatch, html$, cmd$, sub$ } = program(locationToMsg, initWithLocation, navUpdate, H.view, subscriptions)

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
        assert.deepStrictEqual(subs, [{ type: 'LISTEN' }, { type: 'BAR' }])
        assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'sub', 'listen', 'bar'])
      })
    })
  })

  describe('programWithFlags()', () => {
    it('programWithFlags() should return a function which returns a program() with flags on `init` - no subscription', () => {
      const subs: NavMsg[] = []
      const views: NavView[] = []
      const initWithFlags = (f: string) => (_: Location): [H.Model, Cmd<NavMsg>] => [{ x: f }, none]
      const withFlags = programWithFlags(locationToMsg, initWithFlags, navUpdate, H.view)
      const { dispatch, html$, sub$ } = withFlags('start!')

      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => subs.push(v))

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['start!'])
      assert.deepStrictEqual(subs, [])
    })

    it('programWithFlags() should return a function which returns a program() with flags on `init` - with subscription', () => {
      const subs: NavMsg[] = []
      const views: NavView[] = []
      const initWithFlags = (f: string) => (_: Location): [H.Model, Cmd<NavMsg>] => [{ x: f }, none]
      const withFlags = programWithFlags(locationToMsg, initWithFlags, navUpdate, H.view, subscriptions)
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
type NavMsg = H.Msg | { type: 'GO_TO'; path: string }
type NavView = Html<H.Dom, NavMsg>

function navUpdate(msg: NavMsg, model: H.Model): [H.Model, Cmd<NavMsg>] {
  if (msg.type === 'GO_TO') {
    return [model, push(msg.path)]
  }

  return H.update(msg, model)
}

function locationToMsg(l: Location): NavMsg {
  return {
    type: l.pathname.substring(1).toUpperCase()
  } as NavMsg
}

function initWithLocation(l: Location): [H.Model, Cmd<NavMsg>] {
  return [{ x: l.pathname }, none]
}

function subscriptions(m: H.Model): Sub<NavMsg> {
  return m.x === 'sub' ? of<NavMsg>({ type: 'LISTEN' }) : EMPTY
}
