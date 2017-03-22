import { Cmd } from './Cmd'
import { Sub } from './Sub'
import { Program, Dispatch, programWithFlags as headlessProgramWithFlags } from './Platform'
import { ReactElement } from 'react'
import { render } from 'react-dom'

export type Html<msg> = (dispatch: Dispatch<msg>) => ReactElement<any>

export function map<a, msg>(f: (a: a) => msg, ha: Html<a>): Html<msg> {
  return dispatch => ha(a => dispatch(f(a)))
}

export function programWithFlags<flags, model, msg>(
    init: (flags: flags) => [model, Cmd<msg>],
    update: (msg: msg, model: model) => [model, Cmd<msg>],
    subscriptions: Sub<msg>,
    view: (model: model) => Html<msg>,
    node: HTMLElement
  ): Program<flags, model, msg> {

  return flags => {
    const program = headlessProgramWithFlags(init, update, subscriptions)
    const { dispatch, model$ } = program(flags)
    model$.subscribe(model => {
      render(view(model)(dispatch), node)
    })
    return { dispatch, model$ }
  }
}
