import * as assert from 'assert'
import { debugInit, debugMsg } from '../../src/Debug/commons'

describe('Debug/commons', () => {
  it('debugInit() should return a `DebugInit` object', () => {
    assert.deepStrictEqual(debugInit(), { type: 'INIT' })
  })

  it('debugMsg() should return a `DebugMsg` object', () => {
    assert.deepStrictEqual(debugMsg({ type: 'MyMessage', some: 'data' }), {
      type: 'MESSAGE',
      payload: {
        type: 'MyMessage',
        some: 'data'
      }
    })
  })
})
