const { continue: continueActivity } = require('../../commands')
const apiHelpers = require('../../helpers/timeular-api-helpers')
const prompt = require('../../helpers/prompt')

jest.mock('../../helpers/timeular-api-helpers')
jest.mock('../../helpers/prompt')

describe('continue command', () => {
  const argv = {
    apiToken: 'token12345'
  }

  const timeEntry = {
    id: '987',
    activity: {
      id: '123',
      name: 'sleeping',
      color: '#a1b2c3',
      integration: 'zei'
    },
    duration: {
      startedAt: '2017-01-02T03:04:05.678',
      stoppedAt: '2017-02-03T04:05:06.789'
    },
    note: {
      text: 'development Working with John on the new project',
      tags: [
        {
          indices: [
            0,
            11
          ],
          key: 'development'
        }
      ],
      mentions: [
        {
          indices: [
            25,
            29
          ],
          key: 'John'
        }
      ]
    }
  }

  const newTracking = {
    activity: {
      id: '123',
      name: 'sleeping',
      color: '#a1b2c3',
      integration: 'zei'
    },
    startedAt: '2017-01-02T03:04:05.678',
    note: {
      text: 'development Working with John on the new project',
      tags: [
        {
          indices: [
            0,
            11
          ],
          key: 'development'
        }
      ],
      mentions: [
        {
          indices: [
            25,
            29
          ],
          key: 'John'
        }
      ]
    }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('checks timeEntries', async () => {
    prompt.promptIndex.mockImplementationOnce(() => Promise.resolve(0))
    apiHelpers.getTimeEntries.mockImplementationOnce(() => Promise.resolve([timeEntry]))
    apiHelpers.startTracking.mockImplementationOnce(() => Promise.resolve(newTracking))

    await continueActivity(argv)

    expect(apiHelpers.getTimeEntries).toHaveBeenCalledTimes(1)
  })

  it('reads activity to continue from prompt', async () => {
    prompt.promptIndex.mockImplementationOnce(() => Promise.resolve(0))
    apiHelpers.getTimeEntries.mockImplementationOnce(() => Promise.resolve([timeEntry]))
    apiHelpers.startTracking.mockImplementationOnce(() => Promise.resolve(newTracking))

    await continueActivity(argv)

    expect(prompt.promptIndex).toHaveBeenCalledTimes(1)
  })

  it('startsTracking with activity ID and note object from previous activity', async () => {
    prompt.promptIndex.mockImplementationOnce(() => Promise.resolve(0))
    apiHelpers.getTimeEntries.mockImplementationOnce(() => Promise.resolve([timeEntry]))
    apiHelpers.startTracking.mockImplementationOnce(() => Promise.resolve(newTracking))

    await continueActivity(argv)

    expect(apiHelpers.startTracking).toHaveBeenCalledTimes(1)
    expect(apiHelpers.startTracking).toHaveBeenCalledWith(argv.apiToken, timeEntry.activity.id, timeEntry.note)
  })

  it('rejects if nothing to continue', async () => {
    apiHelpers.getTimeEntries.mockImplementationOnce(() => Promise.resolve([]))

    await expect(continueActivity(argv)).rejects.toThrow(new Error('Nothing to continue - start a new activity instead'))
  })

  it('rejects if getting time entries fails', async () => {
    apiHelpers.getTimeEntries.mockRejectedValue(new Error('something went wrong'))

    await expect(continueActivity(argv)).rejects.toThrow(new Error('something went wrong'))
  })
})

describe('internal functions for continue', () => {
  const { _getOptions: getOptions } = require('../../commands/continue')

  describe('_getOptions', () => {
    it('returns empty list for empty input', () => {
      const timeEntries = []
      const expectedTimeEntries = []

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })

    it('returns entry data', () => {
      const timeEntries = [
        {
          id: '987',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2017-01-02T03:04:05.678',
            stoppedAt: '2017-02-03T04:05:06.789'
          },
          note: {
            text: 'development Working with John on the new project',
            tags: [
              {
                indices: [
                  0,
                  11
                ],
                key: 'development'
              }
            ],
            mentions: [
              {
                indices: [
                  25,
                  29
                ],
                key: 'John'
              }
            ]
          }
        }
      ]
      const expectedTimeEntries = [
        {
          activityId: '123',
          key: 'development Working with John on the new project',
          stoppedAt: '2017-02-03T04:05:06.789',
          name: 'sleeping',
          note: {
            text: 'development Working with John on the new project',
            tags: [
              {
                indices: [
                  0,
                  11
                ],
                key: 'development'
              }
            ],
            mentions: [
              {
                indices: [
                  25,
                  29
                ],
                key: 'John'
              }
            ]
          }
        }
      ]

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })

    it('returns most recent data', () => {
      const timeEntries = [
        {
          id: '456',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2016-01-02T03:04:05.678',
            stoppedAt: '2016-02-03T04:05:06.789'
          },
          note: {
            text: 'development Working with John on the new project',
            tags: [
              {
                indices: [
                  0,
                  11
                ],
                key: 'development'
              }
            ],
            mentions: [
              {
                indices: [
                  25,
                  29
                ],
                key: 'John'
              }
            ]
          }
        },
        {
          id: '987',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2017-01-02T03:04:05.678',
            stoppedAt: '2017-02-03T04:05:06.789'
          },
          note: {
            text: 'development Working with John on the new project',
            tags: [
              {
                indices: [
                  0,
                  11
                ],
                key: 'development'
              }
            ],
            mentions: [
              {
                indices: [
                  25,
                  29
                ],
                key: 'John'
              }
            ]
          }
        }
      ]
      const expectedTimeEntries = [
        {
          activityId: '123',
          key: 'development Working with John on the new project',
          stoppedAt: '2017-02-03T04:05:06.789',
          name: 'sleeping',
          note: {
            text: 'development Working with John on the new project',
            tags: [
              {
                indices: [
                  0,
                  11
                ],
                key: 'development'
              }
            ],
            mentions: [
              {
                indices: [
                  25,
                  29
                ],
                key: 'John'
              }
            ]
          }
        }
      ]

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })

    it('filters entries with empty note text', () => {
      const timeEntries = [
        {
          id: '987',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2017-01-02T03:04:05.678',
            stoppedAt: '2017-02-03T04:05:06.789'
          },
          note: {
            text: '',
            tags: [],
            mentions: []
          }
        }
      ]
      const expectedTimeEntries = []

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })

    it('filters entries with null note text', () => {
      const timeEntries = [
        {
          id: '987',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2017-01-02T03:04:05.678',
            stoppedAt: '2017-02-03T04:05:06.789'
          },
          note: {
            text: null,
            tags: [],
            mentions: []
          }
        }
      ]
      const expectedTimeEntries = []

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })

    it('filters entries without note', () => {
      const timeEntries = [
        {
          id: '987',
          activity: {
            id: '123',
            name: 'sleeping',
            color: '#a1b2c3',
            integration: 'zei'
          },
          duration: {
            startedAt: '2017-01-02T03:04:05.678',
            stoppedAt: '2017-02-03T04:05:06.789'
          },
          note: null
        }
      ]
      const expectedTimeEntries = []

      const result = getOptions(timeEntries)

      expect(result).toEqual(expectedTimeEntries)
    })
  })
})
