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
export type Location = HistoryLocation
```

# program (function)

**Signature**

```ts
export function program<model, msg, dom>(
  locationToMessage: (location: Location) => msg,
  init: (location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): html.Program<model, msg, dom> { ... }
```

# programWithFlags (function)

**Signature**

```ts
export function programWithFlags<flags, model, msg, dom>(
  locationToMessage: (location: Location) => msg,
  init: (flags: flags) => (location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): (flags: flags) => html.Program<model, msg, dom> { ... }
```

# push (function)

**Signature**

```ts
export function push<msg>(url: string): Cmd<msg> { ... }
```
