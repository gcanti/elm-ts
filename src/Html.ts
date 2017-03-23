import { Observable } from 'rxjs/Observable'
import { Sub } from './Sub'
import {
  Program as HeadlessProgram,
  Component as HeadlessComponent,
  Dispatch,
  programWithFlags as headlessProgramWithFlags,
  run as headlessRun
} from './Platform'

export type Html<dom, msg> = (dispatch: Dispatch<msg>) => dom

export function map<dom, a, msg>(f: (a: a) => msg, ha: Html<dom, a>): Html<dom, msg> {
  return dispatch => ha(a => dispatch(f(a)))
}

export interface Program<model, msg, dom> extends HeadlessProgram<model, msg> {
  html$: Observable<Html<dom, msg>>,
}

export interface Component<flags, model, msg, dom> extends HeadlessComponent<flags, model, msg> {
  view: (model: model) => Html<dom, msg>
}

export function programWithFlags<flags, model, msg, dom>(
    component: Component<flags, model, msg, dom>,
    flags: flags,
    subscriptions?: (model: model) => Sub<msg>
  ): Program<model, msg, dom> {

  const { dispatch, cmd$, sub$, model$ } = headlessProgramWithFlags(component, flags, subscriptions)
  const html$ = model$.map(model => component.view(model))
  return { dispatch, cmd$, sub$, model$, html$ }
}

export function run<model, msg, dom>(program: Program<model, msg, dom>, render: (dom: dom) => void): Observable<model> {
  const { dispatch, html$ } = program
  html$.subscribe(html => render(html(dispatch)))
  return headlessRun(program)
}
