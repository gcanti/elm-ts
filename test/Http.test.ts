import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import mock from 'xhr-mock'
import { Decoder } from '../src/Decode'
import * as Http from '../src/Http'

describe('Http', () => {
  describe('toTask()', () => {
    beforeEach(() => mock.setup())

    afterEach(() => mock.teardown())

    it('should fetch a valid url', async () => {
      mock.get('http://example.com/test', {
        status: 200,
        body: JSON.stringify('test')
      })

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.right('test'))
    })

    it('should validate the payload', async () => {
      mock.get('http://example.com/test', {
        status: 200,
        body: JSON.stringify('test')
      })

      const request = Http.get('http://example.com/test', fromCodec(t.number))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(
        result,
        E.left({
          _tag: 'BadPayload',
          value: 'Invalid value "test" supplied to : number',
          response: {
            url: 'http://example.com/test',
            status: { code: 200, message: '' },
            headers: {},
            body: 'test'
          }
        })
      )
    })

    it('should handle 404', async () => {
      mock.get('http://example.com/test', {
        status: 404
      })

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.left({ _tag: 'BadUrl', value: 'http://example.com/test' }))
    })

    it('should handle bad responses', async () => {
      mock.get('http://example.com/test', {
        status: 500,
        body: JSON.stringify('bad response')
      })

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.left({ _tag: 'BadStatus', response: 'bad response' }))
    })

    it('should handle a timeout', async () => {
      // ref. https://www.npmjs.com/package/xhr-mock#simulate-a-timeout
      mock.get('http://example.com/test', () => new Promise(() => undefined))

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      request.timeout = some(1)

      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.left({ _tag: 'Timeout' }))
    })

    it('should handle a network error (ajax)', async () => {
      // temporary disable console.error to reduce noise
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

      // ref. https://www.npmjs.com/package/xhr-mock#simulate-an-error
      mock.get('http://example.com/test', () => Promise.reject(new Error('network error')))

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      spy.mockRestore()

      assert.deepStrictEqual(result, E.left({ _tag: 'NetworkError', value: 'ajax error' }))
    })

    it('should handle a network error (generic)', async () => {
      // temporary disable console.error to reduce noise
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

      // temporary disable xhr mock in order to let the request fail
      mock.teardown()

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      spy.mockRestore()

      assert.deepStrictEqual(result, E.left({ _tag: 'NetworkError', value: 'ajax error' }))
    })
  })

  describe('send()', () => {
    beforeEach(() => mock.setup())

    afterEach(() => mock.teardown())

    it('should request an http call and return a Cmd - OK', done => {
      mock.get('http://example.com/test', {
        status: 200,
        body: JSON.stringify('test')
      })

      const request = Http.send(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(result, some({ payload: 'test' }))

        done()
      })
    })

    it('should request an http call and return a Cmd - KO', done => {
      mock.get('http://example.com/test', {
        status: 500,
        body: JSON.stringify('bad response')
      })

      const request = Http.send(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(result, some({ payload: { _tag: 'BadStatus', response: 'bad response' } }))

        done()
      })
    })
  })

  it('get() should return a GET Request', () => {
    const decoder = fromCodec(t.string)

    assert.deepStrictEqual(Http.get('http://example.com', decoder), {
      method: 'GET',
      headers: {},
      url: 'http://example.com',
      body: undefined,
      expect: decoder,
      timeout: none,
      withCredentials: false
    })
  })

  it('post() should return a POST Request', () => {
    const body = JSON.stringify({ some: 'data' })
    const decoder = fromCodec(t.string)

    assert.deepStrictEqual(Http.post('http://example.com', body, decoder), {
      method: 'POST',
      headers: {},
      url: 'http://example.com',
      body,
      expect: decoder,
      timeout: none,
      withCredentials: false
    })
  })
})

// --- Utilities
interface Msg {
  payload: any
}
const msg = (payload: any): Msg => ({ payload })

function fromCodec<A>(codec: t.Decoder<unknown, A>): Decoder<A> {
  return flow(
    codec.decode,
    E.mapLeft(errors => failure(errors).join('\n'))
  )
}
