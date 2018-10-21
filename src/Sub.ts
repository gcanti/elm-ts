import { empty, merge, Observable } from 'rxjs'
import { map as rxjsMap } from 'rxjs/operators'

export interface Sub<msg> extends Observable<msg> {}

export function map<a, msg>(sub: Sub<a>, f: (a: a) => msg): Sub<msg> {
  return sub.pipe(rxjsMap(f))
}

export function batch<msg>(arr: Array<Sub<msg>>): Sub<msg> {
  return merge(...arr)
}

export const none: Sub<never> = empty()
