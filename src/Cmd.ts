import { Option } from 'fp-ts/lib/Option'
import { Task } from 'fp-ts/lib/Task'
import { empty, merge, Observable } from 'rxjs'
import { map as rxjsMap } from 'rxjs/operators'

export interface Cmd<msg> extends Observable<Task<Option<msg>>> {}

export function map<a, msg>(cmd: Cmd<a>, f: (a: a) => msg): Cmd<msg> {
  return cmd.pipe(rxjsMap(task => task.map(option => option.map(f))))
}

export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> {
  return merge(...arr)
}

export const none: Cmd<never> = empty()
