import { Observable } from 'rxjs'
import * as Rx from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as platform from './Platform'
import { none, Sub } from './Sub'

/**
 * @since 0.5.0
 */
export interface Html<Dom, Msg> {
  (dispatch: platform.Dispatch<Msg>): Dom
}

/**
 * @since 0.5.0
 */
export interface Renderer<Dom> {
  (dom: Dom): void
}

/**
 * @since 0.5.0
 */
export function map<Dom, A, Msg>(f: (a: A) => Msg): (ha: Html<Dom, A>) => Html<Dom, Msg> {
  return ha => dispatch => ha(a => dispatch(f(a)))
}

/**
 * @since 0.5.0
 */
export interface Program<Model, Msg, Dom> extends platform.Program<Model, Msg> {
  html$: Observable<Html<Dom, Msg>>
}

/**
 * @since 0.5.0
 */
export function program<Model, Msg, Dom>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg, Dom> {
  const { dispatch, cmd$, sub$, model$ } = platform.program(init, update, subscriptions)
  const html$ = model$.pipe(Rx.map(view))
  return { dispatch, cmd$, sub$, model$, html$ }
}

/**
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
 * @since 0.5.0
 */
export function run<Model, Msg, Dom>(program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model> {
  const { dispatch, html$ } = program
  html$.subscribe(html => renderer(html(dispatch)))
  return platform.run(program)
}
