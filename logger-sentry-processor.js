const createSentryProcessor = sentry => {
  if (!sentry) throw new Error('You must provide a sentry client')

  return ({ date, pid, scope, level, tags }, ...args) => {
    const [first, ...rest] = args
    sentry.withScope(sentryScope => {
      sentryScope.setLevel(level)
      if (tags) {
        Object.keys(tags).forEach(tag => sentryScope.setTag(tag, tags[tag]))
      }
      sentryScope.setExtra('data', rest)
      if (scope) sentryScope.setExtra('scope', scope)
      if (first instanceof Error) {
        sentry.captureException(first)
      } else {
        sentry.captureMessage(first)
      }
    })
  }
}
module.exports = createSentryProcessor
