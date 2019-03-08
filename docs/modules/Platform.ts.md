---
title: Platform.ts
nav_order: 7
parent: Modules
---

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
export interface Dispatch<msg> {
  (msg: msg): void
}
```

# Program (interface)

**Signature**

```ts
export interface Program<model, msg> {
  dispatch: Dispatch<msg>
  cmd$: Cmd<msg>
  sub$: Sub<msg>
  model$: Observable<model>
}
```

# program (function)

**Signature**

```ts
export function program<model, msg>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  subscriptions: (model: model) => Sub<msg> = () => none
): Program<model, msg> { ... }
```

# programWithFlags (function)

**Signature**

```ts
export function programWithFlags<flags, model, msg>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  subscriptions: (model: model) => Sub<msg> = () => none
): (flags: flags) => Program<model, msg> { ... }
```

# run (function)

**Signature**

```ts
export function run<model, msg>(program: Program<model, msg>): Observable<model> { ... }
```
