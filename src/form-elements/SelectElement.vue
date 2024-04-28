<template>
  <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <div class="uk-width-1-3@m">
      <div v-if="props.profile[element] !== undefined">
        <p>
          {{ props.label }}

          <a
            class="uk-icon-button"
            uk-icon="trash"
            title="Remove field"
            v-on:click="updateCurrentProfile({ [props.element]: undefined })"
          ></a>
        </p>
        <select
          class="uk-select"
          v-bind:value="props.profile[element]"
          v-on:change="updateCurrentProfile({ [props.element]: ($event.target as HTMLSelectElement).value as any })"
        >
          <option v-for="val in props.values" v-bind:value="val">{{ val }}</option>
        </select>
      </div>
      <PrimaryButton v-else
        v-on:click="updateCurrentProfile({ [props.element]: props.values[0] })"
      >
        <slot name="add-button">
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
import { useAppStore } from 'src/pinia'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  label: string
  profile: Partial<InternalDefaults>
  element: keyof InternalDefaults
  values: string[]
}>()
</script>

<style></style>
