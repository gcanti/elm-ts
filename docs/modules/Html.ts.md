---
title: Html.ts
nav_order: 9
parent: Modules
---

# Html overview

A specialization of `Program` with the capability of mapping `Model` to `View`
and rendering it into a DOM node.

`Html` is a base abstraction in order to work with any library that renders html.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Html (interface)](#html-interface)
- [Program (interface)](#program-interface)
- [Renderer (interface)](#renderer-interface)
- [map (function)](#map-function)
- [program (function)](#program-function)
- [programWithFlags (function)](#programwithflags-function)
- [run (function)](#run-function)

---

# Html (interface)

It is defined as a function that takes a `dispatch()` function as input and returns a `Dom` as output,
with DOM and messages types constrained.

**Signature**

```ts
export interface Html<Dom, Msg> {
  (dispatch: platform.Dispatch<Msg>): Dom
}
```

Added in v0.5.0

# Program (interface)

The `Program` interface is extended with a `html$` stream (an `Observable` of views) and a `Dom` type constraint.

**Signature**

```ts
export interface Program<Model, Msg, Dom> extends platform.Program<Model, Msg> {
  html$: Observable<Html<Dom, Msg>>
}
```

Added in v0.5.0

# Renderer (interface)

Defines the generalized `Renderer` as a function that takes a `Dom` as input and returns a `void`.

It suggests an effectful computation.

**Signature**

```ts
export interface Renderer<Dom> {
  (dom: Dom): void
}
```

Added in v0.5.0

# map (function)

Maps a view which carries a message of type `A` into a view which carries a message of type `B`.

**Signature**

```ts
export function map<Dom, A, Msg>(f: (a: A) => Msg): (ha: Html<Dom, A>) => Html<Dom, Msg> { ... }
```

Added in v0.5.0

# program (function)

Returns a `Program` specialized for `Html`.

It needs a `view()` function that maps `Model` to `Html`.

Underneath it uses `Platform.program()`.

**Signature**

```ts
export function program<Model, Msg, Dom>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, Msg, Dom> { ... }
```

Added in v0.5.0

# programWithFlags (function)

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export function programWithFlags<Flags, Model, Msg, Dom>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg, Dom> { ... }
```

Added in v0.5.0

# run (function)

Runs the `Program`.

Underneath it uses `Platform.run()`.

It subscribes to the views stream (`html$`) and runs `Renderer` for each new value.

**Signature**

```ts
export function run<Model, Msg, Dom>(program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model> { ... }
```

Added in v0.5.0
