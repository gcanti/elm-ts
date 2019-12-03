import { mapLeft, taskify } from 'fp-ts/lib/TaskEither'
import { flow } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as fs from 'fs'
import Glob from 'glob'
import { Eff } from './program'

export interface MonadFileSystem {
  readonly readFile: (path: string) => Eff<string>
  readonly writeFile: (path: string, content: string) => Eff<void>
  readonly glob: (pattern: string) => Eff<string[]>
}

const readFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, string>(fs.readFile)
const writeFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, void>(fs.writeFile)
const globTE = taskify<string, Error, string[]>(Glob)
const toError = (e: Error): string => e.message

export const effects: MonadFileSystem = {
  readFile: path =>
    pipe(
      readFileTE(path, 'utf8'),
      mapLeft(toError)
    ),

  writeFile: flow(
    writeFileTE,
    mapLeft(toError)
  ),

  glob: pattern =>
    pipe(
      globTE(pattern),
      mapLeft(toError)
    )
}
