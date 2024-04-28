import { InternalDefaults, PandocDefaults } from "./pandoc-defaults";
import { stringify } from 'yaml'

/**
 * Parses a Pandoc-style reader or writer property into its constituent parts.
 *
 * @param   {string}  readerWriter  The string, e.g., markdown+ascii-ext
 *
 * @return  {any}                   The split parts, e.g., "markdown", "ascii", and "ext"
 */
export function parseReaderWriter (readerWriter: string): { name: string, enabledExtensions: string[], disabledExtensions: string[] } {
  const ret = {
    name: readerWriter,
    enabledExtensions: [] as string[],
    disabledExtensions: [] as string[]
  }

  if (!readerWriter.includes('-') && !readerWriter.includes('+')) {
    return ret
  }

  const name = readerWriter.split(/[+-]/g)[0]

  let isEnabled = false
  let currentExtension = ''
  for (const char of readerWriter.slice(name.length)) {
    if (char === '+' || char === '-' && currentExtension.length > 0) {
      if (isEnabled) {
        ret.enabledExtensions.push(currentExtension)
      } else {
        ret.disabledExtensions.push(currentExtension)
      }
      currentExtension = ''
    }

    if (char === '+') {
      isEnabled = true
    } else if (char === '-') {
      isEnabled = false
    } else {
      currentExtension += char
    }
  }

  return ret
}

/**
 * Constructs a Pandoc-style reader or writer property from a descriptor.
 *
 * @param   {any}     readerWriter  The descriptor
 *
 * @return  {string}                The constructed value
 */
function readerWriterToString (readerWriter: { name: string, enabledExtensions: string[], disabledExtensions: string[] }): string {
  let value = readerWriter.name
  if (readerWriter.enabledExtensions.length > 0) {
    value += '+' + readerWriter.enabledExtensions.join('+')
  }
  if (readerWriter.disabledExtensions.length > 0) {
    value += '-' + readerWriter.disabledExtensions.join('-')
  }
  return value
}

function copyAsStringArray (source: Record<string, any>, target: Partial<InternalDefaults>, property: keyof InternalDefaults) {
  if (property in source && typeof source[property] === 'string') {
    // @ts-expect-error We have to make sure we only pass expected properties here
    target[property] = [source[property]]
  } else if (property in source && Array.isArray(source[property]) && source[property].every((x: any) => typeof x === 'string')) {
    target[property] = source[property]
  }
}

function copyAsString (source: Record<string, any>, target: Partial<InternalDefaults>, property: keyof InternalDefaults) {
  if (typeof source[property] === 'string')
    target[property] = source[property]
}

function copyAsConstrainedString (source: Record<string, any>, target: Partial<InternalDefaults>, property: keyof InternalDefaults, allowedValues: string[]) {
  if (property in source && typeof source[property] === 'string' && ['INFO', 'WARNING', 'ERROR'].includes(source[property])) {
    target[property] = source[property]
  }
}

function copyAsNumber (source: Record<string, any>, target: Partial<InternalDefaults>, property: keyof InternalDefaults) {
  if (typeof source[property] === 'number') {
    target[property] = source[property]
  }
}

function copyAsTruishToggle (source: Record<string, any>, target: Partial<InternalDefaults>, property: keyof InternalDefaults) {
  if (property in source && source[property] === true) {
    // @ts-expect-error Yeez, TypeScript is a lil whiney kid today...
    target[property] = true
  }
}

/**
 * Takes a simple object and constructs a valid InternalDefaults object from it
 * by validating it and copying over only allowed values.
 *
 * @param   {Record<string, any>}        source  The source object
 *
 * @return  {Partial<InternalDefaults>}          The validated object
 */
export function parseFromYAML (source: Record<string, any>): Partial<InternalDefaults> {
  const ret: Partial<InternalDefaults> = {}

  // A list of all properties that are string arrays
  const stringArrayProperties: Array<keyof InternalDefaults> = [
    'input-files', 'defaults', 'indented-code-classes', 'metadata-files',
    'syntax-definitions', 'include-in-header', 'include-before-body',
    'include-after-body', 'resource-path', 'css', 'epub-fonts',
    'pdf-engine-opts', 'bibliography'
  ]

  for (const prop of stringArrayProperties) {
    copyAsStringArray(source, ret, prop)
  }

  // Now just strings
  const stringProperties: Array<keyof InternalDefaults> = [
    'output-file', 'data-dir', 'log-file', 'default-image-extension', 'lua-filter',
    'extract-media', 'abbreviations', 'template', 'highlight-style', 'number-offset',
    'id-prefix', 'title-prefix', 'reference-doc', 'chunk-template',
    'epub-cover-image', 'epub-metadata', 'epub-subdirectory', 'pdf-engine',
    'csl', 'citation-abbreviations'
  ]

  for (const prop of stringProperties) {
    copyAsString(source, ret, prop)
  }

  // Special case handling (singular -> plural property names)
  if (typeof source['input-file'] === 'string') {
    ret['input-files'] = [source['input-file']]
  }

  if (typeof source['metadata-file'] === 'string') {
    ret['metadata-files'] = [source['metadata-file']]
  }

  if (typeof source['syntax-definition'] === 'string') {
    ret['syntax-definitions'] = [source['syntax-definition']]
  }

  if (typeof source['pdf-engine-opt'] === 'string') {
    ret['pdf-engine-opts'] = [source['pdf-engine-opt']]
  }

  // Now numbers
  const numberProperties: Array<keyof InternalDefaults> = [
    'shift-heading-level-by', 'tab-stop', 'dpi', 'columns', 'toc-depth',
    'slide-level', 'split-level'
  ]

  for (const prop of numberProperties) {
    copyAsNumber(source, ret, prop)
  }

  // Special case handling: Deprecated property
  if (typeof source['epub-chapter-level'] === 'number') {
    ret['split-level'] = source['epub-chapter-level']
  }

  // The dreaded truish toggles
  const truishToggleProperties: Array<keyof InternalDefaults> = [
  'fail-if-warnings', 'file-scope', 'preserve-tabs', 'trace', 'standalone',
  'sandbox', 'toc', 'strip-comments', 'no-check-certificate', 'self-contained',
  'embed-resources', 'html-q-tags', 'ascii', 'reference-links', 'list-tables',
  'number-sections', 'listings', 'incremental', 'section-divs', 'citeproc',
  'dump-args', 'ignore-args'
  ]

  for (const prop of truishToggleProperties) {
    copyAsTruishToggle(source, ret, prop)
  }

  // Special case: table-of-contents
  if (source['table-of-contents'] === true) {
    ret.toc = true
  }

  // Readers and writers
  if ('from' in source && typeof source.from === 'string') {
    ret.reader = parseReaderWriter(source.from)
  } else if ('reader' in source && typeof source.reader === 'string') {
    ret.reader = parseReaderWriter(source.reader)
  }

  if ('to' in source && typeof source.to === 'string') {
    ret.writer = parseReaderWriter(source.to)
  } else if ('writer' in source && typeof source.writer === 'string') {
    ret.writer = parseReaderWriter(source.writer)
  }

  // Now constrained string (only certain set of numbers)
  copyAsConstrainedString(source, ret, 'verbosity', ['INFO', 'WARNING', 'ERROR'])
  copyAsConstrainedString(source, ret, 'track-changes', ['accept', 'reject', 'all'])
  copyAsConstrainedString(source, ret, 'eol', ['crlf', 'lf', 'native'])
  copyAsConstrainedString(source, ret, 'wrap', ['auto', 'none', 'preserve'])
  
  copyAsConstrainedString(source, ret, 'reference-location', ['block', 'section', 'document'])
  copyAsConstrainedString(source, ret, 'markdown-headings', ['setext', 'atx'])
  copyAsConstrainedString(source, ret, 'top-level-division', ['default', 'section', 'chapter', 'part'])
  copyAsConstrainedString(source, ret, 'email-obfuscation', ['none', 'javascript', 'references'])
  
  copyAsConstrainedString(source, ret, 'ipynb-output', ['all', 'none', 'best'])
  copyAsConstrainedString(source, ret, 'cite-method', ['citeproc', 'natbib', 'biblatex'])

  // Lastly: Special cases where properties have non-default properties
  if ('filters' in source && Array.isArray(source.filters)) {
    ret.filters = []
    for (const item of source.filters) {
      if (typeof item === 'string') {
        if (item === 'citeproc') {
          ret.filters.push({ type: 'citeproc', path: '' })
        } else {
          const isJSON = item.endsWith('.json')
          ret.filters.push({
            type: isJSON ? 'json' : 'lua',
            path: item
          })
        }
      } else if (typeof item === 'object' && !Array.isArray(item)) {
        if ('type' in item && ['citeproc', 'json', 'lua'].includes(item.type)) {
          const newItem: any = { type: item.type }
          if ('path' in item && typeof item.path === 'string') {
            newItem.path = item.path
          }
          ret.filters.push(newItem)
        }
      }
    }
  }

  if ('metadata' in source && typeof source.metadata === 'object' && !Array.isArray(source.metadata)) {
    ret.metadata = {}
    for (const [key, value] of Object.entries(source.metadata)) {
      ret.metadata[key] = value
    }
  }

  if ('variables' in source && typeof source.variables === 'object' && !Array.isArray(source.variables)) {
    ret.variables = {}
    for (const [key, value] of Object.entries(source.variables)) {
      ret.variables[key] = value
    }
  }

  if ('request-headers' in source && Array.isArray(source['request-headers'])) {
    ret['request-headers'] = []
    for (const item of source['request-headers']) {
      if (Array.isArray(item) && item.length === 2 && item.every(x => typeof x === 'string')) {
        ret['request-headers'].push(item as [string, string])
      }
    }
  }

  if ('epub-title-page' in source && typeof source['epub-title-page'] === 'boolean') {
    ret['epub-title-page'] = source['epub-title-page']
  }

  if ('html-math-method' in source && typeof source['html-math-method'] === 'object' && !Array.isArray(source['html-math-method']) && 'method' in source['html-math-method']) {
    ret['html-math-method'] = source['html-math-method'].method
  }

  return ret
}

/**
 * Turns an internal defaults object into a YAML string
 *
 * @param   {Partial<InternalDefaults>}  source  The source
 *
 * @return  {string}                             The YAML source
 */
export function internalDefaultsToYAML (source: Partial<InternalDefaults>): string {
  const retObject: PandocDefaults = {}
  for (const [key, value] of Object.entries(source)) {
    if (key === 'reader' || key === 'writer') {
      retObject[key] = readerWriterToString(source[key] as any)
    } else if (key === 'html-math-method') {
      retObject['html-math-method'] = { method: source[key] as any }
    } else if (key === 'filter' && source.filters !== undefined) {
      // Transform the filters to ensure citeproc is treated differently
      retObject.filters = source.filters.map(x => {
        if (x.type === 'citeproc') {
          return 'citeproc'
        } else {
          return x
        }
      })
    } else {
      // @ts-expect-error We know that the rest of the properties align
      retObject[key] = source[key]
    }
  }
  return stringify(retObject, {})
}

/**
 * Convenience function for a simple file download solution.
 *
 * @param   {string}                     filename          The proposed filename
 * @param   {Partial<InternalDefaults>}  source            The defaults to download
 */
export function exportDefaults (filename: string, source: Partial<InternalDefaults>) {
  const text = internalDefaultsToYAML(source)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  document.body.appendChild(element)
  element.click()
  console.log(element)
  setTimeout(() => {
    document.body.removeChild(element)
  }, 10000)
}
