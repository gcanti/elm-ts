import { fold } from 'fp-ts/lib/Either'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'

export interface Eff<A> extends TE.TaskEither<string, A> {}

export interface Program<C, A> extends RTE.ReaderTaskEither<C, string, A> {}

export function run(te: TE.TaskEither<string, string>): void {
  te()
    .then(
      fold(
        e => {
          console.error(e)

          process.exitCode = 1
        },
        r => {
          console.log(r)

          process.exitCode = 0
        }
      )
    )
    .catch(e => console.error('Unexpected error', e))
}
