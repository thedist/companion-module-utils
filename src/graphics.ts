import { PNG } from 'pngjs'
import icons from './icons.json'
import { Cache, combineRGB } from './util'

export interface BarColor {
  size: number
  color: number
  background: number
  backgroundOpacity: number
}

type IconType =
  | 'directionDown'
  | 'directionDownLeft'
  | 'directionDownRight'
  | 'directionLeft'
  | 'directionRight'
  | 'directionUp'
  | 'directionUpLeft'
  | 'directionUpRight'
  | 'forward'
  | 'headset1'
  | 'headset2'
  | 'headset3'
  | 'headset4'
  | 'mic1'
  | 'mic2'
  | 'mic3'
  | 'mic4'
  | 'mic5'
  | 'pause'
  | 'play'
  | 'playPause'
  | 'power'
  | 'record'
  | 'recordRed'
  | 'rewind'
  | 'stop'
  | 'custom'

export interface Icon {
  type: IconType
  base64: string
  argb: number[]
  width: number
  height: number
}

export interface OptionsBar {
  width: number
  height: number
  colors: BarColor[]
  barLength: number
  barWidth: number
  value: number
  type: 'vertical' | 'horizontal'
  offsetX?: number
  offsetY?: number
  opacity?: number
  reverse?: boolean
}

export interface OptionsBorder {
  width: number
  height: number
  color: number
  size: number
  opacity?: number
  type?: 'border' | 'top' | 'bottom' | 'left' | 'right'
}

export interface OptionsCircle {
  radius: number
  color: number
  opacity?: number
}

export interface OptionsCorner {
  width: number
  height: number
  color: number
  size?: number
  location: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  opacity?: number
}

export interface OptionsIcon {
  width: number
  height: number
  type: IconType | 'Custom'
  custom?: Uint8Array
  customWidth?: number
  customHeight?: number
  offsetX?: number
  offsetY?: number
}

export interface OptionsRect {
  width: number
  height: number
  color: number
  rectWidth: number
  rectHeight: number
  strokeWidth: number
  fillColor?: number
  fillOpacity?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
}

export interface OptionParseBase64 {
  alpha?: boolean
}

export interface OptionToPNG64 {
  image: Buffer | Uint8Array
  width: number
  height: number
}

const cache = new Cache()

/**
 * Generates an image buffer of a bar and calculates the position of the specified value along that bar
 *
 * @param options - Required and optional params for the bar
 * @returns Image buffer containing a bar as per options
 */
export const bar = (options: OptionsBar): Uint8Array => {
  let value = options.value
  if (value < 0) value = 0
  if (value > 100) value = 100
  const offsetX = options.offsetX || 0
  const offsetY = options.offsetY || 0

  const buffer = Buffer.alloc(options.width * options.height * 4)
  const increment = options.barLength / 100
  const position = Math.floor(increment * options.value)

  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `bar-${options.width}-${options.height}-${JSON.stringify(options.colors)}-${
    options.opacity || 0
  }-${offsetX}-${offsetY}-${options.barLength}-${options.barWidth}-${options.type}-${position}-${
    options.reverse || 'false'
  }`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  // Calculate the bar image
  const bar = []
  for (let i = 0; i < options.barLength; i++) {
    const active = i < position
    let barColor = options.colors[0].color
    let barOpacity = options.opacity ?? 255
    let colorTotal = 0

    options.colors.forEach((color) => {
      if (i / increment >= colorTotal) {
        barColor = active ? color.color : color.background
        colorTotal += color.size
        barOpacity = active ? options.opacity ?? 255 : color.backgroundOpacity
      }
    })

    for (let j = 0; j < options.barWidth; j++) {
      bar.push(barOpacity * Math.pow(2, 24) + barColor)
    }
  }

  // Reverse the direction the bar is displayed
  if (options.reverse) {
    bar.reverse()
  }

  // Render the bar onto the buffer
  if (options.type === 'vertical') {
    bar.reverse()
    bar.forEach((pixel, i) => {
      const y = Math.floor(i / options.barWidth) + offsetY
      const x = (i % options.barWidth) + offsetX
      const index = y * options.width + x

      buffer.writeUint32BE(pixel, index * 4)
    })
  } else {
    bar.forEach((pixel, i) => {
      const y = (i % options.barWidth) + offsetY
      const x = Math.floor(i / options.barWidth) + offsetX
      const index = y * options.width + x

      buffer.writeUint32BE(pixel, index * 4)
    })
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Generates an image buffer of border
 *
 * @param options - Required and optional params for the indicator
 * @returns Image buffer containing a border indicator as per options
 */
export const border = (options: OptionsBorder): Uint8Array => {
  const type = options.type || 'border'

  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `border-${options.width}-${options.height}-${options.color}-${options.opacity || 0}-${
    options.size
  }-${type}`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  const buffer = Buffer.alloc(options.width * options.height * 4)
  const opacity = options.opacity ?? 255
  const color = opacity * Math.pow(2, 24) + options.color

  const drawPixel = (x: number, y: number): void => {
    const index = y * options.width + x
    buffer.writeUint32BE(color, index * 4)
  }

  for (let y = 0; y < options.height; y++) {
    for (let x = 0; x < options.width; x++) {
      if (type === 'border') {
        if (
          x < options.size ||
          x > options.width - options.size ||
          y < options.size ||
          y > options.height - options.size
        )
          drawPixel(x, y)
      } else if (type === 'top') {
        if (y < options.size) drawPixel(x, y)
      } else if (type === 'bottom') {
        if (y > options.height - options.size) drawPixel(x, y)
      } else if (type === 'left') {
        if (x < options.size) drawPixel(x, y)
      } else if (type === 'right') {
        if (x > options.width - options.size) drawPixel(x, y)
      }
    }
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Generates an image buffer of a circle at a specified radius. Width and Height are 2 x radius
 *
 * @param options - Required and optional params for the indicator
 * @returns Image buffer containing a circle as per options
 */
export const circle = (options: OptionsCircle): Uint8Array => {
  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `circle-${JSON.stringify(options)}`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  const diameter = options.radius * 2
  const buffer = Buffer.alloc(diameter * diameter * 4)
  const opacity = options.opacity ?? 255
  const color = opacity * Math.pow(2, 24) + options.color

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const withinRadius = Math.sqrt(Math.pow(x - diameter / 2, 2) + Math.pow(y - diameter / 2, 2)) <= options.radius
      if (withinRadius) {
        const index = y * diameter + x
        buffer.writeUint32BE(color, index * 4)
      }
    }
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Generates an image buffer of a corner indicator
 *
 * @param options - Required and optional params for the indicator
 * @returns Image buffer containing a corner indicator as per options
 */
export const corner = (options: OptionsCorner): Uint8Array => {
  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `corner-${options.width}-${options.height}-${options.color}-${options.opacity || 0}-${
    options.size
  }-${options.location}`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  const buffer = Buffer.alloc(options.width * options.height * 4)
  const opacity = options.opacity ?? 255
  const color = opacity * Math.pow(2, 24) + options.color

  const hAlign = options.location.includes('Right') ? 'right' : 'left'
  const vAlign = options.location.includes('top') ? 'top' : 'bottom'

  const sizeHeight = options.size || options.height * 0.33
  const sizeWidth = options.size || options.width * 0.33

  for (let y = 0; y < sizeHeight; y++) {
    const trueY = vAlign === 'bottom' ? options.height - 1 - y : y

    for (let x = 0; x < sizeWidth - y; x++) {
      const trueX = hAlign === 'right' ? options.width - 1 - x : x
      const index = trueY * options.width + trueX
      buffer.writeUint32BE(color, index * 4)
    }
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Generates an image buffer with a specified icon
 *
 * @param options - Required and options params for the icon
 * @returns Image buffer containing an icon as per options
 */
export const icon = (options: OptionsIcon): Uint8Array => {
  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `icon-${JSON.stringify(options)}`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  const buffer = Buffer.alloc(options.width * options.height * 4)
  const offsetX = options.offsetX || 0
  const offsetY = options.offsetY || 0
  let iconWidth = 0
  let iconHeight = 0
  let iconData: number[]

  if (options.type === 'custom') {
    if (!options.custom || !options.customWidth || !options.customHeight)
      throw new Error('custom, customWidth and customHeight MUST be provided when using a custom icon')
    iconData = [...options.custom]
    iconWidth = options.customWidth
    iconHeight = options.customHeight
  } else {
    const icon = icons.find((icon) => icon.type === options.type)
    if (!icon) throw new Error(`Can't find matching icon data of type ${options.type}`)

    iconData = [...icon.argb]
    iconHeight = icon.height
    iconWidth = icon.width
  }

  for (let y = offsetY; y < offsetY + iconHeight; y++) {
    for (let x = offsetX; x < offsetX + iconWidth; x++) {
      const index = y * options.width + x
      if (options.type === 'custom') {
        const color =
          (iconData.shift() || 0) * Math.pow(2, 24) +
          combineRGB(iconData.shift() || 0, iconData.shift() || 0, iconData.shift() || 0)
        buffer.writeUint32BE(color, index * 4)
      } else {
        const color = iconData.shift() || 0
        buffer.writeUint32BE(color, index * 4)
      }
    }
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Generates an image buffer of a rectangle
 *
 * @param options - Required and optional params for the indicator
 * @returns Image buffer containing a rectangle as per options
 */
export const rect = (options: OptionsRect): Uint8Array => {
  // Create a key for the image buffer given the options provided, and return a cached buffer if it exists
  const cacheKey = `rect-${JSON.stringify(options)}`
  if (cache.get(cacheKey)) return cache.get(cacheKey) as Uint8Array

  const buffer = Buffer.alloc(options.width * options.height * 4)
  const opacity = options.opacity ?? 255
  const color = opacity * Math.pow(2, 24) + options.color
  const fillOpacity = options.fillOpacity ?? 255
  const fillColor = fillOpacity * Math.pow(2, 24) + (options.fillColor ?? options.color)
  const offsetX = options.offsetX || 0
  const offsetY = options.offsetY || 0

  for (let y = 0; y < options.height; y++) {
    for (let x = 0; x < options.width; x++) {
      if (y >= offsetY && y < offsetY + options.rectHeight && x >= offsetX && x < offsetX + options.rectWidth) {
        const index = y * options.width + x
        if (
          y >= offsetY + options.strokeWidth &&
          y < offsetY + options.rectHeight - options.strokeWidth &&
          x >= offsetX + options.strokeWidth &&
          x < offsetX + options.rectWidth - options.strokeWidth
        ) {
          buffer.writeUint32BE(fillColor, index * 4)
        } else {
          buffer.writeUint32BE(color, index * 4)
        }
      }
    }
  }

  cache.set(cacheKey, buffer)
  return buffer
}

/**
 * Stacks an array of same-size image buffers into a single buffer
 *
 * @param buffers - Array of image buffers
 * @returns A single image buffer
 */
export const stackImage = (buffers: Uint8Array[]): Uint8Array => {
  const stack: Uint8Array = Buffer.alloc(buffers[0].length)
  buffers[0].forEach((value, index) => {
    stack[index] = value
  })

  for (let i = 1; i < buffers.length; i++) {
    if (stack.length !== buffers[i].length) throw new Error('Images to be stacked must be the same size')

    for (let j = 0; j < buffers[i].length; j += 4) {
      const base: number[] = [stack[j] / 255, stack[j + 1], stack[j + 2], stack[j + 3]]
      const added: number[] = [buffers[i][j] / 255, buffers[i][j + 1], buffers[i][j + 2], buffers[i][j + 3]]
      const mix: number[] = []

      if (added[0] === 0 && added[1] === 0 && added[2] === 0 && added[3] === 0) {
        added[0] = base[0]
        added[1] = base[1]
        added[2] = base[2]
        added[3] = base[3]
      } else if (base[0] === 0 && base[1] === 0 && base[2] === 0 && base[3] === 0) {
        base[0] = added[0]
        base[1] = added[1]
        base[2] = added[2]
        base[3] = added[3]
      }

      mix[0] = 1 - (1 - added[0]) * (1 - base[0])
      mix[1] = Math.round(base[1] * base[0] * (1 - added[0]) + added[1] * added[0])
      mix[2] = Math.round(base[2] * base[0] * (1 - added[0]) + added[2] * added[0])
      mix[3] = Math.round(base[3] * base[0] * (1 - added[0]) + added[3] * added[0])

      stack[j] = mix[0] * 255
      stack[j + 1] = mix[1]
      stack[j + 2] = mix[2]
      stack[j + 3] = mix[3]
    }
  }

  return stack
}

/**
 * Converts a base64 encoded PNG such as that used by png64 feedback into an imagebuffer that can be used with other functions
 *
 * @param png64 - base64 encoded PNG string
 * @param options - Required and optional params
 * @returns An image buffer
 */
export const parseBase64 = (png64: string, options?: OptionParseBase64): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const cacheKey = `parseBase64-${png64}`
    if (cache.get(cacheKey)) return resolve(cache.get(cacheKey) as Uint8Array)

    new PNG({ inputHasAlpha: options?.alpha ?? true }).parse(Buffer.from(png64, 'base64'), (err, data) => {
      if (err) return reject(err)

      const buffer = Buffer.alloc(data.width * data.height * 4)

      for (let y = 0; y < data.height; y++) {
        for (let x = 0; x < data.width; x++) {
          const i = (data.width * y + x) << 2
          const color =
            data.data[i + 3] * Math.pow(2, 24) + combineRGB(data.data[i], data.data[i + 1], data.data[i + 2])
          const index = y * data.width + x

          buffer.writeUInt32BE(color, index * 4)
        }
      }

      cache.set(cacheKey, buffer)
      resolve(buffer)
    })
  })
}

/**
 * Converts an imageBuffer into a base64 encoded PNG string for use as a buttons png64 styling
 *
 * @param options - Required and optional params
 * @returns An base64 encoded PNG
 */
export const toPNG64 = (options: OptionToPNG64): string => {
  const png = new PNG({
    width: options.width,
    height: options.height,
    filterType: -1,
    inputHasAlpha: true,
    colorType: 6,
    deflateLevel: 0,
  })

  const newBuffer = Buffer.alloc(options.width * options.height * 4)

  options.image.forEach((value, index) => {
    const position = ((index + 3) % 4) + Math.floor(index / 4) * 4
    newBuffer[position] = value
  })

  png.data = newBuffer
  const pngBuffer = PNG.sync.write(png)
  return `data:image/png;base64,${pngBuffer.toString('base64')}`
}
