import { none as optionNone } from 'fp-ts/lib/Option'
import { Task } from 'fp-ts/lib/Task'
import * as H from 'history'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as html from './Html'
import { batch, none, Sub } from './Sub'

const history = H.createHashHistory()

const location$ = new Subject<Location>()

export type Location = H.Location

function getLocation(): Location {
  return history.location
}

history.listen(location => {
  location$.next(location)
})

export function push<msg>(url: string): Cmd<msg> {
  return of(
    new Task(() => {
      history.push(url)
      return Promise.resolve(optionNone)
    })
  )
}

export function program<model, msg, dom>(
  locationToMessage: (location: Location) => msg,
  init: (location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): html.Program<model, msg, dom> {
  const onChangeLocation$ = location$.pipe(map(location => locationToMessage(location)))
  const subs = (model: model): Sub<msg> => batch([subscriptions(model), onChangeLocation$])
  return html.program(init(getLocation()), update, view, subs)
}

export function programWithFlags<flags, model, msg, dom>(
  locationToMessage: (location: Location) => msg,
  init: (flags: flags) => (location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): (flags: flags) => html.Program<model, msg, dom> {
  return flags => program(locationToMessage, init(flags), update, view, subscriptions)
}
