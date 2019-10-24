import { ReactChildren } from 'react'

declare module 'react-blessed'

declare namespace JSX {
  interface IntrinsicElements {
    box: {
      top: string
      left: string
      width: string
      height: string
      border: object
      style: object
    }
  }
}
