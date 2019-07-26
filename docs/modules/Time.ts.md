---
title: Time.ts
nav_order: 11
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [every (function)](#every-function)
- [now (function)](#now-function)

---

# every (function)

**Signature**

```ts
export function every<Msg>(time: number, f: (time: number) => Msg): Sub<Msg> { ... }
```

Added in v0.5.0

# now (function)

**Signature**

```ts
export function now(): Task<number> { ... }
```

Added in v0.5.0
