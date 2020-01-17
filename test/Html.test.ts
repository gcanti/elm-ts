import * as assert from 'assert'
import { array } from 'fp-ts/lib/Array'
import { Option, some } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { Subject } from 'rxjs'
import { Cmd, none } from '../src/Cmd'
import { map, program, programWithFlags, run, withStop } from '../src/Html'
import * as H from './_helpers'

const sequenceTask = array.sequence(task)

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

  it('withStop() should stop the Program when a signal is emitted', async () => {
    const signal = new Subject<any>()

    const views: H.View[] = []
    const cmds: Array<Task<Option<H.Msg>>> = []
    const subs: H.Msg[] = []
    const { sub$, html$, cmd$, dispatch } = withStop(program(H.init, H.update, H.view, H.subscriptions), signal)

    cmd$.subscribe(v => cmds.push(v))
    html$.subscribe(v => views.push(v))
    sub$.subscribe(v => subs.push(v))

    dispatch({ type: 'FOO' })
    dispatch({ type: 'BAR' })
    dispatch({ type: 'DO-THE-THING!' })
    dispatch({ type: 'SUB' })

    // Emit stop signal and the other changes are bypassed
    signal.next('stop me!')

    dispatch({ type: 'FOO' })
    dispatch({ type: 'BAR' })
    dispatch({ type: 'DO-THE-THING!' })
    dispatch({ type: 'SUB' })

    const commands = await sequenceTask(cmds)()

    assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar', 'sub'])
    assert.deepStrictEqual(commands, [some({ type: 'FOO' })])
    assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
  })

  describe('run()', () => {
    it('should run the Program', () => {
      const renderings: string[] = []
      const renderer = (dom: H.SimplerDom) => {
        renderings.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
      }
      const view = (model: H.Model) => H.span(model.x)
      const p = program(H.init, H.update, view, H.subscriptions)

      run(p, renderer)

      p.dispatch({ type: 'FOO' })
      p.dispatch({ type: 'SUB' })
      p.dispatch({ type: 'BAR' })
      p.dispatch({ type: 'DO-THE-THING!' })

      return H.delayedAssert(() => {
        assert.deepStrictEqual(renderings, [
          '<span></span>',
          '<span>foo</span>',
          '<span>sub</span>',
          '<span>listen</span>',
          '<span>bar</span>',
          '<span>foo</span>'
        ])
      })
    })

    it('should stop the Program when signal is emitted', () => {
      const signal = new Subject<any>()

      const renderings: string[] = []
      const renderer = (dom: H.SimplerDom) => {
        renderings.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
      }
      const view = (model: H.Model) => H.span(model.x)
      const p = withStop(program(H.init, H.update, view, H.subscriptions), signal)

      run(p, renderer)

      p.dispatch({ type: 'FOO' })
      p.dispatch({ type: 'SUB' })
      p.dispatch({ type: 'BAR' })
      p.dispatch({ type: 'DO-THE-THING!' })

      // Emit stop signal and the other changes are bypassed
      signal.next('stop me!')

      p.dispatch({ type: 'FOO' })
      p.dispatch({ type: 'SUB' })
      p.dispatch({ type: 'BAR' })
      p.dispatch({ type: 'DO-THE-THING!' })

      return H.delayedAssert(() => {
        assert.deepStrictEqual(renderings, [
          '<span></span>',
          '<span>foo</span>',
          '<span>sub</span>',
          '<span>listen</span>',
          '<span>bar</span>'
          // the last "foo" would be generated by the "DO-THE-THING!" command
          // but is bypassed because the "stop" signal is emitted before the command's message is consumed
          // '<span>foo</span>'
        ])
      })
    })
  })
})
