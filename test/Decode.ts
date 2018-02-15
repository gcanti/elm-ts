import * as assert from 'assert'
import { fromType } from '../src/Decode'
import * as t from 'io-ts'
import { right, left } from 'fp-ts/lib/Either'

describe('Decode', () => {
  it('fromType', () => {
    const decoder = fromType(t.string)
    assert.deepEqual(decoder.decode('foo'), right('foo'))
    assert.deepEqual(decoder.decode(1), left('Invalid value 1 supplied to : string'))
  })
})
