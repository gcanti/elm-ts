import { Lens } from 'monocle-ts'
import * as React from 'react'
import { cmd } from '../src'
import { Html } from '../src/React'

// --- Flags
export type Flags = Model

export const flags: Flags = {
  notifications: false,
  autoplay: false,
  location: false
}

// --- Model
export type Model = {
  notifications: boolean
  autoplay: boolean
  location: boolean
}

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [flags, cmd.none]
}

// --- Messages
export type Msg = { type: 'ToggleNotifications' } | { type: 'ToggleAutoplay' } | { type: 'ToggleLocation' }

// --- Update
const notificationsLens = Lens.fromProp<Model, 'notifications'>('notifications')
const autoplayLens = Lens.fromProp<Model, 'autoplay'>('autoplay')
const locationLens = Lens.fromProp<Model, 'location'>('location')

const toggle = (b: boolean): boolean => !b

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'ToggleNotifications':
      return [notificationsLens.modify(toggle)(model), cmd.none]

    case 'ToggleAutoplay':
      return [autoplayLens.modify(toggle)(model), cmd.none]

    case 'ToggleLocation':
      return [locationLens.modify(toggle)(model), cmd.none]
  }
}

// --- View
export function view(_: Model): Html<Msg> {
  return dispatch => (
    <fieldset>
      {checkbox({ type: 'ToggleNotifications' as const }, 'Email Notifications')(dispatch)}
      {checkbox({ type: 'ToggleAutoplay' as const }, 'Video Autoplay')(dispatch)}
      {checkbox({ type: 'ToggleLocation' as const }, 'Use Location')(dispatch)}
    </fieldset>
  )
}

function checkbox<msg>(msg: msg, label: string): Html<msg> {
  return dispatch => (
    <label>
      <input type="checkbox" onClick={() => dispatch(msg)} />
      {label}
    </label>
  )
}
