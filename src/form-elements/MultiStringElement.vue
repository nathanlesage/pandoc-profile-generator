<template>
  <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
    <div class="uk-width-1-3@m">
      <div v-if="props.profile[element] !== undefined">
        <label for="input-files" class="uk-form-label">{{ props.label }}</label>
        <a class="uk-icon-button" uk-icon="trash" title="Remove property"
          v-on:click="updateCurrentProfile({ [props.element]: undefined })"
        ></a>

        <div class="uk-margin">
          <div v-for="elem, i in thisList" class="uk-margin" v-key="elem">
            <div class="uk-inline">
              <a
                class="uk-form-icon uk-form-icon-flip" href="" uk-icon="icon: trash"
                title="Remove entry"
                v-on:click.prevent="removeElement(i)"
              ></a>
              <input class="uk-input" type="text" v-model="thisList[i]" placeholder="Add an entry&hellip;">
            </div>
          </div>
          <p class="uk-text-meta" v-if="thisList.length === 0">No entries</p>
          <button
            class="uk-button uk-button-secondary uk-button-small"
            v-on:click.prevent="addElement()"
          >
            <slot name="add-label">Add entry</slot>
          </button>
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
import { ref, toRef, watch } from 'vue'
import { useAppStore } from 'src/pinia'

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  profile: Partial<InternalDefaults>
  element: keyof InternalDefaults,
  label: string
}>()
const thisList = ref<string[]>(props.profile[props.element] as string[])
watch(toRef(props, 'profile'), (value) => {
  thisList.value = value[props.element] as string[]
})
watch(thisList, (value) => {
  updateCurrentProfile({ [props.element]: value })
})

function removeElement (idx: number) {
  thisList.value.splice(idx, 1)
}

function addElement () {
  thisList.value.push('')
}
</script>

<style></style>
