---
title: React.ts
nav_order: 13
parent: Modules
---

# Overview

A specialization of `Html` that uses `React` as renderer.

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

`Dom` is a `ReactElement`.

**Signature**

```ts
export interface Dom extends ReactElement<any> {}
```

Added in v0.5.0

# Html (interface)

`Html` has `Dom` type constrained to the specialized version for `React`.

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

`map()` is `Html.map()` with `Html` type constrained to the specialized version for `React`.

**Signature**

```ts
export function map<A, Msg>(f: (a: A) => Msg): (ha: Html<A>) => Html<Msg> { ... }
```

Added in v0.5.0

# program (function)

`program()` is `Html.program()` with `Html` type constrained to the specialized version for `React`.

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

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

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

`run()` is `Html.run()` with `dom` type constrained to the specialized version for `React`.

**Signature**

```ts
export function run<Model, Msg>(program: Program<Model, Msg>, renderer: html.Renderer<Dom>): Observable<Model> { ... }
```

Added in v0.5.0
