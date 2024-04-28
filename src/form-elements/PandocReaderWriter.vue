<template>
  <div v-if="isBuiltinReaderWriter" class="uk-alert-primary" uk-alert>
    <p>Currently using the builtin <code>{{ props.readerWriter.name }}</code> {{ props.which }}.</p>
    <button
      class="uk-button uk-button-primary uk-button-small"
      v-on:click.prevent="updateCurrentProfile({ [props.which]: { name: '', enabledExtensions: [], disabledExtensions: [] } })"
    >
      Switch to custom {{ which }}
    </button>
  </div>
  <div class="uk-alert-primary" v-else uk-alert>
    <p>Currently using a custom {{ which }}.</p>
    <button
      class="uk-button uk-button-primary uk-button-small"
      v-on:click.prevent="updateCurrentProfile({ [props.which]: { name: pandocReaders[0], enabledExtensions: [], disabledExtensions: [] } })"
    >
      Switch to builtin {{ which }}
    </button>
  </div>

  <button class="uk-button uk-button-danger uk-button-small" title="Remove field"
      v-on:click="updateCurrentProfile({ [props.which]: undefined })"
    >
      Remove {{ which }} field
    </button>

  <div>
    <div v-if="isBuiltinReaderWriter">
      <label class="uk-form-label" for="builtin-reader">
        Select a builtin reader from the select below. Depending on which reader
        you select, you can enable and disable various sets of extensions.
      </label>
      <select
        class="uk-select"
        name="builtin-reader"
        v-model="thisReaderWriter"
      >
        <option
          v-for="r in availableReadersWriters"
          v-key="r"
          v-bind:value="r"
        >
          {{ r }}
        </option>
      </select>

      <p>Available extensions</p>
      <p class="uk-text-meta">
        The checkboxes reflect the current status of the extensions. Some are
        enabled by default. Enable and disable them explicitly as desired. Note,
        however, that some extensions make only sense for the corresponding
        reader or writer, but not both.
      </p>
      <div class="uk-margin uk-grid-small uk-child-width-auto uk-grid">
        <label
          v-for="ext of availableExtensions"
          v-key="ext.name"
          v-bind:for="props.which + '-' + ext.name"
          v-on:click="toggleExtension(ext.name, ext.enabledByDefault)"
        >
          <input
            class="uk-checkbox" type="checkbox"
            v-bind:checked="ext.active"
            v-bind:name="props.which + '-' + ext.name"
          >
          {{ readableExtensionName(ext.name) }}
          <span
            uk-icon="icon: question; ratio: 0.8"
            v-bind:data-tippy-content="extensionDescription(ext.name)"
            style="cursor: help"
          ></span>
        </label>
      </div>
    </div>
    <div v-else>
      <label class="uk-form-label" for="custom-reader">
        Enter the path to your custom Lua reader here. If the script is not
        found relative to the working directory, it will be sought in the custom
        subdirectory of the user data directory (see <code>--data-dir</code>).
      </label>
      <div class="uk-form-controls">
        <input
          v-model="thisReaderWriter"
          type="text"
          class="uk-input"
          id="custom-reader"
          name="custom-reader"
          placeholder="reader.lua"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PandocExtensions } from 'src/pandoc-defaults';
import { pandocReaders, extensions, pandocExtensions, InternalDefaults, pandocWriters, extensionDescriptions } from 'src/pandoc-defaults'
import { useAppStore } from 'src/pinia'
import { computed, ref, watch, toRef, onUpdated } from 'vue'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  readerWriter: InternalDefaults["reader"]|InternalDefaults["writer"]
  which: 'reader'|'writer'
}>()

const thisReaderWriter = ref(props.readerWriter.name)
watch(toRef(props, 'readerWriter'), () => {
  thisReaderWriter.value = props.readerWriter.name
})

watch(thisReaderWriter, (value) => {
  if (value !== props.readerWriter.name) {
    updateCurrentProfile({ [props.which]: { name: value, enabledExtensions: [], disabledExtensions: [] } })
  }
})

onUpdated(() => {
  console.log('Update!')
  tippy('[data-tippy-content]')
})

const isBuiltinReaderWriter = computed(() => {
  if (props.which === 'reader') {
    return pandocReaders.includes(props.readerWriter.name as any)
  } else {
    return pandocWriters.includes(props.readerWriter.name as any)
  }
})

const availableReadersWriters = computed(() => {
  if (props.which === 'reader') {
    return pandocReaders
  } else {
    return pandocWriters
  }
})

interface AvailableExtension {
  name: string
  // description: string
  active: boolean
  enabledByDefault: boolean
}

const availableExtensions = computed<AvailableExtension[]>(() => {
  const ext: AvailableExtension[] = []
  for (const extension of pandocExtensions) {
    const e = extensions[extension]
    if (!e.enabled.concat(e.disabled).includes(props.readerWriter.name as any)) {
      continue // Reader doesn't support this extension
    }

    const explicitlyDisabled = props.readerWriter.disabledExtensions.includes(extension)
    const explicitlyEnabled = props.readerWriter.enabledExtensions.includes(extension)
    const defaultEnabled = e.enabled.includes(props.readerWriter.name as any)

    const isActive = (defaultEnabled && !explicitlyDisabled) || explicitlyEnabled

    ext.push({ name: extension, active: isActive, enabledByDefault: defaultEnabled })
  }
  return ext
})

/**
 * Converts an_extension_name into An Extension Name.
 *
 * @param   {string}  ext  The actual extension.
 *
 * @return  {string}       A (mostly) human-readable version of that.
 */
function readableExtensionName (ext: string): string {
  return ext
    .replace(/_/g, ' ')
    .split(' ')
    .map(x => x[0].toUpperCase() + x.slice(1))
    .join(' ')
}

/**
 * Returns a short description for the provided extension, or the extension
 * name itself.
 *
 * @param   {string}  ext  The extension to describe
 *
 * @return  {string}       A description
 */
function extensionDescription (ext: string): string {
  if (ext in extensionDescriptions) {
    return extensionDescriptions[ext as keyof PandocExtensions]
  } else {
    return ext
  }
}

/**
 * Toggles the provided extension on or off, respecting whether it's enabled by
 * default.
 *
 * @param   {string}   ext               The extension name
 * @param   {boolean}  enabledByDefault  Whether it's enabled by default
 */
function toggleExtension (ext: string, enabledByDefault: boolean) {
  const descriptor = availableExtensions.value.find(x => x.name === ext)
  if (descriptor === undefined) {
    console.error(`Could not toggle extension ${ext}: Not found in available extensions.`)
    return
  }

  const enabled = props.readerWriter.enabledExtensions.map(x => x)
  const disabled = props.readerWriter.disabledExtensions.map(x => x)
  const enabledIdx = enabled.indexOf(ext)
  const disabledIdx = disabled.indexOf(ext)

  if (enabledIdx > -1) {
    // Currently explicitly enabled --> disable
    enabled.splice(enabledIdx, 1)
    if (enabledByDefault) {
      disabled.push(ext)
    }
    updateCurrentProfile({ [props.which]: { name: props.readerWriter.name, enabledExtensions: enabled, disabledExtensions: disabled } })
  } else if (disabledIdx > -1) {
    // Currently explicitly disabled -> enable
    disabled.splice(disabledIdx, 1)
    if (!enabledByDefault) {
      enabled.push(ext)
    }
    updateCurrentProfile({ [props.which]: { name: props.readerWriter.name, enabledExtensions: enabled, disabledExtensions: disabled } })
  } else if (!enabledByDefault) {
    // Default state, but disabled by default -> enable
    enabled.push(ext)
    updateCurrentProfile({ [props.which]: { name: props.readerWriter.name, enabledExtensions: enabled, disabledExtensions: disabled } })
  } else if (enabledByDefault) {
    // Default state, but enabled by default -> disable
    disabled.push(ext)
    updateCurrentProfile({ [props.which]: { name: props.readerWriter.name, enabledExtensions: enabled, disabledExtensions: disabled } })
  }
}
</script>

<style></style>
