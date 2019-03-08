---
title: Home
nav_order: 1
---

A porting to TypeScript featuring fp-ts, io-ts, rxjs5 and React

# Differences from Elm

- no ports
- decoders are derived from [io-ts](https://github.com/gcanti/io-ts) types
- `react` instead of `virtual-dom` (pluggable)
- `Navigation` is based on [history](https://github.com/ReactTraining/history)

# React

```ts
import * as React from 'elm-ts/lib/React'
import { render } from 'react-dom'
import * as component from './examples/Counter'

const main = React.program(component.init, component.update, component.view)
React.run(main, dom => render(dom, document.getElementById('app')!))
```

# Todomvc implementation

[elm-ts-todomvc](https://github.com/gcanti/elm-ts-todomvc)
