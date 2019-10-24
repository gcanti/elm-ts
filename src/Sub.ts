import { Observable, merge, EMPTY } from 'rxjs'
import { map as mapObs } from 'rxjs/operators'

export type Sub<msg> = Observable<msg>

export function map<a, msg>(sub: Sub<a>, f: (a: a) => msg): Sub<msg> {
  return sub.pipe(mapObs(f))
}

export function batch<msg>(arr: Array<Sub<msg>>): Sub<msg> {
  return merge(...arr)
}

export const none: Sub<never> = EMPTY
