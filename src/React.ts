import { ReactElement } from 'react'
import { Observable } from 'rxjs'
import { Cmd } from './Cmd'
import * as html from './Html'
import { Sub } from './Sub'

/**
 * @since 0.5.0
 */
export interface Dom extends ReactElement<any> {}

/**
 * @since 0.5.0
 */
export interface Html<Msg> extends html.Html<Dom, Msg> {}

/**
 * @since 0.5.0
 */
export function map<A, Msg>(f: (a: A) => Msg): (ha: Html<A>) => Html<Msg> {
  return html.map(f)
}

/**
 * @since 0.5.0
 */
export interface Program<Model, Msg> extends html.Program<Model, Msg, Dom> {}

/**
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
 * @since 0.5.0
 */
export function run<Model, Msg>(program: Program<Model, Msg>, renderer: html.Renderer<Dom>): Observable<Model> {
  return html.run(program, renderer)
}
