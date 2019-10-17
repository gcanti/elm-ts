import * as assert from 'assert'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import * as Rx from 'rxjs'
import { batch, map, of } from '../src/Cmd'

const sequenceTask = A.array.sequence(T.task)

describe('Cmd', () => {
  it('of() should lift a Msg into a Cmd', done => {
    const input = of('TEST')

    return input.subscribe(async to => {
      const result = await to()

      assert.deepEqual(result, O.some('TEST'))

      done()
    })
  })

  it('map() should transform a Cmd<A> into a Cmd<B>', done => {
    const cmdA = Rx.of(T.of(O.some('a')))

    return map(a => a + 'b')(cmdA).subscribe(async to => {
      const result = await to()

      assert.deepEqual(result, O.some('ab'))

      done()
    })
  })

  it('batch() should batch the execution of an Array of Cmd<Msg>', done => {
    const log: Array<T.Task<O.Option<string>>> = []

    const commands = [Rx.of(T.of(O.some('a'))), Rx.of(T.of(O.some('b'))), Rx.of(T.of(O.some('c')))]

    // Use `subscribe` and `done()` callbacks when dealing with async Observables
    return batch(commands).subscribe({
      next: v => log.push(v),

      complete: async () => {
        const result = await sequenceTask(log)()

        assert.deepEqual(result, [O.some('a'), O.some('b'), O.some('c')])

        done()
      }
    })
  })
})
