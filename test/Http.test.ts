import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as sinon from 'sinon'
import { Decoder } from '../src/Decode'
import * as Http from '../src/Http'

describe('Http', () => {
  describe('toTask()', () => {
    let server: sinon.SinonFakeServer

    beforeEach(() => {
      server = sinon.fakeServer.create({ respondImmediately: true })
    })

    afterEach(() => {
      server.restore()
    })

    it('should fetch a valid url', async () => {
      server.respondWith('GET', 'http://example.com/test', [200, {}, JSON.stringify({ a: 'test' })])

      const request = Http.get('http://example.com/test', fromCodec(t.type({ a: t.string })))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.right({ a: 'test' }))
    })

    it('should validate the payload', async () => {
      const body = JSON.stringify({ a: 'test' })
      server.respondWith('GET', 'http://example.com/test', [200, {}, body])

      const request = Http.get('http://example.com/test', fromCodec(t.number))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(
        result,
        E.left({
          _tag: 'BadPayload',
          value: 'Invalid value {"a":"test"} supplied to : number',
          response: {
            url: 'http://example.com/test',
            status: { code: 200, message: '' },
            headers: {},
            body
          }
        })
      )
    })

    it('should handle 404', async () => {
      server.respondWith('GET', 'http://example.com/test', [404, {}, ''])

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.left({ _tag: 'BadUrl', value: 'http://example.com/test' }))
    })

    it('should handle bad responses', async () => {
      const body = JSON.stringify({ error: 'bad response' })
      server.respondWith('GET', 'http://example.com/test', [500, {}, body])

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(
        result,
        E.left({
          _tag: 'BadStatus',
          response: {
            url: 'http://example.com/test',
            status: { code: 500, message: '' },
            headers: {},
            body
          }
        })
      )
    })

    it('should handle a timeout', done => {
      // Use server with clock in order to simulate a timeout
      const clockServer = sinon.fakeServerWithClock.create({ respondImmediately: false })

      clockServer.respondWith('GET', 'http://example.com/test', [200, {}, ''])

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      request.timeout = some(1)

      Http.toTask(request)().then(result => {
        // tslint:disable-line
        assert.deepStrictEqual(result, E.left({ _tag: 'Timeout' }))
        done()
      })

      // Move fake timer ahead in order to fire the Timeout error.
      // sinon's type-definition lacks of right definition for `FakeServerWithClock`'s clock property
      // which is defined here https://github.com/sinonjs/nise/blob/master/lib/fake-server/fake-server-with-clock.js#L16
      // and it is an instance of `FakeTimer` (https://sinonjs.org/releases/v7.5.0/fake-timers/).
      const c: any = clockServer
      c.clock.tick(1000)
    })

    it('should handle a network error (generic)', done => {
      const xhr = sinon.useFakeXMLHttpRequest()
      const requests: sinon.SinonFakeXMLHttpRequest[] = []
      xhr.onCreate = r => requests.push(r)

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      Http.toTask(request)().then(result => {
        // tslint:disable-line
        assert.deepStrictEqual(result, E.left({ _tag: 'NetworkError', value: 'ajax error' }))

        xhr.restore()

        done()
      })

      requests[0].error()
    })

    it('should handle a network error (generic non error)', async () => {
      const oriXHR = XMLHttpRequest

      // Make it throw a non `Error` in order to check the refinement
      XMLHttpRequest = (function () {
        throw 'booom!' // tslint:disable-line no-string-throw
      } as unknown) as any

      const request = Http.get('http://example.com/test', fromCodec(t.string))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(result, E.left({ _tag: 'NetworkError', value: '' }))

      XMLHttpRequest = oriXHR
    })

    it('should handle a parsing error', async () => {
      const body = '{bad:"test"}'

      server.respondWith('GET', 'http://example.com/test', xhr => {
        // This hack is needed in order to avoid JSON parsing of the response body by sinon fake server
        // and consequent error swallowing
        const tmp: any = xhr
        tmp.responseType = ''

        xhr.respond(200, {}, body)
      })

      const request = Http.get('http://example.com/test', fromCodec(t.unknown))
      const result = await Http.toTask(request)()

      assert.deepStrictEqual(
        result,
        E.left({
          _tag: 'BadPayload',
          value: 'Unexpected token b in JSON at position 1',
          response: {
            url: 'http://example.com/test',
            status: { code: 200, message: '' },
            headers: {},
            body
          }
        })
      )
    })
  })

  describe('send()', () => {
    let server: sinon.SinonFakeServer

    beforeEach(() => {
      server = sinon.fakeServer.create({ respondImmediately: true })
    })

    afterEach(() => {
      server.restore()
    })

    it('should request an http call and return a Cmd - OK', done => {
      server.respondWith('GET', 'http://example.com/test', [200, {}, JSON.stringify({ a: 'test' })])

      const request = Http.send(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.type({ a: t.string }))))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(result, some({ payload: { a: 'test' } }))

        done()
      })
    })

    it('should request an http call and return a Cmd - KO', done => {
      const body = JSON.stringify({ error: 'bad response' })
      server.respondWith('GET', 'http://example.com/test', [500, {}, body])

      const request = Http.send(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(
          result,
          some({
            payload: {
              _tag: 'BadStatus',
              response: {
                url: 'http://example.com/test',
                status: { code: 500, message: '' },
                headers: {},
                body
              }
            }
          })
        )

        done()
      })
    })

    it('should request an http call and return a Cmd - EMPTY', done => {
      server.respondWith('GET', 'http://example.com/test', [204, {}, ''])

      const request = Http.send(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.UnknownRecord)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(result, some({ payload: {} }))

        done()
      })
    })
  })

  describe('sendFull()', () => {
    let server: sinon.SinonFakeServer

    beforeEach(() => {
      server = sinon.fakeServer.create({ respondImmediately: true })
    })

    afterEach(() => {
      server.restore()
    })

    it('should request an http call and return a Cmd - OK', done => {
      server.respondWith('GET', 'http://example.com/test', [200, {}, JSON.stringify({ a: 'test' })])

      const request = Http.sendFull(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.type({ a: t.string }))))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(
          result,
          some({
            payload: {
              response: {
                url: 'http://example.com/test',
                status: { code: 200, message: '' },
                headers: {},
                body: { a: 'test' }
              },
              xhr: server.requests[0]
            }
          })
        )

        done()
      })
    })

    it('should request an http call and return a Cmd - KO', done => {
      const body = JSON.stringify({ error: 'bad response' })
      server.respondWith('GET', 'http://example.com/test', [500, {}, body])

      const request = Http.sendFull(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(
          result,
          some({
            payload: {
              _tag: 'BadStatus',
              response: {
                url: 'http://example.com/test',
                status: { code: 500, message: '' },
                headers: {},
                body
              }
            }
          })
        )

        done()
      })
    })

    it('should request an http call and return a Cmd - EMPTY', done => {
      server.respondWith('GET', 'http://example.com/test', [204, {}, ''])

      const request = Http.sendFull(E.fold(msg, msg))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.UnknownRecord)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepStrictEqual(
          result,
          some({
            payload: {
              response: {
                url: 'http://example.com/test',
                status: { code: 204, message: '' },
                headers: {},
                body: {}
              },
              xhr: server.requests[0]
            }
          })
        )

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
    const body = { some: 'data' }
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
