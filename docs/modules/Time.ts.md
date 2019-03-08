---
title: Time.ts
nav_order: 11
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Time (type alias)](#time-type-alias)
- [every (function)](#every-function)
- [now (function)](#now-function)

---

# Time (type alias)

**Signature**

```ts
export type Time = number
```

# every (function)

**Signature**

```ts
export function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg> { ... }
```

# now (function)

**Signature**

```ts
export function now(): Task<Time> { ... }
```
