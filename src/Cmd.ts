import { Observable, EMPTY, merge } from 'rxjs'
import { map as mapObs } from 'rxjs/operators'
import { Task } from 'fp-ts/lib/Task'
import { Option } from 'fp-ts/lib/Option'
import { option as O, task as T } from 'fp-ts'

export type Cmd<msg> = Observable<Task<Option<msg>>>

export function map<a, msg>(cmd: Cmd<a>, f: (a: a) => msg): Cmd<msg> {
  return cmd.pipe(mapObs(T.map(O.map(f))))
}

export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> {
  return merge(...arr)
}

export const none: Cmd<never> = EMPTY
