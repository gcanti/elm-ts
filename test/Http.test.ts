import { toTask, get } from '../src/Http'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as E from 'fp-ts/lib/Either'
// import 'isomorphic-fetch'
import { some } from 'fp-ts/lib/Option'
import { Decoder } from '../src/Decode'
import { flow } from 'fp-ts/lib/function'

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

test('toTask should fetch a valid url', () => {
  const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(TodoPayload))

  return toTask(request)().then(r => {
    expect(r).toEqual(
      E.right({
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false
      })
    )
  })
})

test('toTask should validate the payload', () => {
  expect.assertions(1)

  const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(t.string))

  return toTask(request)().then(r => {
    if (E.isLeft(r) && r.left._tag === 'BadPayload') {
      expect(r.left.value).toBe(
        'Invalid value {"userId":1,"id":1,"title":"delectus aut autem","completed":false} supplied to : string'
      )
    }
  })
})

test('toTask should handle 404', () => {
  expect.assertions(1)

  const request = get('https://jsonplaceholder.typicode.com/404', fromCodec(t.string))

  return toTask(request)().then(r => {
    if (E.isLeft(r)) {
      expect(r.left._tag).toBe('BadUrl')
    }
  })
})

test('toTask should handle a timeout', () => {
  expect.assertions(1)

  const request = get('https://jsonplaceholder.typicode.com/todos/1', fromCodec(TodoPayload))

  request.timeout = some(1)

  return toTask(request)().then(r => {
    if (E.isLeft(r)) {
      expect(r.left._tag).toBe('Timeout')
    }
  })
})
