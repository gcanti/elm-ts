---
title: Decode.ts
nav_order: 2
parent: Modules
---

# Overview

Defines a `Decoder`, namely a function that receives an `unknown` value and tries to decodes it in an `A` value.

It returns an `Either` with a `string` as `Left` when decoding fails or an `A` as `Right` when decoding succeeds.

---

<h2 class="text-delta">Table of contents</h2>

- [Decoder (interface)](#decoder-interface)
- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [decoder (constant)](#decoder-constant)
- [left (constant)](#left-constant)
- [orElse (constant)](#orelse-constant)
- [right (constant)](#right-constant)
- [alt (export)](#alt-export)
- [ap (export)](#ap-export)
- [apFirst (export)](#apfirst-export)
- [apSecond (export)](#apsecond-export)
- [chain (export)](#chain-export)
- [chainFirst (export)](#chainfirst-export)
- [flatten (export)](#flatten-export)
- [map (export)](#map-export)

---

# Decoder (interface)

**Signature**

```ts
export interface Decoder<A> extends RE.ReaderEither<unknown, string, A> {}
```

Added in v0.5.0

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.5.0

# URI (constant)

**Signature**

```ts
export const URI: "Decoder" = ...
```

Added in v0.5.0

# decoder (constant)

**Signature**

```ts
export const decoder: Monad1<URI> & Alternative1<URI> = ...
```

Added in v0.5.0

# left (constant)

**Signature**

```ts
export const left: <A = ...
```

Added in v0.5.0

# orElse (constant)

**Signature**

```ts
export const orElse: <A>(f: (e: string) => Decoder<A>) => (ma: Decoder<A>) => Decoder<A> = ...
```

Added in v0.5.0

# right (constant)

**Signature**

```ts
export const right: <A>(a: A) => Decoder<A> = ...
```

Added in v0.5.0

# alt (export)

**Signature**

```ts
<A>(that: () => Decoder<A>) => (fa: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

# ap (export)

**Signature**

```ts
<A>(fa: Decoder<A>) => <B>(fab: Decoder<(a: A) => B>) => Decoder<B>
```

Added in v0.5.0

# apFirst (export)

**Signature**

```ts
<B>(fb: Decoder<B>) => <A>(fa: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

# apSecond (export)

**Signature**

```ts
<B>(fb: Decoder<B>) => <A>(fa: Decoder<A>) => Decoder<B>
```

Added in v0.5.0

# chain (export)

**Signature**

```ts
<A, B>(f: (a: A) => Decoder<B>) => (ma: Decoder<A>) => Decoder<B>
```

Added in v0.5.0

# chainFirst (export)

**Signature**

```ts
<A, B>(f: (a: A) => Decoder<B>) => (ma: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

# flatten (export)

**Signature**

```ts
<A>(mma: Decoder<Decoder<A>>) => Decoder<A>
```

Added in v0.5.0

# map (export)

**Signature**

```ts
<A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B>
```

Added in v0.5.0
