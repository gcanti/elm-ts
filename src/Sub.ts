import { EMPTY, merge, Observable } from 'rxjs'
import * as Rx from 'rxjs/operators'

/**
 * @since 0.5.0
 */
export interface Sub<Msg> extends Observable<Msg> {}

/**
 * @since 0.5.0
 */
export function map<A, Msg>(f: (a: A) => Msg): (sub: Sub<A>) => Sub<Msg> {
  return sub => sub.pipe(Rx.map(f))
}

/**
 * @since 0.5.0
 */
export function batch<Msg>(arr: Array<Sub<Msg>>): Sub<Msg> {
  return merge(...arr)
}

/**
 * @since 0.5.0
 */
export const none: Sub<never> = EMPTY
