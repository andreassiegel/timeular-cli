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

const startTracking = async (token, activityId, message) => {
  const { data } = await axios.post(`${TIMEULAR_API_URL}/tracking/${activityId}/start`, { note: parseNote(message), startedAt: _convertToAPICompatibleDate(new Date()) }, {
    headers: createAPIHeaders(token)
  })
  return data
}

const getCurrentTracking = async token => {
  const { data: { currentTracking } } = await axios.get(`${TIMEULAR_API_URL}/tracking`, {
    headers: createAPIHeaders(token)
  })
  return currentTracking
}

const stopTracking = async (token, activityId) => {
  const { data: { createdTimeEntry } } = await axios.post(`${TIMEULAR_API_URL}/tracking/${activityId}/stop`, { stoppedAt: _convertToAPICompatibleDate(new Date()) }, {
    headers: createAPIHeaders(token)
  })
  return createdTimeEntry
}

async function downloadReport (token, { startTimestamp, stopTimestamp, timezone = 'Europe/Berlin', fileType = 'csv' }) {
  startTimestamp = _convertToAPICompatibleDate(startTimestamp)
  stopTimestamp = _convertToAPICompatibleDate(stopTimestamp)
  const { data } = await axios.get(`${TIMEULAR_API_URL}/report/${startTimestamp}/${stopTimestamp}?timezone=${encodeURIComponent(timezone)}&fileType=${fileType}`, {
    headers: createAPIHeaders(token),
    responseType: 'arraybuffer'
  })
  return data
}

const _convertToAPICompatibleDate = date => {
  const dateString = date.toISOString()
  return dateString.slice(0, dateString.length - 1)
}

const parseNote = note => note ? _extractLabels(note) : undefined

const _extractLabels = (text, tags = [], mentions = []) => {
  if (_containsLabel(text)) {
    const { key: label, indices, strippedKey: key } = _extractFirstKey(text)
    if (label.startsWith('#')) {
      tags.push({ key, indices })
    }
    if (label.startsWith('@')) {
      mentions.push({ key, indices })
    }
    text = text.replace(label, key)

    return _extractLabels(text, tags, mentions)
  }
  return { text, tags, mentions }
}

const _extractFirstKey = note => {
  const key = note.split(/\s+/).find(w => w.startsWith('@') || w.startsWith('#')) || ''
  const index = note.indexOf(key)
  const strippedKey = key.substring(1, key.length)

  return { key, indices: [index, index + key.length - 1], strippedKey }
}

const _containsLabel = text => text.search(/\s[@#][\w\d]|^[@#][\w\d]/) > -1

module.exports = { signIn, getActivities, startTracking, getCurrentTracking, stopTracking, downloadReport, parseNote }
