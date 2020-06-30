---
title: Task.ts
nav_order: 16
parent: Modules
---

## Task overview

Handles the execution of asynchronous effectful operations.

See the [Task](https://package.elm-lang.org/packages/elm/core/latest/Task) Elm package.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [attempt](#attempt)
  - [perform](#perform)

---

# utils

## attempt

Executes a `Task` that can fail as a `Cmd` mapping the result (`Either`) to a `Msg`.

**Signature**

```ts
export declare function attempt<E, A, Msg>(f: (e: Either<E, A>) => Msg): (task: Task<Either<E, A>>) => Cmd<Msg>
```

Added in v0.5.0

## perform

Executes a `Task` as a `Cmd` mapping the result to a `Msg`.

**Signature**

```ts
export declare function perform<A, Msg>(f: (a: A) => Msg): (t: Task<A>) => Cmd<Msg>
```

Added in v0.5.0
