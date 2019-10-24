import { of } from 'rxjs'
import { Cmd } from './Cmd'
import { Task, task } from 'fp-ts/lib/Task'

import { some } from 'fp-ts/lib/Option'
import { array } from 'fp-ts/lib/Array'
import { Either } from 'fp-ts/lib/Either'

const sequenceTasks = array.sequence(task)

export function perform<a, msg>(t: Task<a>, f: (a: a) => msg): Cmd<msg> {
  return of(task.map(t, a => some(f(a))))
}

export function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>> {
  return sequenceTasks(tasks)
}

export function attempt<e, a, msg>(task: Task<Either<e, a>>, f: (e: Either<e, a>) => msg): Cmd<msg> {
  return perform(task, f)
}
