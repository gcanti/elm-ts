# Differences from Elm

* no ports
* decoders are derived from [io-ts](https://github.com/gcanti/io-ts) types
* React instead of virtual-dom (pluggable)
* `Navigation` is based on [history](https://github.com/ReactTraining/history)

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

# Examples

* [Counter](examples/Counter.tsx)
* [Labeled Checkboxes (with a sprinkle of functional optics)](examples/LabeledCheckboxes.tsx)
* [Task, Time and Option](examples/Task.tsx)
* [Http and Either](examples/Http.tsx)
* [Navigation](examples/Navigation.tsx)
