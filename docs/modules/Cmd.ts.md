---
title: Cmd.ts
nav_order: 1
parent: Modules
---

# Cmd overview

Defines `Cmd`s as streams of asynchronous operations which can not fail and that can optionally carry a message.

See the [Platform.Cmd](https://package.elm-lang.org/packages/elm/core/latest/Platform-Cmd) Elm package.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Cmd (interface)](#cmd-interface)
- [batch](#batch)
- [map](#map)
- [none](#none)
- [of](#of)

---

# Cmd (interface)

**Signature**

```ts
export interface Cmd<Msg> extends Observable<Task<Option<Msg>>> {}
```

Added in v0.5.0

# batch

Batches the execution of a list of commands.

**Signature**

```ts
export declare function batch<Msg>(arr: Array<Cmd<Msg>>): Cmd<Msg>
```

Added in v0.5.0

# map

Maps the carried `Msg` of a `Cmd` into another `Msg`.

**Signature**

```ts
export declare function map<A, Msg>(f: (a: A) => Msg): (cmd: Cmd<A>) => Cmd<Msg>
```

Added in v0.5.0

# none

A `none` command is an empty stream.

**Signature**

```ts
export declare const none: Cmd<never>
```

Added in v0.5.0

# of

Creates a new `Cmd` that carries the provided `Msg`.

**Signature**

```ts
export declare function of<Msg>(m: Msg): Cmd<Msg>
```

Added in v0.5.0
