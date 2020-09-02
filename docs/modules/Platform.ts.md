---
title: Platform.ts
nav_order: 13
parent: Modules
---

## Platform overview

The `Platform` module is the backbone of `elm-ts`.
It defines the base `program()` and `run()` functions which will be extended by more specialized modules.
_The Elm Architecture_ is implemented via **RxJS** `Observables`.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withStop](#withstop)
- [constructors](#constructors)
  - [program](#program)
  - [programWithFlags](#programwithflags)
- [model](#model)
  - [Dispatch (interface)](#dispatch-interface)
  - [Program (interface)](#program-interface)
- [utils](#utils)
  - [run](#run)

---

# combinators

## withStop

Stops the `program` when `signal` Observable emits a value.

**Signature**

```ts
export declare function withStop(
  signal: Observable<unknown>
): <Model, Msg>(program: Program<Model, Msg>) => Program<Model, Msg>
```

Added in v0.5.4

# constructors

## program

`program()` is the real core of `elm-ts`.

When a new `Program` is defined, a `BehaviorSubject` is created (because an initial value is needed) that will track every change to the `Model` and every `Cmd` executed.

Every time `dispatch()` is called a new value, computed by the `update()` function, is added to the the stream.

**Signature**

```ts
export declare function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg>
```

Added in v0.5.0

## programWithFlags

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export declare function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): (flags: Flags) => Program<Model, Msg>
```

Added in v0.5.0

# model

## Dispatch (interface)

**Signature**

```ts
export interface Dispatch<Msg> {
  (msg: Msg): void
}
```

Added in v0.5.0

## Program (interface)

`Program` is just an object that exposes the underlying streams which compose _The Elm Architecture_.
Even **Commands** and **Subscriptions** are expressed as `Observables` in order to mix them with ease.

**Signature**

```ts
export interface Program<Model, Msg> {
  dispatch: Dispatch<Msg>
  cmd$: Cmd<Msg>
  sub$: Sub<Msg>
  model$: Observable<Model>
}
```

Added in v0.5.0

# utils

## run

Runs the `Program`.

Because the program essentially is an object of streams, "running it" means subscribing to these streams and starting to consume values.

**Signature**

```ts
export declare function run<Model, Msg>(program: Program<Model, Msg>): Observable<Model>
```

Added in v0.5.0
