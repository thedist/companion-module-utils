import * as presets from '../src/presets'
import { combineRGB } from '../src/util'
import data from './data.json'


describe('test generating a bar', () => {
  it('should return a bar preset', () => {
    const meter1: Uint8Array = Buffer.from(data.meter1)
    const options: presets.PresetOptionsMeter1 = {
      width: 72,
      height: 72,
      meter1: 60,
      meter2: 65
    }

    expect(presets.meter1(options)).toEqual(meter1)
  })
})

describe('test generating a set of boxes', () => {
  it('should return s boxes preset', () => {
    const boxes: Uint8Array = Buffer.from(data.boxes)
    const options: presets.PresetOptionsBoxes = {
      width: 72,
      height: 72,
      position: 'top',
      boxes: [
        {
          borderColor: combineRGB(255, 255, 255),
          borderOpacity: 255,
          fillColor: combineRGB(255, 0, 0),
          fillOpacity: 128
        },
        {
          borderColor: combineRGB(255, 255, 255),
          borderOpacity: 255,
          fillColor: combineRGB(255, 0, 0),
          fillOpacity: 128
        },
        {
          borderColor: combineRGB(255, 255, 255),
          borderOpacity: 255,
          fillColor: combineRGB(0, 0, 0),
          fillOpacity: 0
        },
      ]
    }


    expect(presets.boxes(options)).toEqual(boxes)
  })
})