---
title: Cmd.ts
nav_order: 1
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Cmd (interface)](#cmd-interface)
- [none (constant)](#none-constant)
- [batch (function)](#batch-function)
- [map (function)](#map-function)

---

# Cmd (interface)

**Signature**

```ts
export interface Cmd<Msg> extends Observable<Task<Option<Msg>>> {}
```

Added in v0.5.0

# none (constant)

**Signature**

```ts
export const none: Cmd<never> = ...
```

Added in v0.5.0

# batch (function)

**Signature**

```ts
export function batch<Msg>(arr: Array<Cmd<Msg>>): Cmd<Msg> { ... }
```

Added in v0.5.0

# map (function)

**Signature**

```ts
export function map<A, Msg>(f: (a: A) => Msg): (cmd: Cmd<A>) => Cmd<Msg> { ... }
```

Added in v0.5.0
