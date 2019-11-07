/**
 * @file This module makes available a debugging utility for `elm-ts` applications.
 *
 * `elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.
 *
 * **Note:** debugging is to be considered unsafe by design so it should be used only in **development**.
 *
 * This is an example of usage:
 * ```ts
 * import {react} from 'elm-ts'
 * import {withDebugger} from 'elm-ts/lib/Debug'
 * import { render } from 'react-dom'
 *
 * type Model = number
 * type Msg = 'INCREMENT' | 'DECREMENT'
 *
 * declare const main: react.Program<Model, Msg>
 *
 * const runner = process.NODE_ENV === 'production' ? react.run : withDebugger(react.run)
 *
 * runner(main, dom => render(document.getElementById('app')))
 * ```
 */

import { IO, chain, map } from 'fp-ts/lib/IO'
import { fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { Observable, Subject, zip } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Program, Renderer } from '../Html'
import { Dispatch } from '../Platform'
import { DebugAction, Global, debugInit, debugMsg } from './commons'
import { consoleDebugger } from './console'
import { getConnection, reduxDevToolDebugger } from './redux-devtool'

/**
 * Represents a generic `Html` `run` function
 * @since 0.5.0
 */
export interface Runner<Model, Msg, Dom> {
  (program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model>
}

/**
 * Adds a debugging capability to a generic `Html` `run` function.
 *
 * It tracks every `Message` dispatched and resulting `Model` update.
 * @since 0.5.0
 */
export function withDebugger<Model, Msg, Dom>(run: Runner<Model, Msg, Dom>): Runner<Model, Msg, Dom> {
  const debug = runDebugger<Model, Msg>(window)

  const actionDebug$ = new Subject<DebugAction<Msg>>()

  let initialized: boolean = false

  // --- Acts like the real `Runner`
  return (program, renderer) => {
    const { dispatch, model$ } = program

    // --- Tracks dispatched messages
    const dispatchWithDebug: Dispatch<Msg> = msg => {
      actionDebug$.next(debugMsg(msg))
      return dispatch(msg)
    }

    // --- Tracks the initial model
    const modelDebug$ = model$.pipe(
      // This is a very hacky way to intercept the first value of model$ (namely the "init" value)
      // but it is the only way to avoid that the stream would be consumed before reaching the debugger
      tap(() => {
        if (!initialized) {
          actionDebug$.next(debugInit())
          initialized = true
        }
      })
    )

    // --- Run the debugger
    debug(actionDebug$, modelDebug$, dispatchWithDebug)()

    // --- Execute the real runner
    return run({ ...program, dispatch: dispatchWithDebug }, renderer)
  }
}

/**
 * Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream
 * @since 0.5.0
 */
function runDebugger<Model, Msg>(
  w: Global
): (action$: Observable<DebugAction<Msg>>, model$: Observable<Model>, dispatch: Dispatch<Msg>) => IO<void> {
  return (action$, model$, dispatch) =>
    pipe(
      getConnection<Model, Msg>(w),
      map(fold(() => consoleDebugger, reduxDevToolDebugger)),
      chain(debug => () => zip(action$, model$).subscribe(debug(dispatch)))
    )
}
