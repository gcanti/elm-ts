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
export interface Html<dom, msg> {
  (dispatch: platform.Dispatch<msg>): dom
}
```

# Program (interface)

**Signature**

```ts
export interface Program<model, msg, dom> extends platform.Program<model, msg> {
  html$: Observable<Html<dom, msg>>
}
```

# Renderer (interface)

**Signature**

```ts
export interface Renderer<dom> {
  (dom: dom): void
}
```

# map (function)

**Signature**

```ts
export function map<dom, a, msg>(ha: Html<dom, a>, f: (a: a) => msg): Html<dom, msg> { ... }
```

# program (function)

**Signature**

```ts
export function program<model, msg, dom>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): Program<model, msg, dom> { ... }
```

# programWithFlags (function)

**Signature**

```ts
export function programWithFlags<flags, model, msg, dom>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => Html<dom, msg>,
  subscriptions?: (model: model) => Sub<msg>
): (flags: flags) => Program<model, msg, dom> { ... }
```

# run (function)

**Signature**

```ts
export function run<model, msg, dom>(program: Program<model, msg, dom>, renderer: Renderer<dom>): Observable<model> { ... }
```
