import { Observable } from 'rxjs/Observable'
import { ReactElement } from 'react'
import { render } from 'react-dom'
import { Sub } from './Sub'
import {
  Program as HeadlessProgram,
  Component as HeadlessComponent,
  Dispatch,
  programWithFlags as headlessProgramWithFlags,
  run as headlessRun
} from './Platform'

export type Html<msg> = (dispatch: Dispatch<msg>) => ReactElement<any>

export function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg> {
  return dispatch => ha(a => dispatch(f(a)))
}

export interface Program<model, msg> extends HeadlessProgram<model, msg> {
  html$: Observable<Html<msg>>,
}

export interface Component<flags, model, msg> extends HeadlessComponent<flags, model, msg> {
  view: (model: model) => Html<msg>
}

export function programWithFlags<flags, model, msg>(
    component: Component<flags, model, msg>,
    flags: flags,
    subscriptions?: (model: model) => Sub<msg>
  ): Program<model, msg> {

  const { dispatch, cmd$, sub$, model$ } = headlessProgramWithFlags(component, flags, subscriptions)
  const html$ = model$.map(model => component.view(model))
  return { dispatch, cmd$, sub$, model$, html$ }
}

export function run<model, msg>(program: Program<model, msg>, node: HTMLElement): Observable<model> {
  const { dispatch, html$ } = program
  html$.subscribe(html => render(html(dispatch), node))
  return headlessRun(program)
}
