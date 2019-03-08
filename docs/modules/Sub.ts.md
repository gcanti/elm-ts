---
title: Sub.ts
nav_order: 9
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Sub (type alias)](#sub-type-alias)
- [none (constant)](#none-constant)
- [batch (function)](#batch-function)
- [map (function)](#map-function)

---

# Sub (type alias)

**Signature**

```ts
export type Sub<msg> = Observable<msg>
```

# none (constant)

**Signature**

```ts
export const none: Sub<never> = ...
```

# batch (function)

**Signature**

```ts
export function batch<msg>(arr: Array<Sub<msg>>): Sub<msg> { ... }
```

# map (function)

**Signature**

```ts
export function map<a, msg>(sub: Sub<a>, f: (a: a) => msg): Sub<msg> { ... }
```
