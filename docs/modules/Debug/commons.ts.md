---
title: Debug/commons.ts
nav_order: 2
parent: Modules
---

# commons overview

Common utilities and type definitions for the `Debug` module.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Debug (interface)](#debug-interface)
- [DebugInit (interface)](#debuginit-interface)
- [DebugMsg (interface)](#debugmsg-interface)
- [Debugger (interface)](#debugger-interface)
- [DebuggerR (interface)](#debuggerr-interface)
- [ProgramWithDebugger (interface)](#programwithdebugger-interface)
- [DebugAction (type alias)](#debugaction-type-alias)
- [DebugData (type alias)](#debugdata-type-alias)
- [Global (type alias)](#global-type-alias)
- [MsgWithDebug (type alias)](#msgwithdebug-type-alias)
- [debugInit (function)](#debuginit-function)
- [debugMsg (function)](#debugmsg-function)
- [runDebugger (function)](#rundebugger-function)
- [updateWithDebug (function)](#updatewithdebug-function)
- [withDebuggerWithStop (function)](#withdebuggerwithstop-function)

---

# Debug (interface)

Defines a generic debugging function

**Signature**

```ts
export interface Debug<Model, Msg> {
  (data: DebugData<Model, Msg>): void
}
```

Added in v0.5.0

# DebugInit (interface)

**Signature**

```ts
export interface DebugInit {
  type: 'INIT'
}
```

Added in v0.5.0

# DebugMsg (interface)

**Signature**

```ts
export interface DebugMsg<Msg> {
  type: 'MESSAGE'
  payload: Msg
}
```

Added in v0.5.0

# Debugger (interface)

Defines a generic `Debugger`

**Signature**

```ts
export interface Debugger<Model, Msg> {
  (d: DebuggerR<Model, Msg>): {
    debug: Debug<Model, Msg>
    stop: DebuggerUnsubscribe
  }
}
```

Added in v0.5.0

# DebuggerR (interface)

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

# ProgramWithDebugger (interface)

Extends the `Program` interface with a function to stop consuming `DebugData` stream (`stop()`).

**Signature**

```ts
export interface ProgramWithDebugger<Model, Msg, Dom> extends Program<Model, Msg, Dom> {
  stop: () => void
}
```

Added in v0.5.0

# DebugAction (type alias)

**Signature**

```ts
export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>
```

Added in v0.5.0

# DebugData (type alias)

**Signature**

```ts
export type DebugData<Model, Msg> = [DebugAction<Msg>, Model]
```

Added in v0.5.0

# Global (type alias)

**Signature**

```ts
export type Global = typeof window
```

Added in v0.5.0

# MsgWithDebug (type alias)

Extends `Msg` with a special kind of message from Debugger

**Signature**

```ts
export type MsgWithDebug<Model, Msg> =
  | Msg
  | { type: '__DebugUpdateModel__'; payload: Model }
  | { type: '__DebugApplyMsg__'; payload: Msg }
```

Added in v0.5.0

# debugInit (function)

Creates a `DebugInit`

**Signature**

```ts
export const debugInit = (): DebugInit => ...
```

Added in v0.5.0

# debugMsg (function)

Creates a `DebugMsg`

**Signature**

```ts
export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ...
```

Added in v0.5.0

# runDebugger (function)

Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream

**Warning:** this function **SHOULD** be considered as an internal method; using it in your application **SHOULD** be avoided.

**Signature**

```ts
export function runDebugger<Model, Msg>(win: Global): (deps: DebuggerR<Model, Msg>) => IO<DebuggerUnsubscribe> { ... }
```

Added in v0.5.4

# updateWithDebug (function)

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
export function updateWithDebug<Model, Msg>(
  debug$: BehaviorSubject<DebugData<Model, Msg>>,
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>]
): (msg: MsgWithDebug<Model, Msg>, model: Model) => [Model, Cmd<Msg>] { ... }
```

Added in v0.5.3

# withDebuggerWithStop (function)

Stops the `program` with Debugger when `signal` Observable emits a value.

**Signature**

```ts
export function withDebuggerWithStop<Model, Msg, Dom>(
  program: ProgramWithDebugger<Model, Msg, Dom>,
  signal: Observable<unknown>
): ProgramWithDebugger<Model, Msg, Dom> { ... }
```

Added in v0.5.4
