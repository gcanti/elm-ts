import { Option, option } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { EMPTY, merge, Observable } from 'rxjs'
import * as Rx from 'rxjs/operators'

/**
 * @since 0.5.0
 */
export interface Cmd<Msg> extends Observable<Task<Option<Msg>>> {}

/**
 * @since 0.5.0
 */
export function map<A, Msg>(f: (a: A) => Msg): (cmd: Cmd<A>) => Cmd<Msg> {
  return cmd => cmd.pipe(Rx.map(t => task.map(t, o => option.map(o, f))))
}

/**
 * @since 0.5.0
 */
export function batch<Msg>(arr: Array<Cmd<Msg>>): Cmd<Msg> {
  return merge(...arr)
}

/**
 * @since 0.5.0
 */
export const none: Cmd<never> = EMPTY
