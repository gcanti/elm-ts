---
title: Debug/index.ts
nav_order: 4
parent: Modules
---

# Overview

This module makes available a debugging utility for `elm-ts` applications.

`elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.

**Note:** debugging is to be considered unsafe by design so it should be used only in **development**.

This is an example of usage:

```ts
import { react } from 'elm-ts'
import { withDebugger } from 'elm-ts/lib/Debug'
import { render } from 'react-dom'

type Model = number
type Msg = 'INCREMENT' | 'DECREMENT'

declare const main: react.Program<Model, Msg>

const runner = process.NODE_ENV === 'production' ? react.run : withDebugger(react.run)

runner(main, dom => render(document.getElementById('app')))
```

---

<h2 class="text-delta">Table of contents</h2>

- [Runner (interface)](#runner-interface)
- [withDebugger (function)](#withdebugger-function)

---

# Runner (interface)

Represents a generic `Html` `run` function

**Signature**

```ts
export interface Runner<Model, Msg, Dom> {
  (program: Program<Model, Msg, Dom>, renderer: Renderer<Dom>): Observable<Model>
}
```

Added in v0.5.0

# withDebugger (function)

Adds a debugging capability to a generic `Html` `run` function.

It tracks every `Message` dispatched and resulting `Model` update.

**Signature**

```ts
export function withDebugger<Model, Msg, Dom>(run: Runner<Model, Msg, Dom>): Runner<Model, Msg, Dom> { ... }
```

Added in v0.5.0
