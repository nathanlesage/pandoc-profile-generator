<template>
  <WelcomeScreen
    v-if="appStore.currentProfile === undefined"
  ></WelcomeScreen>
  <EditorScreen
    v-bind:profile="appStore.currentProfile"
    v-else
  ></EditorScreen>

  <footer
    class="uk-section-secondary uk-margin-top uk-position-fixed uk-position-bottom"
  >
    <div class="uk-container uk-margin-bottom uk-margin-top">
      <div class="uk-text-center">
        Pandoc Profile Generator &copy; 2024 | Hendrik Erz |
        <a href="https://github.com/nathanlesage/pandoc-profile-generator">View on Github</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAppStore } from './pinia'
import WelcomeScreen from './screens/WelcomeScreen.vue'
import EditorScreen from './screens/EditorScreen.vue'

const appStore = useAppStore()
</script>

<style>
#app {
  margin-bottom: 70px;
}
</style>
