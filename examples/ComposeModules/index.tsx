import * as ReactDOM from 'react-dom'

import * as DebugHtml from '../../src/Debug/Html'
import * as React from '../../src/React'

import * as App from './App'

const program = process.env.NODE_ENV === 'production' ? React.program : DebugHtml.programWithDebugger

const main = program(App.init({ prefix: 'String: ' }), App.update, App.view)

React.run(main, dom => {
  ReactDOM.render(dom, document.getElementById('root'))
})
