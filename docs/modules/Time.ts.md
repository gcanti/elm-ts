---
title: Time.ts
nav_order: 16
parent: Modules
---

# Overview

Exposes some utilities to work with unix time.
See [Time](https://package.elm-lang.org/packages/elm/time/latest/Time) Elm package.

---

<h2 class="text-delta">Table of contents</h2>

- [every (function)](#every-function)
- [now (function)](#now-function)

---

# every (function)

Get the current unix time periodically.

**Signature**

```ts
export function every<Msg>(time: number, f: (time: number) => Msg): Sub<Msg> { ... }
```

Added in v0.5.0

# now (function)

Get the current unix time as a `Task`.

**Signature**

```ts
export function now(): Task<number> { ... }
```

Added in v0.5.0
