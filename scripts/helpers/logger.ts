import { info, log } from 'fp-ts/lib/Console'
import { rightIO } from 'fp-ts/lib/TaskEither'
import { Eff } from './program'

export interface MonadLogger {
  readonly info: (s: string) => Eff<void>
  readonly log: (s: string) => Eff<void>
}

export const effects: MonadLogger = {
  info: s => rightIO(info(`> ${s}`)),
  log: s => rightIO(log(`\n> ${s}`))
}
