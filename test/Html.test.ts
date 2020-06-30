import * as assert from 'assert'
import { array } from 'fp-ts/lib/Array'
import { Option, some } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { Subject } from 'rxjs'
import { Cmd, none } from '../src/Cmd'
import { map, program, programWithFlags, run, withStop } from '../src/Html'
import * as App from './helpers/app'
import { delayedAssert } from './helpers/utils'

const sequenceTask = array.sequence(task)

describe('Html', () => {
  describe('map()', () => {
    it('should map an `Html<dom, A>` into an `Html<dom, B>`', () => {
      const state: string[] = []
      const btn = App.button('A button')
      const dispatch = (msg: App.Msg) => state.push(msg.type)
      const m = map<App.Dom, App.Msg, App.Msg>(() => ({ type: 'BAR' as const }))

      btn(dispatch).onclick()
      m(btn)(dispatch).onclick()

      assert.deepStrictEqual(state, ['FOO', 'BAR'])
    })
  })

  describe('program()', () => {
    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - no subscription', () => {
      const views: App.View[] = []
      const subs: App.Msg[] = []
      const { dispatch, html$, sub$ } = program(App.init, App.update, App.view)

      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'DO-THE-THING!' })

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar'])
      assert.deepStrictEqual(subs, [])
    })

    it('should return the Model/Cmd/Sub/Html streams and Dispatch function - with subscription', () => {
      const views: App.View[] = []
      const subs: App.Msg[] = []
      const { sub$, html$, dispatch } = program(App.init, App.update, App.view, App.subscriptions)

      html$.subscribe(v => views.push(v))
      sub$.subscribe(v => subs.push(v))

      dispatch({ type: 'FOO' })
      dispatch({ type: 'BAR' })
      dispatch({ type: 'SUB' })

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar', 'sub'])
      assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
    })
  })

  describe('programWithFlags()', () => {
    it('should return a function that returns a program() with flags on `init`', () => {
      const views: App.View[] = []
      const initWithFlags = (f: string): [App.Model, Cmd<App.Msg>] => [{ x: f }, none]
      const withFlags = programWithFlags(initWithFlags, App.update, App.view, App.subscriptions)
      const { dispatch, html$ } = withFlags('start!')

      html$.subscribe(v => views.push(v))

      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['start!'])
    })
  })

  describe('withStop()', () => {
    it('should stop the Program when a signal is emitted', async () => {
      const signal = new Subject<any>()

      const cmds: Array<Task<Option<App.Msg>>> = []
      const views: App.View[] = []
      const subs: App.Msg[] = []
      const { sub$, html$, cmd$, dispatch } = withStop(signal)(
        program(App.init, App.update, App.view, App.subscriptions)
      )

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

      assert.deepStrictEqual(commands, [some({ type: 'FOO' })])
      assert.deepStrictEqual(views.map(x => x(dispatch).text), ['', 'foo', 'bar', 'sub'])
      assert.deepStrictEqual(subs, [{ type: 'LISTEN' }])
    })
  })

  describe('run()', () => {
    it('should run the Program', () => {
      const renderings: string[] = []
      const renderer = (dom: App.Dom) => {
        renderings.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
      }
      const view = (model: App.Model) => App.span(model.x)
      const p = program(App.init, App.update, view, App.subscriptions)

      run(p, renderer)

      p.dispatch({ type: 'FOO' })
      p.dispatch({ type: 'SUB' })
      p.dispatch({ type: 'BAR' })
      p.dispatch({ type: 'DO-THE-THING!' })

      return delayedAssert(() => {
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
      const renderer = (dom: App.Dom) => {
        renderings.push(`<${dom.tag}>${dom.text}</${dom.tag}>`)
      }
      const view = (model: App.Model) => App.span(model.x)
      const p = withStop(signal)(program(App.init, App.update, view, App.subscriptions))

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

      return delayedAssert(() => {
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
