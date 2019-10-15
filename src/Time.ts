/**
 * @file Exposes some utilities to work with unix time.
 * See [Time](https://package.elm-lang.org/packages/elm/time/latest/Time) Elm package.
 */

import { Task } from 'fp-ts/lib/Task'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'
import { Sub } from './Sub'

/**
 * Get the current unix time as a `Task`.
 * @since 0.5.0
 */
export function now(): Task<number> {
  return () => Promise.resolve(new Date().getTime())
}

/**
 * Get the current unix time periodically.
 * @since 0.5.0
 */
export function every<Msg>(time: number, f: (time: number) => Msg): Sub<Msg> {
  return interval(time).pipe(map(() => f(new Date().getTime())))
}
