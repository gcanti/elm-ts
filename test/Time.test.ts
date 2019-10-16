import * as assert from 'assert'
import { take } from 'rxjs/operators'
import { every, now } from '../src/Time'

interface Msg {
  type: 'CURRENT_TIME'
  time: number
}

// --- Mocks current time in order to have deterministic tests
const TIME = 1531313966894

beforeAll(() => {
  global.Date.prototype.getTime = jest.fn(() => TIME)
})

afterAll(() => {
  jest.restoreAllMocks()
})
// ---

describe('Time', () => {
  it('now() should return a Task which resolves to current Date time', () =>
    now()().then(v => assert.strictEqual(v, TIME)))

  it('every() should return a Sub which dispatch a Msg every "n" Time', done => {
    const log: Msg[] = []
    const toMsg = (time: number): Msg => ({ type: 'CURRENT_TIME', time })
    const sub$ = every(250, toMsg)

    sub$.pipe(take(3)).subscribe({
      next: v => log.push(v),

      complete: () => {
        assert.deepStrictEqual(log, [
          {
            type: 'CURRENT_TIME',
            time: TIME
          },
          {
            type: 'CURRENT_TIME',
            time: TIME
          },
          {
            type: 'CURRENT_TIME',
            time: TIME
          }
        ])

        done()
      }
    })
  })
})
