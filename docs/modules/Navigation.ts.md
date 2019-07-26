---
title: Navigation.ts
nav_order: 6
parent: Modules
---

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

**Signature**

```ts
export function push<Msg>(url: string): Cmd<Msg> { ... }
```

Added in v0.5.0
