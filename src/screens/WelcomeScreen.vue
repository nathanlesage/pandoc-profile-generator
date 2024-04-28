<template>
  <div class="uk-container uk-margin">
    <h1>Pandoc Profile Generator</h1>
    <p>
      Welcome to the Pandoc Profile Generator. It is a small web-app that offers
      a graphical interface for working with Pandoc's
      <a href="https://pandoc.org/MANUAL.html#defaults-files" target="_blank">
        defaults files
      </a>. Defaults files can be tricky since Pandoc is a complex platform that
      has amassed tons of file parsers, writers, and extensions. Oftentimes,
      it is hard to parse the documentation to find the pieces relevant to one's
      own use-case.
    </p>
    <p>
      The generator cannot take the responsibility off you to use whichever
      settings you require to import or export various files, but what it can do
      is guide you through the process of finding the right settings as
      efficient as possible.
    </p>
    <p>
      <strong>To get started, either upload an existing file, or create a new one.</strong>
    </p>

    <div class="uk-grid uk-grid-small uk-grid-match uk-text-center" uk-grid>
      <div class="uk-card uk-card-primary uk-card-hover uk-card-body uk-width-1-2@m">
        <h3 class="uk-card-title">Drag and drop a file to modify &hellip;</h3>

        <div
          class="uk-placeholder uk-text-center"
          v-on:drop.prevent.stop="onDrop"
          v-on:dragover.prevent.stop=""
          dropzone="true"
        >
          <span uk-icon="icon: cloud-upload"></span>
          &nbsp;
          <span class="uk-text-middle">Drop your file here</span>
        </div>

        <p>
          This will parse and load an existing YAML-file from your computer.
        </p>
        <p>
          You can also copy YAML code into your clipboard and press
          <kbd>Ctrl</kbd>+<kbd>V</kbd>&nbsp;(Windows/Linux) or
          <kbd>Cmd</kbd>+<kbd>V</kbd>&nbsp;(macOS).
        </p>
      </div>
  
      <div class="uk-card uk-card-secondary uk-card-hover uk-card-body uk-light uk-width-1-2@m">
        <h3 class="uk-card-title">&hellip; or create a brand new file.</h3>
        <p>
          <button
            class="uk-button uk-button-secondary"
            v-on:click="createNewProfile()"
          >
            Create new file
          </button>
        </p>
        <p>
          This will create an empty file with no options preselected.
        </p>
      </div>
    </div>

    <!-- Recent files -->
    <h3>Recent files</h3>
    <div v-if="appStore.availableProfiles.length > 0">
      <table class="uk-table uk-table-divider uk-table-hover">
        <tbody>
          <tr v-for="item in appStore.availableProfiles">
            <td>{{ item }}</td>
            <td>
              <button
                class="uk-button uk-button-primary"
                v-on:click.prevent="appStore.loadProfileFromLocalStorage(item)"
              >
                Edit
              </button>
            </td>
            <td>
              <button
                class="uk-button uk-button-secondary"
                v-on:click.prevent="exportToFile(item)"
              >
                Download
              </button>
            </td>
            <td>
              <button
                class="uk-button uk-button-danger"
                v-on:click.prevent="appStore.removeProfileFromLocalStorage(item)"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="uk-text-meta">
        Profiles that you create and upload will be persisted to LocalStorage,
        a semi-persistent storage on your own device that keeps data even across
        website reloads. However, it is easy to (accidentally) clear that
        storage, so please always download profiles that you need to your
        computer. Do not rely on LocalStorage.
      </p>
    </div>
    <div v-else>
      <p class="uk-text-meta">No recent files.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAppStore, getProfileFromLocalStorage } from 'src/pinia'
import { onMounted, onUnmounted } from 'vue'
import { parse as parseYAML } from 'yaml'
import { parseFromYAML, exportDefaults } from 'src/pandoc-transformer'

const appStore = useAppStore()

const { createNewProfile } = appStore

// The following is needed because otherwise the browser will process the event instead
function preventDefault (e: Event) {
  e.preventDefault()
}

function captureClipboard (e: ClipboardEvent) {
  if (appStore.currentProfile !== undefined) {
    return // Only when there's no profile loaded
  }
  try {
    const data = e.clipboardData?.getData('text/plain')
    if (data !== undefined) {
      const yaml = parseYAML(data)
      const defaults = parseFromYAML(yaml)
      createNewProfile('Pasted file.yaml', defaults)
      e.preventDefault()
    }
  } catch (err: any) {
    console.error('Could not paste YAML', err)
  }
}

onMounted(() => {
  document.body.addEventListener('drop', preventDefault)
  document.body.addEventListener('paste', captureClipboard)
})

onUnmounted(() => {
  document.body.removeEventListener('drop', preventDefault)
  document.body.removeEventListener('paste', captureClipboard)
})

function exportToFile (profileName: string) {
  const profile = getProfileFromLocalStorage(profileName)
  if (profile !== undefined) {
    exportDefaults(profileName, profile)
  }
}

/**
 * Handles a file drop event where the user passed a YAML file.
 *
 * @param   {DragEvent}  event  The associated event
 */
function onDrop (event: DragEvent) {
  const files = event.dataTransfer?.files
  if (files === undefined) {
    console.error('Could not parse files: No files given.')
    return
  }

  const firstFile = files[0]

  if (!/\.ya?ml$/.test(firstFile.name)) {
    console.error(`Refused to read ${firstFile.name}: Not YAML.`)
    return
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    let text = e.target?.result
    if (text == null) {
      console.error('Could not read file')
      return
    }

    if (text instanceof ArrayBuffer) {
      const dec = new TextDecoder('utf-8')
      text = dec.decode(text)
    }

    const fileContents = parseYAML(text)
    if (typeof fileContents !== 'object' || Array.isArray(fileContents)) {
      console.error('Could not read file: Not a defaults file')
      return
    }

    const defaults = parseFromYAML(fileContents)
    createNewProfile(firstFile.name, defaults)
  }
  reader.readAsText(firstFile)
}
</script>

<style></style>
