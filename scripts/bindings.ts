import * as child_process from 'child_process'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { Eff } from './program'

export const cwd: Eff<string> = TE.rightIO(() => process.cwd())

export const spwan = (
  cmd: string,
  args: ReadonlyArray<string> = [],
  opts?: child_process.SpawnOptions
): Eff<[number, string | null]> => () =>
  new Promise(resolve => {
    let exited: boolean = false

    const options: child_process.SpawnOptions = {
      stdio: 'inherit',
      ...opts
    }

    const subprocess = child_process.spawn(cmd, args, options)

    subprocess.on('exit', (code, signal) => {
      if (exited) {
        return
      }

      exited = true

      if (code > 0) {
        return resolve(E.left(spwanError(cmd, args, code, signal)))
      }

      return resolve(E.right([code, signal]))
    })

    subprocess.on('error', err => {
      if (exited) {
        return
      }

      exited = true

      return resolve(E.left(err.message))
    })
  })

function spwanError(cmd: string, args: readonly string[], code: number | null, signal: string | null): string {
  const s = signal === null ? 'Failed' : `[${signal.toUpperCase()}]`
  const c = `command \`${cmd} ${args.join(' ')}\``
  const e = code === null ? '' : `exited with code ${code}`

  return `\n${s} ${c} ${e}`
}
