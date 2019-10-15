import * as assert from 'assert'
import { of } from 'rxjs'
import { batch, map } from '../src/Sub'

describe('Sub', () => {
  describe('map()', () => {
    it('should transform a Sub<A> into Sub<B>', done => {
      const subA = of('a')

      return map(a => a + 'b')(subA).subscribe(v => {
        assert.strictEqual(v, 'ab')

        done()
      })
    })
  })

  describe('batch()', () => {
    it('should batch an array of Sub<Msg>', done => {
      const log: string[] = []
      const subs = [of('a'), of('b'), of('c')]

      return batch(subs).subscribe({
        next: v => log.push(v),

        complete: () => {
          assert.deepEqual(log, ['a', 'b', 'c'])

          done()
        }
      })
    })
  })
})
