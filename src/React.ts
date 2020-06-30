/**
 * A specialization of `Html` that uses `React` as renderer.
 *
 * @since 0.5.0
 */

import { ReactElement } from 'react'
import { Observable } from 'rxjs'
import { Cmd } from './Cmd'
import * as html from './Html'
import { Sub } from './Sub'

/**
 * `Dom` is a `ReactElement`.
 * @category model
 * @since 0.5.0
 */
export interface Dom extends ReactElement<any> {}

/**
 * `Html` has `Dom` type constrained to the specialized version for `React`.
 * @category model
 * @since 0.5.0
 */
export interface Html<Msg> extends html.Html<Dom, Msg> {}

/**
 * @category model
 * @since 0.5.0
 */
export interface Program<Model, Msg> extends html.Program<Model, Msg, Dom> {}

/**
 * `map()` is `Html.map()` with `Html` type constrained to the specialized version for `React`.
 * @category Functor
 * @since 0.5.0
 */
export function map<A, Msg>(f: (a: A) => Msg): (ha: Html<A>) => Html<Msg> {
  return html.map(f)
}

/**
 * `program()` is `Html.program()` with `Html` type constrained to the specialized version for `React`.
 * @category constructors
 * @since 0.5.0
 */
export function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): Program<Model, Msg> {
  return html.program(init, update, view, subscriptions)
}

/**
 * Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @category constructors
 * @since 0.5.0
 */
export function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg> {
  return flags => program(init(flags), update, view, subscriptions)
}

/**
 * `run()` is `Html.run()` with `dom` type constrained to the specialized version for `React`.
 * @category utils
 * @since 0.5.0
 */
export function run<Model, Msg>(program: Program<Model, Msg>, renderer: html.Renderer<Dom>): Observable<Model> {
  return html.run(program, renderer)
}
