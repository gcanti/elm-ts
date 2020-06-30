/**
 * Integration with _Redux DevTool Extension_.
 *
 * Please check the [docs](https://github.com/zalmoxisus/redux-devtools-extension/tree/master/docs/API) fur further information.
 *
 * @since 0.5.0
 */

import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as IO_ from 'fp-ts/lib/IO'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { Dispatch } from '../Platform'
import { Debug, Debugger, DebuggerR, Global, MsgWithDebug } from './commons'

// --- Aliases for docs
import Option = O.Option
import Either = E.Either
import IO = IO_.IO

const sequenceTEither = sequenceT(E.either)

type Unsubscription = () => void

/**
 * Defines a _Redux DevTool Extension_ object.
 * @category model
 * @since 0.5.0
 */
export interface Extension {
  connect: <Model, Msg>() => Connection<Model, Msg>
}

/**
 * Defines a _Redux DevTool Extension_ connection object.
 * @category model
 * @since 0.5.0
 */
export interface Connection<Model, Msg> {
  subscribe: (listener?: Dispatch<DevToolMsg>) => Unsubscription
  send(action: null, state: LiftedState<Model>): void
  send(action: Msg, state: Model): void
  init: (state: Model) => void
  error: (message: unknown) => void
  unsubscribe: () => void
}

type DevToolMsg = Start | Action | Monitor

interface Start {
  type: 'START'
}

interface Action {
  type: 'ACTION'
  payload: unknown
}

interface Monitor {
  type: 'DISPATCH'
  payload: {
    type: 'JUMP_TO_STATE' | 'JUMP_TO_ACTION' | 'RESET' | 'ROLLBACK' | 'COMMIT' | 'IMPORT_STATE' | 'TOGGLE_ACTION'
    [k: string]: unknown
  }
  [k: string]: unknown
}

interface LiftedState<Model> {
  actionsById: Record<string, unknown>
  computedStates: Array<{ state: Model }>
  currentStateIndex: number
  nextActionId: number
  skippedActionIds: number[]
  stagedActionIds: number[]
  isPaused: boolean
}

interface DevToolHandlerR<Model, Msg> extends DebuggerR<Model, Msg> {
  connection: Connection<Model, Msg>
}

/**
 * Gets a _Redux DevTool Extension_ connection in case the extension is available
 * @category utils
 * @since 0.5.0
 */
export function getConnection<Model, Msg>(global: Global): IO<Option<Connection<Model, Msg>>> {
  return () => (hasExtension(global) ? O.some(global.__REDUX_DEVTOOLS_EXTENSION__.connect()) : O.none)
}

/**
 * **[UNSAFE]** Type guard to check if _Redux DevTool Extension_ is available.
 *
 * This is "tagged" as unsafe because the check is really loose.
 * @since 0.5.0
 */
function hasExtension(global: Global): global is Global & { __REDUX_DEVTOOLS_EXTENSION__: Extension } {
  return '__REDUX_DEVTOOLS_EXTENSION__' in global
}

/**
 * **[UNSAFE]** Debug through _Redux DevTool Extension_
 * @category constructors
 * @since 0.5.4
 */
export function reduxDevToolDebugger<Model, Msg>(connection: Connection<Model, Msg>): Debugger<Model, Msg> {
  return d => {
    const deps = { ...d, connection }

    // --- Subscribe to extension in order to receive messages from monitor
    connection.subscribe(handleSubscription(deps))

    return {
      debug: handleActions(deps),
      stop: connection.unsubscribe
    }
  }
}

/**
 * **[UNSAFE]** Handles the execution of an effect related to an incoming messages sent from extension monitor.
 * @since 0.5.0
 */
function handleSubscription<Model, Msg>(deps: DevToolHandlerR<Model, Msg>): (msg: DevToolMsg) => void {
  const handler = handleIncomingMsg(deps)

  return msg =>
    pipe(
      handler(msg),
      E.fold(
        err => console.warn('[REDUX DEV TOOL]', err),
        eff => eff()
      )
    )
}

/**
 * **[UNSAFE]** Handles incoming messages sent from extension monitor.
 *
 * This is largely inspired by https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js
 *
 * **Note:** the monitor can dispatch messages of any shape that will be re-dispatched into the application; these messages **are not validated** and can lead to unexpected behaviours.
 * @since 0.5.0
 */
function handleIncomingMsg<Model, Msg>({
  connection,
  init,
  debug$,
  dispatch
}: DevToolHandlerR<Model, Msg>): (msg: DevToolMsg) => Either<string, IO<void>> {
  const dispatchToApp = (m: unknown): IO<void> => () => dispatch(m as Msg)
  const reinit: IO<void> = () => connection.init(init)
  const update = (payload: Model): IO<void> => dispatchToApp({ type: '__DebugUpdateModel__', payload })
  const restart = (model: Model): IO<void> => () => connection.init(model)
  const liftState = (state: LiftedState<Model>): IO<void> => () => connection.send(null, state)
  const toggle = toggleAction(dispatch)

  return msg => {
    switch (msg.type) {
      case 'START':
        return E.right(reinit)

      case 'ACTION':
        return pipe(
          E.parseJSON(String(msg.payload), E.toError),
          E.bimap(e => e.message, dispatchToApp)
        )

      case 'DISPATCH':
        switch (msg.payload.type) {
          case 'JUMP_TO_STATE':
          case 'JUMP_TO_ACTION':
            return pipe(parseJump<Model>(msg), E.map(update))

          case 'RESET':
            return E.right(
              pipe(
                update(init),
                IO_.chain(() => reinit)
              )
            )

          case 'ROLLBACK':
            return pipe(
              parseRollback<Model>(msg),
              E.map(m =>
                pipe(
                  update(m),
                  IO_.chain(() => restart(m))
                )
              )
            )

          case 'COMMIT':
            return E.right(restart(debug$.getValue()[1]))

          case 'IMPORT_STATE':
            return pipe(
              parseImportState<Model>(msg),
              E.map(liftedState =>
                pipe(
                  update(liftedState.computedStates[liftedState.computedStates.length - 1].state),
                  IO_.chain(() => liftState(liftedState))
                )
              )
            )

          case 'TOGGLE_ACTION':
            return pipe(
              parseToggleAction<Model>(msg),
              E.map(([id, liftedState]) => pipe(toggle(id, liftedState), IO_.chain(liftState)))
            )

          default:
            return E.left(msg.payload.type)
        }
    }
  }
}

/**
 * Handles debugging actions.
 *
 * The `MESSAGE` action will send the message payload and state to the connected extension (`connection`).
 * @since 0.5.0
 */
function handleActions<Model, Msg>({ connection }: DevToolHandlerR<Model, Msg>): Debug<Model, Msg> {
  return ([action, model]) => (action.type === 'MESSAGE' ? connection.send(action.payload, model) : undefined)
}

/**
 * Parses a `JUMP` message.
 *
 * @since 0.5.0
 */
function parseJump<Model>(msg: Monitor): Either<string, Model> {
  return pipe(
    E.parseJSON(String(msg.state), E.toError),
    E.bimap(
      e => e.message,
      u => u as Model
    )
  )
}

/**
 * Parses a `ROLLBACK` message.
 *
 * @since 0.5.0
 */
function parseRollback<Model>(msg: Monitor): Either<string, Model> {
  return pipe(
    E.parseJSON(String(msg.state), E.toError),
    E.bimap(
      e => e.message,
      u => u as Model
    )
  )
}

/**
 * Parses an `IMPORT_STATE` message.
 *
 * @since 0.5.0
 */
function parseImportState<Model>(msg: Monitor): Either<string, LiftedState<Model>> {
  return typeof msg.payload.nextLiftedState === 'object' && msg.payload.nextLiftedState !== null
    ? E.right(msg.payload.nextLiftedState as LiftedState<Model>)
    : E.left('IMPORT_STATE message has some bad payload...')
}

/**
 * Parses a `TOGGLE_ACTION` message.
 *
 * @since 0.5.0
 */
function parseToggleAction<Model>(msg: Monitor): Either<string, [number, LiftedState<Model>]> {
  const getId = pipe(
    msg.payload.id,
    E.fromNullable('TOGGLE_ACTION message has some bad payload...'),
    E.map(x => x as number)
  )

  const parseState = pipe(
    E.parseJSON(String(msg.state), E.toError),
    E.bimap(
      e => e.message,
      u => u as LiftedState<Model>
    )
  )

  return sequenceTEither(getId, parseState)
}

/**
 * Handles toggling a specific action (identified by `id` parameter).
 *
 * It re-executes all the actions (and updates the store) excluding the toggled one.
 *
 * The implementation is taken from [MobX dev tool integration](https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js#L22)
 *
 * @since 0.5.0
 */
function toggleAction<Model, Msg>(
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
): (id: number, liftedState: LiftedState<Model>) => IO<LiftedState<Model>> {
  return (id, liftedState) => () => {
    const state = JSON.parse(JSON.stringify(liftedState)) // poor man deep clone...

    const { skippedActionIds, stagedActionIds, computedStates, actionsById } = state

    const skippedIndex = skippedActionIds.indexOf(id)
    const skipped = skippedIndex !== -1
    const actionIndex = stagedActionIds.indexOf(id)

    if (actionIndex === -1) {
      return state
    }

    dispatch({ type: '__DebugUpdateModel__', payload: computedStates[actionIndex - 1].state })

    const start = skipped ? actionIndex : actionIndex + 1
    const end = stagedActionIds.length

    for (let i = start; i < end; i++) {
      const currentActionId = stagedActionIds[i]

      if (i !== actionIndex && skippedActionIds.indexOf(currentActionId) !== -1) {
        continue // it's already skipped
      }

      dispatch({ type: '__DebugApplyMsg__', payload: actionsById[currentActionId].action })
    }

    if (skipped) {
      skippedActionIds.splice(skippedIndex, 1)
    } else {
      skippedActionIds.push(id)
    }

    return state
  }
}
