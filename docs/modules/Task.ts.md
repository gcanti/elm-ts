---
title: Task.ts
nav_order: 10
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [attempt (function)](#attempt-function)
- [perform (function)](#perform-function)
- [sequence (function)](#sequence-function)

---

# attempt (function)

**Signature**

```ts
export function attempt<e, a, msg>(task: Task<Either<e, a>>, f: (e: Either<e, a>) => msg): Cmd<msg> { ... }
```

# perform (function)

**Signature**

```ts
export function perform<a, msg>(t: Task<a>, f: (a: a) => msg): Cmd<msg> { ... }
```

# sequence (function)

**Signature**

```ts
export function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>> { ... }
```
