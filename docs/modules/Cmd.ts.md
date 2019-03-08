---
title: Cmd.ts
nav_order: 1
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Cmd (type alias)](#cmd-type-alias)
- [none (constant)](#none-constant)
- [batch (function)](#batch-function)
- [map (function)](#map-function)

---

# Cmd (type alias)

**Signature**

```ts
export type Cmd<msg> = Observable<Task<Option<msg>>>
```

# none (constant)

**Signature**

```ts
export const none: Cmd<never> = ...
```

# batch (function)

**Signature**

```ts
export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> { ... }
```

# map (function)

**Signature**

```ts
export function map<a, msg>(cmd: Cmd<a>, f: (a: a) => msg): Cmd<msg> { ... }
```
