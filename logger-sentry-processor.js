const createSentryProcessor = sentry => {
  if (!sentry) throw new Error('You must provide a sentry client')

  return ({ date, pid, scope, level, tags }, ...args) => {
    const [first, ...rest] = args
    sentry.withScope(scope => {
      scope.setLevel(level)
      if (tags) {
        Object.keys(tags).forEach(tag => scope.setTag(tag, tags[tag]))
      }
      scope.setExtra('data', rest)
      if (first instanceof Error) {
        sentry.captureException(first)
      } else {
        sentry.captureMessage(first)
      }
    })
  }
}
module.exports = createSentryProcessor
