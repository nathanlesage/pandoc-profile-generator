<template>
    <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <div class="uk-width-1-3@m">
      <div v-if="props.profile[props.element] !== undefined">
        <label for="input-files" class="uk-form-label">{{ props.label }}</label>
        <a class="uk-icon-button" uk-icon="trash" title="Remove property"
          v-on:click="updateCurrentProfile({ [props.element]: undefined })"
        ></a>

        <div class="uk-margin">
          <div v-for="[key, value], i in Object.entries(props.profile[props.element] as Record<string, string>)" class="uk-margin">
            <span class="uk-display-inline-block uk-margin-right">{{ key }}</span>
            <div class="uk-inline">
              <a
                class="uk-form-icon uk-form-icon-flip" href="" uk-icon="icon: trash"
                title="Remove entry"
                v-on:click.prevent="removeKey(key)"
              ></a>
              <input
                class="uk-input"
                type="text"
                placeholder="Enter value&hellip;"
                v-bind:value="value"
                v-on:input="updateValue(key, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
          <p class="uk-text-meta" v-if="Object.keys(props.profile[props.element] as Record<string, string>).length === 0">No entries</p>
          <div class="uk-flex" uk-flex>
            <input
              v-model="newKey"
              class="uk-input uk-form-width-medium"
              placeholder="Enter key name&hellip;"
            >
            <button
              v-bind:class="{
                'uk-button': true,
                'uk-button-secondary': true,
                'uk-button-small': true,
                'uk-disabled': newKey.length === 0
              }"
              v-on:click.prevent="addEntry()"
            >
              <slot name="add-label">Add entry</slot>
            </button>
          </div>
        </div>
      </div>
      <PrimaryButton v-else
      v-on:click="updateCurrentProfile({ [props.element]: [] })"
    >
      <slot name="button-label">
        Add field &quot;{{ props.label }}&quot;
      </slot>
    </PrimaryButton>
    </div>
    <p class="uk-text-meta uk-width-expand@m">
    <slot name="description"></slot>
  </p>
  </div>
</template>

<script setup lang="ts">
import PrimaryButton from 'src/form-elements/PrimaryButton.vue'
import { InternalDefaults } from 'src/pandoc-defaults'
import { ref } from 'vue'
import { useAppStore } from 'src/pinia'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  profile: Partial<InternalDefaults>
  element: keyof InternalDefaults,
  label: string
}>()

const newKey = ref('')

function addEntry () {
  let metadata = props.profile[props.element] as Record<string, string>|undefined
  if (newKey.value.length === 0 || metadata === undefined) {
    return
  }

  if (newKey.value in metadata) {
    return
  }
  console.log('Adding key', newKey)

  metadata = { ...metadata, [newKey.value]: '' }
  newKey.value = ''
  // Ensure the changes are picked up
  updateCurrentProfile({ [props.element]: metadata })
}

function updateValue (key: string, value: string) {
  let metadata = props.profile[props.element] as Record<string, string>|undefined
  if (metadata === undefined) {
    return
  }

  metadata = { ...metadata, [key]: value }
  // Ensure the changes are picked up
  updateCurrentProfile({ [props.element]: metadata })
}

function removeKey (key: string) {
  let metadata = props.profile[props.element] as Record<string, string>|undefined
  if (metadata === undefined || !(key in metadata)) {
    return
  }

  delete metadata[key]
  // Ensure the changes are picked up
  updateCurrentProfile({ [props.element]: metadata })
}
</script>

<style></style>
