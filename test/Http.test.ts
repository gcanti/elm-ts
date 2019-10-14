import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
// import 'isomorphic-fetch'
import { some } from 'fp-ts/lib/Option'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import { Decoder } from '../src/Decode'
import { get, toTask } from '../src/Http'

const TodoPayload = t.type({
  userId: t.number,
  id: t.number,
  title: t.string,
  completed: t.boolean
})

function fromCodec<A>(codec: t.Decoder<unknown, A>): Decoder<A> {
  return flow(
    codec.decode,
    E.mapLeft(errors => failure(errors).join('\n'))
  )
}

describe('Http', () => {
  describe('toTask', () => {
    it('should fetch a valid url', () => {
      const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(TodoPayload))

      return toTask(request)().then(r => {
        assert.deepEqual(
          r,
          E.right({
            userId: 1,
            id: 1,
            title: 'delectus aut autem',
            completed: false
          })
        )
      })
    })

    it('should validate the payload', () => {
      const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(t.string))

      return toTask(request)().then(r => {
        if (E.isLeft(r) && r.left._tag === 'BadPayload') {
          return assert.strictEqual(
            r.left.value,
            'Invalid value {"userId":1,"id":1,"title":"delectus aut autem","completed":false} supplied to : string'
          )
        }

        throw new Error('not a BadPayload')
      })
    })

    it('should handle 404', () => {
      const request = get('https://jsonplaceholder.typicode.com/404', fromCodec(t.string))

      return toTask(request)().then(r => {
        if (E.isLeft(r)) {
          return assert.strictEqual(r.left._tag, 'BadUrl')
        }

        throw new Error('not a BadUrl')
      })
    })

    it('should handle a timeout', () => {
      const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(TodoPayload))

      request.timeout = some(1)

      return toTask(request)().then(r => {
        if (E.isLeft(r)) {
          return assert.strictEqual(r.left._tag, 'Timeout')
        }

        throw new Error('not a Timeout')
      })
    })
  })
})
