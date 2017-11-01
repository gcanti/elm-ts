import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/startWith'
import { Cmd } from './Cmd'
import { Sub, none } from './Sub'

export type Dispatch<msg> = (msg: msg) => void

export interface Program<model, msg> {
  dispatch: Dispatch<msg>
  cmd$: Cmd<msg>
  sub$: Sub<msg>
  model$: Observable<model>
}

export interface Component<flags, model, msg> {
  init: (flags: flags) => [model, Cmd<msg>]
  update: (msg: msg, model: model) => [model, Cmd<msg>]
}

function modelCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[0] === y[0]
}

function cmdCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[1] === y[1]
}

export function programWithFlags<flags, model, msg>(
  component: Component<flags, model, msg>,
  flags: flags,
  subscriptions: (model: model) => Sub<msg> = () => none
): Program<model, msg> {
  const { init, update } = component
  const initialState = init(flags)
  const state$ = new BehaviorSubject(initialState)
  const dispatch: Dispatch<msg> = msg => state$.next(update(msg, state$.value[0]))
  const cmd$ = state$
    .distinctUntilChanged(cmdCompare)
    .map(state => state[1])
    .mergeAll()
  const model$ = state$
    .distinctUntilChanged(modelCompare)
    .map(state => state[0])
    .share()
    .startWith(initialState[0])
  const sub$ = model$.switchMap(model => subscriptions(model))
  return { dispatch, cmd$, sub$, model$ }
}

export function run<model, msg>(program: Program<model, msg>): Observable<model> {
  const { dispatch, cmd$, sub$, model$ } = program
  cmd$.subscribe(task => task.run().then(o => o.map(dispatch)))
  sub$.subscribe(dispatch)
  return model$
}
