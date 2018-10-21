import { Observable } from 'rxjs'
import { map as rxjsMap } from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as platform from './Platform'
import { none, Sub } from './Sub'

export interface Html<dom, msg> {
  (dispatch: platform.Dispatch<msg>): dom
}

export interface Renderer<dom> {
  (dom: dom): void
}

export function map<dom, a, msg>(ha: Html<dom, a>, f: (a: a) => msg): Html<dom, msg> {
  return dispatch => ha(a => dispatch(f(a)))
}

export interface Program<model, msg, dom> extends platform.Program<model, msg> {
  html$: Observable<Html<dom, msg>>
}

export function program<model, msg, dom>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): Program<model, msg, dom> {
  const { dispatch, cmd$, sub$, model$ } = platform.program(init, update, subscriptions)
  const html$ = model$.pipe(rxjsMap(view))
  return { dispatch, cmd$, sub$, model$, html$ }
}

export function programWithFlags<flags, model, msg, dom>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): (flags: flags) => Program<model, msg, dom> {
  return flags => program(init(flags), update, view, subscriptions)
}

export function run<model, msg, dom>(program: Program<model, msg, dom>, renderer: Renderer<dom>): Observable<model> {
  const { dispatch, html$ } = program
  html$.subscribe(html => renderer(html(dispatch)))
  return platform.run(program)
}
