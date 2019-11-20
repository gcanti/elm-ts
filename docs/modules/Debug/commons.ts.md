---
title: Debug/commons.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Debug (interface)](#debug-interface)
- [DebugInit (interface)](#debuginit-interface)
- [DebugMsg (interface)](#debugmsg-interface)
- [Debugger (interface)](#debugger-interface)
- [DebugAction (type alias)](#debugaction-type-alias)
- [DebugData (type alias)](#debugdata-type-alias)
- [Global (type alias)](#global-type-alias)
- [MsgWithDebug (type alias)](#msgwithdebug-type-alias)
- [debugInit (function)](#debuginit-function)
- [debugMsg (function)](#debugmsg-function)

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
  (init: Model, data$: BehaviorSubject<DebugData<Model, Msg>>, dispatch: Dispatch<MsgWithDebug<Model, Msg>>): Debug<
    Model,
    Msg
  >
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
export type MsgWithDebug<Model, Msg> = Msg | { type: '__DebugUpdateModel__'; payload: Model }
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
