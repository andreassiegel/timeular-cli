const { sortBy } = require('lodash')

const { Spinner } = require('../helpers/spinner')
const { getActivities, startTracking } = require('../helpers/timeular-api-helpers')
const { feedbackColor } = require('../helpers/colors')
const parse = require('../helpers/trackingParser')
const { promptIndex, promptInput } = require('../helpers/prompt')
const stop = require('./stop')

const start = async argv => {
  const { apiToken, activityName } = argv
  const spinner = new Spinner(feedbackColor('Start tracking...'))
  try {
    const activityId = argv.activityId || await _getActivityIdFromName(apiToken, activityName)
    const message = argv.message || await promptInput('Note:')

    spinner.start()
    await _stopPrevious(argv)

    const newActivity = await startTracking(apiToken, activityId, message)
    spinner.end()
    console.log('Started tracking: ' + parse(newActivity))
  } catch (err) {
    spinner.end()
    throw err
  }
}

const _getActivityIdFromName = async (apiToken, activityName) => {
  const spinner = new Spinner(feedbackColor('Getting available activities...'))
  try {
    spinner.start()
    const activities = await getActivities(apiToken)
    spinner.end()

    const activity = await _getActivity(activityName, activities)
    if (!activity) {
      throw new Error('Activity not found')
    }
    return activity.id
  } catch (err) {
    spinner.end()
    throw err
  }
}

const _getActivity = async (activityName, activities = []) => {
  if (!activityName) {
    activityName = await _getActivityFromInput(activities)
  }
  return activities.find(a => a.name === activityName)
}

const _getActivityFromInput = async activities => {
  if (activities.length === 0) {
    throw new Error('No activities to track')
  }
  activities = sortBy(activities, 'name')
  activities.forEach((activity, index) => {
    console.log(`${index}\t${activity.name}`)
  })
  const index = await promptIndex(activities, 'Number of activity to track:')
  return activities[index].name
}

const _stopPrevious = async argv => {
  try {
    await stop(argv)
  } catch (err) {
    if (err.message !== 'No running activity - nothing to stop') {
      throw err
    }
  }
}

module.exports = start
