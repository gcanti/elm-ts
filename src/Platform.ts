import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/mergeMap'
import { Cmd } from './Cmd'
import { Sub } from './Sub'

export type Dispatch<msg> = (msg: msg) => void

export type Program<flags, model, msg> = (flags: flags) => {
  dispatch: Dispatch<msg>,
  model$: Observable<model>
}

export function programWithFlags<flags, model, msg>(
    init: (flags: flags) => [model, Cmd<msg>],
    update: (msg: msg, model: model) => [model, Cmd<msg>],
    subscriptions: Sub<msg>
  ): Program<flags, model, msg> {

  return flags => {
    const state$ = new BehaviorSubject(init(flags))
    const dispatch: Dispatch<msg> = msg => state$.next(update(msg, state$.value[0]))
    subscriptions.subscribe(dispatch)
    state$.flatMap(x => x[1]).subscribe(io => io.run().map(dispatch))
    const model$ = state$.map(x => x[0])
    return { dispatch, model$ }
  }
}
