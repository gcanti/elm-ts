import { Either } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { pathReporterFailure } from 'io-ts/lib/reporters/default'

export type JSONObject = { [key: string]: JSON }
export interface JSONArray extends Array<JSON> {}
export type JSON = null | string | number | boolean | JSONArray | JSONObject

export interface Decoder<a> {
  decode(value: JSON): Either<string, a>
}

export function decodeJSON<a>(decoder: Decoder<a>, value: JSON): Either<string, a> {
  return decoder.decode(value)
}

export function validationToEither<a>(validation: t.Validation<a>): Either<string, a> {
  return validation.mapLeft(errors => pathReporterFailure(errors).join(''))
}

export function fromType<a>(type: t.Type<a>): Decoder<a> {
  return {
    decode(value) {
      return validationToEither(t.validate(value, type))
    }
  }
}
