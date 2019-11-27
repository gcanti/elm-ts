---
title: Navigation.ts
nav_order: 10
parent: Modules
---

# Overview

A specialization of `Program` that handles application navigation via location's hash.

It uses [`history`](https://github.com/ReactTraining/history) package

---

<h2 class="text-delta">Table of contents</h2>

- [Location (type alias)](#location-type-alias)
- [program (function)](#program-function)
- [programWithFlags (function)](#programwithflags-function)
- [push (function)](#push-function)

---

# Location (type alias)

**Signature**

```ts
export type Location = H.Location
```

Added in v0.5.0

# program (function)

Returns a `Program` specialized for `Navigation`.

The `Program` is a `Html.Program` but it needs a `locationToMsg()` function which converts location changes to messages.

Underneath it consumes `location$` stream (applying `locationToMsg()` on its values).

**Signature**

```ts
export function program<Model, Msg, Dom>(
  locationToMessage: (location: Location) => Msg,
  init: (location: Location) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): html.Program<Model, Msg, Dom> { ... }
```

Added in v0.5.0

# programWithFlags (function)

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export function programWithFlags<Flags, Model, Msg, Dom>(
  locationToMessage: (location: Location) => Msg,
  init: (flags: Flags) => (location: Location) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): (flags: Flags) => html.Program<Model, Msg, Dom> { ... }
```

Added in v0.5.0

# push (function)

Generates a `Cmd` that adds a new location to the history's list.

**Signature**

```ts
export function push<Msg>(url: string): Cmd<Msg> { ... }
```

Added in v0.5.0
