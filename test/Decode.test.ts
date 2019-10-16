import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { decoder } from '../src/Decode'

describe('Decode', () => {
  it('decoder.zero()', () => {
    const anyValue: unknown = {}

    assert.deepStrictEqual(decoder.zero()(anyValue), E.left('zero'))
  })
})
