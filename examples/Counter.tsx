import * as React from 'react'
import { cmd } from '../src'
import { Html } from '../src/React'

// --- Model
export type Model = number

export const init: [Model, cmd.Cmd<Msg>] = [0, cmd.none]

// --- Messages
export type Msg = { type: 'Increment' } | { type: 'Decrement' }

// --- Update
export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Increment':
      return [model + 1, cmd.none]

    case 'Decrement':
      return [model - 1, cmd.none]
  }
}

// --- View
export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      Count: {model}
      <button onClick={() => dispatch({ type: 'Increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'Decrement' })}>-</button>
    </div>
  )
}
