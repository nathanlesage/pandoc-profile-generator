<template>
  <div class="uk-margin uk-grid-column-small uk-grid-row-large uk-child-width-expand@s uk-grid-divider@m uk-card uk-card-default uk-card-body uk-padding" uk-grid>
  <div class="uk-width-1-3@m">
    <div v-if="props.profile[props.element] !== undefined">
      <p>
        <strong>{{ props.label }}</strong>

        <a class="uk-icon-button" uk-icon="trash" title="Remove property"
          v-on:click="updateCurrentProfile({ [props.element]: undefined })"
        ></a>
      </p>

      <div class="uk-margin">
        <div v-for="entry, i in props.profile[props.element] as PandocFilter" class="uk-margin">
          <div class="uk-grid-small" uk-grid>
            <div class="uk-width-1-5@s uk-inline-block">
              <a class="uk-icon-button" uk-icon="chevron-up"
                v-on:click.prevent="moveEntryUp(i)"
                title="Move filter up in the list"
              ></a>
              &nbsp;
              <a class="uk-icon-button" uk-icon="chevron-down"
                v-on:click.prevent="moveEntryDown(i)"
                title="Move filter down in the list"
              ></a>
            </div>
            <select class="uk-select uk-width-1-5@s" v-model="(props.profile[props.element] as PandocFilter)[i].type">
              <option value="citeproc">Citeproc</option>
              <option value="lua">Lua</option>
              <option value="json">JSON</option>
            </select>
            <div v-if="entry.type !== 'citeproc'" class="uk-inline uk-width-3-5@s">
              <a
                class="uk-form-icon uk-form-icon-flip" href="" uk-icon="icon: trash"
                title="Remove entry"
                v-on:click.prevent="removeFilter(i)"
              ></a>
              <input
                class="uk-input"
                type="text"
                placeholder="Enter path&hellip;"
                v-model="(props.profile[props.element] as PandocFilter)[i].path"
              >
            </div>
            <div class="uk-width-3-5@s uk-inline-block" v-else>
              <a
                class="uk-form-icon uk-form-icon-flip" href="" uk-icon="icon: trash"
                title="Remove entry"
                v-on:click.prevent="removeFilter(i)"
              ></a>
              <input class="uk-input uk-disabled uk-form-blank" value="Citeproc has no path">
            </div>
          </div>
        </div>
        <p class="uk-text-meta" v-if="(props.profile[props.element] as PandocFilter).length === 0">No entries</p>
        <button class="uk-button uk-button-secondary uk-button-small"
          v-on:click.prevent="addFilter()"
        >
          <slot name="add-label">Add filter</slot>
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
import { useAppStore } from 'src/pinia'

type PandocFilter = Array<{ type: 'json'|'lua'|'citeproc', path: string }>

const appStore = useAppStore()

const { updateCurrentProfile } = appStore

const props = defineProps<{
  profile: Partial<InternalDefaults>
  element: keyof InternalDefaults,
  label: string
}>()

/**
 * Adds a new filter
 */
function addFilter () {
  let metadata = props.profile[props.element] as PandocFilter|undefined
  if (metadata === undefined) {
    return
  }

  metadata.push({ type: 'lua', path: '' })
  // Ensure the changes are picked up
  updateCurrentProfile({ [props.element]: metadata })
}

/**
 * Removes a filter
 *
 * @param   {number}  index  The index
 */
function removeFilter (index: number) {
  let metadata = props.profile[props.element] as PandocFilter|undefined
  if (metadata === undefined) {
    return
  }

  metadata.splice(index, 1)
  // Ensure the changes are picked up by other participants
  updateCurrentProfile({ [props.element]: metadata })
}

/**
 * Moves a filter up in the list
 *
 * @param   {number}  i  The index
 */
function moveEntryUp (i: number) {
  if (props.profile[props.element] === undefined) {
    return
  }
  const filters = props.profile[props.element] as PandocFilter

  if (i === 0) {
    return
  }

  const elem = filters[i]
  filters.splice(i, 1)
  filters.splice(i - 1, 0, elem)

  updateCurrentProfile({ [props.element]: filters })
}

/**
 * Moves a filter down the list
 *
 * @param   {number}  i  The index
 */
function moveEntryDown (i: number) {
  if (props.profile[props.element] === undefined) {
    return
  }
  const filters = props.profile[props.element] as PandocFilter
  if (i === filters.length - 1) {
    return
  }

  const elem = filters[i]
  filters.splice(i, 1)
  filters.splice(i + 1, 0, elem)

  updateCurrentProfile({ [props.element]: filters })
}
</script>

<style></style>
