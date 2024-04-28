<template>
  <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <label class="uk-form-label uk-width-1-3@m">
      <input
        class="uk-checkbox"
        type="checkbox"
        v-bind:checked="props.checked"
        v-on:change="emit('change', !checked)"
      >
      {{ props.label }}
    </label>
    <p class="uk-text-meta uk-width-expand@m">
      <slot name="description">No description</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  checked: boolean
}>()

const emit = defineEmits<(e: 'change', value: boolean) => void>()
</script>

<style></style>
