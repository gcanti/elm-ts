import { ReactElement } from 'react'
import { Observable } from 'rxjs'
import { Cmd } from './Cmd'
import * as html from './Html'
import { Sub } from './Sub'

// tslint:disable-next-line:class-name
export interface dom extends ReactElement<any> {}

export interface Html<msg> extends html.Html<dom, msg> {}

export function map<a, msg>(ha: Html<a>, f: (a: a) => msg): Html<msg> {
  return html.map(ha, f)
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
