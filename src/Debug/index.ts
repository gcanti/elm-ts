/**
 * @file This module makes available a debugging utility for `elm-ts` applications.
 *
 * `elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.
 *
 * **Note:** debugging is to be considered unsafe by design so it should be used only in **development**.
 *
 * This is an example of usage:
 * ```ts
 * import {react, cmd} from 'elm-ts'
 * import {programWithDebugger} from 'elm-ts/lib/Debug'
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
 */

import { IO, chain, map } from 'fp-ts/lib/IO'
import { fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { BehaviorSubject } from 'rxjs'
import * as cmd from '../Cmd'
import { Html, Program, program } from '../Html'
import { Dispatch } from '../Platform'
import { Sub, none } from '../Sub'
import { DebugData, Global, MsgWithDebug, debugInit, debugMsg } from './commons'
import { consoleDebugger } from './console'
import { getConnection, reduxDevToolDebugger } from './redux-devtool'

/**
 * Adds a debugging capability to a generic `Html` `Program`.
 *
 * It tracks every `Message` dispatched and resulting `Model` update.
 *
 * It also lets updating the application's state with a special `Message` of type:
 *
 * ```ts
 * {
 *   type: '__DebugUpdateModel__'
 *   payload: Model
 * }
 * ```
 * @since 0.5.0
 */
export function programWithDebugger<Model, Msg, Dom>(
  init: [Model, cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, cmd.Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, MsgWithDebug<Model, Msg>, Dom> {
  const debug = runDebugger<Model, Msg>(window)

  const initModel = init[0]

  const data$ = new BehaviorSubject<DebugData<Model, Msg>>([debugInit(), initModel])

  const updateWithDebug = (msg: MsgWithDebug<Model, Msg>, model: Model): [Model, cmd.Cmd<Msg>] => {
    if ('type' in msg && msg.type === '__DebugUpdateModel__') {
      return [msg.payload, cmd.none]
    }

    const msg_ = msg as Msg // risky, but needed...
    const result = update(msg_, model)

    data$.next([debugMsg(msg_), result[0]])

    return result
  }

  const p = program<Model, MsgWithDebug<Model, Msg>, Dom>(init, updateWithDebug, view, subscriptions)

  // --- Run the debugger
  debug(data$, initModel, p.dispatch)()

  return p
}

/**
 * Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream
 * @since 0.5.0
 */
function runDebugger<Model, Msg>(
  win: Global
): (
  data$: BehaviorSubject<DebugData<Model, Msg>>,
  init: Model,
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
) => IO<void> {
  return (data$, init, dispatch) =>
    pipe(
      getConnection<Model, Msg>(win),
      map(fold(() => consoleDebugger<Model, Msg>(), reduxDevToolDebugger)),
      chain(debug => () => data$.subscribe(debug(init, data$, dispatch)))
    )
}
