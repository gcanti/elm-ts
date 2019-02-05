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

# 0.4.3

- **Bug Fix**
  - don't rely on `instanceof Error` while matching axios errors, closes #23 (@minedeljkovic)

# 0.4.1

- **New Feature**
  - expose `http.requestToTask` as `toTask` (@minedeljkovic)
- **Polish**
  - remove `react-dom` dependency (@gcanti)

# 0.4.0

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

# 0.3.1

- **Bug Fix**
  - call subscriptions with initial model, fix #10 (@minedeljkovic)

# 0.3.0

- **Breaking Change**
  - upgrade to `fp-ts@1.x.x`, `io-ts@1.x.x` (@gcanti)

# 0.2.0

Refactoring

# 0.1.0

Initial release
