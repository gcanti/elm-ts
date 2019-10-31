/**
 * @file Makes http calls to remote resources as `Cmd`s.
 *
 * See [Http](https://package.elm-lang.org/packages/elm/http/latest/Http) Elm package.
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
 * @since 0.5.0
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
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
 * @since 0.5.0
 */
export type HttpError =
  | { readonly _tag: 'BadUrl'; readonly value: string }
  | { readonly _tag: 'Timeout' }
  | { readonly _tag: 'NetworkError'; readonly value: string }
  | { readonly _tag: 'BadStatus'; readonly response: Response<string> }
  | { readonly _tag: 'BadPayload'; readonly value: string; readonly response: Response<string> }

/**
 * @since 0.5.0
 */
export type Response<Body> = {
  url: string
  status: {
    code: number
    message: string
  }
  headers: Record<string, string>
  body: Body
}

/**
 * @since 0.5.0
 */
export function toTask<A>(req: Request<A>): TaskEither<HttpError, A> {
  return () => xhr(req).toPromise()
}

/**
 * Executes as `Cmd` the provided call to remote resource, mapping result to a `Msg`.
 * @since 0.5.0
 */
export function send<A, Msg>(f: (e: Either<HttpError, A>) => Msg): (req: Request<A>) => Cmd<Msg> {
  return req => xhr(req).pipe(map(result => T.of(O.some(f(result)))))
}

/**
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
    map(
      flow(
        toResponse(req),
        decodeWith(req.expect)
      )
    ),
    catchError((e: any): Observable<Either<HttpError, A>> => of(E.left(toHttpError(e))))
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
    responseType: 'json'
  }
}

function toResponse<A>(req: Request<A>): (resp: AjaxResponse) => Response<string> {
  return resp => ({
    url: req.url,
    status: {
      code: resp.status,
      message: ''
    },
    headers: req.headers,
    body: resp.response
  })
}

function decodeWith<A>(decoder: Decoder<A>): (resp: Response<string>) => Either<HttpError, A> {
  return resp =>
    pipe(
      decoder(resp.body),
      E.mapLeft(e => ({
        _tag: 'BadPayload',
        value: e,
        response: resp
      }))
    )
}

function toHttpError(e: any): HttpError {
  if (e instanceof AjaxTimeoutError) {
    return { _tag: 'Timeout' }
  }

  // RxJS ajax method can throw errors of different types (not just `AjaxError`).
  // These controls seem to cover every case.
  if (e instanceof AjaxError && e.status === 404) {
    return { _tag: 'BadUrl', value: e.request.url! }
  }

  if (e instanceof AjaxError && e.status !== 0) {
    return { _tag: 'BadStatus', response: e.response }
  }

  return { _tag: 'NetworkError', value: e.message }
}
