---
title: Debug/commons.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [DebugInit (interface)](#debuginit-interface)
- [DebugMsg (interface)](#debugmsg-interface)
- [DebugAction (type alias)](#debugaction-type-alias)
- [DebugData (type alias)](#debugdata-type-alias)
- [Global (type alias)](#global-type-alias)
- [debugInit (function)](#debuginit-function)
- [debugMsg (function)](#debugmsg-function)

---

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
