import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { FileSystem, fileSystemNode } from './helpers/fs'
import { Logger, loggerConsole } from './helpers/logger'
import { Program, run } from './helpers/program'

const README_FILE = 'README.md'
const DOCS_INDEX_FILE = 'docs/index.md'
const HEADLINE = `---
title: Home
nav_order: 1
---

`

interface Capabilities extends FileSystem, Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

const withHeadline = (content: string): string => `${HEADLINE}${content}`

const main: AppEff<void> = C =>
  pipe(
    C.info(`Copy content of ${README_FILE} into ${DOCS_INDEX_FILE}...`),
    TE.chain(() => C.readFile(README_FILE)),
    TE.map(withHeadline),
    TE.chain(content => C.writeFile(DOCS_INDEX_FILE, content)),
    TE.chainFirst(() => C.log('Docs index updated'))
  )

// --- Run the program
run(
  main({
    ...fileSystemNode,
    ...loggerConsole
  })
)
