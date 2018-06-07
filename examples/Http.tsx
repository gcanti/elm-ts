import * as React from 'react'
import { Lens } from 'monocle-ts'
import * as t from 'io-ts'
import { cmd, http, decode } from '../src'
import { Html } from '../src/React'
import { Either } from 'fp-ts/lib/Either'
import { Option, none, some } from 'fp-ts/lib/Option'

// original: https://guide.elm-lang.org/architecture/effects/http.html

export type Result = Either<http.HttpError, string>

export type Model = {
  topic: string
  gifUrl: Option<Result>
}

export type Flags = Model

export const flags: Flags = {
  topic: 'cats',
  gifUrl: none
}

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [flags, getRandomGif(flags.topic)]
}

export type MorePlease = { type: 'MorePlease' }
export type NewGif = { type: 'NewGif'; result: Result }

export type Msg = MorePlease | NewGif

function newGif(result: Result): NewGif {
  return { type: 'NewGif', result }
}

const gifUrlLens = Lens.fromProp<Model, 'gifUrl'>('gifUrl')

const ApiPayloadSchema = t.interface({
  data: t.interface({
    image_url: t.string
  })
})

const decoder = decode.fromType(ApiPayloadSchema)

function getRandomGif(topic: string): cmd.Cmd<Msg> {
  const url = `https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${topic}`
  const req = http.get(url, decoder)
  return http.send(e => newGif(e.map(a => a.data.image_url)), req)
}

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'MorePlease':
      return [gifUrlLens.set(none)(model), getRandomGif(model.topic)]
    case 'NewGif':
      return [gifUrlLens.set(some(msg.result))(model), cmd.none]
  }
  throw 'err'
}

export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      <h2>{model.topic}</h2>
      {model.gifUrl.foldL(
        () => <span>loading...</span>,
        e => e.fold(error => <span>Error: {error._tag}</span>, gifUrl => <img src={gifUrl} />)
      )}
      <button onClick={() => dispatch({ type: 'MorePlease' })}>New Gif</button>
    </div>
  )
}
