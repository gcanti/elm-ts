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

export const mockDebugger = <Model, Msg>(log: DebugData<Model, Msg>[]) => () => ({
  debug: (data: unknown) => log.push(data as DebugData<Model, Msg>),
  stop: () => undefined
})

export const disableDebugger = () => ({ debug: () => undefined, stop: () => undefined })
