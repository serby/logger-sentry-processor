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

  it('should send extra data to sentry', () => {
    const mockSetExtra = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetExtra: mockSetExtra
      })
    )
    processor({ pid: 42 }, 'There was a error', 2, { a: 1 })
    strictEqual(mockSetExtra.mock.calls.length, 2)
    strictEqual(mockSetExtra.mock.calls[0][0], 'data')
    strictEqual(mockSetExtra.mock.calls[0][1][0], 2)
    deepStrictEqual(mockSetExtra.mock.calls[0][1][1], { a: 1 })
    strictEqual(mockSetExtra.mock.calls[1][0], 'pid')
    strictEqual(mockSetExtra.mock.calls[1][1], 42)
  })

  it('should send logger scope ', () => {
    const mockSetExtra = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetExtra: mockSetExtra
      })
    )
    processor({ pid: 42, scope: 'app' }, 'There was a error')
    strictEqual(mockSetExtra.mock.calls.length, 2)
    strictEqual(mockSetExtra.mock.calls[0][0], 'scope')
    strictEqual(mockSetExtra.mock.calls[0][1], 'app')
    strictEqual(mockSetExtra.mock.calls[1][0], 'pid')
    strictEqual(mockSetExtra.mock.calls[1][1], 42)
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

  it('should capture extra data attached to errors', () => {
    const mockSetExtra = jest.fn()
    const processor = createSentryProcessor(
      createSentrySpy({
        onSetExtra: mockSetExtra
      })
    )
    const error = new Error('This is an error')
    error.foo = 'bar'
    error.errors = { name: 'Not good' }
    processor({}, error, 2, { a: 1 })
    strictEqual(mockSetExtra.mock.calls.length, 4)
    strictEqual(mockSetExtra.mock.calls[2][0], '.foo')
    strictEqual(mockSetExtra.mock.calls[2][1], 'bar')
    strictEqual(mockSetExtra.mock.calls[3][0], '.errors')
    deepStrictEqual(mockSetExtra.mock.calls[3][1], { name: 'Not good' })
  })
})
