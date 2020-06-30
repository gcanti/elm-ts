/**
 * Defines a `Decoder`, namely a function that receives an `unknown` value and tries to decodes it in an `A` value.
 *
 * It returns an `Either` with a `string` as `Left` when decoding fails or an `A` as `Right` when decoding succeeds.
 *
 * @since 0.5.0
 */

import { Alternative1 } from 'fp-ts/lib/Alternative'
import * as E from 'fp-ts/lib/Either'
import { Monad1 } from 'fp-ts/lib/Monad'
import * as RE from 'fp-ts/lib/ReaderEither'
import { pipeable } from 'fp-ts/lib/pipeable'

// --- Aliases for docs
import ReaderEither = RE.ReaderEither

/**
 * @category instances
 * @since 0.5.0
 */
export const URI = 'elm-ts/Decoder'

/**
 * @category instances
 * @since 0.5.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Decoder<A>
  }
}

/**
 * @category model
 * @since 0.5.0
 */
export interface Decoder<A> extends ReaderEither<unknown, string, A> {}

/**
 * @category constructors
 * @since 0.5.0
 */
export const left: <A = never>(e: string) => Decoder<A> = RE.left

/**
 * @category constructors
 * @since 0.5.0
 */
export const right: <A>(a: A) => Decoder<A> = RE.readerEither.of

/**
 * @category combinators
 * @since 0.5.0
 */
export const orElse: <A>(f: (e: string) => Decoder<A>) => (ma: Decoder<A>) => Decoder<A> = RE.orElse

/**
 * @category instances
 * @since 0.5.0
 */
export const decoder: Monad1<URI> & Alternative1<URI> = {
  URI,
  map: RE.readerEither.map,
  of: right,
  ap: RE.readerEither.ap,
  chain: RE.readerEither.chain,
  alt: RE.readerEither.alt,
  zero: () => () => E.left('zero')
}

const { alt, ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(decoder)

export {
  /**
   * @category Alt
   * @since 0.5.0
   */
  alt,
  /**
   * @category Apply
   * @since 0.5.0
   */
  ap,
  /**
   * @category Apply
   * @since 0.5.0
   */
  apFirst,
  /**
   * @category Apply
   * @since 0.5.0
   */
  apSecond,
  /**
   * @category Monad
   * @since 0.5.0
   */
  chain,
  /**
   * @category Monad
   * @since 0.5.0
   */
  chainFirst,
  /**
   * @category Monad
   * @since 0.5.0
   */
  flatten,
  /**
   * @category Functor
   * @since 0.5.0
   */
  map
}
