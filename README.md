# Differences from Elm

- no ports
- decoders are derived from [io-ts](https://github.com/gcanti/io-ts) types
- React instead of virtual-dom (pluggable)
- `Navigation` is based on [history](https://github.com/ReactTraining/history)
- no need for `NoOp` messages

# React

```ts
import * as react from 'elm-ts/lib/React'
import * as counter from './Counter'

const program = react.programWithFlags(counter, 0)
react.run(program, react.render(document.getElementById('app')!))
```

# Examples

- [Counter](examples/Counter.tsx)
- [Labeled Checkboxes (with a sprinkle of functional optics)](examples/LabeledCheckboxes.tsx)
- [Task, Time and Option](examples/Task.tsx)
- [Http and Either](examples/Http.tsx)
- [Navigation](examples/Navigation.tsx)

