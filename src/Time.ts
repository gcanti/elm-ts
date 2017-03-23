import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import 'rxjs/add/operator/map'
import { Task } from './Task'
import { Sub } from './Sub'

export type Time = number

export function now(): Task<Time> {
  return new Task(() => Promise.resolve(new Date().getTime()))
}

export function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg> {
  return Observable.interval(time).map(() => f(new Date().getTime()))
}
