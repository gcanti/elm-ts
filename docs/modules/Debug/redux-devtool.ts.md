---
title: Debug/redux-devtool.ts
nav_order: 6
parent: Modules
---

# Overview

Integration with _Redux DevTool Extension_.

Please check the [docs](https://github.com/zalmoxisus/redux-devtools-extension/tree/master/docs/API) fur further information.

---

<h2 class="text-delta">Table of contents</h2>

- [Connection (interface)](#connection-interface)
- [Extension (interface)](#extension-interface)
- [getConnection (function)](#getconnection-function)
- [reduxDevToolDebugger (function)](#reduxdevtooldebugger-function)

---

# Connection (interface)

Defines a _Redux DevTool Extension_ connection object.

**Signature**

```ts
export interface Connection<Model, Msg> {
  subscribe: (listener?: Dispatch<DevToolMsg>) => Unsubscription
  send(action: null, state: LiftedState<Model>): void
  send(action: Msg, state: Model): void
  init: (state: Model) => void
  error: (message: any) => void
}
```

Added in v0.5.0

# Extension (interface)

Defines a _Redux DevTool Extension_ object.

**Signature**

```ts
export interface Extension {
  connect: <Model, Msg>() => Connection<Model, Msg>
}
```

Added in v0.5.0

# getConnection (function)

Gets a _Redux DevTool Extension_ connection in case the extension is available

**Signature**

```ts
export function getConnection<Model, Msg>(global: Global): IO<Option<Connection<Model, Msg>>> { ... }
```

Added in v0.5.0

# reduxDevToolDebugger (function)

**[UNSAFE]** Debug through _Redux DevTool Extension_

**Signature**

```ts
export function reduxDevToolDebugger<Model, Msg>(connection: Connection<Model, Msg>): Debugger<Model, Msg> { ... }
```

Added in v0.5.0
