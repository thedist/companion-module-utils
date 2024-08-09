# Module Utils for Bitfocus Companion Modules
This project provides utility functions to simplify some of the complex tasks common throughout many Companion modules, such as the generation of graphics in Feedbacks.

## Features
* Create simple button graphics for use in Bitfocus Companion modules
* Stack multiple graphics together to create more complex images
* A range of presets to simplify the use of common graphics
* Minimal dependencies
* Supports Companion 3.0 and newer

## Installation
```
yarn add companion-module-utils
```

```javascript
// ES6 Module or Typescript
import { graphics, presets } from 'comapnion-module-utils'

// Commonjs
const { graphics, presets } = require('companion-module-utils')

```

## Documentation
* [Graphics](/docs/graphics.md)
* [Presets](/docs/presets.md)

## License
Licensed under the [MIT License](License)
