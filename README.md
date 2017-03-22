# Examples

Counter

```ts
import { cmd, html, sub } from 'elm-ts'
import * as React from 'react'

type Model = number

const model: Model = 0

type Msg =
  | { type: 'Increment' }
  | { type: 'Decrement' }

function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Increment' :
      return [model + 1, cmd.none]
    case 'Decrement' :
      return [model - 1, cmd.none]
  }
}

function view(model: Model): html.Html<Msg> {
  return dispatch => (
    <div>Count: {model}
      <button onClick={() => dispatch({ type: 'Increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'Decrement' })}>-</button>
    </div>
  )
}

const program = html.programWithFlags<Model, Model, Msg>(
  (model) => [model, cmd.none],
  update,
  sub.none,
  view,
  document.getElementById('app')!
)

program(model)
```

Labeled Checkboxes (with a sprinkle of functional optics)

```ts
import { cmd, html, sub } from 'elm-ts'
import { Lens } from 'monocle-ts'
import * as React from 'react'

type Model = {
  notifications: boolean,
  autoplay: boolean,
  location: boolean
}

type Msg =
  | { type: 'ToggleNotifications' }
  | { type: 'ToggleAutoplay' }
  | { type: 'ToggleLocation' }

const notificationsLens = Lens.fromProp<Model, 'notifications'>('notifications')
const autoplayLens = Lens.fromProp<Model, 'autoplay'>('autoplay')
const locationLens = Lens.fromProp<Model, 'location'>('location')

const toggle = (b: boolean): boolean => !b

function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'ToggleNotifications' :
      return [notificationsLens.modify(toggle, model), cmd.none]
    case 'ToggleAutoplay' :
      return [autoplayLens.modify(toggle, model), cmd.none]
    case 'ToggleLocation' :
      return [locationLens.modify(toggle, model), cmd.none]
  }
}

function view(model: Model): html.Html<Msg> {
  return dispatch => (
    <fieldset>
      {checkbox({ type: 'ToggleNotifications' }, 'Email Notifications')(dispatch)}
      {checkbox({ type: 'ToggleAutoplay' }, 'Video Autoplay')(dispatch)}
      {checkbox({ type: 'ToggleLocation' }, 'Use Location')(dispatch)}
    </fieldset>
  )
}

function checkbox<msg>(msg: msg, label: string): html.Html<msg> {
  return dispatch => (
    <label>
      <input type='checkbox' onClick={() => dispatch(msg)} />
      {label}
    </label>
  )
}
```
