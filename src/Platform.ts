import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/mergeMap'
import { Cmd } from './Cmd'
import { Sub, none } from './Sub'

export type Dispatch<msg> = (msg: msg) => void

export interface Program<model, msg> {
  dispatch: Dispatch<msg>,
  cmd$: Cmd<msg>,
  sub$: Sub<msg>,
  model$: Observable<model>
}

export interface Component<flags, model, msg> {
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>]
}

export function programWithFlags<flags, model, msg>(
    component: Component<flags, model, msg>,
    flags: flags,
    subscriptions: (model: model) => Sub<msg> = () => none
  ): Program<model, msg> {

  const { init, update } = component
  const state$ = new BehaviorSubject(init(flags))
  const dispatch: Dispatch<msg> = msg => state$.next(update(msg, state$.value[0]))
  const cmd$ = state$.mergeMap(state => state[1])
  const model$ = state$.map(state => state[0])
  const sub$ = model$.mergeMap(subscriptions)
  return { dispatch, cmd$, sub$, model$ }
}

export function run<model, msg>(program: Program<model, msg>): Observable<model> {
  const { dispatch, cmd$, sub$, model$ } = program
  cmd$.subscribe(io => io.run().map(dispatch))
  sub$.subscribe(dispatch)
  return model$
}
