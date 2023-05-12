import { Cache, combineRGB } from '../src/util'
import data from './data.json'

// Cache
describe('test image cache', () => {
  const cache = new Cache()

  it('should return return an Uint8Array if item is found', () => {
    const border: Uint8Array = Buffer.from(data.border)
    cache.set('borderTest', border)

    expect(cache.get('borderTest')).toEqual(border)
  })

  it('should return null for nonexistent items', () => {
    expect(cache.get('nullTest')).toEqual(null)
  })
})

// combineRGB
describe('test combining RGB', () => {
  it('should return a number when given RGB values', () => {
    expect(combineRGB(255, 128, 0)).toEqual(16744448)
  })
})