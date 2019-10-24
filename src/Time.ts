import { interval } from 'rxjs'
import { Task } from 'fp-ts/lib/Task'
import { Sub } from './Sub'
import { map } from 'rxjs/operators'

export type Time = number

export function now(): Task<Time> {
  return () => Promise.resolve(new Date().getTime())
}

export function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg> {
  return interval(time).pipe(map(() => f(new Date().getTime())))
}
