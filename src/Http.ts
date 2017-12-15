import axios from 'axios'
import { AxiosResponse, AxiosRequestConfig } from 'axios'
import { Option, none } from 'fp-ts/lib/Option'
import { Either, left } from 'fp-ts/lib/Either'
import { Task } from 'fp-ts/lib/Task'
import { Time } from './Time'
import { Decoder, JSON } from './Decode'
import { Cmd } from './Cmd'
import { attempt } from './Task'
import { identity } from 'fp-ts/lib/function'

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Request<a> = {
  method: Method
  headers: { [key: string]: string }
  url: string
  body?: any
  expect: Expect<a>
  timeout: Option<Time>
  withCredentials: boolean
}

export type Expect<a> = (value: JSON) => Either<string, a>

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
    body: (res as any).request.responseText
  }
}

function axiosResponseToEither<a>(res: AxiosResponse, expect: Expect<a>): Either<HttpError, a> {
  return expect(res.data).mapLeft(errors => new BadPayload(errors, axiosResponseToResponse(res)))
}

function axiosErrorToEither<a>(e: Error | { response: AxiosResponse }): Either<HttpError, a> {
  if (e instanceof Error) {
    if ((e as any).code === 'ECONNABORTED') {
      return left(new Timeout())
    }
    return left(new NetworkError(e.message))
  }
  const res = e.response
  switch (res.status) {
    case 404:
      return left(new BadUrl(res.config.url!))
    default:
      return left(new BadStatus(axiosResponseToResponse(res)))
  }
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config) as any
}

function requestToTask<a>(req: Request<a>): Task<Either<HttpError, a>> {
  return new Task(() =>
    getPromiseAxiosResponse({
      method: req.method,
      headers: req.headers,
      url: req.url,
      data: req.body,
      timeout: req.timeout.fold(() => undefined, identity),
      withCredentials: req.withCredentials
    })
      .then(res => axiosResponseToEither(res, req.expect))
      .catch(e => axiosErrorToEither<a>(e))
  )
}

export function send<a, msg>(f: (e: Either<HttpError, a>) => msg, req: Request<a>): Cmd<msg> {
  return attempt(f, requestToTask(req))
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

export function post<a>(url: string, body: any, decoder: Decoder<a>): Request<a> {
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
