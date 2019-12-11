---
title: Home
nav_order: 1
---

# elm-ts

A porting of [_The Elm Architecture_](https://guide.elm-lang.org/architecture/) to TypeScript featuring `fp-ts`, `RxJS` and `React`.

## Installation

```sh
npm i elm-ts fp-ts rxjs react
```

Note: `fp-ts`, `rxjs` and `react` are peer dependencies

## Differences from Elm

- no ports
- `React` instead of `virtual-dom` (pluggable)
- `Navigation` is based on [history](https://github.com/ReactTraining/history)

## React

```ts
import * as React from 'elm-ts/lib/React'
import { render } from 'react-dom'
import * as component from './examples/Counter'

const main = React.program(component.init, component.update, component.view)

React.run(main, dom => render(dom, document.getElementById('app')!))
```

## How to derive decoders from [io-ts](https://github.com/gcanti/io-ts) codecs

```ts
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

function fromCodec<A>(codec: t.Decoder<unknown, A>): Decoder<A> {
  return flow(
    codec.decode,
    E.mapLeft(errors => failure(errors).join('\n'))
  )
}
```

## Enable debugger in development mode

For `Html` (and its specializations) programs:

```ts
import { programWithDebugger } from 'elm-ts/lib/Debug/Html'
import * as React from 'elm-ts/lib/React'
import { render } from 'react-dom'
import * as component from './examples/Counter'

const program = process.env.NODE_ENV === 'production' ? React.program : programWithDebugger

const main = program(component.init, component.update, component.view)

React.run(main, dom => render(dom, document.getElementById('app')!))
```

## Examples

- [Counter](examples/Counter.tsx)
- [Labeled Checkboxes (with a sprinkle of functional optics)](examples/LabeledCheckboxes.tsx)
- [Task, Time and Option](examples/Task.tsx)
- [Http and Either](examples/Http.tsx)
- [Navigation](examples/Navigation.tsx)

## Documentation

- [API Reference](https://gcanti.github.io/elm-ts)
