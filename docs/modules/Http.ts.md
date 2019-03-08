---
title: Http.ts
nav_order: 4
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Expect (type alias)](#expect-type-alias)
- [HttpError (type alias)](#httperror-type-alias)
- [Method (type alias)](#method-type-alias)
- [Request (type alias)](#request-type-alias)
- [Response (type alias)](#response-type-alias)
- [BadPayload (class)](#badpayload-class)
- [BadStatus (class)](#badstatus-class)
- [BadUrl (class)](#badurl-class)
- [NetworkError (class)](#networkerror-class)
- [Timeout (class)](#timeout-class)
- [expectJson (function)](#expectjson-function)
- [get (function)](#get-function)
- [post (function)](#post-function)
- [send (function)](#send-function)
- [toTask (function)](#totask-function)

---

# Expect (type alias)

**Signature**

```ts
export type Expect<a> = (value: mixed) => Either<string, a>
```

# HttpError (type alias)

**Signature**

```ts
export type HttpError = BadUrl | Timeout | NetworkError | BadStatus | BadPayload
```

# Method (type alias)

**Signature**

```ts
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
```

# Request (type alias)

**Signature**

```ts
export type Request<a> = {
  method: Method
  headers: { [key: string]: string }
  url: string
  body?: mixed
  expect: Expect<a>
  timeout: Option<Time>
  withCredentials: boolean
}
```

# Response (type alias)

**Signature**

```ts
export type Response<body> = {
  url: string
  status: {
    code: number
    message: string
  }
  headers: { [key: string]: string }
  body: body
}
```

# BadPayload (class)

**Signature**

```ts
export class BadPayload {
  constructor(readonly value: string, readonly response: Response<string>) { ... }
  ...
}
```

# BadStatus (class)

**Signature**

```ts
export class BadStatus {
  constructor(readonly response: Response<string>) { ... }
  ...
}
```

# BadUrl (class)

**Signature**

```ts
export class BadUrl {
  constructor(readonly value: string) { ... }
  ...
}
```

# NetworkError (class)

**Signature**

```ts
export class NetworkError {
  constructor(readonly value: string) { ... }
  ...
}
```

# Timeout (class)

**Signature**

```ts
export class Timeout { ... }
```

# expectJson (function)

**Signature**

```ts
export function expectJson<a>(decoder: Decoder<a>): Expect<a> { ... }
```

# get (function)

**Signature**

```ts
export function get<a>(url: string, decoder: Decoder<a>): Request<a> { ... }
```

# post (function)

**Signature**

```ts
export function post<a>(url: string, body: mixed, decoder: Decoder<a>): Request<a> { ... }
```

# send (function)

**Signature**

```ts
export function send<a, msg>(req: Request<a>, f: (e: Either<HttpError, a>) => msg): Cmd<msg> { ... }
```

# toTask (function)

**Signature**

```ts
export function toTask<a>(req: Request<a>): Task<Either<HttpError, a>> { ... }
```
