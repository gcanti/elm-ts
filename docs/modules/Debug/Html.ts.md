---
title: Debug/Html.ts
nav_order: 4
parent: Modules
---

## Html overview

This module makes available a debugging utility for `elm-ts` applications running `Html` programs.

`elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.

**Note:** debugging is to be considered unsafe by design so it should be used only in **development**.

This is an example of usage:

```ts
import { react, cmd } from 'elm-ts'
import { programWithDebugger } from 'elm-ts/lib/Debug/Html'
import { render } from 'react-dom'

type Model = number
type Msg = 'INCREMENT' | 'DECREMENT'

declare const init: [Model, cmd.none]
declare function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>]
declare function view(model: Model): react.Html<Msg>

const program = process.NODE_ENV === 'production' ? react.program : programWithDebugger

const main = program(init, update, view)

react.run(main, (dom) => render(dom, document.getElementById('app')))
```

Added in v0.5.3

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [programWithDebugger](#programwithdebugger)
  - [programWithDebuggerWithFlags](#programwithdebuggerwithflags)
  - [programWithDebuggerWithFlagsWithStop](#programwithdebuggerwithflagswithstop)
  - [programWithDebuggerWithStop](#programwithdebuggerwithstop)

---

# constructors

## programWithDebugger

Adds a debugging capability to a generic `Html` `Program`.

It tracks every `Message` dispatched and resulting `Model` update.

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
export declare function programWithDebugger<Model, Msg, Dom>(
  init: [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): Program<Model, Msg, Dom>
```

Added in v0.5.3

## programWithDebuggerWithFlags

Same as `programWithDebugger()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export declare function programWithDebuggerWithFlags<Flags, Model, Msg, Dom>(
  init: (flags: Flags) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => Html<Dom, Msg>,
  subscriptions?: (model: Model) => Sub<Msg>
): (flags: Flags) => Program<Model, Msg, Dom>
```

Added in v0.5.3

## programWithDebuggerWithFlagsWithStop

Same as `programWithDebuggerWithStop()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.

**Signature**

```ts
export declare function programWithDebuggerWithFlagsWithStop<Model, Msg, Dom>(
  stopDebuggerOn: Observable<unknown>
): <Flags, S extends Model, M extends Msg, D extends Dom>(
  init: (flags: Flags) => [S, Cmd<M>],
  update: (msg: M, model: S) => [S, Cmd<M>],
  view: (model: S) => Html<D, M>,
  subscriptions?: (model: S) => Sub<M>
) => (flags: Flags) => Program<S, M, D>
```

Added in v0.5.4

## programWithDebuggerWithStop

A function that requires an `Observable` and returns a `programWithDebugger()` function: the underlying debugger will stop when the `Observable` emits a value.

**Signature**

```ts
export declare function programWithDebuggerWithStop<Model, Msg, Dom>(
  stopDebuggerOn: Observable<unknown>
): <S extends Model, M extends Msg, D extends Dom>(
  init: [S, Cmd<M>],
  update: (msg: M, model: S) => [S, Cmd<M>],
  view: (model: S) => Html<D, M>,
  subscriptions?: (model: S) => Sub<M>
) => Program<S, M, D>
```

Added in v0.5.4
