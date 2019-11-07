/**
 * @file Integration with _Redux DevTool Extension_.
 *
 * Please check the [docs](https://github.com/zalmoxisus/redux-devtools-extension/tree/master/docs/API) fur further information.
 */

import { fold, parseJSON, toError } from 'fp-ts/lib/Either'
import { IO } from 'fp-ts/lib/IO'
import { Option, chain, fromNullable, getOrElse, none, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { Dispatch } from '../Platform'
import { DebugData, Global } from './commons'

// --- Constants
const EXTENSION_CONFIG: ExtensionOptions = {
  features: {
    dispatch: true
  }
}

// --- Definitions
type Unsubscription = () => void

/**
 * This is a partial porting of [`EnhancerOptions`](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/npm-package/index.d.ts#L3) without the need to install the `redux-devtools-extension` package (and all its dependencies)
 */
interface ExtensionOptions {
  /**
   * If you want to restrict the extension, specify the features you allow.
   * If not specified, all of the features are enabled. When set as an object, only those included as `true` will be allowed.
   * Note that except `true`/`false`, `import` and `export` can be set as `custom` (which is by default for Redux enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /**
     * start/pause recording of dispatched actions
     */
    pause?: boolean
    /**
     * lock/unlock dispatching actions and side effects
     */
    lock?: boolean
    /**
     * persist states on page reloading
     */
    persist?: boolean
    /**
     * export history of actions in a file
     */
    export?: boolean | 'custom'
    /**
     * import history of actions from a file
     */
    import?: boolean | 'custom'
    /**
     * jump back and forth (time travelling)
     */
    jump?: boolean
    /**
     * skip (cancel) actions
     */
    skip?: boolean
    /**
     * drag and drop actions in the history list
     */
    reorder?: boolean
    /**
     * dispatch custom actions or action creators
     */
    dispatch?: boolean
    /**
     * generate tests for the selected actions
     */
    test?: boolean
  }
}

interface Extension {
  connect: <Model, Msg>(options?: ExtensionOptions) => Connection<Model, Msg>
  disconnect: Unsubscription
}

interface Connection<Model, Msg> {
  subscribe: (listener?: (data: Message) => void) => Unsubscription
  unsubscribe: Unsubscription
  send: (action: Msg, state: Model) => void
  init: (state: Model) => void
  error: (message: any) => void
}

interface Message {
  type: string
  [k: string]: any
}

type AllowedMessage = { type: 'START' } | { type: 'ACTION'; payload: string }

// --- Functions
/**
 * Gets a _Redux DevTool Extension_ connection in case the extension is available
 * @since 0.5.0
 */
export function getConnection<Model, Msg>(g: Global): IO<Option<Connection<Model, Msg>>> {
  return () => (globalHasExtension(g) ? some(g.__REDUX_DEVTOOLS_EXTENSION__.connect(EXTENSION_CONFIG)) : none)
}

/**
 * **[UNSAFE]** Type guard to check if _Redux DevTool Extension_ is available.
 *
 * This is "tagged" as unsafe because the check is really loose.
 * @since 0.5.0
 */
function globalHasExtension(g: Global): g is Global & { __REDUX_DEVTOOLS_EXTENSION__: Extension } {
  return '__REDUX_DEVTOOLS_EXTENSION__' in g
}

/**
 * **[UNSAFE]** Debug through _Redux DevTool Extension_
 * @since 0.5.0
 */
export function reduxDevToolDebugger<Model, Msg>(
  connection: Connection<Model, Msg>
): (dispatch: Dispatch<Msg>) => (data: DebugData<Model, Msg>) => void {
  return dispatch => {
    // --- Subscribe to extension in order to receive messages from monitor
    connection.subscribe(handleSubscription(dispatch))

    return handleActions(connection)
  }
}

/**
 * **[UNSAFE]** Handles incoming messages sent from extension monitor.
 *
 * Only few features are supported.
 *
 * **Note:** the monitor can dispatch messages of any shape that will be re-dispatched into the application; these messages **are not validated** and can lead to unexpected beahviours.
 * @since 0.5.0
 */
function handleSubscription<Msg>(dispatch: Dispatch<Msg>): (msg: Message) => void {
  return msg => {
    // --- Bypass not allowed messages
    if (!isAllowedMessage(msg)) {
      return warnNotSupportedFeature(msg)()
    }

    switch (msg.type) {
      case 'ACTION':
        return pipe(
          parseJSON(msg.payload, toError),
          fold(e => console.warn('[REDUX DEV TOOL]', e.message), m => dispatch(m as Msg))
        )

      case 'START':
        return
    }
  }
}

/**
 * Handles debugging actions.
 *
 * The `INIT` action will set the init state on the connected extension (`connection`).
 *
 * The `MESSAGE` action will send the message payload and state to the connected extension (`connection`).
 * @since 0.5.0
 */
function handleActions<Model, Msg>(connection: Connection<Model, Msg>): (data: DebugData<Model, Msg>) => void {
  return data => {
    const [action, model] = data

    // --- Init
    if (action.type === 'INIT') {
      return connection.init(model)
    }

    // --- Send
    if (action.type === 'MESSAGE') {
      return connection.send(action.payload, model)
    }
  }
}

/**
 * Warns about not supported feature.
 *
 * `msg` is an incoming message from extension.
 * @since 0.5.0
 */
function warnNotSupportedFeature(msg: Message): IO<void> {
  return () => {
    console.warn('[REDUX DEV TOOL]', 'This feature is not yet supported:', getFeatureLabel(msg))
  }
}

/**
 * Type guard to check if incoming `msg` is an allowed one.
 *
 * `msg` is an incoming message from extension.
 * @since 0.5.0
 */
function isAllowedMessage(msg: Message): msg is AllowedMessage {
  return ['START', 'ACTION'].includes(msg.type)
}

/**
 * Gets the feature label/type from a `Message`.
 * @since 0.5.0
 */
function getFeatureLabel(msg: Message): string {
  return pipe(
    fromNullable(msg.payload),
    chain(payload => (typeof payload === 'object' ? fromNullable(payload.type) : none)),
    chain(type => (typeof type === 'string' ? some(type) : none)),
    getOrElse(() => msg.type)
  )
}
