import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios'
import { Option, none } from 'fp-ts/lib/Option'
import { Either, left } from 'fp-ts/lib/Either'
import { Task } from 'fp-ts/lib/Task'
import { Time } from './Time'
import { Decoder, mixed } from './Decode'
import { Cmd } from './Cmd'
import { attempt } from './Task'
import { identity } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { either, option } from 'fp-ts'

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Request<a> = {
  method: Method
  headers: { [key: string]: string }
  url: string
  body?: mixed
  expect: Expect<a>
  timeout: Option<Time>
  withCredentials: boolean
}

export type Expect<a> = (value: mixed) => Either<string, a>

export function expectJson<a>(decoder: Decoder<a>): Expect<a> {
  return decoder.decode
}

export class BadUrl {
  readonly _tag: 'BadUrl' = 'BadUrl'
  constructor(readonly value: string) {}
}

export class Timeout {
  readonly _tag: 'Timeout' = 'Timeout'
}

export class NetworkError {
  readonly _tag: 'NetworkError' = 'NetworkError'
  constructor(readonly value: string) {}
}

export class BadStatus {
  readonly _tag: 'BadStatus' = 'BadStatus'
  constructor(readonly response: Response<string>) {}
}

export class BadPayload {
  readonly _tag: 'BadPayload' = 'BadPayload'
  constructor(readonly value: string, readonly response: Response<string>) {}
}

export type HttpError = BadUrl | Timeout | NetworkError | BadStatus | BadPayload

export type Response<body> = {
  url: string
  status: {
    code: number
    message: string
  }
  headers: { [key: string]: string }
  body: body
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

function axiosResponseToEither<a>(res: AxiosResponse, expect: Expect<a>): Either<HttpError, a> {
  return pipe(
    expect(res.data),
    either.mapLeft(errors => new BadPayload(errors, axiosResponseToResponse(res)))
  )
}

function axiosErrorToEither<a>(e: AxiosError): Either<HttpError, a> {
  if (e.response != null) {
    const res = e.response
    switch (res.status) {
      case 404:
        return left(new BadUrl(res.config.url!))
      default:
        return left(new BadStatus(axiosResponseToResponse(res)))
    }
  }

  if (e.code === 'ECONNABORTED') {
    return left(new Timeout())
  } else {
    return left(new NetworkError(e.message))
  }
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config)
}

export function toTask<a>(req: Request<a>): Task<Either<HttpError, a>> {
  return () =>
    getPromiseAxiosResponse({
      method: req.method,
      headers: req.headers,
      url: req.url,
      data: req.body,
      timeout: pipe(
        req.timeout,
        option.fold(() => undefined, identity)
      ),
      withCredentials: req.withCredentials
    })
      .then(res => axiosResponseToEither(res, req.expect))
      .catch(e => axiosErrorToEither<a>(e))
}

export function send<a, msg>(req: Request<a>, f: (e: Either<HttpError, a>) => msg): Cmd<msg> {
  return attempt(toTask(req), f)
}

export function get<a>(url: string, decoder: Decoder<a>): Request<a> {
  return {
    method: 'GET',
    headers: {},
    url,
    body: undefined,
    expect: expectJson(decoder),
    timeout: none,
    withCredentials: false
  }
}

export function post<a>(url: string, body: mixed, decoder: Decoder<a>): Request<a> {
  return {
    method: 'POST',
    headers: {},
    url,
    body,
    expect: expectJson(decoder),
    timeout: none,
    withCredentials: false
  }
}
