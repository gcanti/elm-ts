import { Alternative1 } from 'fp-ts/lib/Alternative'
import * as E from 'fp-ts/lib/Either'
import { Monad1 } from 'fp-ts/lib/Monad'
import * as RE from 'fp-ts/lib/ReaderEither'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import { Type } from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    Decoder: Decoder<A>
  }
}

/**
 * @since 0.5.0
 */
export type Mixed = unknown

/**
 * @since 0.5.0
 */
export const URI = 'Decoder'

/**
 * @since 0.5.0
 */
export type URI = typeof URI

/**
 * @since 0.5.0
 */
export interface Decoder<A> extends RE.ReaderEither<unknown, string, A> {}

/**
 * @since 0.5.0
 */
export const left: <A = never>(e: string) => Decoder<A> = RE.left

/**
 * @since 0.5.0
 */
export const right: <A>(a: A) => Decoder<A> = RE.readerEither.of

/**
 * @since 0.5.0
 */
export const orElse: <A>(f: (e: string) => Decoder<A>) => (ma: Decoder<A>) => Decoder<A> = RE.orElse

/**
 * Creates a `Decoder` from an `io-ts` type.
 * @since 0.5.0
 */
export const fromType: <A>(t: Type<A, any, Mixed>) => Decoder<A> = type => v =>
  pipe(
    type.decode(v),
    E.mapLeft(errors => failure(errors).join('\n'))
  )

/**
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
   * @since 0.5.0
   */
  alt,
  /**
   * @since 0.5.0
   */
  ap,
  /**
   * @since 0.5.0
   */
  apFirst,
  /**
   * @since 0.5.0
   */
  apSecond,
  /**
   * @since 0.5.0
   */
  chain,
  /**
   * @since 0.5.0
   */
  chainFirst,
  /**
   * @since 0.5.0
   */
  flatten,
  /**
   * @since 0.5.0
   */
  map
}
