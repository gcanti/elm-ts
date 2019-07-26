import { Task } from 'fp-ts/lib/Task'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'
import { Sub } from './Sub'

/**
 * @since 0.5.0
 */
export function now(): Task<number> {
  return () => Promise.resolve(new Date().getTime())
}

/**
 * @since 0.5.0
 */
export function every<Msg>(time: number, f: (time: number) => Msg): Sub<Msg> {
  return interval(time).pipe(map(() => f(new Date().getTime())))
}
