import * as React from 'react'

import { Cmd, batch } from '../../src/Cmd'
import { Html } from '../../src/React'
import * as Counter from './Counter'
import * as StringBuilder from './StringBuilder'
import { withEffect } from './helpers'

export type Flags = StringBuilder.Flags // Only `StringBuilder` has flags

export interface Model {
  counter: Counter.Model
  stringBuilder: StringBuilder.Model
}

export type Msg = Counter.Msg | StringBuilder.Msg

export const init = (flags: Flags): [Model, Cmd<Msg>] => {
  const [counter, counterCmd] = Counter.init
  const [stringBuilder, stringBuilderCmd] = StringBuilder.init(flags)

  return [{ counter, stringBuilder }, batch<Msg>([counterCmd, stringBuilderCmd])]
}

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.group) {
    case 'Counter':
      const [counter, counterCmd] = Counter.update(msg, model.counter)
      return withEffect({ ...model, counter }, counterCmd)

    case 'StringBuilder':
      const [stringBuilder, stringBuilderCmd] = StringBuilder.update(msg, model.stringBuilder)
      return withEffect({ ...model, stringBuilder }, stringBuilderCmd)
  }
}

export const view = (model: Model): Html<Msg> => dispatch => (
  <div>
    <h1>My Application</h1>
    {Counter.view(model.counter)(dispatch)}
    {StringBuilder.view(model.stringBuilder)(dispatch)}
  </div>
)
