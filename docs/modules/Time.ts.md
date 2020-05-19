---
title: Time.ts
nav_order: 17
parent: Modules
---

# Time overview

Exposes some utilities to work with unix time.

See [Time](https://package.elm-lang.org/packages/elm/time/latest/Time) Elm package.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [every](#every)
- [now](#now)

---

# every

Get the current unix time periodically.

**Signature**

```ts
export declare function every<Msg>(time: number, f: (time: number) => Msg): Sub<Msg>
```

Added in v0.5.0

# now

Get the current unix time as a `Task`.

**Signature**

```ts
export declare function now(): Task<number>
```

Added in v0.5.0
