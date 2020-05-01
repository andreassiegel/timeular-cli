#!/usr/bin/env node

require('dotenv').config()

const yargs = require('yargs')
const { start, stop, continue: continueActivity, status, list } = require('./commands')
const { getCLIVersion } = require('./helpers/get-cli-version')
const errorHandler = require('./helpers/errorHandler')
const apiLogin = require('./middleware/apiLogin')

const init = async () => {
  // eslint-disable-next-line no-unused-expressions
  yargs
    .scriptName('timeular')
    .usage('Usage: $0 <command> [options]')
    .command('start [activityName]', 'Start tracking for a specific activity, stops current tracking before starting a new one', startBuilder, start, [apiLogin])
    .command('stop', 'Stops tracking current activity', () => {}, stop, [apiLogin])
    .command('continue', 'Continues tracking of a previous activity', () => {}, continueActivity, [apiLogin])
    .command('status', 'Shows the current activity tracking status', () => {}, status, [apiLogin])
    .command('list', 'Lists all activities that are available for tracking', () => {}, list, [apiLogin])
    .help('help', 'output usage information')
    .alias(['h'], 'help')
    .version('version', 'output the version number', getCLIVersion())
    .alias(['v'], 'version')
    .recommendCommands()
    .wrap(100)
    .strict(true)
    .demandCommand(1, '')
    .middleware(apiLogin)
    .fail(errorHandler)
    .argv
}

const startBuilder = yargs => {
  yargs
    .positional('activityName', {
      type: 'string',
      default: '',
      describe: 'the name of the activity to track'
    })
    .option('m', {
      alias: 'message',
      describe: 'the message to add to the activity',
      type: 'string',
      nargs: 1,
      demand: false
    })
}

init()
