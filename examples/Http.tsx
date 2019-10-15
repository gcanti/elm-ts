import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { flow } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import { Lens } from 'monocle-ts'
import * as React from 'react'
import { cmd, http } from '../src'
import { Html } from '../src/React'

// original: https://guide.elm-lang.org/architecture/effects/http.html

export type Result = E.Either<http.HttpError, string>

// --- Flags
export type Flags = Model

export const flags: Flags = {
  topic: 'cats',
  gifUrl: O.none
}

// --- Model
export type Model = {
  topic: string
  gifUrl: O.Option<Result>
}

export function init(flags: Flags): [Model, cmd.Cmd<Msg>] {
  return [flags, getRandomGif(flags.topic)]
}

// --- Messages
export type Msg = MorePlease | NewGif

export type MorePlease = { type: 'MorePlease' }
export type NewGif = { type: 'NewGif'; result: Result }

function newGif(result: Result): NewGif {
  return { type: 'NewGif', result }
}

// --- Get random gif
const ApiPayloadSchema = t.interface({
  data: t.interface({
    image_url: t.string
  })
})

const decoder = flow(
  ApiPayloadSchema.decode,
  E.mapLeft(errors => failure(errors).join('\n'))
)

function getRandomGif(topic: string): cmd.Cmd<Msg> {
  const url = `https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${topic}`

  return pipe(
    http.get(url, decoder),
    http.send(e => newGif(E.either.map(e, a => a.data.image_url)))
  )
}

// --- Update
const gifUrlLens = Lens.fromProp<Model, 'gifUrl'>('gifUrl')

export function update(msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] {
  switch (msg.type) {
    case 'MorePlease':
      return [gifUrlLens.set(O.none)(model), getRandomGif(model.topic)]

    case 'NewGif':
      return [gifUrlLens.set(O.some(msg.result))(model), cmd.none]
  }
  throw new Error('err')
}

// --- View
export function view(model: Model): Html<Msg> {
  return dispatch => (
    <div>
      <h2>{model.topic}</h2>
      {pipe(
        model.gifUrl,
        O.fold(
          () => <span>loading...</span>,
          E.fold(error => <span>Error: {error._tag}</span>, gifUrl => <img src={gifUrl} />)
        )
      )}
      <button onClick={() => dispatch({ type: 'MorePlease' })}>New Gif</button>
    </div>
  )
}
