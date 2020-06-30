/**
 * A specialization of `Program` with the capability of mapping `Model` to `View`
 * and rendering it into a DOM node.
 *
 * `Html` is a base abstraction in order to work with any library that renders html.
 *
 * @since 0.5.0
 */

import { Observable } from 'rxjs'
import { map as RxMap, takeUntil } from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as platform from './Platform'
import { Sub, none } from './Sub'

/**
 * It is defined as a function that takes a `dispatch()` function as input and returns a `Dom` as output,
 * with DOM and messages types constrained.
 * @category model
 * @since 0.5.0
 */
export interface Html<Dom, Msg> {
  (dispatch: platform.Dispatch<Msg>): Dom
}

/**
 * Defines the generalized `Renderer` as a function that takes a `Dom` as input and returns a `void`.
 *
 * It suggests an effectful computation.
 * @category model
 * @since 0.5.0
 */
export interface Renderer<Dom> {
  (dom: Dom): void
}

/**
 * The `Program` interface is extended with a `html$` stream (an `Observable` of views) and a `Dom` type constraint.
 * @category model
 * @since 0.5.0
 */
export interface Program<Model, Msg, Dom> extends platform.Program<Model, Msg> {
  html$: Observable<Html<Dom, Msg>>
}

/**
 * Maps a view which carries a message of type `A` into a view which carries a message of type `B`.
 * @category Functor
 * @since 0.5.0
 */
export function map<Dom, A, Msg>(f: (a: A) => Msg): (ha: Html<Dom, A>) => Html<Dom, Msg> {
  return ha => dispatch => ha(a => dispatch(f(a)))
}

/**
 * Returns a `Program` specialized for `Html`.
 *
 * It needs a `view()` function that maps `Model` to `Html`.
 *
 * Underneath it uses `Platform.program()`.
 * @category constructors
 * @since 0.5.0
 */
export function program<Model, Msg, Dom>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg, Dom> {
  const { dispatch, cmd$, sub$, model$ } = platform.program(init, update, subscriptions)

  const html$ = model$.pipe(RxMap(view))

  return { dispatch, cmd$, sub$, model$, html$ }
}

/**
 * Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @category constructors
 * @since 0.5.0
 */
export function programWithFlags<Flags, Model, Msg, Dom>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg, Dom> {
  return flags => program(init(flags), update, view, subscriptions)
}

/**
 * Stops the `program` when `signal` Observable emits a value.
 * @category combinators
 * @since 0.5.4
 */
export function withStop(
  signal: Observable<unknown>
): <Model, Msg, Dom>(program: Program<Model, Msg, Dom>) => Program<Model, Msg, Dom> {
  return program => {
    const platformProgram = platform.withStop(signal)(program)

    return {
      ...platformProgram,

      html$: program.html$.pipe(takeUntil(signal))
    }
  }
}

/**
 * Runs the `Program`.
 *
 * Underneath it uses `Platform.run()`.
 *
 * It subscribes to the views stream (`html$`) and runs `Renderer` for each new value.
 * @category utils
 * @since 0.5.0
 */
export function run<Model, Msg, Dom>(program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model> {
  const { dispatch, html$ } = program

  html$.subscribe(html => renderer(html(dispatch)))

  return platform.run(program)
}
