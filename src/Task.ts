import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import { Cmd } from './Cmd'
import { Task, task } from 'fp-ts/lib/Task'
import { some } from 'fp-ts/lib/Option'
import { sequence as seq } from 'fp-ts/lib/Traversable'
import { array } from 'fp-ts/lib/Array'
import { Either } from 'fp-ts/lib/Either'

export { Task }

const sequenceTasks = seq(task, array)

export function perform<a, msg>(task: Task<a>, f: (a: a) => msg): Cmd<msg> {
  return Observable.of(task.map(a => some(f(a))))
}

export function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>> {
  return sequenceTasks(tasks)
}

export function attempt<e, a, msg>(task: Task<Either<e, a>>, f: (e: Either<e, a>) => msg): Cmd<msg> {
  return perform(task, f)
}
