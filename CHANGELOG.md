# Changelog

> **Tags:**
>
> - [New Feature]
> - [Bug Fix]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]
> - [Experimental]

**Note**: Gaps between patch versions are faulty/broken releases. **Note**: A feature tagged as Experimental is in a
high state of flux, you're at risk of it changing without notice.

## 0.5.2

- **Bug Fix:**
  - fix return type of `programWithDebugger` in order to comply to `Html`'s `program` (@StefanoMagrassi)

## 0.5.1

- **Breaking Change**
  - upgrade to `fp-ts@2.x` (@gcanti)
  - upgrade to `rxjs@6.x` (@gcanti)
  - by default do not export `Navigation` from `index`, resolves #14 (@gcanti)
  - `Cmd`
    - make `map` data-last (@gcanti)
    - add `of` function - it lifts a `Msg` into a command (@StefanoMagrassi)
  - `Decode`
    - remove dependency on `io-ts` (@gcanti)
    - refactor `Decoder` definition (@gcanti)
  - `Html`
    - make `map` data-last (@gcanti)
  - `Http`
    - remove `Expect<a>` type (@gcanti)
    - remove class encoding for `BadUrl`, `Timeout`, `NetworkError`, `BadStatus`, `BadPayload` (@gcanti)
    - make `send` data-last (@gcanti)
  - `React`
    - make `map` data-last (@gcanti)
  - `Sub`
    - make `map` data-last (@gcanti)
  - `Task`
    - make `perform` data-last (@gcanti)
    - make `attempt` data-last (@gcanti)
    - remove `sequence` (@gcanti)
- **New Feature**
  - Debugger support, resolves #3 (@StefanoMagrassi, @minedeljkovic)
- **Internal**
  - Remove `axios` as dependency, resolves #4 (@StefanoMagrassi)
  - Full tests coverage (@StefanoMagrassi)
  - switch from `Mocha` to `Jest` as test runner (@StefanoMagrassi)

## 0.4.3

- **Bug Fix**
  - don't rely on `instanceof Error` while matching axios errors, closes #23 (@minedeljkovic)

## 0.4.1

- **New Feature**
  - expose `http.requestToTask` as `toTask` (@minedeljkovic)
- **Polish**
  - remove `react-dom` dependency (@gcanti)

## 0.4.0

- **Breaking Change**
  - remove `Reader` from `Html` signature (@minedeljkovic)
  - swap `Cmd.map` arguments (@minedeljkovic)
  - swap `Decoder.map` arguments (@minedeljkovic)
  - swap `Http.send` arguments (@minedeljkovic)
  - swap `Task.perform` arguments (@minedeljkovic)
  - swap `Task.attempt` arguments (@minedeljkovic)
- **New Feature**
  - add `Html.map` function (@minedeljkovic)
  - add `React.map` function (@minedeljkovic)
  - add `Sub.map` function (@minedeljkovic)

## 0.3.1

- **Bug Fix**
  - call subscriptions with initial model, fix #10 (@minedeljkovic)

## 0.3.0

- **Breaking Change**
  - upgrade to `fp-ts@1.x.x`, `io-ts@1.x.x` (@gcanti)

## 0.2.0

Refactoring

## 0.1.0

Initial release
