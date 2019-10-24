import { pipe } from 'fp-ts/lib/pipeable'
import { Type } from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as E from 'fp-ts/lib/Either'

export type mixed = unknown

export interface Decoder<a> {
  decode: (value: mixed) => E.Either<string, a>
}

export function decodeJSON<a>(decoder: Decoder<a>, value: mixed): E.Either<string, a> {
  return decoder.decode(value)
}

export function map<a, b>(fa: Decoder<a>, f: (a: a) => b): Decoder<b> {
  return {
    decode: value => pipe(fa.decode(value), E.map(f))
  }
}

export function fromType<a>(type: Type<a, any, mixed>): Decoder<a> {
  return {
    decode: value => pipe(type.decode(value), E.mapLeft(errors => failure(errors).join('\n')))
  }
}
