#!/usr/bin/env node
'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var require$$0 = require('events')
var require$$1 = require('child_process')
var require$$2 = require('path')
var require$$3 = require('fs')
var require$$0$1 = require('playwright')

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e }
}

var require$$0__default = /*#__PURE__*/ _interopDefaultLegacy(require$$0)
var require$$1__default = /*#__PURE__*/ _interopDefaultLegacy(require$$1)
var require$$2__default = /*#__PURE__*/ _interopDefaultLegacy(require$$2)
var require$$3__default = /*#__PURE__*/ _interopDefaultLegacy(require$$3)
var require$$0__default$1 = /*#__PURE__*/ _interopDefaultLegacy(require$$0$1)

var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {}

var commander = { exports: {} }

var argument = {}

var error = {}

// @ts-check

/**
 * CommanderError class
 * @class
 */
class CommanderError$1 extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @constructor
   */
  constructor(exitCode, code, message) {
    super(message) // properly capture stack trace in Node.js

    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.code = code
    this.exitCode = exitCode
    this.nestedError = undefined
  }
}
/**
 * InvalidArgumentError class
 * @class
 */

class InvalidArgumentError$2 extends CommanderError$1 {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   * @constructor
   */
  constructor(message) {
    super(1, 'commander.invalidArgument', message) // properly capture stack trace in Node.js

    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
  }
}

error.CommanderError = CommanderError$1
error.InvalidArgumentError = InvalidArgumentError$2

const { InvalidArgumentError: InvalidArgumentError$1 } = error // @ts-check

class Argument$1 {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */
  constructor(name, description) {
    this.description = description || ''
    this.variadic = false
    this.parseArg = undefined
    this.defaultValue = undefined
    this.defaultValueDescription = undefined
    this.argChoices = undefined

    switch (name[0]) {
      case '<':
        // e.g. <required>
        this.required = true
        this._name = name.slice(1, -1)
        break

      case '[':
        // e.g. [optional]
        this.required = false
        this._name = name.slice(1, -1)
        break

      default:
        this.required = true
        this._name = name
        break
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true
      this._name = this._name.slice(0, -3)
    }
  }
  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name
  }

  /**
   * @api private
   */
  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value]
    }

    return previous.concat(value)
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {any} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value, description) {
    this.defaultValue = value
    this.defaultValueDescription = description
    return this
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */
  argParser(fn) {
    this.parseArg = fn
    return this
  }

  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */
  choices(values) {
    this.argChoices = values

    this.parseArg = (arg, previous) => {
      if (!values.includes(arg)) {
        throw new InvalidArgumentError$1(
          `Allowed choices are ${values.join(', ')}.`
        )
      }

      if (this.variadic) {
        return this._concatValue(arg, previous)
      }

      return arg
    }

    return this
  }

  /**
   * Make option-argument required.
   */
  argRequired() {
    this.required = true
    return this
  }
  /**
   * Make option-argument optional.
   */

  argOptional() {
    this.required = false
    return this
  }
}
/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @api private
 */

function humanReadableArgName$2(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '')
  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']'
}

argument.Argument = Argument$1
argument.humanReadableArgName = humanReadableArgName$2

var command = {}

var help = {}

const { humanReadableArgName: humanReadableArgName$1 } = argument
/**
 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
 * @typedef { import("./argument.js").Argument } Argument
 * @typedef { import("./command.js").Command } Command
 * @typedef { import("./option.js").Option } Option
 */
// @ts-check
// Although this is a class, methods are static in style to allow override using subclass or just functions.

class Help$1 {
  constructor() {
    this.helpWidth = undefined
    this.sortSubcommands = false
    this.sortOptions = false
  }
  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd) => !cmd._hidden)

    if (cmd._hasImplicitHelpCommand()) {
      // Create a command matching the implicit help command.
      const [, helpName, helpArgs] =
        cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/)

      const helpCommand = cmd.createCommand(helpName).helpOption(false)
      helpCommand.description(cmd._helpCommandDescription)
      if (helpArgs) helpCommand.arguments(helpArgs)
      visibleCommands.push(helpCommand)
    }

    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        // @ts-ignore: overloaded return type
        return a.name().localeCompare(b.name())
      })
    }

    return visibleCommands
  }
  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden) // Implicit help

    const showShortHelpFlag =
      cmd._hasHelpOption &&
      cmd._helpShortFlag &&
      !cmd._findOption(cmd._helpShortFlag)
    const showLongHelpFlag =
      cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag)

    if (showShortHelpFlag || showLongHelpFlag) {
      let helpOption

      if (!showShortHelpFlag) {
        helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription)
      } else if (!showLongHelpFlag) {
        helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription)
      } else {
        helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription)
      }

      visibleOptions.push(helpOption)
    }

    if (this.sortOptions) {
      const getSortKey = (option) => {
        // WYSIWYG for order displayed in help with short before long, no special handling for negated.
        return option.short
          ? option.short.replace(/^-/, '')
          : option.long.replace(/^--/, '')
      }

      visibleOptions.sort((a, b) => {
        return getSortKey(a).localeCompare(getSortKey(b))
      })
    }

    return visibleOptions
  }
  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */

  visibleArguments(cmd) {
    // Side effect! Apply the legacy descriptions before the arguments are displayed.
    if (cmd._argsDescription) {
      cmd._args.forEach((argument) => {
        argument.description =
          argument.description || cmd._argsDescription[argument.name()] || ''
      })
    } // If there are any arguments with a description then return all the arguments.

    if (cmd._args.find((argument) => argument.description)) {
      return cmd._args
    }
    return []
  }
  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandTerm(cmd) {
    // Legacy. Ignores custom usage string, and nested commands.
    const args = cmd._args.map((arg) => humanReadableArgName$1(arg)).join(' ')

    return (
      cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') +
      (args ? ' ' + args : '')
    )
  }
  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */

  optionTerm(option) {
    return option.flags
  }
  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */

  argumentTerm(argument) {
    return argument.name()
  }
  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, helper.subcommandTerm(command).length)
    }, 0)
  }

  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length)
    }, 0)
  }

  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, helper.argumentTerm(argument).length)
    }, 0)
  }

  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  commandUsage(cmd) {
    // Usage
    let cmdName = cmd._name

    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0]
    }

    let parentCmdNames = ''

    for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
      parentCmdNames = parentCmd.name() + ' ' + parentCmdNames
    }

    return parentCmdNames + cmdName + ' ' + cmd.usage()
  }
  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.description()
  }
  /**
   * Get the command description to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.description()
  }
  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */

  optionDescription(option) {
    const extraInfo = [] // Some of these do not make sense for negated boolean and suppress for backwards compatibility.

    if (option.argChoices && !option.negate) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices
          .map((choice) => JSON.stringify(choice))
          .join(', ')}`
      )
    }

    if (option.defaultValue !== undefined && !option.negate) {
      extraInfo.push(
        `default: ${
          option.defaultValueDescription || JSON.stringify(option.defaultValue)
        }`
      )
    }

    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`)
    }

    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`
    }

    return option.description
  }

  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */
  argumentDescription(argument) {
    const extraInfo = []

    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices
          .map((choice) => JSON.stringify(choice))
          .join(', ')}`
      )
    }

    if (argument.defaultValue !== undefined) {
      extraInfo.push(
        `default: ${
          argument.defaultValueDescription ||
          JSON.stringify(argument.defaultValue)
        }`
      )
    }

    if (extraInfo.length > 0) {
      const extraDescripton = `(${extraInfo.join(', ')})`

      if (argument.description) {
        return `${argument.description} ${extraDescripton}`
      }

      return extraDescripton
    }

    return argument.description
  }
  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper)
    const helpWidth = helper.helpWidth || 80
    const itemIndentWidth = 2
    const itemSeparatorWidth = 2 // between term and description

    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(
          termWidth + itemSeparatorWidth
        )}${description}`
        return helper.wrap(
          fullText,
          helpWidth - itemIndentWidth,
          termWidth + itemSeparatorWidth
        )
      }

      return term
    }

    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth))
    } // Usage

    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''] // Description

    const commandDescription = helper.commandDescription(cmd)

    if (commandDescription.length > 0) {
      output = output.concat([commandDescription, ''])
    } // Arguments

    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return formatItem(
        helper.argumentTerm(argument),
        helper.argumentDescription(argument)
      )
    })

    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), ''])
    } // Options

    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(
        helper.optionTerm(option),
        helper.optionDescription(option)
      )
    })

    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), ''])
    } // Commands

    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return formatItem(
        helper.subcommandTerm(cmd),
        helper.subcommandDescription(cmd)
      )
    })

    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), ''])
    }

    return output.join('\n')
  }
  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    )
  }

  /**
   * Wrap the given string to width characters per line, with lines after the first indented.
   * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
   *
   * @param {string} str
   * @param {number} width
   * @param {number} indent
   * @param {number} [minColumnWidth=40]
   * @return {string}
   *
   */
  wrap(str, width, indent, minColumnWidth = 40) {
    // Detect manually wrapped and indented strings by searching for line breaks
    // followed by multiple spaces/tabs.
    if (str.match(/[\n]\s+/)) return str // Do not wrap if not enough room for a wrapped column of text (as could end up with a word per line).

    const columnWidth = width - indent
    if (columnWidth < minColumnWidth) return str
    const leadingStr = str.substr(0, indent)
    const columnText = str.substr(indent)
    const indentString = ' '.repeat(indent)
    const regex = new RegExp(
      '.{1,' +
        (columnWidth - 1) +
        '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)',
      'g'
    )
    const lines = columnText.match(regex) || []
    return (
      leadingStr +
      lines
        .map((line, i) => {
          if (line.slice(-1) === '\n') {
            line = line.slice(0, line.length - 1)
          }

          return (i > 0 ? indentString : '') + line.trimRight()
        })
        .join('\n')
    )
  }
}

help.Help = Help$1

var option = {}

const { InvalidArgumentError } = error // @ts-check

class Option$1 {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */
  constructor(flags, description) {
    this.flags = flags
    this.description = description || ''
    this.required = flags.includes('<') // A value must be supplied when the option is specified.

    this.optional = flags.includes('[') // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument

    this.variadic = /\w\.\.\.[>\]]$/.test(flags) // The option can take multiple values.

    this.mandatory = false // The option must have a value after parsing, which usually means it must be specified on command line.

    const optionFlags = splitOptionFlags$1(flags)
    this.short = optionFlags.shortFlag
    this.long = optionFlags.longFlag
    this.negate = false

    if (this.long) {
      this.negate = this.long.startsWith('--no-')
    }

    this.defaultValue = undefined
    this.defaultValueDescription = undefined
    this.envVar = undefined
    this.parseArg = undefined
    this.hidden = false
    this.argChoices = undefined
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {any} value
   * @param {string} [description]
   * @return {Option}
   */

  default(value, description) {
    this.defaultValue = value
    this.defaultValueDescription = description
    return this
  }

  /**
   * Set environment variable to check for option value.
   * Priority order of option values is default < env < cli
   *
   * @param {string} name
   * @return {Option}
   */
  env(name) {
    this.envVar = name
    return this
  }

  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */
  argParser(fn) {
    this.parseArg = fn
    return this
  }

  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */
  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory
    return this
  }

  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */
  hideHelp(hide = true) {
    this.hidden = !!hide
    return this
  }

  /**
   * @api private
   */
  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value]
    }

    return previous.concat(value)
  }
  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */

  choices(values) {
    this.argChoices = values

    this.parseArg = (arg, previous) => {
      if (!values.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${values.join(', ')}.`
        )
      }

      if (this.variadic) {
        return this._concatValue(arg, previous)
      }

      return arg
    }

    return this
  }

  /**
   * Return option name.
   *
   * @return {string}
   */
  name() {
    if (this.long) {
      return this.long.replace(/^--/, '')
    }

    return this.short.replace(/^-/, '')
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {string}
   * @api private
   */
  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''))
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @api private
   */
  is(arg) {
    return this.short === arg || this.long === arg
  }
}
/**
 * Convert string from kebab-case to camelCase.
 *
 * @param {string} str
 * @return {string}
 * @api private
 */

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1)
  })
}
/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 *
 * @api private
 */

function splitOptionFlags$1(flags) {
  let shortFlag
  let longFlag // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].

  const flagParts = flags.split(/[ |,]+/)
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift()
  longFlag = flagParts.shift() // Add support for lone short flag without significantly changing parsing!

  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag
    longFlag = undefined
  }

  return {
    shortFlag,
    longFlag
  }
}

option.Option = Option$1
option.splitOptionFlags = splitOptionFlags$1

var suggestSimilar$2 = {}

const maxDistance = 3

function editDistance(a, b) {
  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
  // Calculating optimal string alignment distance, no substring is edited more than once.
  // (Simple implementation.)
  // Quick early exit, return worst case.
  if (Math.abs(a.length - b.length) > maxDistance)
    return Math.max(a.length, b.length) // distance between prefix substrings of a and b

  const d = [] // pure deletions turn a into empty string

  for (let i = 0; i <= a.length; i++) {
    d[i] = [i]
  } // pure insertions turn empty string into b

  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j
  } // fill matrix

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1

      if (a[i - 1] === b[j - 1]) {
        cost = 0
      } else {
        cost = 1
      }

      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      ) // transposition

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[a.length][b.length]
}
/**
 * Find close matches, restricted to same number of edits.
 *
 * @param {string} word
 * @param {string[]} candidates
 * @returns {string}
 */

function suggestSimilar$1(word, candidates) {
  if (!candidates || candidates.length === 0) return '' // remove possible duplicates

  candidates = Array.from(new Set(candidates))
  const searchingOptions = word.startsWith('--')

  if (searchingOptions) {
    word = word.slice(2)
    candidates = candidates.map((candidate) => candidate.slice(2))
  }

  let similar = []
  let bestDistance = maxDistance
  const minSimilarity = 0.4
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return // no one character guesses

    const distance = editDistance(word, candidate)
    const length = Math.max(word.length, candidate.length)
    const similarity = (length - distance) / length

    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        // better edit distance, throw away previous worse matches
        bestDistance = distance
        similar = [candidate]
      } else if (distance === bestDistance) {
        similar.push(candidate)
      }
    }
  })
  similar.sort((a, b) => a.localeCompare(b))

  if (searchingOptions) {
    similar = similar.map((candidate) => `--${candidate}`)
  }

  if (similar.length > 1) {
    return `\n(Did you mean one of ${similar.join(', ')}?)`
  }

  if (similar.length === 1) {
    return `\n(Did you mean ${similar[0]}?)`
  }

  return ''
}

suggestSimilar$2.suggestSimilar = suggestSimilar$1

const EventEmitter = require$$0__default['default'].EventEmitter

const childProcess = require$$1__default['default']

const path = require$$2__default['default']

const fs = require$$3__default['default']

const { Argument, humanReadableArgName } = argument

const { CommanderError } = error

const { Help } = help

const { Option, splitOptionFlags } = option

const { suggestSimilar } = suggestSimilar$2 // @ts-check

class Command extends EventEmitter {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */
  constructor(name) {
    super()
    /** @type {Command[]} */

    this.commands = []
    /** @type {Option[]} */

    this.options = []
    this.parent = null
    this._allowUnknownOption = false
    this._allowExcessArguments = true
    /** @type {Argument[]} */

    this._args = []
    /** @type {string[]} */

    this.args = [] // cli args with options removed

    this.rawArgs = []
    this.processedArgs = [] // like .args but after custom processing and collecting variadic

    this._scriptPath = null
    this._name = name || ''
    this._optionValues = {}
    this._optionValueSources = {} // default < env < cli

    this._storeOptionsAsProperties = false
    this._actionHandler = null
    this._executableHandler = false
    this._executableFile = null // custom name for executable

    this._defaultCommandName = null
    this._exitCallback = null
    this._aliases = []
    this._combineFlagAndOptionalValue = true
    this._description = ''
    this._argsDescription = undefined // legacy

    this._enablePositionalOptions = false
    this._passThroughOptions = false
    this._lifeCycleHooks = {} // a hash of arrays

    /** @type {boolean | string} */

    this._showHelpAfterError = false
    this._showSuggestionAfterError = false // see .configureOutput() for docs

    this._outputConfiguration = {
      writeOut: (str) => process.stdout.write(str),
      writeErr: (str) => process.stderr.write(str),
      getOutHelpWidth: () =>
        process.stdout.isTTY ? process.stdout.columns : undefined,
      getErrHelpWidth: () =>
        process.stderr.isTTY ? process.stderr.columns : undefined,
      outputError: (str, write) => write(str)
    }
    this._hidden = false
    this._hasHelpOption = true
    this._helpFlags = '-h, --help'
    this._helpDescription = 'display help for command'
    this._helpShortFlag = '-h'
    this._helpLongFlag = '--help'
    this._addImplicitHelpCommand = undefined // Deliberately undefined, not decided whether true or false

    this._helpCommandName = 'help'
    this._helpCommandnameAndArgs = 'help [command]'
    this._helpCommandDescription = 'display help for command'
    this._helpConfiguration = {}
  }
  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} returns `this` for executable command
   */

  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration
    this._hasHelpOption = sourceCommand._hasHelpOption
    this._helpFlags = sourceCommand._helpFlags
    this._helpDescription = sourceCommand._helpDescription
    this._helpShortFlag = sourceCommand._helpShortFlag
    this._helpLongFlag = sourceCommand._helpLongFlag
    this._helpCommandName = sourceCommand._helpCommandName
    this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs
    this._helpCommandDescription = sourceCommand._helpCommandDescription
    this._helpConfiguration = sourceCommand._helpConfiguration
    this._exitCallback = sourceCommand._exitCallback
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties
    this._combineFlagAndOptionalValue =
      sourceCommand._combineFlagAndOptionalValue
    this._allowExcessArguments = sourceCommand._allowExcessArguments
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions
    this._showHelpAfterError = sourceCommand._showHelpAfterError
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError
    return this
  }
  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {Object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc
    let opts = execOpts

    if (typeof desc === 'object' && desc !== null) {
      opts = desc
      desc = null
    }

    opts = opts || {}
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/)
    const cmd = this.createCommand(name)

    if (desc) {
      cmd.description(desc)
      cmd._executableHandler = true
    }

    if (opts.isDefault) this._defaultCommandName = cmd._name
    cmd._hidden = !!(opts.noHelp || opts.hidden) // noHelp is deprecated old name for hidden

    cmd._executableFile = opts.executableFile || null // Custom name for executable file, set missing to null to match constructor

    if (args) cmd.arguments(args)
    this.commands.push(cmd)
    cmd.parent = this
    cmd.copyInheritedSettings(this)
    if (desc) return this
    return cmd
  }

  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */
  createCommand(name) {
    return new Command(name)
  }

  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */
  createHelp() {
    return Object.assign(new Help(), this.configureHelp())
  }

  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */
  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration
    this._helpConfiguration = configuration
    return this
  }
  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // functions to change where being written, stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // matching functions to specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // functions based on what is being written out
   *     outputError(str, write) // used for displaying errors, and not used for displaying help
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration
    Object.assign(this._outputConfiguration, configuration)
    return this
  }
  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {boolean|string} [displayHelp]
   * @return {Command} `this` command for chaining
   */

  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp
    this._showHelpAfterError = displayHelp
    return this
  }
  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */

  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion
    return this
  }
  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {Object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */

  addCommand(cmd, opts) {
    if (!cmd._name)
      throw new Error('Command passed to .addCommand() must have a name') // To keep things simple, block automatic name generation for deeply nested executables.
    // Fail fast and detect when adding rather than later when parsing.

    function checkExplicitNames(commandArray) {
      commandArray.forEach((cmd) => {
        if (cmd._executableHandler && !cmd._executableFile) {
          throw new Error(
            `Must specify executableFile for deeply nested executable: ${cmd.name()}`
          )
        }

        checkExplicitNames(cmd.commands)
      })
    }

    checkExplicitNames(cmd.commands)
    opts = opts || {}
    if (opts.isDefault) this._defaultCommandName = cmd._name
    if (opts.noHelp || opts.hidden) cmd._hidden = true // modifying passed command due to existing implementation

    this.commands.push(cmd)
    cmd.parent = this
    return this
  }

  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */
  createArgument(name, description) {
    return new Argument(name, description)
  }

  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {Function|*} [fn] - custom argument processing function
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, fn, defaultValue) {
    const argument = this.createArgument(name, description)

    if (typeof fn === 'function') {
      argument.default(defaultValue).argParser(fn)
    } else {
      argument.default(fn)
    }

    this.addArgument(argument)
    return this
  }
  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */

  arguments(names) {
    names.split(/ +/).forEach((detail) => {
      this.argument(detail)
    })
    return this
  }

  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this._args.slice(-1)[0]

    if (previousArgument && previousArgument.variadic) {
      throw new Error(
        `only the last argument can be variadic '${previousArgument.name()}'`
      )
    }

    if (
      argument.required &&
      argument.defaultValue !== undefined &&
      argument.parseArg === undefined
    ) {
      throw new Error(
        `a default value for a required argument is never used: '${argument.name()}'`
      )
    }

    this._args.push(argument)

    return this
  }
  /**
   * Override default decision whether to add implicit help command.
   *
   *    addHelpCommand() // force on
   *    addHelpCommand(false); // force off
   *    addHelpCommand('help [cmd]', 'display help for [cmd]'); // force on with custom details
   *
   * @return {Command} `this` command for chaining
   */

  addHelpCommand(enableOrNameAndArgs, description) {
    if (enableOrNameAndArgs === false) {
      this._addImplicitHelpCommand = false
    } else {
      this._addImplicitHelpCommand = true

      if (typeof enableOrNameAndArgs === 'string') {
        this._helpCommandName = enableOrNameAndArgs.split(' ')[0]
        this._helpCommandnameAndArgs = enableOrNameAndArgs
      }

      this._helpCommandDescription = description || this._helpCommandDescription
    }

    return this
  }

  /**
   * @return {boolean}
   * @api private
   */
  _hasImplicitHelpCommand() {
    if (this._addImplicitHelpCommand === undefined) {
      return (
        this.commands.length &&
        !this._actionHandler &&
        !this._findCommand('help')
      )
    }

    return this._addImplicitHelpCommand
  }

  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */
  hook(event, listener) {
    const allowedValues = ['preAction', 'postAction']

    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`)
    }

    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener)
    } else {
      this._lifeCycleHooks[event] = [listener]
    }

    return this
  }
  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn
    } else {
      this._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err
        }
      }
    }

    return this
  }

  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @api private
   */
  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError(exitCode, code, message)) // Expecting this line is not reached.
    }

    process.exit(exitCode)
  }

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('help')
   *   .description('display verbose help')
   *   .action(function() {
   *      // output help here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */
  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this._args.length
      const actionArgs = args.slice(0, expectedArgsCount)

      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts()
      }

      actionArgs.push(this)
      return fn.apply(this, actionArgs)
    }

    this._actionHandler = listener
    return this
  }

  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */
  createOption(flags, description) {
    return new Option(flags, description)
  }

  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    const oname = option.name()
    const name = option.attributeName()
    let defaultValue = option.defaultValue // preassign default value for --no-*, [optional], <required>, or plain flag if boolean value

    if (
      option.negate ||
      option.optional ||
      option.required ||
      typeof defaultValue === 'boolean'
    ) {
      // when --no-foo we make sure default is true, unless a --foo option is already defined
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, '--')
        defaultValue = this._findOption(positiveLongFlag)
          ? this.getOptionValue(name)
          : true
      } // preassign only if we have a default

      if (defaultValue !== undefined) {
        this._setOptionValueWithSource(name, defaultValue, 'default')
      }
    } // register the option

    this.options.push(option) // handler for cli and env supplied values

    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // Note: using closure to access lots of lexical scoped variables.
      const oldValue = this.getOptionValue(name) // custom processing

      if (val !== null && option.parseArg) {
        try {
          val = option.parseArg(
            val,
            oldValue === undefined ? defaultValue : oldValue
          )
        } catch (err) {
          if (err.code === 'commander.invalidArgument') {
            const message = `${invalidValueMessage} ${err.message}`

            this._displayError(err.exitCode, err.code, message)
          }

          throw err
        }
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue)
      } // unassigned or boolean value

      if (typeof oldValue === 'boolean' || typeof oldValue === 'undefined') {
        // if no value, negate false, and we have a default, then use it!
        if (val == null) {
          this._setOptionValueWithSource(
            name,
            option.negate ? false : defaultValue || true,
            valueSource
          )
        } else {
          this._setOptionValueWithSource(name, val, valueSource)
        }
      } else if (val !== null) {
        // reassign
        this._setOptionValueWithSource(
          name,
          option.negate ? false : val,
          valueSource
        )
      }
    }

    this.on('option:' + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`
      handleOptionValue(val, invalidValueMessage, 'cli')
    })

    if (option.envVar) {
      this.on('optionEnv:' + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`
        handleOptionValue(val, invalidValueMessage, 'env')
      })
    }

    return this
  }
  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @api private
   */

  _optionEx(config, flags, description, fn, defaultValue) {
    const option = this.createOption(flags, description)
    option.makeOptionMandatory(!!config.mandatory)

    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn)
    } else if (fn instanceof RegExp) {
      // deprecated
      const regex = fn

      fn = (val, def) => {
        const m = regex.exec(val)
        return m ? m[0] : def
      }

      option.default(defaultValue).argParser(fn)
    } else {
      option.default(fn)
    }

    return this.addOption(option)
  }
  /**
   * Define option with `flags`, `description` and optional
   * coercion `fn`.
   *
   * The `flags` string contains the short and/or long flags,
   * separated by comma, a pipe or space. The following are all valid
   * all will output this way when `--help` is used.
   *
   *     "-p, --pepper"
   *     "-p|--pepper"
   *     "-p --pepper"
   *
   * @example
   * // simple boolean defaulting to undefined
   * program.option('-p, --pepper', 'add pepper');
   *
   * program.pepper
   * // => undefined
   *
   * --pepper
   * program.pepper
   * // => true
   *
   * // simple boolean defaulting to true (unless non-negated option is also defined)
   * program.option('-C, --no-cheese', 'remove cheese');
   *
   * program.cheese
   * // => true
   *
   * --no-cheese
   * program.cheese
   * // => false
   *
   * // required argument
   * program.option('-C, --chdir <path>', 'change the working directory');
   *
   * --chdir /tmp
   * program.chdir
   * // => "/tmp"
   *
   * // optional argument
   * program.option('-c, --cheese [type]', 'add cheese [marble]');
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {Function|*} [fn] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  option(flags, description, fn, defaultValue) {
    return this._optionEx({}, flags, description, fn, defaultValue)
  }

  /**
   * Add a required option which must have a value after parsing. This usually means
   * the option must be specified on the command line. (Otherwise the same as .option().)
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {Function|*} [fn] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  requiredOption(flags, description, fn, defaultValue) {
    return this._optionEx(
      {
        mandatory: true
      },
      flags,
      description,
      fn,
      defaultValue
    )
  }

  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {Boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine
    return this
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {Boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
   * for unknown options.
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown
    return this
  }

  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {Boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
   * for excess arguments.
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess
    return this
  }

  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {Boolean} [positional=true]
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional
    return this
  }

  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {Boolean} [passThrough=true]
   * for unknown options.
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough

    if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
      throw new Error(
        'passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)'
      )
    }

    return this
  }

  /**
   * Whether to store option values as properties on command object,
   * or store separately (specify false). In both cases the option values can be accessed using .opts().
   *
   * @param {boolean} [storeAsProperties=true]
   * @return {Command} `this` command for chaining
   */
  storeOptionsAsProperties(storeAsProperties = true) {
    this._storeOptionsAsProperties = !!storeAsProperties

    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options')
    }

    return this
  }

  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {Object} value
   */
  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key]
    }

    return this._optionValues[key]
  }

  /**
   * Store option value.
   *
   * @param {string} key
   * @param {Object} value
   * @return {Command} `this` command for chaining
   */
  setOptionValue(key, value) {
    if (this._storeOptionsAsProperties) {
      this[key] = value
    } else {
      this._optionValues[key] = value
    }

    return this
  }

  /**
   * @api private
   */
  _setOptionValueWithSource(key, value, source) {
    this.setOptionValue(key, value)
    this._optionValueSources[key] = source
  }
  /**
   * Get user arguments implied or explicit arguments.
   * Side-effects: set _scriptPath if args included application, and use that to set implicit command name.
   *
   * @api private
   */

  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined')
    }

    parseOptions = parseOptions || {} // Default to using process.argv

    if (argv === undefined) {
      argv = process.argv // @ts-ignore: unknown property

      if (process.versions && process.versions.electron) {
        parseOptions.from = 'electron'
      }
    }

    this.rawArgs = argv.slice() // make it a little easier for callers by supporting various argv conventions

    let userArgs

    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1]
        userArgs = argv.slice(2)
        break

      case 'electron':
        // @ts-ignore: unknown property
        if (process.defaultApp) {
          this._scriptPath = argv[1]
          userArgs = argv.slice(2)
        } else {
          userArgs = argv.slice(1)
        }

        break

      case 'user':
        userArgs = argv.slice(0)
        break

      default:
        throw new Error(
          `unexpected parse option { from: '${parseOptions.from}' }`
        )
    }

    if (!this._scriptPath && require.main) {
      this._scriptPath = require.main.filename
    } // Guess name, used in usage in help.

    this._name =
      this._name ||
      (this._scriptPath &&
        path.basename(this._scriptPath, path.extname(this._scriptPath)))
    return userArgs
  }
  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * program.parse(process.argv);
   * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */

  parse(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions)

    this._parseCommand([], userArgs)

    return this
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * await program.parseAsync(process.argv);
   * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {Object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */
  async parseAsync(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions)

    await this._parseCommand([], userArgs)
    return this
  }

  /**
   * Execute a sub-command executable.
   *
   * @api private
   */
  _executeSubCommand(subcommand, args) {
    args = args.slice()
    let launchWithNode = false // Use node for source targets so do not need to get permissions correct, and on Windows.

    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'] // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.

    this._checkForMissingMandatoryOptions() // Want the entry script as the reference for command name and directory for searching for other files.

    let scriptPath = this._scriptPath // Fallback in case not set, due to how Command created or called.

    if (!scriptPath && require.main) {
      scriptPath = require.main.filename
    }

    let baseDir

    try {
      const resolvedLink = fs.realpathSync(scriptPath)
      baseDir = path.dirname(resolvedLink)
    } catch (e) {
      baseDir = '.' // dummy, probably not going to find executable!
    } // name of the subcommand, like `pm-install`

    let bin =
      path.basename(scriptPath, path.extname(scriptPath)) +
      '-' +
      subcommand._name

    if (subcommand._executableFile) {
      bin = subcommand._executableFile
    }

    const localBin = path.join(baseDir, bin)

    if (fs.existsSync(localBin)) {
      // prefer local `./<bin>` to bin in the $PATH
      bin = localBin
    } else {
      // Look for source files.
      sourceExt.forEach((ext) => {
        if (fs.existsSync(`${localBin}${ext}`)) {
          bin = `${localBin}${ext}`
        }
      })
    }

    launchWithNode = sourceExt.includes(path.extname(bin))
    let proc

    if (process.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(bin) // add executable arguments to spawn

        args = incrementNodeInspectorPort(process.execArgv).concat(args)
        proc = childProcess.spawn(process.argv[0], args, {
          stdio: 'inherit'
        })
      } else {
        proc = childProcess.spawn(bin, args, {
          stdio: 'inherit'
        })
      }
    } else {
      args.unshift(bin) // add executable arguments to spawn

      args = incrementNodeInspectorPort(process.execArgv).concat(args)
      proc = childProcess.spawn(process.execPath, args, {
        stdio: 'inherit'
      })
    }

    const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP']
    signals.forEach((signal) => {
      // @ts-ignore
      process.on(signal, () => {
        if (proc.killed === false && proc.exitCode === null) {
          proc.kill(signal)
        }
      })
    }) // By default terminate process when spawned process terminates.
    // Suppressing the exit if exitCallback defined is a bit messy and of limited use, but does allow process to stay running!

    const exitCallback = this._exitCallback

    if (!exitCallback) {
      proc.on('close', process.exit.bind(process))
    } else {
      proc.on('close', () => {
        exitCallback(
          new CommanderError(
            process.exitCode || 0,
            'commander.executeSubCommandAsync',
            '(close)'
          )
        )
      })
    }

    proc.on('error', (err) => {
      // @ts-ignore
      if (err.code === 'ENOENT') {
        const executableMissing = `'${bin}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name`
        throw new Error(executableMissing) // @ts-ignore
      } else if (err.code === 'EACCES') {
        throw new Error(`'${bin}' not executable`)
      }

      if (!exitCallback) {
        process.exit(1)
      } else {
        const wrappedError = new CommanderError(
          1,
          'commander.executeSubCommandAsync',
          '(error)'
        )
        wrappedError.nestedError = err
        exitCallback(wrappedError)
      }
    }) // Store the reference to the child process

    this.runningCommand = proc
  }

  /**
   * @api private
   */
  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName)

    if (!subCommand)
      this.help({
        error: true
      })

    if (subCommand._executableHandler) {
      this._executeSubCommand(subCommand, operands.concat(unknown))
    } else {
      return subCommand._parseCommand(operands, unknown)
    }
  }

  /**
   * Check this.args against expected this._args.
   *
   * @api private
   */
  _checkNumberOfArguments() {
    // too few
    this._args.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name())
      }
    }) // too many

    if (this._args.length > 0 && this._args[this._args.length - 1].variadic) {
      return
    }

    if (this.args.length > this._args.length) {
      this._excessArguments(this.args)
    }
  }

  /**
   * Process this.args using this._args and save as this.processedArgs!
   *
   * @api private
   */
  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      // Extra processing for nice error message on parsing failure.
      let parsedValue = value

      if (value !== null && argument.parseArg) {
        try {
          parsedValue = argument.parseArg(value, previous)
        } catch (err) {
          if (err.code === 'commander.invalidArgument') {
            const message = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'. ${
              err.message
            }`

            this._displayError(err.exitCode, err.code, message)
          }

          throw err
        }
      }

      return parsedValue
    }

    this._checkNumberOfArguments()

    const processedArgs = []

    this._args.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue

      if (declaredArg.variadic) {
        // Collect together remaining arguments for passing together as an array.
        if (index < this.args.length) {
          value = this.args.slice(index)

          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed)
            }, declaredArg.defaultValue)
          }
        } else if (value === undefined) {
          value = []
        }
      } else if (index < this.args.length) {
        value = this.args[index]

        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue)
        }
      }

      processedArgs[index] = value
    })

    this.processedArgs = processedArgs
  }
  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {Promise|undefined} promise
   * @param {Function} fn
   * @return {Promise|undefined}
   */

  _chainOrCall(promise, fn) {
    // thenable
    if (promise && promise.then && typeof promise.then === 'function') {
      // already have a promise, chain callback
      return promise.then(() => fn())
    } // callback might return a promise

    return fn()
  }
  /**
   *
   * @param {Promise|undefined} promise
   * @param {string} event
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCallHooks(promise, event) {
    let result = promise
    const hooks = []
    getCommandAndParents(this)
      .reverse()
      .filter((cmd) => cmd._lifeCycleHooks[event] !== undefined)
      .forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({
            hookedCommand,
            callback
          })
        })
      })

    if (event === 'postAction') {
      hooks.reverse()
    }

    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this)
      })
    })
    return result
  }
  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @api private
   */

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown)

    this._parseOptionsEnv() // after cli, so parseArg not called on both cli and env

    operands = operands.concat(parsed.operands)
    unknown = parsed.unknown
    this.args = operands.concat(unknown)

    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown)
    }

    if (
      this._hasImplicitHelpCommand() &&
      operands[0] === this._helpCommandName
    ) {
      if (operands.length === 1) {
        this.help()
      }

      return this._dispatchSubcommand(operands[1], [], [this._helpLongFlag])
    }

    if (this._defaultCommandName) {
      outputHelpIfRequested(this, unknown) // Run the help for default command from parent rather than passing to default command

      return this._dispatchSubcommand(
        this._defaultCommandName,
        operands,
        unknown
      )
    }

    if (
      this.commands.length &&
      this.args.length === 0 &&
      !this._actionHandler &&
      !this._defaultCommandName
    ) {
      // probably missing subcommand and no handler, user needs help (and exit)
      this.help({
        error: true
      })
    }

    outputHelpIfRequested(this, parsed.unknown)

    this._checkForMissingMandatoryOptions() // We do not always call this check to avoid masking a "better" error, like unknown command.

    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0])
      }
    }

    const commandEvent = `command:${this.name()}`

    if (this._actionHandler) {
      checkForUnknownOptions()

      this._processArguments()

      let actionResult
      actionResult = this._chainOrCallHooks(actionResult, 'preAction')
      actionResult = this._chainOrCall(actionResult, () =>
        this._actionHandler(this.processedArgs)
      )
      if (this.parent) this.parent.emit(commandEvent, operands, unknown) // legacy

      actionResult = this._chainOrCallHooks(actionResult, 'postAction')
      return actionResult
    }

    if (this.parent && this.parent.listenerCount(commandEvent)) {
      checkForUnknownOptions()

      this._processArguments()

      this.parent.emit(commandEvent, operands, unknown) // legacy
    } else if (operands.length) {
      if (this._findCommand('*')) {
        // legacy default command
        return this._dispatchSubcommand('*', operands, unknown)
      }

      if (this.listenerCount('command:*')) {
        // skip option check, emit event for possible misspelling suggestion
        this.emit('command:*', operands, unknown)
      } else if (this.commands.length) {
        this.unknownCommand()
      } else {
        checkForUnknownOptions()

        this._processArguments()
      }
    } else if (this.commands.length) {
      checkForUnknownOptions() // This command has subcommands and nothing hooked up at this level, so display help (and exit).

      this.help({
        error: true
      })
    } else {
      checkForUnknownOptions()

      this._processArguments() // fall through for caller to handle after calling .parse()
    }
  }

  /**
   * Find matching command.
   *
   * @api private
   */
  _findCommand(name) {
    if (!name) return undefined
    return this.commands.find(
      (cmd) => cmd._name === name || cmd._aliases.includes(name)
    )
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @api private
   */
  _findOption(arg) {
    return this.options.find((option) => option.is(arg))
  }

  /**
   * Display an error message if a mandatory option does not have a value.
   * Lazy calling after checking for help flags from leaf subcommand.
   *
   * @api private
   */
  _checkForMissingMandatoryOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    for (let cmd = this; cmd; cmd = cmd.parent) {
      cmd.options.forEach((anOption) => {
        if (
          anOption.mandatory &&
          cmd.getOptionValue(anOption.attributeName()) === undefined
        ) {
          cmd.missingMandatoryOptionValue(anOption)
        }
      })
    }
  }

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {String[]} argv
   * @return {{operands: String[], unknown: String[]}}
   */
  parseOptions(argv) {
    const operands = [] // operands, not options or values

    const unknown = [] // first unknown option and remaining unknown args

    let dest = operands
    const args = argv.slice()

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-'
    } // parse options

    let activeVariadicOption = null

    while (args.length) {
      const arg = args.shift() // literal

      if (arg === '--') {
        if (dest === unknown) dest.push(arg)
        dest.push(...args)
        break
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg)
        continue
      }

      activeVariadicOption = null

      if (maybeOption(arg)) {
        const option = this._findOption(arg) // recognised option, call listener to assign value with possible custom processing

        if (option) {
          if (option.required) {
            const value = args.shift()
            if (value === undefined) this.optionMissingArgument(option)
            this.emit(`option:${option.name()}`, value)
          } else if (option.optional) {
            let value = null // historical behaviour is optional value is following arg unless an option

            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift()
            }

            this.emit(`option:${option.name()}`, value)
          } else {
            // boolean flag
            this.emit(`option:${option.name()}`)
          }

          activeVariadicOption = option.variadic ? option : null
          continue
        }
      } // Look for combo options following single dash, eat first one if known.

      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`)

        if (option) {
          if (
            option.required ||
            (option.optional && this._combineFlagAndOptionalValue)
          ) {
            // option with value following in same argument
            this.emit(`option:${option.name()}`, arg.slice(2))
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${option.name()}`)
            args.unshift(`-${arg.slice(2)}`)
          }

          continue
        }
      } // Look for known long flag with value, like --foo=bar

      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=')

        const option = this._findOption(arg.slice(0, index))

        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1))
          continue
        }
      } // Not a recognised option by this command.
      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.
      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.

      if (maybeOption(arg)) {
        dest = unknown
      } // If using positionalOptions, stop processing our options at subcommand.

      if (
        (this._enablePositionalOptions || this._passThroughOptions) &&
        operands.length === 0 &&
        unknown.length === 0
      ) {
        if (this._findCommand(arg)) {
          operands.push(arg)
          if (args.length > 0) unknown.push(...args)
          break
        } else if (
          arg === this._helpCommandName &&
          this._hasImplicitHelpCommand()
        ) {
          operands.push(arg)
          if (args.length > 0) operands.push(...args)
          break
        } else if (this._defaultCommandName) {
          unknown.push(arg)
          if (args.length > 0) unknown.push(...args)
          break
        }
      } // If using passThroughOptions, stop processing options at first command-argument.

      if (this._passThroughOptions) {
        dest.push(arg)
        if (args.length > 0) dest.push(...args)
        break
      } // add arg

      dest.push(arg)
    }

    return {
      operands,
      unknown
    }
  }

  /**
   * Return an object containing options as key-value pairs
   *
   * @return {Object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {}
      const len = this.options.length

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName()
        result[key] =
          key === this._versionOptionName ? this._version : this[key]
      }

      return result
    }

    return this._optionValues
  }

  /**
   * Internal bottleneck for handling of parsing errors.
   *
   * @api private
   */
  _displayError(exitCode, code, message) {
    this._outputConfiguration.outputError(
      `${message}\n`,
      this._outputConfiguration.writeErr
    )

    if (typeof this._showHelpAfterError === 'string') {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`)
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr('\n')

      this.outputHelp({
        error: true
      })
    }

    this._exit(exitCode, code, message)
  }
  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @api private
   */

  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process.env) {
        const optionKey = option.attributeName() // env is second lowest priority source, above default

        if (
          this.getOptionValue(optionKey) === undefined ||
          this._optionValueSources[optionKey] === 'default'
        ) {
          if (option.required || option.optional) {
            // option can take a value
            // keep very simple, optional always takes value
            this.emit(`optionEnv:${option.name()}`, process.env[option.envVar])
          } else {
            // boolean
            // keep very simple, only care that envVar defined and not the value
            this.emit(`optionEnv:${option.name()}`)
          }
        }
      }
    })
  }
  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @api private
   */

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`

    this._displayError(1, 'commander.missingArgument', message)
  }

  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @api private
   */
  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`

    this._displayError(1, 'commander.optionMissingArgument', message)
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @api private
   */
  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`

    this._displayError(1, 'commander.missingMandatoryOptionValue', message)
  }

  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @api private
   */
  unknownOption(flag) {
    if (this._allowUnknownOption) return
    let suggestion = ''

    if (flag.startsWith('--') && this._showSuggestionAfterError) {
      // Looping to pick up the global options too
      let candidateFlags = []
      let command = this

      do {
        const moreFlags = command
          .createHelp()
          .visibleOptions(command)
          .filter((option) => option.long)
          .map((option) => option.long)
        candidateFlags = candidateFlags.concat(moreFlags)
        command = command.parent
      } while (command && !command._enablePositionalOptions)

      suggestion = suggestSimilar(flag, candidateFlags)
    }

    const message = `error: unknown option '${flag}'${suggestion}`

    this._displayError(1, 'commander.unknownOption', message)
  }

  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @api private
   */
  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return
    const expected = this._args.length
    const s = expected === 1 ? '' : 's'
    const forSubcommand = this.parent ? ` for '${this.name()}'` : ''
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`

    this._displayError(1, 'commander.excessArguments', message)
  }

  /**
   * Unknown command.
   *
   * @api private
   */
  unknownCommand() {
    const unknownName = this.args[0]
    let suggestion = ''

    if (this._showSuggestionAfterError) {
      const candidateNames = []
      this.createHelp()
        .visibleCommands(this)
        .forEach((command) => {
          candidateNames.push(command.name()) // just visible alias

          if (command.alias()) candidateNames.push(command.alias())
        })
      suggestion = suggestSimilar(unknownName, candidateNames)
    }

    const message = `error: unknown command '${unknownName}'${suggestion}`

    this._displayError(1, 'commander.unknownCommand', message)
  }

  /**
   * Set the program version to `str`.
   *
   * This method auto-registers the "-V, --version" flag
   * which will print the version number when passed.
   *
   * You can optionally supply the  flags and description to override the defaults.
   *
   * @param {string} str
   * @param {string} [flags]
   * @param {string} [description]
   * @return {this | string} `this` command for chaining, or version string if no arguments
   */
  version(str, flags, description) {
    if (str === undefined) return this._version
    this._version = str
    flags = flags || '-V, --version'
    description = description || 'output the version number'
    const versionOption = this.createOption(flags, description)
    this._versionOptionName = versionOption.attributeName()
    this.options.push(versionOption)
    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`)

      this._exit(0, 'commander.version', str)
    })
    return this
  }

  /**
   * Set the description to `str`.
   *
   * @param {string} [str]
   * @param {Object} [argsDescription]
   * @return {string|Command}
   */
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined)
      return this._description
    this._description = str

    if (argsDescription) {
      this._argsDescription = argsDescription
    }

    return this
  }

  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {string|Command}
   */
  alias(alias) {
    if (alias === undefined) return this._aliases[0] // just return first, for backwards compatibility

    /** @type {Command} */

    let command = this

    if (
      this.commands.length !== 0 &&
      this.commands[this.commands.length - 1]._executableHandler
    ) {
      // assume adding alias for last added executable subcommand, rather than this
      command = this.commands[this.commands.length - 1]
    }

    if (alias === command._name)
      throw new Error("Command alias can't be the same as its name")

    command._aliases.push(alias)

    return this
  }

  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {string[]|Command}
   */
  aliases(aliases) {
    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
    if (aliases === undefined) return this._aliases
    aliases.forEach((alias) => this.alias(alias))
    return this
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {String|Command}
   */
  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage

      const args = this._args.map((arg) => {
        return humanReadableArgName(arg)
      })

      return []
        .concat(
          this.options.length || this._hasHelpOption ? '[options]' : [],
          this.commands.length ? '[command]' : [],
          this._args.length ? args : []
        )
        .join(' ')
    }

    this._usage = str
    return this
  }

  /**
   * Get or set the name of the command
   *
   * @param {string} [str]
   * @return {string|Command}
   */
  name(str) {
    if (str === undefined) return this._name
    this._name = str
    return this
  }

  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */
  helpInformation(contextOptions) {
    const helper = this.createHelp()

    if (helper.helpWidth === undefined) {
      helper.helpWidth =
        contextOptions && contextOptions.error
          ? this._outputConfiguration.getErrHelpWidth()
          : this._outputConfiguration.getOutHelpWidth()
    }

    return helper.formatHelp(this, helper)
  }

  /**
   * @api private
   */
  _getHelpContext(contextOptions) {
    contextOptions = contextOptions || {}
    const context = {
      error: !!contextOptions.error
    }
    let write

    if (context.error) {
      write = (arg) => this._outputConfiguration.writeErr(arg)
    } else {
      write = (arg) => this._outputConfiguration.writeOut(arg)
    }

    context.write = contextOptions.write || write
    context.command = this
    return context
  }
  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  outputHelp(contextOptions) {
    let deprecatedCallback

    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions
      contextOptions = undefined
    }

    const context = this._getHelpContext(contextOptions)

    getCommandAndParents(this)
      .reverse()
      .forEach((command) => command.emit('beforeAllHelp', context))
    this.emit('beforeHelp', context)
    let helpInformation = this.helpInformation(context)

    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation)

      if (
        typeof helpInformation !== 'string' &&
        !Buffer.isBuffer(helpInformation)
      ) {
        throw new Error('outputHelp callback must return a string or a Buffer')
      }
    }

    context.write(helpInformation)
    this.emit(this._helpLongFlag) // deprecated

    this.emit('afterHelp', context)
    getCommandAndParents(this).forEach((command) =>
      command.emit('afterAllHelp', context)
    )
  }

  /**
   * You can pass in flags and a description to override the help
   * flags and help description for your command. Pass in false to
   * disable the built-in help option.
   *
   * @param {string | boolean} [flags]
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */
  helpOption(flags, description) {
    if (typeof flags === 'boolean') {
      this._hasHelpOption = flags
      return this
    }

    this._helpFlags = flags || this._helpFlags
    this._helpDescription = description || this._helpDescription
    const helpFlags = splitOptionFlags(this._helpFlags)
    this._helpShortFlag = helpFlags.shortFlag
    this._helpLongFlag = helpFlags.longFlag
    return this
  }

  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */
  help(contextOptions) {
    this.outputHelp(contextOptions)
    let exitCode = process.exitCode || 0

    if (
      exitCode === 0 &&
      contextOptions &&
      typeof contextOptions !== 'function' &&
      contextOptions.error
    ) {
      exitCode = 1
    } // message: do not have all displayed text available so only passing placeholder.

    this._exit(exitCode, 'commander.help', '(outputHelp)')
  }

  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {string | Function} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll']

    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`)
    }

    const helpEvent = `${position}Help`
    this.on(helpEvent, (context) => {
      let helpStr

      if (typeof text === 'function') {
        helpStr = text({
          error: context.error,
          command: context.command
        })
      } else {
        helpStr = text
      } // Ignore falsy value when nothing to output.

      if (helpStr) {
        context.write(`${helpStr}\n`)
      }
    })
    return this
  }
}
/**
 * Output help information if help flags specified
 *
 * @param {Command} cmd - command to output help for
 * @param {Array} args - array of options to search for help flags
 * @api private
 */

function outputHelpIfRequested(cmd, args) {
  const helpOption =
    cmd._hasHelpOption &&
    args.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag)

  if (helpOption) {
    cmd.outputHelp() // (Do not have all displayed text available so only passing placeholder.)

    cmd._exit(0, 'commander.helpDisplayed', '(outputHelp)')
  }
}
/**
 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
 *
 * @param {string[]} args - array of arguments from node.execArgv
 * @returns {string[]}
 * @api private
 */

function incrementNodeInspectorPort(args) {
  // Testing for these options:
  //  --inspect[=[host:]port]
  //  --inspect-brk[=[host:]port]
  //  --inspect-port=[host:]port
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg
    }

    let debugOption
    let debugHost = '127.0.0.1'
    let debugPort = '9229'
    let match

    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      // e.g. --inspect
      debugOption = match[1]
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null
    ) {
      debugOption = match[1]

      if (/^\d+$/.test(match[3])) {
        // e.g. --inspect=1234
        debugPort = match[3]
      } else {
        // e.g. --inspect=localhost
        debugHost = match[3]
      }
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null
    ) {
      // e.g. --inspect=localhost:1234
      debugOption = match[1]
      debugHost = match[3]
      debugPort = match[4]
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`
    }

    return arg
  })
}
/**
 * @param {Command} startCommand
 * @returns {Command[]}
 * @api private
 */

function getCommandAndParents(startCommand) {
  const result = []

  for (let command = startCommand; command; command = command.parent) {
    result.push(command)
  }

  return result
}

command.Command = Command

;(function (module, exports) {
  const { Argument } = argument

  const { Command } = command

  const { CommanderError, InvalidArgumentError } = error

  const { Help } = help

  const { Option } = option // @ts-check

  /**
   * Expose the root command.
   */

  exports = module.exports = new Command()
  exports.program = exports // More explicit access to global command.
  // Implicit export of createArgument, createCommand, and createOption.

  /**
   * Expose classes
   */

  exports.Argument = Argument
  exports.Command = Command
  exports.CommanderError = CommanderError
  exports.Help = Help
  exports.InvalidArgumentError = InvalidArgumentError
  exports.InvalidOptionArgumentError = InvalidArgumentError // Deprecated

  exports.Option = Option
})(commander, commander.exports)

var numeral$1 = { exports: {} }

/*! @preserve
 * numeral.js
 * version : 2.0.6
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

;(function (module) {
  ;(function (global, factory) {
    if (module.exports) {
      module.exports = factory()
    } else {
      global.numeral = factory()
    }
  })(commonjsGlobal, function () {
    /************************************
      Variables
  ************************************/
    var numeral,
      _,
      VERSION = '2.0.6',
      formats = {},
      locales = {},
      defaults = {
        currentLocale: 'en',
        zeroFormat: null,
        nullFormat: null,
        defaultFormat: '0,0',
        scalePercentBy100: true
      },
      options = {
        currentLocale: defaults.currentLocale,
        zeroFormat: defaults.zeroFormat,
        nullFormat: defaults.nullFormat,
        defaultFormat: defaults.defaultFormat,
        scalePercentBy100: defaults.scalePercentBy100
      }
    /************************************
      Constructors
  ************************************/
    // Numeral prototype object

    function Numeral(input, number) {
      this._input = input
      this._value = number
    }

    numeral = function (input) {
      var value, kind, unformatFunction, regexp

      if (numeral.isNumeral(input)) {
        value = input.value()
      } else if (input === 0 || typeof input === 'undefined') {
        value = 0
      } else if (input === null || _.isNaN(input)) {
        value = null
      } else if (typeof input === 'string') {
        if (options.zeroFormat && input === options.zeroFormat) {
          value = 0
        } else if (
          (options.nullFormat && input === options.nullFormat) ||
          !input.replace(/[^0-9]+/g, '').length
        ) {
          value = null
        } else {
          for (kind in formats) {
            regexp =
              typeof formats[kind].regexps.unformat === 'function'
                ? formats[kind].regexps.unformat()
                : formats[kind].regexps.unformat

            if (regexp && input.match(regexp)) {
              unformatFunction = formats[kind].unformat
              break
            }
          }

          unformatFunction = unformatFunction || numeral._.stringToNumber
          value = unformatFunction(input)
        }
      } else {
        value = Number(input) || null
      }

      return new Numeral(input, value)
    } // version number

    numeral.version = VERSION // compare numeral object

    numeral.isNumeral = function (obj) {
      return obj instanceof Numeral
    } // helper functions

    numeral._ = _ = {
      // formats numbers separators, decimals places, signs, abbreviations
      numberToFormat: function (value, format, roundingFunction) {
        var locale = locales[numeral.options.currentLocale],
          negP = false,
          optDec = false,
          leadingCount = 0,
          abbr = '',
          trillion = 1000000000000,
          billion = 1000000000,
          million = 1000000,
          thousand = 1000,
          decimal = '',
          neg = false,
          abbrForce,
          // force abbreviation
          abs,
          int,
          precision,
          signed,
          thousands,
          output // make sure we never format a null value

        value = value || 0
        abs = Math.abs(value) // see if we should use parentheses for negative number or if we should prefix with a sign
        // if both are present we default to parentheses

        if (numeral._.includes(format, '(')) {
          negP = true
          format = format.replace(/[\(|\)]/g, '')
        } else if (
          numeral._.includes(format, '+') ||
          numeral._.includes(format, '-')
        ) {
          signed = numeral._.includes(format, '+')
            ? format.indexOf('+')
            : value < 0
            ? format.indexOf('-')
            : -1
          format = format.replace(/[\+|\-]/g, '')
        } // see if abbreviation is wanted

        if (numeral._.includes(format, 'a')) {
          abbrForce = format.match(/a(k|m|b|t)?/)
          abbrForce = abbrForce ? abbrForce[1] : false // check for space before abbreviation

          if (numeral._.includes(format, ' a')) {
            abbr = ' '
          }

          format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '')

          if ((abs >= trillion && !abbrForce) || abbrForce === 't') {
            // trillion
            abbr += locale.abbreviations.trillion
            value = value / trillion
          } else if (
            (abs < trillion && abs >= billion && !abbrForce) ||
            abbrForce === 'b'
          ) {
            // billion
            abbr += locale.abbreviations.billion
            value = value / billion
          } else if (
            (abs < billion && abs >= million && !abbrForce) ||
            abbrForce === 'm'
          ) {
            // million
            abbr += locale.abbreviations.million
            value = value / million
          } else if (
            (abs < million && abs >= thousand && !abbrForce) ||
            abbrForce === 'k'
          ) {
            // thousand
            abbr += locale.abbreviations.thousand
            value = value / thousand
          }
        } // check for optional decimals

        if (numeral._.includes(format, '[.]')) {
          optDec = true
          format = format.replace('[.]', '.')
        } // break number and format

        int = value.toString().split('.')[0]
        precision = format.split('.')[1]
        thousands = format.indexOf(',')
        leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || [])
          .length

        if (precision) {
          if (numeral._.includes(precision, '[')) {
            precision = precision.replace(']', '')
            precision = precision.split('[')
            decimal = numeral._.toFixed(
              value,
              precision[0].length + precision[1].length,
              roundingFunction,
              precision[1].length
            )
          } else {
            decimal = numeral._.toFixed(
              value,
              precision.length,
              roundingFunction
            )
          }

          int = decimal.split('.')[0]

          if (numeral._.includes(decimal, '.')) {
            decimal = locale.delimiters.decimal + decimal.split('.')[1]
          } else {
            decimal = ''
          }

          if (optDec && Number(decimal.slice(1)) === 0) {
            decimal = ''
          }
        } else {
          int = numeral._.toFixed(value, 0, roundingFunction)
        } // check abbreviation again after rounding

        if (
          abbr &&
          !abbrForce &&
          Number(int) >= 1000 &&
          abbr !== locale.abbreviations.trillion
        ) {
          int = String(Number(int) / 1000)

          switch (abbr) {
            case locale.abbreviations.thousand:
              abbr = locale.abbreviations.million
              break

            case locale.abbreviations.million:
              abbr = locale.abbreviations.billion
              break

            case locale.abbreviations.billion:
              abbr = locale.abbreviations.trillion
              break
          }
        } // format number

        if (numeral._.includes(int, '-')) {
          int = int.slice(1)
          neg = true
        }

        if (int.length < leadingCount) {
          for (var i = leadingCount - int.length; i > 0; i--) {
            int = '0' + int
          }
        }

        if (thousands > -1) {
          int = int
            .toString()
            .replace(
              /(\d)(?=(\d{3})+(?!\d))/g,
              '$1' + locale.delimiters.thousands
            )
        }

        if (format.indexOf('.') === 0) {
          int = ''
        }

        output = int + decimal + (abbr ? abbr : '')

        if (negP) {
          output = (negP && neg ? '(' : '') + output + (negP && neg ? ')' : '')
        } else {
          if (signed >= 0) {
            output =
              signed === 0
                ? (neg ? '-' : '+') + output
                : output + (neg ? '-' : '+')
          } else if (neg) {
            output = '-' + output
          }
        }

        return output
      },
      // unformats numbers separators, decimals places, signs, abbreviations
      stringToNumber: function (string) {
        var locale = locales[options.currentLocale],
          stringOriginal = string,
          abbreviations = {
            thousand: 3,
            million: 6,
            billion: 9,
            trillion: 12
          },
          abbreviation,
          value,
          regexp

        if (options.zeroFormat && string === options.zeroFormat) {
          value = 0
        } else if (
          (options.nullFormat && string === options.nullFormat) ||
          !string.replace(/[^0-9]+/g, '').length
        ) {
          value = null
        } else {
          value = 1

          if (locale.delimiters.decimal !== '.') {
            string = string
              .replace(/\./g, '')
              .replace(locale.delimiters.decimal, '.')
          }

          for (abbreviation in abbreviations) {
            regexp = new RegExp(
              '[^a-zA-Z]' +
                locale.abbreviations[abbreviation] +
                '(?:\\)|(\\' +
                locale.currency.symbol +
                ')?(?:\\))?)?$'
            )

            if (stringOriginal.match(regexp)) {
              value *= Math.pow(10, abbreviations[abbreviation])
              break
            }
          } // check for negative number

          value *=
            (string.split('-').length +
              Math.min(
                string.split('(').length - 1,
                string.split(')').length - 1
              )) %
            2
              ? 1
              : -1 // remove non numbers

          string = string.replace(/[^0-9\.]+/g, '')
          value *= Number(string)
        }

        return value
      },
      isNaN: function (value) {
        return typeof value === 'number' && isNaN(value)
      },
      includes: function (string, search) {
        return string.indexOf(search) !== -1
      },
      insert: function (string, subString, start) {
        return string.slice(0, start) + subString + string.slice(start)
      },
      reduce: function (
        array,
        callback
        /*, initialValue*/
      ) {
        if (this === null) {
          throw new TypeError(
            'Array.prototype.reduce called on null or undefined'
          )
        }

        if (typeof callback !== 'function') {
          throw new TypeError(callback + ' is not a function')
        }

        var t = Object(array),
          len = t.length >>> 0,
          k = 0,
          value

        if (arguments.length === 3) {
          value = arguments[2]
        } else {
          while (k < len && !(k in t)) {
            k++
          }

          if (k >= len) {
            throw new TypeError('Reduce of empty array with no initial value')
          }

          value = t[k++]
        }

        for (; k < len; k++) {
          if (k in t) {
            value = callback(value, t[k], k, t)
          }
        }

        return value
      },

      /**
       * Computes the multiplier necessary to make x >= 1,
       * effectively eliminating miscalculations caused by
       * finite precision.
       */
      multiplier: function (x) {
        var parts = x.toString().split('.')
        return parts.length < 2 ? 1 : Math.pow(10, parts[1].length)
      },

      /**
       * Given a variable number of arguments, returns the maximum
       * multiplier that must be used to normalize an operation involving
       * all of them.
       */
      correctionFactor: function () {
        var args = Array.prototype.slice.call(arguments)
        return args.reduce(function (accum, next) {
          var mn = _.multiplier(next)

          return accum > mn ? accum : mn
        }, 1)
      },

      /**
       * Implementation of toFixed() that treats floats more like decimals
       *
       * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
       * problems for accounting- and finance-related software.
       */
      toFixed: function (value, maxDecimals, roundingFunction, optionals) {
        var splitValue = value.toString().split('.'),
          minDecimals = maxDecimals - (optionals || 0),
          boundedPrecision,
          optionalsRegExp,
          power,
          output // Use the smallest precision value possible to avoid errors from floating point representation

        if (splitValue.length === 2) {
          boundedPrecision = Math.min(
            Math.max(splitValue[1].length, minDecimals),
            maxDecimals
          )
        } else {
          boundedPrecision = minDecimals
        }

        power = Math.pow(10, boundedPrecision) // Multiply up by precision, round accurately, then divide and use native toFixed():

        output = (
          roundingFunction(value + 'e+' + boundedPrecision) / power
        ).toFixed(boundedPrecision)

        if (optionals > maxDecimals - boundedPrecision) {
          optionalsRegExp = new RegExp(
            '\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$'
          )
          output = output.replace(optionalsRegExp, '')
        }

        return output
      }
    } // avaliable options

    numeral.options = options // avaliable formats

    numeral.formats = formats // avaliable formats

    numeral.locales = locales // This function sets the current locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.

    numeral.locale = function (key) {
      if (key) {
        options.currentLocale = key.toLowerCase()
      }

      return options.currentLocale
    } // This function provides access to the loaded locale data.  If
    // no arguments are passed in, it will simply return the current
    // global locale object.

    numeral.localeData = function (key) {
      if (!key) {
        return locales[options.currentLocale]
      }

      key = key.toLowerCase()

      if (!locales[key]) {
        throw new Error('Unknown locale : ' + key)
      }

      return locales[key]
    }

    numeral.reset = function () {
      for (var property in defaults) {
        options[property] = defaults[property]
      }
    }

    numeral.zeroFormat = function (format) {
      options.zeroFormat = typeof format === 'string' ? format : null
    }

    numeral.nullFormat = function (format) {
      options.nullFormat = typeof format === 'string' ? format : null
    }

    numeral.defaultFormat = function (format) {
      options.defaultFormat = typeof format === 'string' ? format : '0.0'
    }

    numeral.register = function (type, name, format) {
      name = name.toLowerCase()

      if (this[type + 's'][name]) {
        throw new TypeError(name + ' ' + type + ' already registered.')
      }

      this[type + 's'][name] = format
      return format
    }

    numeral.validate = function (val, culture) {
      var _decimalSep,
        _thousandSep,
        _currSymbol,
        _valArray,
        _abbrObj,
        _thousandRegEx,
        localeData,
        temp //coerce val to string

      if (typeof val !== 'string') {
        val += ''

        if (console.warn) {
          console.warn(
            'Numeral.js: Value is not string. It has been co-erced to: ',
            val
          )
        }
      } //trim whitespaces from either sides

      val = val.trim() //if val is just digits return true

      if (!!val.match(/^\d+$/)) {
        return true
      } //if val is empty return false

      if (val === '') {
        return false
      } //get the decimal and thousands separator from numeral.localeData

      try {
        //check if the culture is understood by numeral. if not, default it to current locale
        localeData = numeral.localeData(culture)
      } catch (e) {
        localeData = numeral.localeData(numeral.locale())
      } //setup the delimiters and currency symbol based on culture/locale

      _currSymbol = localeData.currency.symbol
      _abbrObj = localeData.abbreviations
      _decimalSep = localeData.delimiters.decimal

      if (localeData.delimiters.thousands === '.') {
        _thousandSep = '\\.'
      } else {
        _thousandSep = localeData.delimiters.thousands
      } // validating currency symbol

      temp = val.match(/^[^\d]+/)

      if (temp !== null) {
        val = val.substr(1)

        if (temp[0] !== _currSymbol) {
          return false
        }
      } //validating abbreviation symbol

      temp = val.match(/[^\d]+$/)

      if (temp !== null) {
        val = val.slice(0, -1)

        if (
          temp[0] !== _abbrObj.thousand &&
          temp[0] !== _abbrObj.million &&
          temp[0] !== _abbrObj.billion &&
          temp[0] !== _abbrObj.trillion
        ) {
          return false
        }
      }

      _thousandRegEx = new RegExp(_thousandSep + '{2}')

      if (!val.match(/[^\d.,]/g)) {
        _valArray = val.split(_decimalSep)

        if (_valArray.length > 2) {
          return false
        } else {
          if (_valArray.length < 2) {
            return (
              !!_valArray[0].match(/^\d+.*\d$/) &&
              !_valArray[0].match(_thousandRegEx)
            )
          } else {
            if (_valArray[0].length === 1) {
              return (
                !!_valArray[0].match(/^\d+$/) &&
                !_valArray[0].match(_thousandRegEx) &&
                !!_valArray[1].match(/^\d+$/)
              )
            } else {
              return (
                !!_valArray[0].match(/^\d+.*\d$/) &&
                !_valArray[0].match(_thousandRegEx) &&
                !!_valArray[1].match(/^\d+$/)
              )
            }
          }
        }
      }

      return false
    }
    /************************************
      Numeral Prototype
  ************************************/

    numeral.fn = Numeral.prototype = {
      clone: function () {
        return numeral(this)
      },
      format: function (inputString, roundingFunction) {
        var value = this._value,
          format = inputString || options.defaultFormat,
          kind,
          output,
          formatFunction // make sure we have a roundingFunction

        roundingFunction = roundingFunction || Math.round // format based on value

        if (value === 0 && options.zeroFormat !== null) {
          output = options.zeroFormat
        } else if (value === null && options.nullFormat !== null) {
          output = options.nullFormat
        } else {
          for (kind in formats) {
            if (format.match(formats[kind].regexps.format)) {
              formatFunction = formats[kind].format
              break
            }
          }

          formatFunction = formatFunction || numeral._.numberToFormat
          output = formatFunction(value, format, roundingFunction)
        }

        return output
      },
      value: function () {
        return this._value
      },
      input: function () {
        return this._input
      },
      set: function (value) {
        this._value = Number(value)
        return this
      },
      add: function (value) {
        var corrFactor = _.correctionFactor.call(null, this._value, value)

        function cback(accum, curr, currI, O) {
          return accum + Math.round(corrFactor * curr)
        }

        this._value = _.reduce([this._value, value], cback, 0) / corrFactor
        return this
      },
      subtract: function (value) {
        var corrFactor = _.correctionFactor.call(null, this._value, value)

        function cback(accum, curr, currI, O) {
          return accum - Math.round(corrFactor * curr)
        }

        this._value =
          _.reduce([value], cback, Math.round(this._value * corrFactor)) /
          corrFactor
        return this
      },
      multiply: function (value) {
        function cback(accum, curr, currI, O) {
          var corrFactor = _.correctionFactor(accum, curr)

          return (
            (Math.round(accum * corrFactor) * Math.round(curr * corrFactor)) /
            Math.round(corrFactor * corrFactor)
          )
        }

        this._value = _.reduce([this._value, value], cback, 1)
        return this
      },
      divide: function (value) {
        function cback(accum, curr, currI, O) {
          var corrFactor = _.correctionFactor(accum, curr)

          return Math.round(accum * corrFactor) / Math.round(curr * corrFactor)
        }

        this._value = _.reduce([this._value, value], cback)
        return this
      },
      difference: function (value) {
        return Math.abs(numeral(this._value).subtract(value).value())
      }
    }
    /************************************
      Default Locale && Format
  ************************************/

    numeral.register('locale', 'en', {
      delimiters: {
        thousands: ',',
        decimal: '.'
      },
      abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
      },
      ordinal: function (number) {
        var b = number % 10
        return ~~((number % 100) / 10) === 1
          ? 'th'
          : b === 1
          ? 'st'
          : b === 2
          ? 'nd'
          : b === 3
          ? 'rd'
          : 'th'
      },
      currency: {
        symbol: '$'
      }
    })

    ;(function () {
      numeral.register('format', 'bps', {
        regexps: {
          format: /(BPS)/,
          unformat: /(BPS)/
        },
        format: function (value, format, roundingFunction) {
          var space = numeral._.includes(format, ' BPS') ? ' ' : '',
            output
          value = value * 10000 // check for space before BPS

          format = format.replace(/\s?BPS/, '')
          output = numeral._.numberToFormat(value, format, roundingFunction)

          if (numeral._.includes(output, ')')) {
            output = output.split('')
            output.splice(-1, 0, space + 'BPS')
            output = output.join('')
          } else {
            output = output + space + 'BPS'
          }

          return output
        },
        unformat: function (string) {
          return +(numeral._.stringToNumber(string) * 0.0001).toFixed(15)
        }
      })
    })()

    ;(function () {
      var decimal = {
          base: 1000,
          suffixes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        },
        binary = {
          base: 1024,
          suffixes: [
            'B',
            'KiB',
            'MiB',
            'GiB',
            'TiB',
            'PiB',
            'EiB',
            'ZiB',
            'YiB'
          ]
        }
      var allSuffixes = decimal.suffixes.concat(
        binary.suffixes.filter(function (item) {
          return decimal.suffixes.indexOf(item) < 0
        })
      )
      var unformatRegex = allSuffixes.join('|') // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)

      unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')'
      numeral.register('format', 'bytes', {
        regexps: {
          format: /([0\s]i?b)/,
          unformat: new RegExp(unformatRegex)
        },
        format: function (value, format, roundingFunction) {
          var output,
            bytes = numeral._.includes(format, 'ib') ? binary : decimal,
            suffix =
              numeral._.includes(format, ' b') ||
              numeral._.includes(format, ' ib')
                ? ' '
                : '',
            power,
            min,
            max // check for space before

          format = format.replace(/\s?i?b/, '')

          for (power = 0; power <= bytes.suffixes.length; power++) {
            min = Math.pow(bytes.base, power)
            max = Math.pow(bytes.base, power + 1)

            if (
              value === null ||
              value === 0 ||
              (value >= min && value < max)
            ) {
              suffix += bytes.suffixes[power]

              if (min > 0) {
                value = value / min
              }

              break
            }
          }

          output = numeral._.numberToFormat(value, format, roundingFunction)
          return output + suffix
        },
        unformat: function (string) {
          var value = numeral._.stringToNumber(string),
            power,
            bytesMultiplier

          if (value) {
            for (power = decimal.suffixes.length - 1; power >= 0; power--) {
              if (numeral._.includes(string, decimal.suffixes[power])) {
                bytesMultiplier = Math.pow(decimal.base, power)
                break
              }

              if (numeral._.includes(string, binary.suffixes[power])) {
                bytesMultiplier = Math.pow(binary.base, power)
                break
              }
            }

            value *= bytesMultiplier || 1
          }

          return value
        }
      })
    })()

    ;(function () {
      numeral.register('format', 'currency', {
        regexps: {
          format: /(\$)/
        },
        format: function (value, format, roundingFunction) {
          var locale = numeral.locales[numeral.options.currentLocale],
            symbols = {
              before: format.match(/^([\+|\-|\(|\s|\$]*)/)[0],
              after: format.match(/([\+|\-|\)|\s|\$]*)$/)[0]
            },
            output,
            symbol,
            i // strip format of spaces and $

          format = format.replace(/\s?\$\s?/, '') // format the number

          output = numeral._.numberToFormat(value, format, roundingFunction) // update the before and after based on value

          if (value >= 0) {
            symbols.before = symbols.before.replace(/[\-\(]/, '')
            symbols.after = symbols.after.replace(/[\-\)]/, '')
          } else if (
            value < 0 &&
            !numeral._.includes(symbols.before, '-') &&
            !numeral._.includes(symbols.before, '(')
          ) {
            symbols.before = '-' + symbols.before
          } // loop through each before symbol

          for (i = 0; i < symbols.before.length; i++) {
            symbol = symbols.before[i]

            switch (symbol) {
              case '$':
                output = numeral._.insert(output, locale.currency.symbol, i)
                break

              case ' ':
                output = numeral._.insert(
                  output,
                  ' ',
                  i + locale.currency.symbol.length - 1
                )
                break
            }
          } // loop through each after symbol

          for (i = symbols.after.length - 1; i >= 0; i--) {
            symbol = symbols.after[i]

            switch (symbol) {
              case '$':
                output =
                  i === symbols.after.length - 1
                    ? output + locale.currency.symbol
                    : numeral._.insert(
                        output,
                        locale.currency.symbol,
                        -(symbols.after.length - (1 + i))
                      )
                break

              case ' ':
                output =
                  i === symbols.after.length - 1
                    ? output + ' '
                    : numeral._.insert(
                        output,
                        ' ',
                        -(
                          symbols.after.length -
                          (1 + i) +
                          locale.currency.symbol.length -
                          1
                        )
                      )
                break
            }
          }

          return output
        }
      })
    })()

    ;(function () {
      numeral.register('format', 'exponential', {
        regexps: {
          format: /(e\+|e-)/,
          unformat: /(e\+|e-)/
        },
        format: function (value, format, roundingFunction) {
          var output,
            exponential =
              typeof value === 'number' && !numeral._.isNaN(value)
                ? value.toExponential()
                : '0e+0',
            parts = exponential.split('e')
          format = format.replace(/e[\+|\-]{1}0/, '')
          output = numeral._.numberToFormat(
            Number(parts[0]),
            format,
            roundingFunction
          )
          return output + 'e' + parts[1]
        },
        unformat: function (string) {
          var parts = numeral._.includes(string, 'e+')
              ? string.split('e+')
              : string.split('e-'),
            value = Number(parts[0]),
            power = Number(parts[1])
          power = numeral._.includes(string, 'e-') ? (power *= -1) : power

          function cback(accum, curr, currI, O) {
            var corrFactor = numeral._.correctionFactor(accum, curr),
              num =
                (accum * corrFactor * (curr * corrFactor)) /
                (corrFactor * corrFactor)

            return num
          }

          return numeral._.reduce([value, Math.pow(10, power)], cback, 1)
        }
      })
    })()

    ;(function () {
      numeral.register('format', 'ordinal', {
        regexps: {
          format: /(o)/
        },
        format: function (value, format, roundingFunction) {
          var locale = numeral.locales[numeral.options.currentLocale],
            output,
            ordinal = numeral._.includes(format, ' o') ? ' ' : '' // check for space before

          format = format.replace(/\s?o/, '')
          ordinal += locale.ordinal(value)
          output = numeral._.numberToFormat(value, format, roundingFunction)
          return output + ordinal
        }
      })
    })()

    ;(function () {
      numeral.register('format', 'percentage', {
        regexps: {
          format: /(%)/,
          unformat: /(%)/
        },
        format: function (value, format, roundingFunction) {
          var space = numeral._.includes(format, ' %') ? ' ' : '',
            output

          if (numeral.options.scalePercentBy100) {
            value = value * 100
          } // check for space before %

          format = format.replace(/\s?\%/, '')
          output = numeral._.numberToFormat(value, format, roundingFunction)

          if (numeral._.includes(output, ')')) {
            output = output.split('')
            output.splice(-1, 0, space + '%')
            output = output.join('')
          } else {
            output = output + space + '%'
          }

          return output
        },
        unformat: function (string) {
          var number = numeral._.stringToNumber(string)

          if (numeral.options.scalePercentBy100) {
            return number * 0.01
          }

          return number
        }
      })
    })()

    ;(function () {
      numeral.register('format', 'time', {
        regexps: {
          format: /(:)/,
          unformat: /(:)/
        },
        format: function (value, format, roundingFunction) {
          var hours = Math.floor(value / 60 / 60),
            minutes = Math.floor((value - hours * 60 * 60) / 60),
            seconds = Math.round(value - hours * 60 * 60 - minutes * 60)
          return (
            hours +
            ':' +
            (minutes < 10 ? '0' + minutes : minutes) +
            ':' +
            (seconds < 10 ? '0' + seconds : seconds)
          )
        },
        unformat: function (string) {
          var timeArray = string.split(':'),
            seconds = 0 // turn hours and minutes into seconds and add them all up

          if (timeArray.length === 3) {
            // hours
            seconds = seconds + Number(timeArray[0]) * 60 * 60 // minutes

            seconds = seconds + Number(timeArray[1]) * 60 // seconds

            seconds = seconds + Number(timeArray[2])
          } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + Number(timeArray[0]) * 60 // seconds

            seconds = seconds + Number(timeArray[1])
          }

          return Number(seconds)
        }
      })
    })()

    return numeral
  })
})(numeral$1)

var numeral = numeral$1.exports

var dist$2 = {}

;(function (exports) {
  Object.defineProperty(exports, '__esModule', {
    value: true
  })

  var playwright = require$$0__default$1['default']

  exports._playwright = null

  const usePlaywright = async () => {
    if (exports._playwright) return exports._playwright
    const browser = await playwright.webkit.launch()
    const context = await browser.newContext()

    const newPage = async () => {
      return await context.newPage()
    }

    const close = async () => {
      await context.close()
      await browser.close()
      exports._playwright = null
    }

    exports._playwright = {
      browser,
      context,
      newPage,
      close
    }
    return exports._playwright
  }

  exports.usePlaywright = usePlaywright
})(dist$2)

var dist$1 = {}

Object.defineProperty(dist$1, '__esModule', {
  value: true
})

var crawler$1 = dist$2
/**
 * RootApis
 */

const rootApis = ['/hot/', '/latest-updates/', '/new-release/']

const isRootApis = (api) => rootApis.includes(api)
/**
 * Apis
 */

const apis = [
  '/hot/',
  '/latest-updates/',
  '/new-release/',
  '/categories/bdsm/',
  '/categories/chinese-subtitle/',
  '/categories/groupsex/',
  '/categories/pantyhose/',
  '/categories/pov/',
  '/categories/rape/',
  '/categories/roleplay/',
  '/categories/sex-only/',
  '/categories/uncensored/',
  '/categories/uniform/',
  '/tags/10-times-a-day/',
  '/tags/3p/',
  '/tags/Cosplay/',
  '/tags/affair/',
  '/tags/age-difference/',
  '/tags/anal-sex/',
  '/tags/avenge/',
  '/tags/bathing-place/',
  '/tags/beautiful-butt/',
  '/tags/beautiful-leg/',
  '/tags/big-tits/',
  '/tags/black-pantyhose/',
  '/tags/black/',
  '/tags/blowjob/',
  '/tags/bondage/',
  '/tags/breast-milk/',
  '/tags/bunny-girl/',
  '/tags/car/',
  '/tags/cheongsam/',
  '/tags/chikan/',
  '/tags/chizyo/',
  '/tags/club-hostess-and-sex-worker/',
  '/tags/couple/',
  '/tags/crapulence/',
  '/tags/creampie/',
  '/tags/cum-in-mouth/',
  '/tags/debut-retires/',
  '/tags/deep-throat/',
  '/tags/detective/',
  '/tags/doctor/',
  '/tags/facial/',
  '/tags/female-anchor/',
  '/tags/festival/',
  '/tags/first-night/',
  '/tags/fishnets/',
  '/tags/flesh-toned-pantyhose/',
  '/tags/flexible-body/',
  '/tags/flight-attendant/',
  '/tags/footjob/',
  '/tags/fugitive/',
  '/tags/gang-rape/',
  '/tags/gangbang/',
  '/tags/giant/',
  '/tags/girl/',
  '/tags/glasses/',
  '/tags/gym-room/',
  '/tags/hairless-pussy/',
  '/tags/hidden-cam/',
  '/tags/hot-spring/',
  '/tags/housewife/',
  '/tags/hypnosis/',
  '/tags/idol/',
  '/tags/incest/',
  '/tags/incest/',
  '/tags/insult/',
  '/tags/kemonomimi/',
  '/tags/kimono/',
  '/tags/kiss/',
  '/tags/knee-socks/',
  '/tags/library/',
  '/tags/loli/',
  '/tags/love-potion/',
  '/tags/magic-mirror/',
  '/tags/maid/',
  '/tags/masochism-guy/',
  '/tags/massage/',
  '/tags/mature-woman/',
  '/tags/more-than-4-hours/',
  '/tags/ntr/',
  '/tags/nurse/',
  '/tags/ol/',
  '/tags/outdoor/',
  '/tags/pantyhose/',
  '/tags/piss/',
  '/tags/prison/',
  '/tags/private-teacher/',
  '/tags/quickie/',
  '/tags/rainy-day/',
  '/tags/rape/',
  '/tags/rape/',
  '/tags/school-uniform/',
  '/tags/school/',
  '/tags/sex-beside-husband/',
  '/tags/short-hair/',
  '/tags/small-tits/',
  '/tags/soapland/',
  '/tags/spasms/',
  '/tags/sportswear/',
  '/tags/squirting/',
  '/tags/stockings/',
  '/tags/store/',
  '/tags/suntan/',
  '/tags/swimming-pool/',
  '/tags/swimsuit/',
  '/tags/tall/',
  '/tags/tattoo/',
  '/tags/teacher/',
  '/tags/team-manager/',
  '/tags/temptation/',
  '/tags/thanksgiving/',
  '/tags/time-stop/',
  '/tags/tit-wank/',
  '/tags/toilet/',
  '/tags/torture/',
  '/tags/tram/',
  '/tags/tune/',
  '/tags/ugly-man/',
  '/tags/variety-show/',
  '/tags/video-recording/',
  '/tags/virginity/',
  '/tags/wedding-dress/',
  '/tags/widow/',
  '/tags/wife/'
]

const isApis = (api) => apis.includes(api)

const JABLE = 'https://jable.tv'

const getOptions = (api, ...opts) => {
  const options = isRootApis(api)
    ? rootApisOptions[api]
    : rootApisOptions['rest']
  return Object.assign({}, options, ...opts)
}

const getVideos = async (api, ...opts) => {
  const jable = await crawler$1.usePlaywright()
  const jablePage = await jable.newPage()
  const { list, sort, page } = getOptions(api, ...opts)
  const time = new Date().getTime()
  const url = `${JABLE}${api}?mode=async&function=get_block&block_id=${list}&sort_by=${sort}&from=${page}&_=${time}`
  await jablePage.goto(url)
  const $selector = 'div.video-img-box .detail a'
  const videos = await jablePage.$$eval($selector, parser$1).catch(() => [])
  await jablePage.close()
  return videos
}

const parser$1 = (elements) => {
  const vidoes = []
  elements.forEach((el) => {
    var _el$textContent

    const url = el.getAttribute('href')
    const name =
      (_el$textContent = el.textContent) === null || _el$textContent === void 0
        ? void 0
        : _el$textContent.trim()
    if (!url || !name) return
    const [code] = name.split(' ')
    vidoes.push({
      code,
      name
    })
  })
  return vidoes
}

const rootApisOptions = {
  '/hot/': {
    list: 'list_videos_common_videos_list',
    sort: 'video_viewed',
    page: 1
  },
  '/latest-updates/': {
    list: 'list_videos_latest_videos_list',
    sort: 'post_date',
    page: 1
  },
  '/new-release/': {
    list: 'list_videos_common_videos_list',
    sort: 'release_year',
    page: 1
  },
  'rest': {
    list: 'list_videos_common_videos_list',
    sort: 'video_viewed',
    page: 1
  }
}
dist$1.JABLE = JABLE
dist$1.apis = apis
var getOptions_1 = (dist$1.getOptions = getOptions)
var getVideos_1 = (dist$1.getVideos = getVideos)
dist$1.isApis = isApis
dist$1.isRootApis = isRootApis
dist$1.rootApis = rootApis
dist$1.rootApisOptions = rootApisOptions

var dist = {}

Object.defineProperty(dist, '__esModule', {
  value: true
})

var crawler = dist$2

const SUKEBEI = 'https://sukebei.nyaa.si/'

const getMagnets = async (key) => {
  const sukebei = await crawler.usePlaywright()
  const sukebeiPage = await sukebei.newPage()
  const url = `${SUKEBEI}?f=0&c=0_0&q=${key}&s=size&o=desc`
  await sukebeiPage.goto(url)
  const elements = await sukebeiPage.$$('table.torrent-list tbody tr.default')
  const magnets = await parser(elements)
  await sukebeiPage.close()
  return magnets
}

const sortMagnets = (magnets, opts) => {
  const defaultOptions = {
    sort: 'size',
    minSize: 2,
    maxSize: 0,
    minDownload: 0,
    maxDownload: 0
  }
  const options = Object.assign(defaultOptions, opts)
  const { sort, minSize, maxSize, minDownload, maxDownload } = options
  return magnets
    .filter((m) => {
      const minS = minSize ? m.size > minSize : true
      const maxS = maxSize ? m.size < maxSize : true
      const minD = minDownload ? m.downloads > minDownload : true
      const maxD = maxDownload ? m.downloads < maxDownload : true
      return minS && maxS && minD && maxD
    })
    .sort((a, b) => b[sort] - a[sort])
}

const parser = async (elements) => {
  const magnets = []

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const url = await urlParser(element)
    const name = await nameParser(element)
    const size = await sizeParser(element)
    const downloads = await dlParser(element)
    if (!url) continue
    magnets.push({
      url,
      name,
      size,
      downloads
    })
  }

  return magnets
}

const hrefParser = (el) => el.getAttribute('href')

const textParser = (el) => el.textContent

const urlParser = async (element) => {
  const $url = await element.$('td >> nth=2')
  if (!$url) return
  const rawUrl = await $url.$eval('a >> nth=1', hrefParser).catch(() => '')
  if (!rawUrl) return
  return rawUrl.split('&')[0]
}

const nameParser = async (element) => {
  const $name = await element.$('td >> nth=1')
  if (!$name) return ''
  const rawName = await $name.$eval('a', textParser).catch(() => '')
  if (!rawName) return ''
  const name = rawName.replace(/\n|\t/g, '')
  return name
}

const sizeParser = async (element) => {
  const $size = await element.$eval('td >> nth=3', textParser)
  const [rawSize, unit] = ($size === null || $size === void 0
    ? void 0
    : $size.split(' ')) ?? ['0', 'GiB']
  return Number(rawSize) / (unit === 'GiB' ? 1 : unit === 'MiB' ? 1024 : 0)
}

const dlParser = async (element) => {
  const $downloads = await element.$eval('td >> nth=-1', textParser)
  return Number($downloads) ?? 0
}

dist.SUKEBEI = SUKEBEI
var getMagnets_1 = (dist.getMagnets = getMagnets)
var sortMagnets_1 = (dist.sortMagnets = sortMagnets)

const sort = (magnets) => {
  let sorted = sortMagnets_1(magnets, {
    sort: 'downloads',
    minSize: 5,
    maxSize: 10
  })

  if (sorted.length < 1) {
    sorted = sortMagnets_1(magnets, {
      sort: 'downloads',
      minSize: 0,
      maxSize: 10
    })
  }

  return sorted
}
const withMagent = async (videos) => {
  for (let i = 0; i < videos.length; i++) {
    var _video$magnets

    const video = videos[i]
    const magnets = await getMagnets_1(video.code)
    video.magnets = sort(magnets)
    const bestMagnet =
      (_video$magnets = video.magnets) === null || _video$magnets === void 0
        ? void 0
        : _video$magnets[0]
    if (!bestMagnet) continue
    const size = numeral(bestMagnet.size).format('0,0.00')
    const magnet = `${bestMagnet.url}&dn=${video.code}&size=${size}GB`
    console.log(magnet)
  }

  return videos
}
const getOutputs = (videos) => {
  return videos
    .map((v) => v.magnet ?? v.code ?? '')
    .filter((l) => l)
    .join('\n')
}
const handle = async (path, opts) => {
  const { page, magnet: isGetMagnet, latest: isGetLatest } = opts
  let videos

  if (path === '/hot/') {
    const sort = isGetLatest ? 'video_viewed_today' : 'video_viewed'
    const options = getOptions_1(path, {
      sort,
      page
    })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos_1(path, options)
  } else if (path === '/latest-updates/') {
    const options = getOptions_1(path, {
      page
    })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos_1(path, options)
  } else if (path === '/new-release/') {
    const options = getOptions_1(path, {
      page
    })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos_1(path, options)
  } else {
    const sort = isGetLatest ? 'post_date' : 'video_viewed'
    const options = getOptions_1(path, {
      sort,
      page
    })
    console.info(`🔔 ${path}${options.sort} 🔔`)
    videos = await getVideos_1(path, options)
  }

  if (isGetMagnet) {
    await withMagent(videos)
  } else {
    console.info(getOutputs(videos))
  }

  return videos
}
const program = new commander.exports.Command()
program
  .name('jable')
  .description('npm i -g @boxts/crawler')
  .argument('[path]', 'get videos from path.', (v) => v, '/hot/')
  .option('-p, --page <page>', 'get videos from page.', (p) => parseInt(p), 1)
  .option('-m, --magnet [magnet]', 'get video magnet.', false)
  .option('-l, --latest [latest]', 'get latest videos.', false)
  .helpOption(
    '-h, --help',
    `
    jable /tags/creampie/ -m
    jable /tags/creampie/ -l
    jable /tags/creampis/ -p 2

    jable /hot/ -m -l
    jable /latest-updates/ -m -l
    jable /new-release/ -m -l
    jable /categories/uncensored/ -m -l
    jable /tags/creampie/ -m -l

    more: https://www.npmjs.com/package/@boxts/crawler
    `
  )
  .action(async (path) => {
    const opts = program.opts()
    await handle(path, opts)
    await dist$2.usePlaywright().then(({ close }) => close())
  })
program.parse(process.argv)

exports.getOutputs = getOutputs
exports.handle = handle
exports.sort = sort
exports.withMagent = withMagent
