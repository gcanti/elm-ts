import { cmd } from '../src'
import { Html } from '../src/React'
import { Lens } from 'monocle-ts'
import * as React from 'react'

export type Model = {
  notifications: boolean,
  autoplay: boolean,
  location: boolean
}

export type Flags = Model

export const flags: Flags = {
  notifications: false,
  autoplay: false,
  location: false
}

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [flags, cmd.none]
}

export type Msg =
  | { type: 'ToggleNotifications' }
  | { type: 'ToggleAutoplay' }
  | { type: 'ToggleLocation' }

const notificationsLens = Lens.fromProp<Model, 'notifications'>('notifications')
const autoplayLens = Lens.fromProp<Model, 'autoplay'>('autoplay')
const locationLens = Lens.fromProp<Model, 'location'>('location')

const toggle = (b: boolean): boolean => !b

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'ToggleNotifications' :
      return [notificationsLens.modify(toggle, model), cmd.none]
    case 'ToggleAutoplay' :
      return [autoplayLens.modify(toggle, model), cmd.none]
    case 'ToggleLocation' :
      return [locationLens.modify(toggle, model), cmd.none]
  }
}

export function view(model: Model): Html<Msg> {
  return dispatch => (
    <fieldset>
      {checkbox({ type: 'ToggleNotifications' }, 'Email Notifications')(dispatch)}
      {checkbox({ type: 'ToggleAutoplay' }, 'Video Autoplay')(dispatch)}
      {checkbox({ type: 'ToggleLocation' }, 'Use Location')(dispatch)}
    </fieldset>
  )
}

function checkbox<msg>(msg: msg, label: string): Html<msg> {
  return dispatch => (
    <label>
      <input type='checkbox' onClick={() => dispatch(msg)} />
      {label}
    </label>
  )
}
