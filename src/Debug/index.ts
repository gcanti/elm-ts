/**
 * This module makes available a debugging utility for `elm-ts` applications.
 *
 * Use of the functions directly exported from this module is **deprecated**.
 *
 * Please use the specialized versions that you can find under `Debug/`.
 *
 * @since 0.5.0
 */

import * as HtmlDebugger from './Html'

/**
 * @deprecated Please use the specialized version exposed by `Debug/Html` module
 * @category constructors
 * @since 0.5.0
 */
export const programWithDebugger = HtmlDebugger.programWithDebugger

/**
 * @deprecated Please use the specialized version exposed by `Debug/Html` module
 * @category constructors
 * @since 0.5.0
 */
export const programWithDebuggerWithFlags = HtmlDebugger.programWithDebuggerWithFlags
