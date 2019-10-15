import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/pipeable'
import * as React from 'react'
import { cmd } from '../src'
import { Html } from '../src/React'
import { perform } from '../src/Task'
import { now } from '../src/Time'

type Time = number

// --- Flags
export type Flags = void

export const flags: Flags = undefined

// --- Model
export type Model = O.Option<Time>

export function init(_: Flags): [Model, cmd.Cmd<Msg>] {
  return [
    O.none,
    pipe(
      now(),
      perform(newTime)
    )
  ]
}

// --- Messages
export type Msg = { type: 'Click' } | NewTime

export type NewTime = { type: 'NewTime'; time: Time }

// --- Update
function newTime(time: Time): NewTime {
  return { type: 'NewTime', time }
}

function delay<A>(n: number, task: T.Task<A>): T.Task<A> {
  return () =>
    new Promise(resolve => {
      setTimeout(() => task().then(resolve), n)
    })
}

export function update(msg: Msg, _: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Click':
      return [
        O.none,
        pipe(
          delay(1000, now()),
          perform(newTime)
        )
      ]

    case 'NewTime':
      return [O.some(msg.time), cmd.none]
  }
}

// --- View
export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      Time:{' '}
      {pipe(
        model,
        O.fold(displayLoading, displayTime)
      )}
      <button onClick={() => dispatch({ type: 'Click' })}>New time</button>
    </div>
  )
}

function displayTime(time: Time): string {
  return new Date(time).toISOString()
}

const displayLoading = () => 'loading...'
