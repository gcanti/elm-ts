---
title: Debug/redux-devtool.ts
nav_order: 7
parent: Modules
---

## redux-devtool overview

Integration with _Redux DevTool Extension_.

Please check the [docs](https://github.com/zalmoxisus/redux-devtools-extension/tree/master/docs/API) fur further information.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [reduxDevToolDebugger](#reduxdevtooldebugger)
- [model](#model)
  - [Connection (interface)](#connection-interface)
  - [Extension (interface)](#extension-interface)
- [utils](#utils)
  - [getConnection](#getconnection)

---

# constructors

## reduxDevToolDebugger

**[UNSAFE]** Debug through _Redux DevTool Extension_

**Signature**

```ts
export declare function reduxDevToolDebugger<Model, Msg>(connection: Connection<Model, Msg>): Debugger<Model, Msg>
```

Added in v0.5.4

# model

## Connection (interface)

Defines a _Redux DevTool Extension_ connection object.

**Signature**

```ts
export interface Connection<Model, Msg> {
  subscribe: (listener?: Dispatch<DevToolMsg>) => Unsubscription
  send(action: null, state: LiftedState<Model>): void
  send(action: Msg, state: Model): void
  init: (state: Model) => void
  error: (message: unknown) => void
  unsubscribe: () => void
}
```

Added in v0.5.0

## Extension (interface)

Defines a _Redux DevTool Extension_ object.

**Signature**

```ts
export interface Extension {
  connect: <Model, Msg>() => Connection<Model, Msg>
}
```

Added in v0.5.0

# utils

## getConnection

Gets a _Redux DevTool Extension_ connection in case the extension is available

**Signature**

```ts
export declare function getConnection<Model, Msg>(global: Global): IO<Option<Connection<Model, Msg>>>
```

Added in v0.5.0
