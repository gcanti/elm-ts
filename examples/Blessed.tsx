import * as blessed from 'blessed'
import * as React from 'react'
import { render } from 'react-blessed'
import * as cmd from '../src/Cmd'
import { Html, program, run } from '../src/React'

// --- Blessed configuration
// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'react-blessed hello world'
})

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function() {
  return process.exit(0)
})

// --- Model
export type Model = undefined

export const init: [Model, cmd.Cmd<Msg>] = [undefined, cmd.none]

// --- Messages
export type Msg = { type: 'NoOp' }

// --- Update
export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'NoOp':
      return [model, cmd.none]
  }
}

// --- View
export function view(_: Model): Html<Msg> {
  return _ => <App />
}

function App() {
  return (
    <box
      top="center"
      left="center"
      width="50%"
      height="50%"
      border={{ type: 'line' }}
      style={{ border: { fg: 'blue' } }}
    >
      Hello World!
    </box>
  )
}

// --- Main
export const main = () => run(program(init, update, view), dom => render(dom, screen))
