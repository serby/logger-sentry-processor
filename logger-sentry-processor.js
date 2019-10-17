const levelMap = {
  warn: 'warning'
}
const createSentryProcessor = sentry => {
  if (!sentry) throw new Error('You must provide a sentry client')

  return ({ date, pid, scope, level, tags }, ...args) => {
    const [first, ...rest] = args
    sentry.withScope(sentryScope => {
      sentryScope.setLevel(levelMap[level] || level)
      if (tags) {
        Object.keys(tags).forEach(tag => sentryScope.setTag(tag, tags[tag]))
      }
      if (rest.length > 0) sentryScope.setExtra('data', rest)
      if (scope) sentryScope.setExtra('scope', scope)
      sentryScope.setExtra('pid', pid)
      if (first instanceof Error) {
        sentry.captureException(first)
      } else {
        sentry.captureMessage(first)
      }
    })
  }
}
module.exports = createSentryProcessor
