import { Either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
export declare type JSONObject = {
    [key: string]: JSON;
};
export interface JSONArray extends Array<JSON> {
}
export declare type JSON = null | string | number | boolean | JSONArray | JSONObject;
export interface Decoder<a> {
    decode(value: JSON): Either<string, a>;
}
export declare function decodeJSON<a>(decoder: Decoder<a>, value: JSON): Either<string, a>;
export declare function validationToEither<a>(validation: t.Validation<a>): Either<string, a>;
export declare function fromType<a>(type: t.Type<any, a>): Decoder<a>;
