import * as React from 'react'

import { Cmd, batch } from '../../src/Cmd'
import { Html } from '../../src/React'
import * as A from './A'
import * as B from './B'
import { withEffect } from './helpers'

export type Flags = B.Flags // Only `B` has flags

export interface Model {
  a: A.Model
  b: B.Model
}

export type Msg = A.Msg | B.Msg

export const init = (flags: Flags): [Model, Cmd<Msg>] => {
  const [a, aCmd] = A.init
  const [b, bCmd] = B.init(flags)

  return [{ a, b }, batch<Msg>([aCmd, bCmd])]
}

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.group) {
    case 'A':
      const [a, aCmd] = A.update(msg, model.a)
      return withEffect({ ...model, a }, aCmd)

    case 'B':
      const [b, bCmd] = B.update(msg, model.b)
      return withEffect({ ...model, b }, bCmd)
  }
}

export const view = (model: Model): Html<Msg> => dispatch => (
  <div>
    <h1>My Application</h1>
    {A.view(model.a)(dispatch)}
    {B.view(model.b)(dispatch)}
  </div>
)
