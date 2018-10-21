import { Task } from 'fp-ts/lib/Task'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'
import { Sub } from './Sub'

export type Time = number

export function now(): Task<Time> {
  return new Task(() => Promise.resolve(new Date().getTime()))
}

export function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg> {
  return interval(time).pipe(map(() => f(new Date().getTime())))
}
