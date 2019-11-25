import * as assert from 'assert'
import { consoleDebugger } from '../../src/Debug/console'
import { Model, Msg, STD_DEPS } from './_helpers'

describe('Debug/console', () => {
  const oriConsoleLog = console.log
  const oriConsoleDir = console.dir
  const oriConsoleGroup = console.group
  const oriConsoleGroupCollapsed = console.groupCollapsed
  const oriConsoleGroupEnd = console.groupEnd

  let log: Array<{ type: string; value: any }>
  const logger = (type: string) => (...values: any[]) => log.push({ type, value: values })

  // --- Setup
  beforeAll(() => {
    console.log = logger('log')
    console.dir = logger('dir')
    console.group = logger('group')
    console.groupCollapsed = logger('groupCollapsed')
    console.groupEnd = logger('groupEnd')
  })

  beforeEach(() => {
    log = []
  })

  // --- Teardown
  afterAll(() => {
    console.log = oriConsoleLog
    console.dir = oriConsoleDir
    console.group = oriConsoleGroup
    console.groupCollapsed = oriConsoleGroupCollapsed
    console.groupEnd = oriConsoleGroupEnd
  })

  // --- Tests
  it('consoleDebugger() should debug to console', () => {
    const debug = consoleDebugger<Model, Msg>()(STD_DEPS)

    debug([{ type: 'INIT' }, 0])
    debug([{ type: 'MESSAGE', payload: { type: 'Inc' } }, 1])

    assert.deepStrictEqual(log, [
      // --- INIT
      { type: 'group', value: ['%cELM-TS', 'background-color: green; color: black'] },
      { type: 'log', value: ['[INIT]'] },
      { type: 'groupCollapsed', value: ['[MODEL]'] },
      { type: 'dir', value: [0] },
      { type: 'groupEnd', value: [] },
      { type: 'groupEnd', value: [] },
      // --- MESSAGE
      { type: 'group', value: ['%cELM-TS', 'background-color: green; color: black'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cInc`, 'font-weight: bold'] },
      { type: 'dir', value: [{ type: 'Inc' }] },
      { type: 'groupEnd', value: [] },
      { type: 'groupCollapsed', value: ['[MODEL]'] },
      { type: 'dir', value: [1] },
      { type: 'groupEnd', value: [] },
      { type: 'groupEnd', value: [] }
    ])
  })

  it('consoleDebugger() should handle messages with different tag property names', () => {
    type MsgTag = { tag: 'FooTag' }
    type Msg_Tag = { _tag: 'Foo_Tag' }
    type MsgType = { type: 'FooType' }
    type Msg_Type = { _type: 'Foo_Type' }
    type MsgKind = { kind: 'FooKind' }
    type Msg_Kind = { _kind: 'Foo_Kind' }
    type MsgOther = { other: 'FooOther' }
    type MsgDetect = MsgTag | Msg_Tag | MsgType | Msg_Type | MsgKind | Msg_Kind | MsgOther

    const debug = consoleDebugger<Model, MsgDetect>()(STD_DEPS as any)

    debug([{ type: 'MESSAGE', payload: { tag: 'FooTag' } }, 1])
    debug([{ type: 'MESSAGE', payload: { _tag: 'Foo_Tag' } }, 1])
    debug([{ type: 'MESSAGE', payload: { type: 'FooType' } }, 1])
    debug([{ type: 'MESSAGE', payload: { _type: 'Foo_Type' } }, 1])
    debug([{ type: 'MESSAGE', payload: { kind: 'FooKind' } }, 1])
    debug([{ type: 'MESSAGE', payload: { _kind: 'Foo_Kind' } }, 1])
    debug([{ type: 'MESSAGE', payload: { other: 'FooOther' } }, 1])

    const result = log.filter(x => x.type === 'groupCollapsed' && x.value[0] !== '[MODEL]')

    assert.deepStrictEqual(result, [
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFooTag`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFoo_Tag`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFooType`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFoo_Type`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFooKind`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %cFoo_Kind`, 'font-weight: bold'] },
      { type: 'groupCollapsed', value: [`[MESSAGE] %c`, 'font-weight: bold'] }
    ])
  })
})
