<template>
  <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <div class="uk-width-1-3@m">
      <div v-if="props.profile[props.element] !== undefined">
      <p>
        {{ props.label }}

        <a class="uk-icon-button" uk-icon="trash" title="Remove property"
          v-on:click="updateCurrentProfile({ [props.element]: undefined })"
        ></a>
      </p>
      <input
        class="uk-input"
        type="text"
        placeholder="Entry"
        v-bind:value="props.profile[element]"
        v-on:input="updateCurrentProfile({ [props.element]: ($event.target as HTMLInputElement).value })"
      >
    </div>
    <PrimaryButton v-else
      v-on:click="updateCurrentProfile({ [props.element]: '' })"
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
import { useAppStore } from 'src/pinia'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  profile: Partial<InternalDefaults>
  element: keyof InternalDefaults
  label: string
}>()
</script>

<style></style>
