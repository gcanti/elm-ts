/**
 * @file Defines `Cmd`s as streams of asynchronous operations which can not fail and that can optionally carry a message.
 *
 * See the [Platform.Cmd](https://package.elm-lang.org/packages/elm/core/latest/Platform-Cmd) Elm package.
 */

import { Option, option } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { EMPTY, Observable, merge } from 'rxjs'
import * as Rx from 'rxjs/operators'

/**
 * @since 0.5.0
 */
export interface Cmd<Msg> extends Observable<Task<Option<Msg>>> {}

/**
 * Maps the carried `Msg` of a `Cmd` into another `Msg`.
 * @since 0.5.0
 */
export function map<A, Msg>(f: (a: A) => Msg): (cmd: Cmd<A>) => Cmd<Msg> {
  return cmd => cmd.pipe(Rx.map(t => task.map(t, o => option.map(o, f))))
}

/**
 * Batches the execution of a list of commands.
 * @since 0.5.0
 */
export function batch<Msg>(arr: Array<Cmd<Msg>>): Cmd<Msg> {
  return merge(...arr)
}

/**
 * A `none` command is an empty stream.
 * @since 0.5.0
 */
export const none: Cmd<never> = EMPTY
