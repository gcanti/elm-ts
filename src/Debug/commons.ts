import { BehaviorSubject } from 'rxjs'
import { Dispatch } from '../Platform'

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
  data$: BehaviorSubject<DebugData<Model, Msg>>
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
}
