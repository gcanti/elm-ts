---
title: Http.ts
nav_order: 4
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Request (interface)](#request-interface)
- [HttpError (type alias)](#httperror-type-alias)
- [Method (type alias)](#method-type-alias)
- [Response (type alias)](#response-type-alias)
- [get (function)](#get-function)
- [post (function)](#post-function)
- [send (function)](#send-function)
- [toTask (function)](#totask-function)

---

# Request (interface)

**Signature**

```ts
export interface Request<A> {
  method: Method
  headers: Record<string, string>
  url: string
  body?: unknown
  expect: Decoder<A>
  timeout: O.Option<number>
  withCredentials: boolean
}
```

Added in v0.5.0

# HttpError (type alias)

**Signature**

```ts
export type HttpError =
  | { readonly _tag: 'BadUrl'; readonly value: string }
  | { readonly _tag: 'Timeout' }
  | { readonly _tag: 'NetworkError'; readonly value: string }
  | { readonly _tag: 'BadStatus'; readonly response: Response<string> }
  | { readonly _tag: 'BadPayload'; readonly value: string; readonly response: Response<string> }
```

Added in v0.5.0

# Method (type alias)

**Signature**

```ts
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
```

Added in v0.5.0

# Response (type alias)

**Signature**

```ts
export type Response<Body> = {
  url: string
  status: {
    code: number
    message: string
  }
  headers: Record<string, string>
  body: Body
}
```

Added in v0.5.0

# get (function)

**Signature**

```ts
export function get<a>(url: string, decoder: Decoder<a>): Request<a> { ... }
```

Added in v0.5.0

# post (function)

**Signature**

```ts
export function post<a>(url: string, body: unknown, decoder: Decoder<a>): Request<a> { ... }
```

Added in v0.5.0

# send (function)

**Signature**

```ts
export function send<A, Msg>(f: (e: E.Either<HttpError, A>) => Msg): (req: Request<A>) => Cmd<Msg> { ... }
```

Added in v0.5.0

# toTask (function)

**Signature**

```ts
export function toTask<A>(req: Request<A>): TaskEither<HttpError, A> { ... }
```

Added in v0.5.0
