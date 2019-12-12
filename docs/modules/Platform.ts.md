---
title: Platform.ts
nav_order: 13
parent: Modules
---

# Platform overview

The `Platform` module is the backbone of `elm-ts`.
It defines the base `program()` and `run()` functions which will be extended by more specialized modules.
_The Elm Architecture_ is implemented via **RxJS** `Observables`.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Dispatch (interface)](#dispatch-interface)
- [Program (interface)](#program-interface)
- [program (function)](#program-function)
- [programWithFlags (function)](#programwithflags-function)
- [run (function)](#run-function)

---

# Dispatch (interface)

**Signature**

```ts
export interface Dispatch<Msg> {
  (msg: Msg): void
}
```

Added in v0.5.0

# Program (interface)

Program`is just an object that exposes the underlying streams which compose _The Elm Architecture_. Even **Commands** and **Subscriptions** are expressed as`Observables` in order to mix them with ease.

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

# program (function)

`program()` is the real core of `elm-ts`.

When a new `Program` is defined, a `BehaviorSubject` is created (because an initial value is needed) that will track every change to the `Model` and every `Cmd` executed.

Every time `dispatch()` is called a new value, computed by the `update()` function, is added to the the stream.

**Signature**

```ts
export function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg> { ... }
```

Added in v0.5.0

# programWithFlags (function)

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  subscriptions: (model: Model) => Sub<Msg> = () => none
): (flags: Flags) => Program<Model, Msg> { ... }
```

Added in v0.5.0

# run (function)

Runs the `Program`.

Because the program essentially is an object of streams, "running it" means subscribing to these streams and starting to consume values.

**Signature**

```ts
export function run<Model, Msg>(program: Program<Model, Msg>): Observable<Model> { ... }
```

Added in v0.5.0
