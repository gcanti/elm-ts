import * as assert from 'assert'
import { Cmd, none } from '../src/Cmd'
import { Html, map, program, programWithFlags, run } from '../src/Html'
import { Dispatch } from '../src/Platform'
import { Model, Msg, delayedAssert, init, subscriptions, update } from './_helpers'

describe('Html', () => {
  it('map() should map an `Html<dom, A>` into an `Html<dom, B>`', () => {
    const state: string[] = []
    const btn = button('A button')
    const dispatch = (msg: Msg) => state.push(msg.type)
    const m = map<Dom, Msg, Msg>(() => ({ type: 'BAR' as const }))

    btn(dispatch).onclick()
    m(btn)(dispatch).onclick()

    assert.deepStrictEqual(state, ['FOO', 'BAR'])
  })

  describe('program()', () => {
    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - no subscription', () => {
      const collectSub$: Msg[] = []
      const collectView$: View[] = []
      const { dispatch, html$, sub$ } = program(init, update, view)

      html$.subscribe(v => collectView$.push(v))
      sub$.subscribe(v => collectSub$.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'DO-THE-THING!' })

      assert.deepStrictEqual(collectSub$, [])
      assert.deepStrictEqual(collectView$.map(x => x(dispatch).text), ['', 'foo', 'bar'])
    })

    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - with subscription', () => {
      const collectView$: View[] = []
      const collectSub$: Msg[] = []
      const { sub$, html$, dispatch } = program(init, update, view, subscriptions)

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
    const collectView$: View[] = []
    const initWithFlags = (f: string): [Model, Cmd<Msg>] => [{ x: f }, none]
    const withFlags = programWithFlags(initWithFlags, update, view, subscriptions)
    const { dispatch, html$ } = withFlags('start!')

    html$.subscribe(v => collectView$.push(v))

    assert.deepStrictEqual(collectView$.map(x => x(dispatch).text), ['start!'])
  })

  it('run() should run the Program', () => {
    const collectRendering: string[] = []
    const renderer = (dom: SimplerDom) => {
      collectRendering.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
    }
    const spanView = (model: Model) => span(model.x)
    const p = program(init, update, spanView, subscriptions)

    run(p, renderer)

    p.dispatch({ type: 'FOO' })
    p.dispatch({ type: 'SUB' })
    p.dispatch({ type: 'BAR' })
    p.dispatch({ type: 'DO-THE-THING!' })

    return delayedAssert(() => {
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

// --- Utilities
interface Dom {
  tag: string
  text: string
  onclick: () => void
}
type SimplerDom = Omit<Dom, 'onclick'>

type View = Html<Dom, Msg>
type SimplerView = Html<SimplerDom, Msg>

function view(model: Model): View {
  return button(model.x)
}

function button(x: string): View {
  return (d: Dispatch<Msg>) => ({
    tag: 'button',
    text: x,
    onclick: () => d({ type: 'FOO' })
  })
}

function span(x: string): SimplerView {
  return (_: Dispatch<Msg>) => ({
    tag: 'span',
    text: x
  })
}
