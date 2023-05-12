import { bar, rect, stackImage } from './graphics'
import { combineRGB } from './util'

export interface PresetBox {
  borderColor: number
  borderOpacity: number
  fillColor: number
  fillOpacity: number
}

export interface PresetOptionsBoxes {
  width: number
  height: number
  position: 'top' | 'bottom' | 'left' | 'right'
  boxes: PresetBox[]
}

export interface PresetOptionsMeter1 {
  width: number
  height: number
  meter1: number
  meter2?: number
  muted?: boolean
}

export const boxes = (options: PresetOptionsBoxes): Uint8Array => {
  const boxOptions = [...options.boxes].slice(0, 6)
  const boxArray: Uint8Array[] = []

  boxOptions.forEach((boxOption, index) => {
    let offsetX = 0
    let offsetY = 0

    if (options.position === 'top' || options.position === 'bottom') {
      offsetY = options.position === 'top' ? 2 : options.height - 10
      offsetX = (options.width - boxOptions.length * 10) / 2 + index * 10
    }

    if (options.position === 'left' || options.position === 'right') {
      offsetX = options.position === 'left' ? 2 : 62
      offsetY = (options.height - boxOptions.length * 10) / 2 + index * 10
    }

    const box = rect({
      width: options.width,
      height: options.height,
      offsetX,
      offsetY,
      color: boxOption.borderColor,
      opacity: boxOption.borderOpacity,
      fillColor: boxOption.fillColor,
      fillOpacity: boxOption.fillOpacity,
      rectHeight: 8,
      rectWidth: 8,
      strokeWidth: 1,
    })

    boxArray.push(box)
  })

  return stackImage(boxArray)
}

export const meter1 = (options: PresetOptionsMeter1): Uint8Array => {
  const muted = options.muted !== undefined ? options.muted : false
  const bars2 = options.meter2 !== undefined

  const bar1 = bar({
    width: options.width,
    height: options.height,
    colors: [
      {
        size: 35,
        color: muted ? combineRGB(0, 128, 128) : combineRGB(0, 128, 0),
        background: muted ? combineRGB(0, 128, 128) : combineRGB(0, 128, 0),
        backgroundOpacity: 64,
      },
      {
        size: 25,
        color: muted ? combineRGB(0, 192, 192) : combineRGB(0, 192, 0),
        background: muted ? combineRGB(0, 192, 192) : combineRGB(0, 192, 0),
        backgroundOpacity: 64,
      },
      {
        size: 25,
        color: muted ? combineRGB(0, 255, 255) : combineRGB(0, 255, 0),
        background: muted ? combineRGB(0, 255, 255) : combineRGB(0, 255, 0),
        backgroundOpacity: 64,
      },
      {
        size: 10,
        color: muted ? combineRGB(255, 255, 116) : combineRGB(255, 255, 0),
        background: muted ? combineRGB(255, 255, 116) : combineRGB(225, 225, 0),
        backgroundOpacity: 64,
      },
      {
        size: 5,
        color: muted ? combineRGB(255, 0, 0) : combineRGB(255, 0, 0),
        background: muted ? combineRGB(255, 0, 0) : combineRGB(255, 0, 0),
        backgroundOpacity: 64,
      },
    ],
    opacity: 255,
    offsetX: bars2 ? 54 : 62,
    offsetY: 5,
    barLength: options.height - 10,
    barWidth: 6,
    value: options.meter1,
    type: 'vertical',
  })

  let bar2

  if (bars2) {
    bar2 = bar({
      width: options.width,
      height: options.height,
      colors: [
        {
          size: 35,
          color: muted ? combineRGB(0, 128, 128) : combineRGB(0, 128, 0),
          background: muted ? combineRGB(0, 128, 128) : combineRGB(0, 128, 0),
          backgroundOpacity: 64,
        },
        {
          size: 25,
          color: muted ? combineRGB(0, 192, 192) : combineRGB(0, 192, 0),
          background: muted ? combineRGB(0, 192, 192) : combineRGB(0, 192, 0),
          backgroundOpacity: 64,
        },
        {
          size: 25,
          color: muted ? combineRGB(0, 255, 255) : combineRGB(0, 255, 0),
          background: muted ? combineRGB(0, 255, 255) : combineRGB(0, 255, 0),
          backgroundOpacity: 64,
        },
        {
          size: 10,
          color: muted ? combineRGB(255, 255, 116) : combineRGB(255, 255, 0),
          background: muted ? combineRGB(255, 255, 116) : combineRGB(225, 225, 0),
          backgroundOpacity: 64,
        },
        {
          size: 5,
          color: muted ? combineRGB(255, 0, 0) : combineRGB(255, 0, 0),
          background: muted ? combineRGB(255, 0, 0) : combineRGB(255, 0, 0),
          backgroundOpacity: 64,
        },
      ],
      opacity: 255,
      offsetX: 62,
      offsetY: 5,
      barLength: options.height - 10,
      barWidth: 6,
      value: options.meter2 as number,
      type: 'vertical',
    })

    return stackImage([bar1, bar2])
  }

  return bar1
}
