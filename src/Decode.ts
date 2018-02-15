import { Either } from 'fp-ts/lib/Either'
import { Type, mixed } from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

export type mixed = mixed

export interface Decoder<a> {
  decode: (value: mixed) => Either<string, a>
}

export function decodeJSON<a>(decoder: Decoder<a>, value: mixed): Either<string, a> {
  return decoder.decode(value)
}

export function map<a, b>(f: (a: a) => b, fa: Decoder<a>): Decoder<b> {
  return {
    decode: value => fa.decode(value).map(f)
  }
}

export function fromType<a>(type: Type<a, any, mixed>): Decoder<a> {
  return {
    decode: value => type.decode(value).mapLeft(errors => failure(errors).join('\n'))
  }
}
