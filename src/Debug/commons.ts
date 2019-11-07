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
