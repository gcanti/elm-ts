---
title: React.ts
nav_order: 8
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Dom (interface)](#dom-interface)
- [Html (interface)](#html-interface)
- [Program (interface)](#program-interface)
- [map (function)](#map-function)
- [program (function)](#program-function)
- [programWithFlags (function)](#programwithflags-function)
- [run (function)](#run-function)

---

# Dom (interface)

**Signature**

```ts
export interface Dom extends ReactElement<any> {}
```

Added in v0.5.0

# Html (interface)

**Signature**

```ts
export interface Html<Msg> extends html.Html<Dom, Msg> {}
```

Added in v0.5.0

# Program (interface)

**Signature**

```ts
export interface Program<Model, Msg> extends html.Program<Model, Msg, Dom> {}
```

Added in v0.5.0

# map (function)

**Signature**

```ts
export function map<A, Msg>(f: (a: A) => Msg): (ha: Html<A>) => Html<Msg> { ... }
```

Added in v0.5.0

# program (function)

**Signature**

```ts
export function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): Program<Model, Msg> { ... }
```

Added in v0.5.0

# programWithFlags (function)

**Signature**

```ts
export function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg> { ... }
```

Added in v0.5.0

# run (function)

**Signature**

```ts
export function run<Model, Msg>(program: Program<Model, Msg>, renderer: html.Renderer<Dom>): Observable<Model> { ... }
```

Added in v0.5.0
