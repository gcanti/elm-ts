import { fold } from 'fp-ts/lib/Either'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'

export interface Eff<A> extends TE.TaskEither<string, A> {}

export interface Program<C, A> extends RTE.ReaderTaskEither<C, string, A> {}

export function run<A>(eff: Eff<A>): void {
  eff()
    .then(
      fold(
        e => {
          throw e
        },
        _ => {
          process.exitCode = 0
        }
      )
    )
    .catch(e => {
      console.error('[ERROR]', e)

      process.exitCode = 1
    })
}
