import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
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
 * @since 0.5.0
 */
export function run<Model, Msg>(program: Program<Model, Msg>): Observable<Model> {
  const { dispatch, cmd$, sub$, model$ } = program
  cmd$.subscribe(task =>
    task().then(o =>
      pipe(
        o,
        O.map(dispatch)
      )
    )
  )
  sub$.subscribe(dispatch)
  return model$
}
