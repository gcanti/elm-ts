---
title: Html.ts
nav_order: 3
parent: Modules
---

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

**Signature**

```ts
export interface Html<Dom, Msg> {
  (dispatch: platform.Dispatch<Msg>): Dom
}
```

Added in v0.5.0

# Program (interface)

**Signature**

```ts
export interface Program<Model, Msg, Dom> extends platform.Program<Model, Msg> {
  html$: Observable<Html<Dom, Msg>>
}
```

Added in v0.5.0

# Renderer (interface)

**Signature**

```ts
export interface Renderer<Dom> {
  (dom: Dom): void
}
```

Added in v0.5.0

# map (function)

**Signature**

```ts
export function map<Dom, A, Msg>(f: (a: A) => Msg): (ha: Html<Dom, A>) => Html<Dom, Msg> { ... }
```

Added in v0.5.0

# program (function)

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

**Signature**

```ts
export function run<Model, Msg, Dom>(program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model> { ... }
```

Added in v0.5.0
