import { array } from 'fp-ts/lib/Array'
import { Either } from 'fp-ts/lib/Either'
import { some } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { sequence as seq } from 'fp-ts/lib/Traversable'
import { of } from 'rxjs'
import { Cmd } from './Cmd'

export { Task }

const sequenceTasks = seq(task, array)

export function perform<a, msg>(task: Task<a>, f: (a: a) => msg): Cmd<msg> {
  return of(task.map(a => some(f(a))))
}

export function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>> {
  return sequenceTasks(tasks)
}

export function attempt<e, a, msg>(task: Task<Either<e, a>>, f: (e: Either<e, a>) => msg): Cmd<msg> {
  return perform(task, f)
}
