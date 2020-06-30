---
title: React.ts
nav_order: 14
parent: Modules
---

## React overview

A specialization of `Html` that uses `React` as renderer.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Functor](#functor)
  - [map](#map)
- [constructors](#constructors)
  - [program](#program)
  - [programWithFlags](#programwithflags)
- [model](#model)
  - [Dom (interface)](#dom-interface)
  - [Html (interface)](#html-interface)
  - [Program (interface)](#program-interface)
- [utils](#utils)
  - [run](#run)

---

# Functor

## map

`map()` is `Html.map()` with `Html` type constrained to the specialized version for `React`.

**Signature**

```ts
export declare function map<A, Msg>(f: (a: A) => Msg): (ha: Html<A>) => Html<Msg>
```

Added in v0.5.0

# constructors

## program

`program()` is `Html.program()` with `Html` type constrained to the specialized version for `React`.

**Signature**

```ts
export declare function program<Model, Msg>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): Program<Model, Msg>
```

Added in v0.5.0

## programWithFlags

Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export declare function programWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg>
```

Added in v0.5.0

# model

## Dom (interface)

`Dom` is a `ReactElement`.

**Signature**

```ts
export interface Dom extends ReactElement<any> {}
```

Added in v0.5.0

## Html (interface)

`Html` has `Dom` type constrained to the specialized version for `React`.

**Signature**

```ts
export interface Html<Msg> extends html.Html<Dom, Msg> {}
```

Added in v0.5.0

## Program (interface)

**Signature**

```ts
export interface Program<Model, Msg> extends html.Program<Model, Msg, Dom> {}
```

Added in v0.5.0

# utils

## run

`run()` is `Html.run()` with `dom` type constrained to the specialized version for `React`.

**Signature**

```ts
export declare function run<Model, Msg>(program: Program<Model, Msg>, renderer: html.Renderer<Dom>): Observable<Model>
```

Added in v0.5.0
