/**
 * A specialization of `Program` that handles application navigation via location's hash.
 *
 * It uses [`history`](https://github.com/ReactTraining/history) package.
 *
 * @since 0.5.0
 */

import * as O from 'fp-ts/lib/Option'
import * as H from 'history'
import { Subject, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { Cmd } from './Cmd'
import * as html from './Html'
import { Sub, batch, none } from './Sub'

/**
 * @since 0.5.0
 */
export type Location = H.Location

const history = H.createHashHistory()

/**
 * Location changes are expressed as a stream
 */
const location$ = new Subject<Location>()

history.listen(location => {
  location$.next(location)
})

/**
 * Generates a `Cmd` that adds a new location to the history's list.
 * @since 0.5.0
 */
export function push<Msg>(url: string): Cmd<Msg> {
  return of(() => {
    history.push(url)

    return Promise.resolve(O.none)
  })
}

/**
 * Returns a `Program` specialized for `Navigation`.
 *
 * The `Program` is a `Html.Program` but it needs a `locationToMsg()` function which converts location changes to messages.
 *
 * Underneath it consumes `location$` stream (applying `locationToMsg()` on its values).
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

  return html.program(init(history.location), update, view, subs)
}

/**
 * Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
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
