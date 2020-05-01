const { Input, NumberPrompt } = require('enquirer')

const promptIndex = async (options, message) => new NumberPrompt({
  name: 'index',
  message,
  validate: i => i >= 0 && i < options.length
}).run()

const promptInput = async label => new Input({
  message: label
}).run()

module.exports = {
  promptIndex,
  promptInput
}
