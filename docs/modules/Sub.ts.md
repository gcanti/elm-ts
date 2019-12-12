---
title: Sub.ts
nav_order: 15
parent: Modules
---

# Sub overview

Defines `Sub`s as streams of messages.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Sub (interface)](#sub-interface)
- [none (constant)](#none-constant)
- [batch (function)](#batch-function)
- [map (function)](#map-function)

---

# Sub (interface)

**Signature**

```ts
export interface Sub<Msg> extends Observable<Msg> {}
```

Added in v0.5.0

# none (constant)

A `none` subscription is an empty stream.

**Signature**

```ts
export const none: Sub<never> = ...
```

Added in v0.5.0

# batch (function)

Merges subscriptions streams into one stream.

**Signature**

```ts
export function batch<Msg>(arr: Array<Sub<Msg>>): Sub<Msg> { ... }
```

Added in v0.5.0

# map (function)

Maps `Msg` of a `Sub` into another `Msg`.

**Signature**

```ts
export function map<A, Msg>(f: (a: A) => Msg): (sub: Sub<A>) => Sub<Msg> { ... }
```

Added in v0.5.0
