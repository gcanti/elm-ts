import * as assert from 'assert'
import * as React from 'react'
import { Cmd, none } from '../src/Cmd'
import { Html, map, program, programWithFlags, run } from '../src/React'
import { Model, Msg, delayedAssert, init, subscriptions, update } from './_helpers'

describe('React', () => {
  it('map() should map an Html<A> into an Html<msg>', () => {
    const log: string[] = []
    const dispatch = (msg: Msg) => log.push(msg.type)

    const btn01: Html<Msg> = dispatch => <button onClick={() => dispatch({ type: 'FOO' })}>Test</button>
    const btn02 = map<Msg, Msg>(() => ({ type: 'BAR' }))(btn01)

    btn01(dispatch).props.onClick()
    btn02(dispatch).props.onClick()

    assert.deepStrictEqual(log, ['FOO', 'BAR'])
  })

  describe('program()', () => {
    it('should return the Model/Cmd/Sub/Html streams and Dispatch function for React - no subscription', () => {
      const collectView$: Array<Html<Msg>> = []
      const { dispatch, html$ } = program(init, update, view)

      html$.subscribe(v => collectView$.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'DO-THE-THING!' })

      assert.deepStrictEqual(collectView$.map(x => x(dispatch).props.children as React.ReactElement<any>), [
        '',
        'foo',
        'bar'
      ])
    })

    it('should return the Model/Cmd/Sub/Html streams and Dispatch function for React - with subscription', () => {
      const collectView$: Array<Html<Msg>> = []
      const collectSub$: Msg[] = []
      const { sub$, html$, dispatch } = program(init, update, view, subscriptions)

      html$.subscribe(v => collectView$.push(v))
      sub$.subscribe(v => collectSub$.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(collectSub$, [{ type: 'LISTEN' }])
      assert.deepStrictEqual(collectView$.map(x => x(dispatch).props.children as React.ReactElement<any>), [
        '',
        'foo',
        'bar',
        'sub'
      ])
    })
  })

  it('programWithFlags() should return a function which returns a program() with flags on `init` for React', () => {
    const collectView$: Array<Html<Msg>> = []
    const initWithFlags = (f: string): [Model, Cmd<Msg>] => [{ x: f }, none]
    const withFlags = programWithFlags(initWithFlags, update, view, subscriptions)
    const { dispatch, html$ } = withFlags('start!')

    html$.subscribe(v => collectView$.push(v))

    assert.deepStrictEqual(collectView$.map(x => x(dispatch).props.children as React.ReactElement<any>), ['start!'])
  })

  it('run() should run the React Program', () => {
    const collectRendering: Array<React.ReactElement<any>> = []
    const renderer = (dom: React.ReactElement<any>) => {
      collectRendering.push(dom)
    }
    const p = program(init, update, view, subscriptions)

    run(p, renderer)

    p.dispatch({ type: 'FOO' })
    p.dispatch({ type: 'SUB' })
    p.dispatch({ type: 'BAR' })
    p.dispatch({ type: 'DO-THE-THING!' })

    return delayedAssert(() => {
      assert.deepEqual(collectRendering.map(testRenderer), [
        { type: 'button', children: '' },
        { type: 'button', children: 'foo' },
        { type: 'button', children: 'sub' },
        { type: 'button', children: 'listen' },
        { type: 'button', children: 'bar' },
        { type: 'button', children: 'foo' }
      ])
    })
  })
})

// --- Utilities
function view(model: Model): Html<Msg> {
  return dispatch => <button onClick={() => dispatch({ type: 'FOO' })}>{model.x}</button>
}

function testRenderer(el: any): any {
  return { type: el.type, children: el.props.children }
}
