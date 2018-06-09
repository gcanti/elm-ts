import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/map'
import { Task } from 'fp-ts/lib/Task'
import { Option } from 'fp-ts/lib/Option'

export type Cmd<msg> = Observable<Task<Option<msg>>>

export function map<a, msg>(cmd: Cmd<a>, f: (a: a) => msg): Cmd<msg> {
  return cmd.map(task => task.map(option => option.map(f)))
}

export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> {
  return Observable.merge(...arr)
}

export const none: Cmd<never> = Observable.empty()
