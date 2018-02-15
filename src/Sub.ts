import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/map'

export type Sub<msg> = Observable<msg>

export function batch<msg>(arr: Array<Sub<msg>>): Sub<msg> {
  return Observable.merge(...arr)
}

export const none: Sub<never> = Observable.empty()
