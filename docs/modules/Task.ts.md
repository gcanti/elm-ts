---
title: Task.ts
nav_order: 10
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [attempt (function)](#attempt-function)
- [perform (function)](#perform-function)

---

# attempt (function)

**Signature**

```ts
export function attempt<E, A, Msg>(f: (e: Either<E, A>) => Msg): (task: Task<Either<E, A>>) => Cmd<Msg> { ... }
```

Added in v0.5.0

# perform (function)

**Signature**

```ts
export function perform<A, Msg>(f: (a: A) => Msg): (t: Task<A>) => Cmd<Msg> { ... }
```

Added in v0.5.0
