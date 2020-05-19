---
title: Http.ts
nav_order: 10
parent: Modules
---

# Http overview

Makes http calls to remote resources as `Cmd`s.

See [Http](https://package.elm-lang.org/packages/elm/http/latest/Http) Elm package.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Request (interface)](#request-interface)
- [Response (interface)](#response-interface)
- [HttpError (type alias)](#httperror-type-alias)
- [Method (type alias)](#method-type-alias)
- [get](#get)
- [post](#post)
- [send](#send)
- [toTask](#totask)

---

# Request (interface)

**Signature**

```ts
export interface Request<A> {
  expect: Decoder<A>
  url: string
  method: Method
  headers: Record<string, string>
  body?: unknown
  timeout: Option<number>
  withCredentials: boolean
}
```

Added in v0.5.0

# Response (interface)

**Signature**

```ts
export interface Response<Body> {
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
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
```

Added in v0.5.0

# get

**Signature**

```ts
export declare function get<A>(url: string, decoder: Decoder<A>): Request<A>
```

Added in v0.5.0

# post

**Signature**

```ts
export declare function post<A>(url: string, body: unknown, decoder: Decoder<A>): Request<A>
```

Added in v0.5.0

# send

Executes as `Cmd` the provided call to remote resource, mapping result to a `Msg`.

**Signature**

```ts
export declare function send<A, Msg>(f: (e: Either<HttpError, A>) => Msg): (req: Request<A>) => Cmd<Msg>
```

Added in v0.5.0

# toTask

**Signature**

```ts
export declare function toTask<A>(req: Request<A>): TaskEither<HttpError, A>
```

Added in v0.5.0
