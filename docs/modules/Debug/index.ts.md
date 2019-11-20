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
import { react, cmd } from 'elm-ts'
import { programWithDebugger } from 'elm-ts/lib/Debug'
import { render } from 'react-dom'

type Model = number
type Msg = 'INCREMENT' | 'DECREMENT'

declare const init: [Model, cmd.none]
declare function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>]
declare function view(model: Model): react.Html<Msg>

const program = process.NODE_ENV === 'production' ? react.program : programWithDebugger

const main = program(init, update, view)

react.run(main, dom => render(document.getElementById('app')))
```

---

<h2 class="text-delta">Table of contents</h2>

- [programWithDebugger (function)](#programwithdebugger-function)

---

# programWithDebugger (function)

Adds a debugging capability to a generic `Html` `Program`.

It tracks every `Message` dispatched and resulting `Model` update.

It also lets updating the application's state with a special `Message` of type:

```ts
{
  type: '__DebugUpdateModel__'
  payload: Model
}
```

**Signature**

```ts
export function programWithDebugger<Model, Msg, Dom>(
  init: [Model, cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, cmd.Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): Program<Model, MsgWithDebug<Model, Msg>, Dom> { ... }
```

Added in v0.5.0
