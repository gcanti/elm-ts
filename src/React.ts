import { Observable } from 'rxjs/Observable'
import { ReactElement } from 'react'
import { render as ReactDOMrender } from 'react-dom'
import { Cmd } from './Cmd'
import { Sub } from './Sub'
import * as html from './Html'

export type dom = ReactElement<any>

export type Html<msg> = html.Html<dom, msg>

export function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg> {
  return html.map(f, ha)
}

export interface Program<model, msg> extends html.Program<model, msg, dom> {}

export function program<model, msg>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): Program<model, msg> {
  return html.program(init, update, view, subscriptions)
}

export function programWithFlags<flags, model, msg>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): (flags: flags) => Program<model, msg> {
  return flags => program(init(flags), update, view, subscriptions)
}

export function run<model, msg>(program: Program<model, msg>, renderer: html.Renderer<dom>): Observable<model> {
  return html.run(program, renderer)
}

export function render(node: Element): html.Renderer<dom> {
  return {
    render(dom) {
      return ReactDOMrender(dom, node)
    }
  }
}
