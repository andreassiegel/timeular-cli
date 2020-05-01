const axios = require('axios')
const TIMEULAR_API_KEY = process.env.TIMEULAR_API_KEY
const TIMEULAR_API_SECRET = process.env.TIMEULAR_API_SECRET
const TIMEULAR_API_URL = 'https://api.timeular.com/api/v2'

const cache = {}
const createAPIHeaders = token => ({
  Authorization: `Bearer ${token}`
})

const signIn = async () => {
  const { data: { token } } = await axios.post(`${TIMEULAR_API_URL}/developer/sign-in`, {
    apiKey: TIMEULAR_API_KEY,
    apiSecret: TIMEULAR_API_SECRET
  })
  cache.token = token
  return token
}

const getActivities = async token => {
  const { data: { activities } } = await axios.get(`${TIMEULAR_API_URL}/activities`, {
    headers: createAPIHeaders(token)
  })
  return activities
}

const startTracking = async (token, activityId, note) => {
  const { data: { currentTracking } } = await axios.post(`${TIMEULAR_API_URL}/tracking/${activityId}/start`, { note: parseNote(note), startedAt: _convertToAPICompatibleDate(new Date()) }, {
    headers: createAPIHeaders(token)
  })
  return currentTracking
}

const getCurrentTracking = async token => {
  const { data = {} } = await axios.get(`${TIMEULAR_API_URL}/tracking`, {
    headers: createAPIHeaders(token)
  })
  return data.currentTracking || null
}

const stopTracking = async (token, activityId) => {
  const { data: { createdTimeEntry } } = await axios.post(`${TIMEULAR_API_URL}/tracking/${activityId}/stop`, { stoppedAt: _convertToAPICompatibleDate(new Date()) }, {
    headers: createAPIHeaders(token)
  })
  return createdTimeEntry
}

const getTimeEntries = async (token, stopped, started) => {
  const stoppedAfter = _convertToAPICompatibleDate(stopped)
  const startedBefore = _convertToAPICompatibleDate(started)
  const { data: { timeEntries } } = await axios.get(`${TIMEULAR_API_URL}/time-entries/${stoppedAfter}/${startedBefore}`, {
    headers: createAPIHeaders(token)
  })
  return timeEntries
}

const _convertToAPICompatibleDate = date => {
  const dateString = date.toISOString()
  return dateString.slice(0, dateString.length - 1)
}

const parseNote = note => {
  if (!note) {
    return undefined
  }
  return typeof note === 'string' ? _extractLabels(note) : note
}

const _extractLabels = (text, tags = [], mentions = []) => {
  if (_containsLabel(text)) {
    const { label, indices, key } = _extractFirstKey(text)
    switch (label.substring(0, 1)) {
      case '#':
        tags.push({ key, indices })
        break
      case '@':
        mentions.push({ key, indices })
        break
    }
    text = text.replace(label, key)

    return _extractLabels(text, tags, mentions)
  }
  return { text, tags, mentions }
}

const _extractFirstKey = note => {
  const label = note.split(/\s+/).find(w => w.startsWith('@') || w.startsWith('#')) || ''
  const index = note.indexOf(label)
  const key = label.substring(1, label.length)

  return { label, indices: [index, index + label.length - 1], key }
}

const _containsLabel = text => text.search(/\s[@#][\w\d]|^[@#][\w\d]/) > -1

module.exports = { signIn, getActivities, startTracking, getCurrentTracking, stopTracking, getTimeEntries, parseNote }
