import * as ReactDOM from 'react-dom'

import * as DebugHtml from '../../src/Debug/Html'
import * as React from '../../src/React'

import * as App from './App'

const program = process.env.NODE_ENV === 'production' ? React.programWithFlags : DebugHtml.programWithDebuggerWithFlags

const main = program(App.init, App.update, App.view)

React.run(main({ prefix: 'String: ' }), dom => {
  ReactDOM.render(dom, document.getElementById('root'))
})
