const errorHandler = (msg, err, yargs) => {
  if (!err && !msg) {
    yargs.showHelp()
  } else {
    console.log(msg || _errorOutput(err))
  }
  process.exit(1)
}

const _errorOutput = err => {
  if (_isResponseError(err)) {
    return err.response.data.message || err.response.data
  }
  return err.message || err
}

const _isResponseError = err => err && !!err.response && !!err.response.data

module.exports = errorHandler
