<template>
  <div class="uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <div class="uk-width-1-3@m">
      <div v-if="props.profile[props.element] !== undefined">
        <label class="uk-form-label">{{ props.label }}</label>
        <a class="uk-icon-button" uk-icon="trash" title="Remove property"
          v-on:click="updateCurrentProfile({ [props.element]: undefined })"
        ></a>
        <div class="uk-form-controls">
          <input
            type="number"
            class="uk-input"
            placeholder="Enter number"
            v-bind:value="props.profile[element]"
            v-on:input="updateCurrentProfile({ [props.element]: parseInt(($event.target as HTMLInputElement).value, 10) })"
          >
        </div>
      </div>
      <PrimaryButton v-else
        v-on:click="updateCurrentProfile({ [props.element]: props.defaultValue })"
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
import { InternalDefaults } from 'src/pandoc-defaults'
import PrimaryButton from 'src/form-elements/PrimaryButton.vue'
import { useAppStore } from 'src/pinia'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  element: keyof InternalDefaults
  defaultValue: number
  profile: Partial<InternalDefaults>
  label: string
}>()
</script>

<style></style>
