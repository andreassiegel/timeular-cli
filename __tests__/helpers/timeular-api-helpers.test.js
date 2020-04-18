const axios = require('axios')
const { TIMEULAR_API_KEY, TIMEULAR_API_SECRET } = process.env
const apiHelpers = require('../../helpers/timeular-api-helpers')

jest.mock('axios')

const TIMEULAR_API_URL = 'https://api.timeular.com/api/v2'

describe('signIn()', () => {
  const token = '12345'
  const response = { data: { token } }

  it('sends sign-in request with API credentials', async () => {
    const apiKey = TIMEULAR_API_KEY
    const apiSecret = TIMEULAR_API_SECRET
    const expectedBody = { apiKey, apiSecret }

    axios.post.mockImplementationOnce(() => Promise.resolve(response))

    await apiHelpers.signIn()

    expect(axios.post).toHaveBeenCalledWith(`${TIMEULAR_API_URL}/developer/sign-in`, expectedBody)
  })

  it('returns token', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve(response))

    await expect(apiHelpers.signIn()).resolves.toEqual(token)
  })

  it('returns undefined for 400 Bad Request', async () => {
    const response = {
      status: 400,
      statusText: 'Bad Request',
      data: { message: 'Explanation of what has happened' }
    }
    axios.post.mockImplementationOnce(() => Promise.resolve(response))

    await expect(apiHelpers.signIn()).resolves.toBeUndefined()
  })

  it('returns undefined for 401 Unauthorized', async () => {
    const response = {
      status: 401,
      statusText: 'Unauthorized',
      data: { message: 'Explanation of what has happened' }
    }
    axios.post.mockImplementationOnce(() => Promise.resolve(response))

    await expect(apiHelpers.signIn()).resolves.toBeUndefined()
  })
})

describe('getActivities()', () => {

})

describe('startTracking()', () => {

})

describe('getCurrentTracking()', () => {

})

describe('stopTracking()', () => {

})
