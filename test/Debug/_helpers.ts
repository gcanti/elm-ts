import { BehaviorSubject } from 'rxjs'
import { DebugData, DebuggerR } from '../../src/Debug/commons'

export type Model = number
export type Msg = { type: 'Inc' } | { type: 'Dec' }

export const DATA$ = new BehaviorSubject<DebugData<Model, Msg>>([{ type: 'INIT' }, 0])

export const STD_DEPS: DebuggerR<Model, Msg> = {
  init: 0,
  debug$: DATA$,
  dispatch: () => undefined
}
