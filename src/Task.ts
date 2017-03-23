import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import { Cmd } from './Cmd'
import { Task } from 'fp-ts/lib/Task'
import { some } from 'fp-ts/lib/Option'

export {
  Task
}

export function perform<a, msg>(f: (a: a) => msg, task: Task<a>): Cmd<msg> {
  return Observable.of(task.map(a => some(f(a))))
}
