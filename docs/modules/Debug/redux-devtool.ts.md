---
title: Debug/redux-devtool.ts
nav_order: 5
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

**Signature**

```ts
export interface Connection<Model, Msg> {
  subscribe: (listener?: (data: Message) => void) => Unsubscription
  unsubscribe: Unsubscription
  send: (action: Msg, state: Model) => void
  init: (state: Model) => void
  error: (message: any) => void
}
```

Added in v0.5.0

# Extension (interface)

**Signature**

```ts
export interface Extension {
  connect: <Model, Msg>(options?: EnhancerOptions) => Connection<Model, Msg>
  disconnect: Unsubscription
}
```

Added in v0.5.0

# getConnection (function)

Gets a _Redux DevTool Extension_ connection in case the extension is available

**Signature**

```ts
export function getConnection<Model, Msg>(g: Global): IO<Option<Connection<Model, Msg>>> { ... }
```

Added in v0.5.0

# reduxDevToolDebugger (function)

**[UNSAFE]** Debug through _Redux DevTool Extension_

**Signature**

```ts
export function reduxDevToolDebugger<Model, Msg>(
  connection: Connection<Model, Msg>
): (dispatch: Dispatch<Msg>) => (data: DebugData<Model, Msg>) => void { ... }
```

Added in v0.5.0
