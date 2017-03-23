# Differences from Elm

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
- [Task and Time](examples/Task.tsx)

