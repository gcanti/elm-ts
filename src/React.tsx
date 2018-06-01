import { Observable } from 'rxjs/Observable'
import * as React from 'react'
import { Cmd } from './Cmd'
import { Sub } from './Sub'
import * as html from './Html'
import * as platform from './Platform'
import { Reader } from 'fp-ts/lib/Reader'

export { Reader }

export type dom = React.ReactElement<any>

export interface Html<msg> extends html.Html<dom, msg> {}

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

type LazyProps<msg> = {
  dispatch: platform.Dispatch<msg>
  view: (...args: Array<any>) => Html<msg>
  viewArgs: Array<any>
}
class LazyDom<msg> extends React.Component<LazyProps<msg>, {}> {
  constructor(props: LazyProps<msg>) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
  }

  dispatch(msg: msg) {
    this.props.dispatch(msg)
  }

  shouldComponentUpdate(nextProps: LazyProps<msg>) {
    return this.props.viewArgs.some((x, i) => !Object.is(x, nextProps.viewArgs[i]))
  }

  render() {
    return this.props.view(...this.props.viewArgs).run(this.dispatch)
  }
}

export type View1<a, msg> = (a: a) => Html<msg>
export type View2<a, b, msg> = (a: a, b: b) => Html<msg>
export type View3<a, b, c, msg> = (a: a, b: b, c: c) => Html<msg>
export type View4<a, b, c, d, msg> = (a: a, b: b, c: c, d: d) => Html<msg>
export type View5<a, b, c, d, e, msg> = (a: a, b: b, c: c, d: d, e: e) => Html<msg>
export type View6<a, b, c, d, e, f, msg> = (a: a, b: b, c: c, d: d, e: e, f: f) => Html<msg>
export type View7<a, b, c, d, e, f, g, msg> = (a: a, b: b, c: c, d: d, e: e, f: f, g: g) => Html<msg>
export type View8<a, b, c, d, e, f, g, h, msg> = (a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h) => Html<msg>
export type View9<a, b, c, d, e, f, g, h, i, msg> = (a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i) => Html<msg>

export function lazy<a, msg>(view: View1<a, msg>): View1<a, msg>
export function lazy<a, b, msg>(view: View2<a, b, msg>): View2<a, b, msg>
export function lazy<a, b, c, msg>(view: View3<a, b, c, msg>): View3<a, b, c, msg>
export function lazy<a, b, c, d, msg>(view: View4<a, b, c, d, msg>): View4<a, b, c, d, msg>
export function lazy<a, b, c, d, e, msg>(view: View5<a, b, c, d, e, msg>): View5<a, b, c, d, e, msg>
export function lazy<a, b, c, d, e, f, msg>(view: View6<a, b, c, d, e, f, msg>): View6<a, b, c, d, e, f, msg>
export function lazy<a, b, c, d, e, f, g, msg>(view: View7<a, b, c, d, e, f, g, msg>): View7<a, b, c, d, e, f, g, msg>
export function lazy<a, b, c, d, e, f, g, h, msg>(
  view: View8<a, b, c, d, e, f, g, h, msg>
): View8<a, b, c, d, e, f, g, h, msg>
export function lazy<a, b, c, d, e, f, g, h, i, msg>(
  view: View9<a, b, c, d, e, f, g, h, i, msg>
): View9<a, b, c, d, e, f, g, h, i, msg>
export function lazy(view: (...args: Array<any>) => Html<any>): (...args: Array<any>) => Html<any> {
  return (...args) => new Reader(dispatch => <LazyDom dispatch={dispatch} view={view} viewArgs={args} />)
}
