import { Either } from 'fp-ts/lib/Either'
import { Type, validate } from 'io-ts'
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

export function map<a, b>(f: (a: a) => b, fa: Decoder<a>): Decoder<b> {
  return {
    decode: value => fa.decode(value).map(f)
  }
}

export function fromType<a>(type: Type<any, a>): Decoder<a> {
  return {
    decode: value => validate(value, type).mapLeft(errors => failure(errors).join('\n'))
  }
}
