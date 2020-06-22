import * as React from 'react'

import { Cmd, none } from '../../src/Cmd'
import { Html } from '../../src/React'
import { withModel } from './helpers'

export type Model = number

interface Up {
  type: 'Up'
  group: 'Counter'
}

const Up: Up = { type: 'Up', group: 'Counter' }

interface Down {
  type: 'Down'
  group: 'Counter'
}

const Down: Down = { type: 'Down', group: 'Counter' }

export type Msg = Up | Down

export const init: [Model, Cmd<Msg>] = [0, none]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case 'Up':
      return withModel(model + 1)

    case 'Down':
      return withModel(model - 1)
  }
}

export const view = (model: Model): Html<Msg> => dispatch => (
  <div>
    <button onClick={() => dispatch(Up)}>Up</button>
    <span>{model}</span>
    <button onClick={() => dispatch(Down)}>Down</button>
  </div>
)
