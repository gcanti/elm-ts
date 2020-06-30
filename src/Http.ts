/**
 * Makes http calls to remote resources as `Cmd`s.
 *
 * See [Http](https://package.elm-lang.org/packages/elm/http/latest/Http) Elm package.
 *
 * @since 0.5.0
 */

import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { flow, identity } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { Observable, of } from 'rxjs'
import { AjaxError, AjaxRequest, AjaxResponse, AjaxTimeoutError, ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'
import { Cmd } from './Cmd'
import { Decoder } from './Decode'

// --- Aliases for docs
import Option = O.Option
import Either = E.Either
import TaskEither = TE.TaskEither

/**
 * @category model
 * @since 0.5.0
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * @category model
 * @since 0.5.0
 */
export interface Request<A> {
  expect: Decoder<A>
  url: string
  method: Method
  headers: Record<string, string>
  body?: unknown
  timeout: Option<number>
  withCredentials: boolean
}

/**
 * @category model
 * @since 0.5.0
 */
export interface Response<Body> {
  url: string
  status: {
    code: number
    message: string
  }
  headers: Record<string, string>
  body: Body
}

/**
 * @category model
 * @since 0.5.0
 */
export type HttpError =
  | { readonly _tag: 'BadUrl'; readonly value: string }
  | { readonly _tag: 'Timeout' }
  | { readonly _tag: 'NetworkError'; readonly value: string }
  | { readonly _tag: 'BadStatus'; readonly response: Response<string> }
  | { readonly _tag: 'BadPayload'; readonly value: string; readonly response: Response<string> }

/**
 * @category destructors
 * @since 0.5.0
 */
export function toTask<A>(req: Request<A>): TaskEither<HttpError, A> {
  return () => xhr(req).toPromise()
}

/**
 * Executes as `Cmd` the provided call to remote resource, mapping result to a `Msg`.
 * @category utils
 * @since 0.5.0
 */
export function send<A, Msg>(f: (e: Either<HttpError, A>) => Msg): (req: Request<A>) => Cmd<Msg> {
  return req => xhr(req).pipe(map(result => T.of(O.some(f(result)))))
}

/**
 * @category creators
 * @since 0.5.0
 */
export function get<A>(url: string, decoder: Decoder<A>): Request<A> {
  return {
    method: 'GET',
    headers: {},
    url,
    body: undefined,
    expect: decoder,
    timeout: O.none,
    withCredentials: false
  }
}

/**
 * @category creators
 * @since 0.5.0
 */
export function post<A>(url: string, body: unknown, decoder: Decoder<A>): Request<A> {
  return {
    method: 'POST',
    headers: {},
    url,
    body,
    expect: decoder,
    timeout: O.none,
    withCredentials: false
  }
}

// --- Helpers
function xhr<A>(req: Request<A>): Observable<Either<HttpError, A>> {
  return ajax(toXHRRequest(req)).pipe(
    map(flow(toResponse(req), decodeWith(req.expect))),
    catchError((e: unknown): Observable<Either<HttpError, A>> => of(E.left(toHttpError(req, e))))
  )
}

function toXHRRequest<A>(req: Request<A>): AjaxRequest {
  return {
    ...req,
    timeout: pipe(
      req.timeout,
      O.fold(() => 0, identity)
    ),
    async: true,
    responseType: 'text'
  }
}

function toResponse<A>(req: Request<A>): (resp: AjaxResponse) => Response<string> {
  return resp => ({
    url: req.url,
    status: { code: resp.status, message: '' },
    headers: req.headers,
    body: resp.response
  })
}

function decodeWith<A>(decoder: Decoder<A>): (resp: Response<string>) => Either<HttpError, A> {
  return resp =>
    pipe(
      // By spec parsing json can only throw `SyntaxError`
      E.parseJSON(resp.body, e => (e as SyntaxError).message),
      E.chain(decoder),
      E.mapLeft(e => ({
        _tag: 'BadPayload',
        value: e,
        response: resp
      }))
    )
}

function toHttpError<A>(req: Request<A>, e: unknown): HttpError {
  if (e instanceof AjaxTimeoutError) {
    return { _tag: 'Timeout' }
  }

  if (e instanceof AjaxError && e.status === 404) {
    return { _tag: 'BadUrl', value: req.url }
  }

  if (e instanceof AjaxError && e.status !== 0) {
    return {
      _tag: 'BadStatus',
      response: {
        url: req.url,
        status: { code: e.status, message: '' },
        headers: req.headers,
        body: e.response
      }
    }
  }

  return { _tag: 'NetworkError', value: e instanceof Error ? e.message : '' }
}
