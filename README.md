# logger-sentry - Sentry logger for @serby/logger

[![build status](https://secure.travis-ci.org/serby/logger-sentry-processor.png)](http://travis-ci.org/serby/logger-sentry-processor)
[![dependency status](https://david-dm.org/serby/logger-sentry-processor.svg)](https://david-dm.org/serby/logger-sentry-processor)

## Installation

    npm install @serby/logger-sentry-processor
    yarn add @serby/logger-sentry-processor

## Usage

```js
const createLogger = require('@serby/logger')
const createSentryProcessor = require('@serby/logger-sentry-processor')
const Sentry = require('@sentry/node')

const createStdOutProcessor = createLogger.createStdOutProcessor
const logger = createLogger('app', {
  level: info,
  processors: [
    createStdOutProcessor(),
    { processor: createSentryProcessor(Sentry), level: 'warn' }
  ]
})
```

## Credits

[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/serby)

## License

Licensed under the [ISC](http://opensource.org/licenses/isc)
