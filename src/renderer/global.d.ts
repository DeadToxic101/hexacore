import type { HexaCoreApi } from '../main/preload'
declare global {
  interface Window {
    hexacore: HexaCoreApi
  }
}
export {}
