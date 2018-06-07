import { cmd } from '../src'
import { Html } from '../src/React'
import { Location, push } from '../src/Navigation'
import * as React from 'react'

const routes = {
  RouteA: true,
  RouteB: true
}

type Route = keyof typeof routes

export type Model = Route

export type Flags = Model

const defaultRoute: Route = 'RouteA'

export const flags: Flags = defaultRoute

function isRoute(route: string): route is Route {
  return routes.hasOwnProperty(route)
}

function getRoute(location: Location): Route {
  const route = location.pathname.substring(1)
  return isRoute(route) ? route : defaultRoute
}

export function locationToMessage(location: Location): Msg {
  return { type: getRoute(location) } as Msg
}

export function init(flags: Flags, location: Location): [Model, cmd.Cmd<Msg>] {
  return [getRoute(location), cmd.none]
}

export type Msg = { type: 'RouteA' } | { type: 'RouteB' } | { type: 'Push'; url: Route }

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'RouteA':
      return ['RouteA', cmd.none]
    case 'RouteB':
      return ['RouteB', cmd.none]
    case 'Push':
      return [model, push(msg.url)]
  }
}

const RouteA: Html<Msg> = dispatch => (
  <div>
    RouteA <button onClick={() => dispatch({ type: 'Push', url: 'RouteB' })}>RouteB</button>
  </div>
)

const RouteB: Html<Msg> = dispatch => (
  <div>
    RouteB <button onClick={() => dispatch({ type: 'Push', url: 'RouteA' })}>RouteA</button>
  </div>
)

export function view(model: Model): Html<Msg> {
  return dispatch => <div>{model === 'RouteA' ? RouteA(dispatch) : RouteB(dispatch)}</div>
}
