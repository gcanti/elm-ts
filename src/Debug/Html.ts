/**
 * This module makes available a debugging utility for `elm-ts` applications running `Html` programs.
 *
 * `elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.
 *
 * **Note:** debugging is to be considered unsafe by design so it should be used only in **development**.
 *
 * This is an example of usage:
 * ```ts
 * import {react, cmd} from 'elm-ts'
 * import {programWithDebugger} from 'elm-ts/lib/Debug/Html'
 * import { render } from 'react-dom'
 *
 * type Model = number
 * type Msg = 'INCREMENT' | 'DECREMENT'
 *
 * declare const init: [Model, cmd.none]
 * declare function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>]
 * declare function view(model: Model): react.Html<Msg>
 *
 * const program = process.NODE_ENV === 'production' ? react.program : programWithDebugger
 *
 * const main = program(init, update, view)
 *
 * react.run(main, dom => render(document.getElementById('app')))
 * ```
 *
 * @since 0.5.3
 */

import { BehaviorSubject } from 'rxjs'
import { Cmd } from '../Cmd'
import { Html, program } from '../Html'
import { Sub } from '../Sub'
import { DebugData, DebuggerR, ProgramWithDebugger, debugInit, runDebugger, updateWithDebug } from './commons'

// --- Re-exports
export { withDebuggerWithStop } from './commons'

/**
 * Adds a debugging capability to a generic `Html` `Program`.
 *
 * It tracks every `Message` dispatched and resulting `Model` update.
 *
 * It also lets directly updating the application's state with a special `Message` of type:
 *
 * ```ts
 * {
 *   type: '__DebugUpdateModel__'
 *   payload: Model
 * }
 * ```
 *
 * or applying a message with:
 * ```ts
 * {
 *   type: '__DebugApplyMsg__';
 *   payload: Msg
 * }
 * ```
 * @since 0.5.4
 */
export function programWithDebugger<Model, Msg, Dom>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): ProgramWithDebugger<Model, Msg, Dom> {
  const Debugger = runDebugger<Model, Msg>(window)

  const initModel = init[0]

  const debug$ = new BehaviorSubject<DebugData<Model, Msg>>([debugInit(), initModel])

  const p = program(init, updateWithDebug(debug$, update), view, subscriptions)

  // --- Run the debugger
  // --- we need to make a type assertion for `dispatch` because we cannot change the intrinsic `msg` type of `program`;
  // --- otherwise `programWithDebugger` won't be usable as a transparent extension/substitution of `Html`'s programs
  const { unsubscribe } = Debugger({
    debug$,
    init: initModel,
    dispatch: p.dispatch as DebuggerR<Model, Msg>['dispatch']
  })()

  return { ...p, stop: unsubscribe }
}

/**
 * Same as `programWithDebugger()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @since 0.5.4
 */
export function programWithDebuggerWithFlags<Flags, Model, Msg, Dom>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => ProgramWithDebugger<Model, Msg, Dom> {
  return flags => programWithDebugger(init(flags), update, view, subscriptions)
}
