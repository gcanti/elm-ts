import { chain, map, mapLeft, rightIO, taskify } from 'fp-ts/lib/TaskEither'
import { flow } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as fs from 'fs'
import * as path from 'path'
import { Eff, Program, run } from './program'

const README_FILE = 'README.md'
const DOCS_INDEX_FILE = 'docs/index.md'
const HEADLINE = `---
title: Home
nav_order: 1
---

`
interface MonadProcess {
  cwd: Eff<string>
}

interface MonadFileSystem {
  readonly readFile: (path: string) => Eff<string>
  readonly writeFile: (path: string, content: string) => Eff<void>
}

interface Capabilities extends MonadProcess, MonadFileSystem {}

const readFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, string>(fs.readFile)
const writeFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, void>(fs.writeFile)

const capabilities: Capabilities = {
  cwd: rightIO(() => process.cwd()),

  readFile: path =>
    pipe(
      readFileTE(path, 'utf8'),
      mapLeft(e => e.message)
    ),

  writeFile: flow(
    writeFileTE,
    mapLeft(e => e.message)
  )
}

const main: Program<Capabilities, string> = C =>
  pipe(
    C.cwd,
    map(dir => [path.join(dir, README_FILE), path.join(dir, DOCS_INDEX_FILE)] as const),
    chain(([input, output]) =>
      pipe(
        C.readFile(input),
        chain(data => C.writeFile(output, `${HEADLINE}${data}`))
      )
    ),
    map(() => 'Docs index updated')
  )

// --- Run the program
run(main(capabilities))
