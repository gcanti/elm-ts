import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/take'
import { Subject } from 'rxjs/Subject'
import { Task } from 'fp-ts/lib/Task'
import * as option from 'fp-ts/lib/Option'
import { Cmd } from './Cmd'
import { Sub, none, batch } from './Sub'
import { Html, Program, programWithFlags as htmlProgramWithFlags } from './Html'
import { Location as HistoryLocation } from 'history'
import createHashHistory from 'history/createHashHistory'

const history = createHashHistory()

const location$ = new Subject<Location>()

export type Location = HistoryLocation

function getLocation(): Location {
  return history.location
}

history.listen(location => {
  location$.next(location)
})

export function push<msg>(url: string): Cmd<msg> {
  return Observable.of(new Task(() => {
    history.push(url)
    return Promise.resolve(option.none)
  }))
}

export interface Component<flags, model, msg, dom> {
  init: (flags: flags, location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => Html<dom, msg>
}

export function programWithFlags<flags, model, msg, dom>(
    locationToMessage: (location: Location) => msg,
    component: Component<flags, model, msg, dom>,
    flags: flags,
    subscriptions: (model: model) => Sub<msg> = () => none
  ): Program<model, msg, dom> {

  const onChangeLocation$ = location$.map(location => locationToMessage(location))
  const subs = (model: model): Sub<msg> => batch([
    subscriptions(model),
    onChangeLocation$.take(1)
  ])
  const init = (flags: flags): [model, Cmd<msg>] => component.init(flags, getLocation())
  return htmlProgramWithFlags({
    init,
    update: component.update,
    view: component.view
  }, flags, subs)
}
