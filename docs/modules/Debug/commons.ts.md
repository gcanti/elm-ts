---
title: Debug/commons.ts
nav_order: 2
parent: Modules
---

## commons overview

Common utilities and type definitions for the `Debug` module.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [debugMsg](#debugmsg)
- [constructos](#constructos)
  - [debugInit](#debuginit)
- [model](#model)
  - [Debug (interface)](#debug-interface)
  - [DebugAction (type alias)](#debugaction-type-alias)
  - [DebugData (type alias)](#debugdata-type-alias)
  - [DebugInit (interface)](#debuginit-interface)
  - [DebugMsg (interface)](#debugmsg-interface)
  - [Debugger (interface)](#debugger-interface)
  - [DebuggerR (interface)](#debuggerr-interface)
  - [Global (type alias)](#global-type-alias)
  - [MsgWithDebug (type alias)](#msgwithdebug-type-alias)
- [utils](#utils)
  - [runDebugger](#rundebugger)
  - [updateWithDebug](#updatewithdebug)

---

# constructors

## debugMsg

Creates a `DebugMsg`

**Signature**

```ts
export declare const debugMsg: <Msg>(payload: Msg) => DebugMsg<Msg>
```

Added in v0.5.0

# constructos

## debugInit

Creates a `DebugInit`

**Signature**

```ts
export declare const debugInit: () => DebugInit
```

Added in v0.5.0

# model

## Debug (interface)

Defines a generic debugging function

**Signature**

```ts
export interface Debug<Model, Msg> {
  (data: DebugData<Model, Msg>): void
}
```

Added in v0.5.0

## DebugAction (type alias)

**Signature**

```ts
export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>
```

Added in v0.5.0

## DebugData (type alias)

**Signature**

```ts
export type DebugData<Model, Msg> = [DebugAction<Msg>, Model]
```

Added in v0.5.0

## DebugInit (interface)

**Signature**

```ts
export interface DebugInit {
  type: 'INIT'
}
```

Added in v0.5.0

## DebugMsg (interface)

**Signature**

```ts
export interface DebugMsg<Msg> {
  type: 'MESSAGE'
  payload: Msg
}
```

Added in v0.5.0

## Debugger (interface)

Defines a generic `Debugger`

**Signature**

```ts
export interface Debugger<Model, Msg> {
  (d: DebuggerR<Model, Msg>): {
    debug: Debug<Model, Msg>
    stop: () => void
  }
}
```

Added in v0.5.4

## DebuggerR (interface)

Defines the dependencies for a `Debugger` function.

**Signature**

```ts
export interface DebuggerR<Model, Msg> {
  init: Model
  debug$: BehaviorSubject<DebugData<Model, Msg>>
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
}
```

Added in v0.5.0

## Global (type alias)

**Signature**

```ts
export type Global = typeof window
```

Added in v0.5.0

## MsgWithDebug (type alias)

Extends `Msg` with a special kind of message from Debugger

**Signature**

```ts
export type MsgWithDebug<Model, Msg> =
  | Msg
  | { type: '__DebugUpdateModel__'; payload: Model }
  | { type: '__DebugApplyMsg__'; payload: Msg }
```

Added in v0.5.0

# utils

## runDebugger

Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream

**Warning:** this function **SHOULD** be considered as an internal method; using it in your application **SHOULD** be avoided.

**Signature**

```ts
export declare function runDebugger<Model, Msg>(
  win: Global,
  stop$: Observable<unknown>
): (deps: DebuggerR<Model, Msg>) => IO<void>
```

Added in v0.5.4

## updateWithDebug

Adds debugging capability to the provided `update` function.

It tracks through the `debug$` stream every `Message` dispatched and resulting `Model` update.

It also lets directly updating the application's state with a special `Message` of type:

```ts
{
  type: '__DebugUpdateModel__'
  payload: Model
}
```

or applying a message with:

```ts
{
  type: '__DebugApplyMsg__'
  payload: Msg
}
```

**Signature**

```ts
export declare function updateWithDebug<Model, Msg>(
  debug$: BehaviorSubject<DebugData<Model, Msg>>,
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>]
): (msg: MsgWithDebug<Model, Msg>, model: Model) => [Model, Cmd<Msg>]
```

Added in v0.5.3
