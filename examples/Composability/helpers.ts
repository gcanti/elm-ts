import { Cmd, none } from '../../src/Cmd'

export const withEffect = <Model, Msg>(m: Model, c: Cmd<Msg>): [Model, Cmd<Msg>] => [m, c]

export const withModel = <Model, Msg>(m: Model): [Model, Cmd<Msg>] => [m, none]
