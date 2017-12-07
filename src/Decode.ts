import { Either } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

export type JSONObject = { [key: string]: JSON }
export interface JSONArray extends Array<JSON> {}
export type JSON = null | string | number | boolean | JSONArray | JSONObject

export interface Decoder<a> {
  decode: (value: JSON) => Either<string, a>
}

export function decodeJSON<a>(decoder: Decoder<a>, value: JSON): Either<string, a> {
  return decoder.decode(value)
}

export function validationToEither<a>(validation: t.Validation<a>): Either<string, a> {
  return validation.mapLeft(errors => failure(errors).join(''))
}

export function map<a, b>(f: (a: a) => b, fa: Decoder<a>): Decoder<b> {
  return {
    decode: value => fa.decode(value).map(f)
  }
}

export function fromType<a>(type: t.Type<any, a>): Decoder<a> {
  return {
    decode: value => validationToEither(t.validate(value, type))
  }
}
