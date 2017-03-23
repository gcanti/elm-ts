import { Observable } from 'rxjs/Observable'
import { ReactElement } from 'react'
import * as ReactDOM from 'react-dom'
import { Sub } from './Sub'
import * as html from './Html'

export type Dom = ReactElement<any>

export type Html<msg> = html.Html<Dom, msg>

export function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg> {
  return html.map(f, ha)
}

export interface Program<model, msg> extends html.Program<model, msg, Dom> {}

export interface Component<flags, model, msg> extends html.Component<flags, model, msg, Dom> {}

export function programWithFlags<flags, model, msg>(
    component: Component<flags, model, msg>,
    flags: flags,
    subscriptions?: (model: model) => Sub<msg>
  ): Program<model, msg> {

  return html.programWithFlags(component, flags, subscriptions)
}

export function run<model, msg>(program: Program<model, msg>, render: (dom: Dom) => void): Observable<model> {
  return html.run(program, render)
}

export function render(node: HTMLElement): (dom: Dom) => void {
  return dom => ReactDOM.render(dom, node)
}
