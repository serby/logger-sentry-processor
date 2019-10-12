const createSentryProcessor = require('../logger-sentry-processor')
const { throws, strictEqual, deepStrictEqual, ok } = require('assert')

const noop = f => f

const mockSentry = {
  captureMessage: noop
}

const createSentrySpy = ({
  onSetLevel = noop,
  onSetExtra = noop,
  onSetTag = noop,
  onCaptureMessage = noop,
  onCaptureException = noop
}) => ({
  captureMessage: onCaptureMessage,
  captureException: onCaptureException,
  withScope: scope =>
    scope({
      setLevel: onSetLevel,
      setExtra: onSetExtra,
      setTag: onSetTag
    })
})

describe('logger-sentry-processor', () => {
  it('should error on missing sentry client', () => {
    throws(() => createSentryProcessor(), /You must provide a sentry client/)
  })

  it('should return a function', () => {
    const processor = createSentryProcessor(mockSentry)
    ok(typeof processor, 'function')
  })
  it('should set the scope level', () => {
    const mockSetLevel = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetLevel: mockSetLevel
      })
    )
    processor({ level: 'info' })
    deepStrictEqual(mockSetLevel.mock.calls[0][0], 'info')
  })
  it('should set the scope tags', () => {
    const mockSetTag = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetTag: mockSetTag
      })
    )
    processor({ tags: { a: 1, b: 2 } })
    strictEqual(mockSetTag.mock.calls.length, 2)
    strictEqual(mockSetTag.mock.calls[0][0], 'a')
    strictEqual(mockSetTag.mock.calls[0][1], 1)
    strictEqual(mockSetTag.mock.calls[1][0], 'b')
    strictEqual(mockSetTag.mock.calls[1][1], 2)
  })

  it('should set the scope extra', () => {
    const mockSetExtra = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetExtra: mockSetExtra
      })
    )
    processor({}, 'There was a error', 2, { a: 1 })
    strictEqual(mockSetExtra.mock.calls.length, 1)
    strictEqual(mockSetExtra.mock.calls[0][0], 'data')
    strictEqual(mockSetExtra.mock.calls[0][1][0], 2)
    deepStrictEqual(mockSetExtra.mock.calls[0][1][1], { a: 1 })
  })

  it('should capture the first argument after meta as a message', () => {
    const mockCaptureMessage = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onCaptureMessage: mockCaptureMessage
      })
    )
    processor({}, 'There was a error', 2, { a: 1 })
    strictEqual(mockCaptureMessage.mock.calls.length, 1)
    strictEqual(mockCaptureMessage.mock.calls[0][0], 'There was a error')
  })

  it('should capture the first argument after meta as an exception if an Error', () => {
    const mockCaptureException = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onCaptureException: mockCaptureException
      })
    )
    processor({}, new Error('This is an error'), 2, { a: 1 })
    strictEqual(mockCaptureException.mock.calls.length, 1)
    ok(mockCaptureException.mock.calls[0][0] instanceof Error)
    strictEqual(
      mockCaptureException.mock.calls[0][0].message,
      'This is an error'
    )
    ok(
      mockCaptureException.mock.calls[0][0].stack.includes(
        'Error: This is an error'
      )
    )
  })
})
