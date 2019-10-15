/**
 * @file The `Platform` module is the backbone of `elm-ts`.
 * It defines the base `program()` and `run()` functions which will be extended by more specialized modules.
 * _The Elm Architecture_ is implemented via **RxJS** `Observables`.
 */

import * as O from 'fp-ts/lib/Option'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeAll, share, startWith, switchMap } from 'rxjs/operators'
import { Cmd } from './Cmd'
import { Sub, none } from './Sub'

/**
 * @since 0.5.0
 */
export interface Dispatch<Msg> {
  (msg: Msg): void
}

/**
 * Program` is just an object that exposes the underlying streams which compose _The Elm Architecture_.
 * Even **Commands** and **Subscriptions** are expressed as `Observables` in order to mix them with ease.
 * @since 0.5.0
 */
export interface Program<Model, Msg> {
  dispatch: Dispatch<Msg>
  cmd$: Cmd<Msg>
  sub$: Sub<Msg>
  model$: Observable<Model>
}

function modelCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[0] === y[0]
}

function cmdCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[1] === y[1]
}

/**
 * `program()` is the real core of `elm-ts`.
 *
 * When a new `Program` is defined, a `BehaviorSubject` is created (because an initial value is needed) that will track every change to the `Model` and every `Cmd` executed.
 *
 * Every time `dispatch()` is called a new value, computed by the `update()` function, is added to the the stream.
 * @since 0.5.0
 */
export function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg> {
  const state$ = new BehaviorSubject(init)
  const dispatch: Dispatch<Msg> = msg => state$.next(update(msg, state$.getValue()[0]))

  const cmd$ = state$.pipe(
    // startWith(init), // added to make the initial cmd work
    distinctUntilChanged(cmdCompare),
    map(state => state[1]),
    mergeAll()
  )

  const model$ = state$.pipe(
    distinctUntilChanged(modelCompare),
    map(state => state[0]),
    share()
  )

  const sub$ = model$.pipe(
    startWith(init[0]),
    switchMap(model => subscriptions(model))
  )

  return { dispatch, cmd$, sub$, model$ }
}

/**
 * Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @since 0.5.0
 */
export function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): (flags: Flags) => Program<Model, Msg> {
  return flags => program(init(flags), update, subscriptions)
}

/**
 * Runs the `Program`.
 *
 * Because the program essentially is an object of streams, "running it" means subscribing to these streams and starting to consume values.
 * @since 0.5.0
 */
export function run<Model, Msg>(program: Program<Model, Msg>): Observable<Model> {
  const { dispatch, cmd$, sub$, model$ } = program

  cmd$.subscribe(task => task().then(O.map(dispatch)))

  sub$.subscribe(dispatch)

  return model$
}
