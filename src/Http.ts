import axios from 'axios'
import { AxiosResponse, AxiosRequestConfig } from 'axios'
import { Option, none } from 'fp-ts/lib/Option'
import { Either, left } from 'fp-ts/lib/Either'
import { Time } from './Time'
import { Decoder, JSON } from './Decode'
import { Cmd } from './Cmd'
import { Task, attempt } from './Task'
import { identity } from 'fp-ts/lib/function'

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'

export type Request<a> = {
  method: Method,
  headers: { [key: string]: string },
  url: string,
  body?: any,
  expect: Expect<a>,
  timeout: Option<Time>,
  withCredentials: boolean
}

export type Expect<a> = (value: JSON) => Either<string, a>

export function expectJson<a>(decoder: Decoder<a>): Expect<a> {
  return decoder.decode
}

export type HttpError =
  | { type: 'BadUrl', value: string }
  | { type: 'Timeout' }
  | { type: 'NetworkError', value: string }
  | { type: 'BadStatus', response: Response<string> }
  | { type: 'BadPayload', value: string, response: Response<string> }

export type Response<body> = {
  url: string,
  status: {
    code: number,
    message: string
  },
  headers: { [key: string]: string },
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
  return expect(res.data).mapLeft(errors => ({
    type: 'BadPayload',
    value: errors,
    response: axiosResponseToResponse(res)
  }) as HttpError)
}

function axiosErrorToEither<a>(e: Error | { response: AxiosResponse }): Either<HttpError, a> {
  if (e instanceof Error) {
    if ((e as any).code === 'ECONNABORTED') {
      return left<HttpError, a>({ type: 'Timeout' })
    }
    return left<HttpError, a>({ type: 'NetworkError', value: e.message })
  }
  const res = e.response
  switch (res.status) {
    case 404 :
      return left<HttpError, a>({ type: 'BadUrl', value: res.config.url! })
    default :
      return left<HttpError, a>({ type: 'BadStatus', response: axiosResponseToResponse(res) })
  }
}

function getPromiseAxiosResponse(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return axios(config) as any
}

export function toTask<a>(req: Request<a>): Task<Either<HttpError, a>> {
  return new Task<Either<HttpError, a>>(() => getPromiseAxiosResponse({
    method: req.method,
    headers: req.headers,
    url: req.url,
    data: req.body,
    timeout: req.timeout.fold(() => undefined, identity),
    withCredentials: req.withCredentials
  }).then(res => axiosResponseToEither(res, req.expect))
  .catch(e => axiosErrorToEither<a>(e)))
}

export function send<a, msg>(f: (e: Either<HttpError, a>) => msg, req: Request<a>): Cmd<msg> {
  return attempt(f, toTask(req))
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
