import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import * as E from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Cmd } from './Cmd'
import { Decoder } from './Decode'
import { attempt } from './Task'

/**
 * @since 0.5.0
 */
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * @since 0.5.0
 */
export interface Request<A> {
  method: Method
  headers: Record<string, string>
  url: string
  body?: unknown
  expect: Decoder<A>
  timeout: O.Option<number>
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

function axiosResponseToResponse(res: AxiosResponse): Response<string> {
  return {
    url: res.config.url!,
    status: {
      code: res.status,
      message: res.statusText
    },
    headers: res.headers,
    body: res.request.responseText
  }
}

function axiosResponseToEither<A>(res: AxiosResponse, expect: Decoder<A>): E.Either<HttpError, A> {
  return pipe(
    expect(res.data),
    E.mapLeft(errors => ({
      _tag: 'BadPayload',
      value: errors,
      response: axiosResponseToResponse(res)
    }))
  )
}

function axiosErrorToEither<A>(e: AxiosError): E.Either<HttpError, A> {
  // tslint:disable-next-line: strict-type-predicates
  if (e.response != null) {
    const res = e.response
    switch (res.status) {
      case 404:
        return E.left({ _tag: 'BadUrl', value: res.config.url! })
      default:
        return E.left({ _tag: 'BadStatus', response: axiosResponseToResponse(res) })
    }
  }

  if (e.code === 'ECONNABORTED') {
    return E.left({ _tag: 'Timeout' })
  } else {
    return E.left({ _tag: 'NetworkError', value: e.message })
  }
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config)
}

/**
 * @since 0.5.0
 */
export function toTask<A>(req: Request<A>): TaskEither<HttpError, A> {
  return () =>
    getPromiseAxiosResponse({
      method: req.method,
      headers: req.headers,
      url: req.url,
      data: req.body,
      timeout: pipe(
        req.timeout,
        O.fold(() => undefined, identity)
      ),
      withCredentials: req.withCredentials
    })
      .then(res => axiosResponseToEither(res, req.expect))
      .catch(e => axiosErrorToEither<A>(e))
}

/**
 * @since 0.5.0
 */
export function send<A, Msg>(f: (e: E.Either<HttpError, A>) => Msg): (req: Request<A>) => Cmd<Msg> {
  return req => attempt(f)(toTask(req))
}

/**
 * @since 0.5.0
 */
export function get<a>(url: string, decoder: Decoder<a>): Request<a> {
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
export function post<a>(url: string, body: unknown, decoder: Decoder<a>): Request<a> {
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
