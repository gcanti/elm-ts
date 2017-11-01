import { cmd } from '../src'
import { Html } from '../src/React'
import * as React from 'react'

export type Model = number

export type Flags = Model

export const flags: Flags = 0

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [flags, cmd.none]
}

export type Msg = { type: 'Increment' } | { type: 'Decrement' }

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Increment':
      return [model + 1, cmd.none]
    case 'Decrement':
      return [model - 1, cmd.none]
  }
}

export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      Count: {model}
      <button onClick={() => dispatch({ type: 'Increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'Decrement' })}>-</button>
    </div>
  )
}
