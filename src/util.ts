/**
 * Cache to prever redrawing existing imagebuffers
 */
export class Cache {
  private data = new Map<string, Uint8Array>()

  public readonly get = (key: string): Uint8Array | null => {
    return this.data.get(key) || null
  }

  public readonly set = (key: string, imageBuffer: Uint8Array): void => {
    this.data.set(key, imageBuffer)
  }
}

export const combineRGB = (r: number, g: number, b: number): number => {
  return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)
}
