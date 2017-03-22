# Examples

Counter

```ts
import * as Cmd from 'elm-ts/lib/Cmd'
import * as Sub from 'elm-ts/lib/Sub'
import { programWithFlags, Html } from 'elm-ts/lib/Html'
import * as React from 'react'

type Model = number

const model: Model = 0

type Msg = { type: 'Increment' } | { type: 'Decrement' }

function update(msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Increment' :
      return [model + 1, Cmd.none]
    case 'Decrement' :
      return [model - 1, Cmd.none]
  }
}

function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>Count: {model}
      <button onClick={() => dispatch({ type: 'Increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'Decrement' })}>-</button>
    </div>
  )
}

const program = programWithFlags<Model, Model, Msg>(
  (model) => [model, Cmd.none],
  update,
  Sub.none,
  view,
  document.getElementById('app')!
)

program(model)
```
