import { IO, chain, map } from 'fp-ts/lib/IO'
import { fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { BehaviorSubject } from 'rxjs'
import { Dispatch } from '../Platform'
import { consoleDebugger } from './console'
import { getConnection, reduxDevToolDebugger } from './redux-devtool'

/**
 * @since 0.5.0
 */
export type Global = typeof window

/**
 * @since 0.5.0
 */
export type DebugData<Model, Msg> = [DebugAction<Msg>, Model]

/**
 * @since 0.5.0
 */
export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>

/**
 * @since 0.5.0
 */
export interface DebugInit {
  type: 'INIT'
}
/**
 * Creates a `DebugInit`
 * @since 0.5.0
 */
export const debugInit = (): DebugInit => ({ type: 'INIT' })

/**
 * @since 0.5.0
 */
export interface DebugMsg<Msg> {
  type: 'MESSAGE'
  payload: Msg
}
/**
 * Creates a `DebugMsg`
 * @since 0.5.0
 */
export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ({ type: 'MESSAGE', payload })

/**
 * Extends `Msg` with a special kind of message from Debugger
 * @since 0.5.0
 */
export type MsgWithDebug<Model, Msg> =
  | Msg
  | { type: '__DebugUpdateModel__'; payload: Model }
  | { type: '__DebugApplyMsg__'; payload: Msg }

/**
 * Defines a generic debugging function
 * @since 0.5.0
 */
export interface Debug<Model, Msg> {
  (data: DebugData<Model, Msg>): void
}

/**
 * Defines a generic `Debugger`
 * @since 0.5.0
 */
export interface Debugger<Model, Msg> {
  (d: DebuggerR<Model, Msg>): Debug<Model, Msg>
}

/**
 * Defines the dependencies for a `Debugger` function.
 * @since 0.5.0
 */
export interface DebuggerR<Model, Msg> {
  init: Model
  debug$: BehaviorSubject<DebugData<Model, Msg>>
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
}

/**
 * Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream
 * @since 0.5.0
 */
export function runDebugger<Model, Msg>(win: Global): (deps: DebuggerR<Model, Msg>) => IO<void> {
  return deps =>
    pipe(
      getConnection<Model, Msg>(win),
      map(fold(() => consoleDebugger<Model, Msg>(), reduxDevToolDebugger)),
      chain(Debugger => () => deps.debug$.subscribe(Debugger(deps)))
    )
}
