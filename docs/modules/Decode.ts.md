---
title: Decode.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Decoder (interface)](#decoder-interface)
- [mixed (type alias)](#mixed-type-alias)
- [decodeJSON (function)](#decodejson-function)
- [fromType (function)](#fromtype-function)
- [map (function)](#map-function)

---

# Decoder (interface)

**Signature**

```ts
export interface Decoder<a> {
  decode: (value: mixed) => Either<string, a>
}
```

# mixed (type alias)

**Signature**

```ts
export type mixed = mixed
```

# decodeJSON (function)

**Signature**

```ts
export function decodeJSON<a>(decoder: Decoder<a>, value: mixed): Either<string, a> { ... }
```

# fromType (function)

**Signature**

```ts
export function fromType<a>(type: Type<a, any, mixed>): Decoder<a> { ... }
```

# map (function)

**Signature**

```ts
export function map<a, b>(fa: Decoder<a>, f: (a: a) => b): Decoder<b> { ... }
```
