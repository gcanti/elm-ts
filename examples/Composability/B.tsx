import * as React from 'react'

import { Cmd, none } from '../../src/Cmd'
import { Html } from '../../src/React'
import { withModel } from './helpers'

export interface Flags {
  prefix: string
}

export type Model = string

interface AddChar {
  type: 'AddChar'
  group: 'B'
  char: string
}

const AddChar = (char: string): AddChar => ({ type: 'AddChar', group: 'B', char })

interface Reset {
  type: 'Reset'
  group: 'B'
}

const Reset: Reset = { type: 'Reset', group: 'B' }

export type Msg = AddChar | Reset

export const init = (flags: Flags): [Model, Cmd<Msg>] => [flags.prefix, none]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case 'AddChar':
      return withModel(`${model}${msg.char}`)

    case 'Reset':
      return withModel('')
  }
}

export const view = (model: Model): Html<Msg> => dispatch => (
  <div>
    <h1>{model}</h1>
    <button onClick={() => dispatch(AddChar('a'))}>add char</button>
    <button onClick={() => dispatch(Reset)}>reset</button>
  </div>
)
