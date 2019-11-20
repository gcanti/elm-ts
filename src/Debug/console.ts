/**
 * @file Debug via standard browser's `console`
 */

import { Option, alt, fromNullable, getOrElse } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { DebugMsg, Debugger } from './commons'

/**
 * **[UNSAFE]** Simple debugger that uses the standard browser's `console`
 * @since 0.5.0
 */
export function consoleDebugger<Model, Msg>(): Debugger<Model, Msg> {
  return () => data => {
    const [action, model] = data

    console.group('%cELM-TS', 'background-color: green; color: black')

    // --- Action
    if (action.type === 'INIT') {
      console.log('[INIT]')
    }

    if (action.type === 'MESSAGE') {
      const showType = getOrElse(() => '')(getMsgType(action))

      console.groupCollapsed(`[MESSAGE] %c${showType}`, 'font-weight: bold')
      console.dir(action.payload)
      console.groupEnd()
    }

    // --- Model
    console.groupCollapsed('[MODEL]')
    console.dir(model)
    console.groupEnd()
    console.groupEnd()
  }
}

/**
 * Tries to extract the "type" of a `Message` reading the value of the [_discriminant_ property](http://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) (iterating through a list of commonly used names - e.g. "tag", "type", "kind" etc.)
 * @since 0.5.0
 */
function getMsgType<Msg>(m: DebugMsg<Msg>): Option<string> {
  const { payload } = m as any

  return pipe(
    fromNullable(payload['tag']),
    alt(() => fromNullable(payload['_tag'])),
    alt(() => fromNullable(payload['type'])),
    alt(() => fromNullable(payload['_type'])),
    alt(() => fromNullable(payload['kind'])),
    alt(() => fromNullable(payload['_kind']))
  )
}
