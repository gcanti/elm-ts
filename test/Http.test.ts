import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as nock from 'nock'
import { Decoder } from '../src/Decode'
import * as Http from '../src/Http'

describe('Http', () => {
  describe('toTask', () => {
    it('should fetch a valid url', () => {
      nock('http://example.com')
        .get('/test')
        .reply(200, 'test')

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      return Http.toTask(request)().then(r => {
        assert.deepEqual(r, E.right('test'))
      })
    })

    it('should validate the payload', () => {
      nock('http://example.com')
        .get('/test')
        .reply(200, 'test')

      const request = Http.get('http://example.com/test', fromCodec(t.number))

      return Http.toTask(request)().then(r => {
        if (E.isLeft(r) && r.left._tag === 'BadPayload') {
          return assert.strictEqual(r.left.value, 'Invalid value "test" supplied to : number')
        }

        throw new Error('not a BadPayload')
      })
    })

    it('should handle 404', () => {
      nock('http://example.com')
        .get('/test')
        .reply(404)

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      return Http.toTask(request)().then(r => {
        if (E.isLeft(r)) {
          return assert.strictEqual(r.left._tag, 'BadUrl')
        }

        throw new Error('not a BadUrl')
      })
    })

    it('should handle a timeout', () => {
      nock('http://example.com')
        .get('/test')
        .delay(2000)
        .reply(200)

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      request.timeout = some(1)

      return Http.toTask(request)().then(r => {
        if (E.isLeft(r)) {
          return assert.strictEqual(r.left._tag, 'Timeout')
        }

        throw new Error('not a Timeout')
      })
    })

    it('should handle a network error', () => {
      nock('http://example.com')
        .get('/test')
        .replyWithError('network error')

      const request = Http.get('http://example.com/test', fromCodec(t.string))

      return Http.toTask(request)().then(r => {
        if (E.isLeft(r) && r.left._tag === 'NetworkError') {
          return assert.strictEqual(r.left.value, 'network error')
        }

        throw new Error('not a NetworkError')
      })
    })
  })

  describe('send()', () => {
    it('send() should request an http call and return a Cmd - OK', done => {
      nock('http://example.com')
        .get('/test')
        .reply(200, 'test')

      const request = Http.send<string, Msg>(E.fold<Http.HttpError, string, Msg>(ko, ok))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepEqual(result, some({ type: 'OK', payload: 'test' }))

        done()
      })
    })

    it('send() should request an http call and return a Cmd - KO', done => {
      nock('http://example.com')
        .get('/test')
        .reply(500)

      const request = Http.send<string, Msg>(E.fold<Http.HttpError, string, Msg>(ko, ok))

      const cmd = request(Http.get('http://example.com/test', fromCodec(t.string)))

      return cmd.subscribe(async to => {
        const result = await to()

        assert.deepEqual(result, some({ type: 'KO', error: 'BadStatus' }))

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
type Msg = OK | KO

interface OK {
  type: 'OK'
  payload: string
}
const ok = (payload: string): OK => ({ type: 'OK', payload })

interface KO {
  type: 'KO'
  error: Http.HttpError['_tag']
}
const ko = (e: Http.HttpError): KO => ({ type: 'KO', error: e._tag })

function fromCodec<A>(codec: t.Decoder<unknown, A>): Decoder<A> {
  return flow(
    codec.decode,
    E.mapLeft(errors => failure(errors).join('\n'))
  )
}
