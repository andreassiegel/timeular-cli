const { orderBy } = require('lodash')

const { Spinner } = require('../helpers/spinner')
const { getTimeEntries } = require('../helpers/timeular-api-helpers')
const { feedbackColor } = require('../helpers/colors')
const { promptIndex } = require('../helpers/prompt')
const start = require('./start')

const continueActivity = async argv => {
  const { apiToken } = argv
  const spinner = new Spinner(feedbackColor('Getting previous activities'))
  try {
    spinner.start()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 3)
    yesterday.setHours(0)
    yesterday.setMinutes(0)
    yesterday.setSeconds(0)
    yesterday.setMilliseconds(0)
    const timeEntries = await getTimeEntries(apiToken, yesterday, new Date())
    spinner.end()
    const { activityId, note: message } = await _getActivityFromInput(timeEntries)
    await start({ apiToken, activityId, message })
  } catch (err) {
    spinner.end()
    throw err
  }
}

const _getActivityFromInput = async timeEntries => {
  const options = _getOptions(timeEntries)
  if (options.length === 0) {
    throw new Error('Nothing to continue - start a new activity instead')
  }
  options.forEach((option, index) => {
    console.log(`${index}\t${option.key} (${option.name})`)
  })
  const index = await promptIndex(timeEntries, 'Number of activity to continue:')
  return options[index]
}

const _getOptions = timeEntries => {
  const timeEntryMap = timeEntries
    .filter(({ note = {} }) => !!note && !!note.text) // don't continue anything without a note
    .reduce(_collectUniqueEntries, {})
  return orderBy(Object.values(timeEntryMap), ['stoppedAt'], ['desc']).slice(0, 10)
}

const _collectUniqueEntries = (acc, timeEntry) => {
  const { note, activity: { id: activityId, name }, duration: { stoppedAt } } = timeEntry
  const key = note.text
  const item = { activityId, name, key, stoppedAt, note }
  acc[key] = (!acc[key] || acc[key].stoppedAt < stoppedAt) ? item : acc[key]
  return acc
}

module.exports = { continueActivity, _getOptions }
