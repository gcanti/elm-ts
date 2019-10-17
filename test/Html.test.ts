import * as assert from 'assert'
import { Cmd, none } from '../src/Cmd'
import { map, program, programWithFlags, run } from '../src/Html'
import * as H from './_helpers'

describe('Html', () => {
  it('map() should map an `Html<dom, A>` into an `Html<dom, B>`', () => {
    const state: string[] = []
    const btn = H.button('A button')
    const dispatch = (msg: H.Msg) => state.push(msg.type)
    const m = map<H.Dom, H.Msg, H.Msg>(() => ({ type: 'BAR' as const }))

    btn(dispatch).onclick()
    m(btn)(dispatch).onclick()

    assert.deepStrictEqual(state, ['FOO', 'BAR'])
  })

  describe('program()', () => {
    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - no subscription', () => {
      const collectSub$: H.Msg[] = []
      const collectView$: H.View[] = []
      const { dispatch, html$, sub$ } = program(H.init, H.update, H.view)

      html$.subscribe(v => collectView$.push(v))
      sub$.subscribe(v => collectSub$.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'DO-THE-THING!' })

      assert.deepStrictEqual(collectSub$, [])
      assert.deepStrictEqual(collectView$.map(x => x(dispatch).text), ['', 'foo', 'bar'])
    })

    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - with subscription', () => {
      const collectView$: H.View[] = []
      const collectSub$: H.Msg[] = []
      const { sub$, html$, dispatch } = program(H.init, H.update, H.view, H.subscriptions)

      html$.subscribe(v => collectView$.push(v))
      sub$.subscribe(v => collectSub$.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(collectSub$, [{ type: 'LISTEN' }])
      assert.deepStrictEqual(collectView$.map(x => x(dispatch).text), ['', 'foo', 'bar', 'sub'])
    })
  })

  it('programWithFlags() should return a function that returns a program() with flags on `init`', () => {
    const collectView$: H.View[] = []
    const initWithFlags = (f: string): [H.Model, Cmd<H.Msg>] => [{ x: f }, none]
    const withFlags = programWithFlags(initWithFlags, H.update, H.view, H.subscriptions)
    const { dispatch, html$ } = withFlags('start!')

    html$.subscribe(v => collectView$.push(v))

    assert.deepStrictEqual(collectView$.map(x => x(dispatch).text), ['start!'])
  })

  it('run() should run the Program', () => {
    const collectRendering: string[] = []
    const renderer = (dom: H.SimplerDom) => {
      collectRendering.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
    }
    const spanView = (model: H.Model) => H.span(model.x)
    const p = program(H.init, H.update, spanView, H.subscriptions)

    run(p, renderer)

    p.dispatch({ type: 'FOO' })
    p.dispatch({ type: 'SUB' })
    p.dispatch({ type: 'BAR' })
    p.dispatch({ type: 'DO-THE-THING!' })

    return H.delayedAssert(() => {
      assert.deepStrictEqual(collectRendering, [
        '<span></span>',
        '<span>foo</span>',
        '<span>sub</span>',
        '<span>listen</span>',
        '<span>bar</span>',
        '<span>foo</span>'
      ])
    })
  })
})
