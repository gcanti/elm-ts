import * as cmd from '../src/Cmd'
import { Html, Reader, program, run } from '../src/React'
import * as React from 'react'
import * as blessed from 'blessed'
import { render } from 'react-blessed'

export type Model = undefined

export const init: [Model, cmd.Cmd<Msg>] = [undefined, cmd.none]

export type Msg = { type: 'NoOp' }

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'NoOp':
      return [model, cmd.none]
  }
}

class App extends React.Component {
  render() {
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
}
export function view(model: Model): Html<Msg> {
  return new Reader(dispatch => <App />)
}

// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'react-blessed hello world'
})

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0)
})

export const main = () => run(program(init, update, view), dom => render(dom, screen))
