import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/map'
import { IO } from 'fp-ts/lib/IO'
import { Option } from 'fp-ts/lib/Option'

export type Cmd<msg> = Observable<IO<Option<msg>>>

export function map<a, msg>(f: (a: a) => msg, cmd: Cmd<a>): Cmd<msg> {
  return cmd.map(io => io.map(option => option.map(f)))
}

export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> {
  return Observable.merge(...arr)
}

export const none: Cmd<any> = Observable.empty()
