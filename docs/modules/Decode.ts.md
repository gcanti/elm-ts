---
title: Decode.ts
nav_order: 8
parent: Modules
---

## Decode overview

Defines a `Decoder`, namely a function that receives an `unknown` value and tries to decodes it in an `A` value.

It returns an `Either` with a `string` as `Left` when decoding fails or an `A` as `Right` when decoding succeeds.

Added in v0.5.0

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [Apply](#apply)
  - [ap](#ap)
  - [apFirst](#apfirst)
  - [apSecond](#apsecond)
- [Functor](#functor)
  - [map](#map)
- [Monad](#monad)
  - [chain](#chain)
  - [chainFirst](#chainfirst)
  - [flatten](#flatten)
- [combinators](#combinators)
  - [orElse](#orelse)
- [constructors](#constructors)
  - [left](#left)
  - [right](#right)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [decoder](#decoder)
- [model](#model)
  - [Decoder (interface)](#decoder-interface)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <A>(that: () => Decoder<A>) => (fa: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

# Apply

## ap

**Signature**

```ts
export declare const ap: <A>(fa: Decoder<A>) => <B>(fab: Decoder<(a: A) => B>) => Decoder<B>
```

Added in v0.5.0

## apFirst

**Signature**

```ts
export declare const apFirst: <B>(fb: Decoder<B>) => <A>(fa: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

## apSecond

**Signature**

```ts
export declare const apSecond: <B>(fb: Decoder<B>) => <A>(fa: Decoder<A>) => Decoder<B>
```

Added in v0.5.0

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B>
```

Added in v0.5.0

# Monad

## chain

**Signature**

```ts
export declare const chain: <A, B>(f: (a: A) => Decoder<B>) => (ma: Decoder<A>) => Decoder<B>
```

Added in v0.5.0

## chainFirst

**Signature**

```ts
export declare const chainFirst: <A, B>(f: (a: A) => Decoder<B>) => (ma: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

## flatten

**Signature**

```ts
export declare const flatten: <A>(mma: Decoder<Decoder<A>>) => Decoder<A>
```

Added in v0.5.0

# combinators

## orElse

**Signature**

```ts
export declare const orElse: <A>(f: (e: string) => Decoder<A>) => (ma: Decoder<A>) => Decoder<A>
```

Added in v0.5.0

# constructors

## left

**Signature**

```ts
export declare const left: <A = never>(e: string) => Decoder<A>
```

Added in v0.5.0

## right

**Signature**

```ts
export declare const right: <A>(a: A) => Decoder<A>
```

Added in v0.5.0

# instances

## URI

**Signature**

```ts
export declare const URI: 'elm-ts/Decoder'
```

Added in v0.5.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.5.0

## decoder

**Signature**

```ts
export declare const decoder: Monad1<'elm-ts/Decoder'> & Alternative1<'elm-ts/Decoder'>
```

Added in v0.5.0

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<A> extends ReaderEither<unknown, string, A> {}
```

Added in v0.5.0
