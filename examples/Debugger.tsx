import { render } from 'react-dom'
import { programWithDebugger } from '../src/Debug'
import * as React from '../src/React'
import * as component from './Counter'

const program = process.env.NODE_ENV === 'production' ? React.program : programWithDebugger

const main = program(component.init, component.update, component.view)

React.run(main, dom => render(dom, document.getElementById('app')))
