import * as O from 'fp-ts/lib/Option'
import * as H from 'history'
import { of, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as html from './Html'
import { batch, none, Sub } from './Sub'

const history = H.createHashHistory()

const location$ = new Subject<Location>()

/**
 * @since 0.5.0
 */
export type Location = H.Location

function getLocation(): Location {
  return history.location
}

history.listen(location => {
  location$.next(location)
})

/**
 * @since 0.5.0
 */
export function push<Msg>(url: string): Cmd<Msg> {
  return of(() => {
    history.push(url)
    return Promise.resolve(O.none)
  })
}

/**
 * @since 0.5.0
 */
export function program<Model, Msg, Dom>(
  locationToMessage: (location: Location) => Msg,
  init: (location: Location) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): html.Program<Model, Msg, Dom> {
  const onChangeLocation$ = location$.pipe(map(location => locationToMessage(location)))
  const subs = (model: Model): Sub<Msg> => batch([subscriptions(model), onChangeLocation$])
  return html.program(init(getLocation()), update, view, subs)
}

/**
 * @since 0.5.0
 */
export function programWithFlags<Flags, Model, Msg, Dom>(
  locationToMessage: (location: Location) => Msg,
  init: (flags: Flags) => (location: Location) => [Model, Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  view: (model: Model) => html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub<Msg> = () => none
): (flags: Flags) => html.Program<Model, Msg, Dom> {
  return flags => program(locationToMessage, init(flags), update, view, subscriptions)
}
