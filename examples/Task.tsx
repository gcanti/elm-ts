import { cmd } from '../src'
import { Html } from '../src/React'
import * as React from 'react'
import { Task, perform } from '../src/Task'
import { Time, now } from '../src/Time'
import { Option, none, some } from 'fp-ts/lib/Option'

export type Model = Option<Time>

export type Flags = void

export const flags: Flags = undefined

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [none, perform(now(), newTime)]
}

export type NewTime = { type: 'NewTime'; time: Time }

export type Msg = { type: 'Click' } | NewTime

function newTime(time: Time): NewTime {
  return { type: 'NewTime', time }
}

function delay<A>(n: number, task: Task<A>): Task<A> {
  return new Task<A>(
    () =>
      new Promise(resolve => {
        setTimeout(() => task.run().then(resolve), n)
      })
  )
}

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'Click':
      return [none, perform(delay(1000, now()), newTime)]
    case 'NewTime':
      return [some(msg.time), cmd.none]
  }
}

function displayTime(time: Time): string {
  return new Date(time).toISOString()
}

const displayLoading = () => 'loading...'

export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      Time: {model.foldL(displayLoading, displayTime)}
      <button onClick={() => dispatch({ type: 'Click' })}>New time</button>
    </div>
  )
}
