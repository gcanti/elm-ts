import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { cwd, spwan } from './bindings'
import { Eff, Program, run, unexpected } from './program'

const MAKE_DOCS = 'npm run docs'
const GIT_ADD_DOCS = 'git add ./docs'

interface ExecOptions {
  cwd: string
}

interface MonadProcess {
  readonly cwd: Eff<string>
}

interface MonadChildProcess {
  readonly exec: (cmd: string, opts?: ExecOptions) => Eff<string>
}

interface Capabilities extends MonadProcess, MonadChildProcess {}

const capabilities: Capabilities = {
  cwd,

  exec: (cmd, opts) => {
    const [command, ...args] = cmd.split(' ')

    return pipe(
      spwan(command, args, opts),
      TE.map(() => `Command "${cmd}" executed`)
    )
  }
}

const main: Program<Capabilities, string> = C =>
  pipe(
    C.cwd,
    TE.chain(dir =>
      pipe(
        C.exec(MAKE_DOCS, { cwd: dir }),
        TE.chain(() => C.exec(GIT_ADD_DOCS, { cwd: dir }))
      )
    ),
    TE.map(() => `Docs updated and staged`)
  )

// --- Run the program
run(main(capabilities)).catch(unexpected)
