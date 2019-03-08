---
title: React.ts
nav_order: 8
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Html (interface)](#html-interface)
- [Program (interface)](#program-interface)
- [dom (type alias)](#dom-type-alias)
- [map (function)](#map-function)
- [program (function)](#program-function)
- [programWithFlags (function)](#programwithflags-function)
- [run (function)](#run-function)

---

# Html (interface)

**Signature**

```ts
export interface Html<msg> extends html.Html<dom, msg> {}
```

# Program (interface)

**Signature**

```ts
export interface Program<model, msg> extends html.Program<model, msg, dom> {}
```

# dom (type alias)

**Signature**

```ts
export type dom = ReactElement<any>
```

# map (function)

**Signature**

```ts
export function map<a, msg>(ha: Html<a>, f: (a: a) => msg): Html<msg> { ... }
```

# program (function)

**Signature**

```ts
export function program<model, msg>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): Program<model, msg> { ... }
```

# programWithFlags (function)

**Signature**

```ts
export function programWithFlags<flags, model, msg>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): (flags: flags) => Program<model, msg> { ... }
```

# run (function)

**Signature**

```ts
export function run<model, msg>(program: Program<model, msg>, renderer: html.Renderer<dom>): Observable<model> { ... }
```
