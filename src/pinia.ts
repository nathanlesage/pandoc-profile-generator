import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { InternalDefaults } from './pandoc-defaults'

const STORAGE_KEY = 'app_data'

// This is how the application data is laid out in LocalStorage
interface StorageLayout {
  profiles: Array<{ name: string, data: Partial<InternalDefaults> }>
}

/**
 * Retrieves the app data from storage
 *
 * @return  {StorageLayout}  The data
 */
function getAppDataFromLocalStorage (): StorageLayout {
  const defaultData: StorageLayout = { profiles: [] }
  const rawItem = window.localStorage.getItem(STORAGE_KEY)
  const appData: StorageLayout = rawItem === null ? defaultData : JSON.parse(rawItem)
  return appData
}

/**
 * Persists app data to local storage
 *
 * @param   {StorageLayout}  appData  The data to persist
 */
function saveAppDataToLocalStorage (appData: StorageLayout) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appData))
}

/**
 * Saves a given profile to storage, potentially overwriting an existing one.
 *
 * @param   {string}                     name   The name of the profile
 * @param   {Partial<InternalDefaults>}  value  The data to save
 */
function saveProfileToLocalStorage (name: string, value: Partial<InternalDefaults>) {
  if (name.trim() === '') {
    console.error('Cannot save profile: No name given.')
    return
  }

  try {
    const appData = getAppDataFromLocalStorage()
  
    const existingIndex = appData.profiles.findIndex(x => x.name === name)
    if (existingIndex > 0) {
      appData.profiles.splice(existingIndex, 1, { name, data: value })
    } else {
      appData.profiles.push({ name, data: value })
    }
  
    saveAppDataToLocalStorage(appData)
  } catch (err: any) {
    console.warn('Could not save profile -- maybe LocalStorage is unsupported')
    console.error(err)
  }
}

/**
 * Retrieves a profile from local storage
 *
 * @param   {string}                     name  The profile to retrieve
 *
 * @return  {Partial<InternalDefaults>}        The profile's data
 */
export function getProfileFromLocalStorage (name: string): Partial<InternalDefaults>|undefined {
  const appData = getAppDataFromLocalStorage()
  const profile = appData.profiles.find(x => x.name === name)
  return profile?.data
}

function renameProfileInLocalStorage (oldName: string, newName: string) {
  if (oldName === newName || newName.trim() === '') {
    return
  }

  const appData = getAppDataFromLocalStorage()
  const profile = appData.profiles.find(x => x.name === oldName)
  if (profile !== undefined) {
    profile.name = newName
    saveAppDataToLocalStorage(appData)
  }
}

/**
 * Retrieves a list of all profiles in storage
 *
 * @return  {string[]}  The profile names
 */
export function listProfilesInLocalStorage (): string[] {
  const appData = getAppDataFromLocalStorage()
  return appData.profiles.map(x => x.name)
}

export const useAppStore = defineStore('app-store', () => {
  const currentProfile = ref<Partial<InternalDefaults>|undefined>(undefined)
  const currentProfileName = ref('')
  const availableProfiles = ref<string[]>([])

  watch(currentProfileName, (newValue, oldValue) => {
    if (newValue === oldValue) {
      return
    }

    renameProfileInLocalStorage(oldValue, newValue)
    availableProfiles.value = listProfilesInLocalStorage()
  })

  try {
    availableProfiles.value = listProfilesInLocalStorage()
  } catch (err: any) {
    console.warn('Could not retrieve profiles from LocalStorage -- maybe unsupported')
  }

  function createNewProfile (name = 'Untitled.yml', template: Partial<InternalDefaults> = {}) {
    // Save the current profile, if applicable
    if (currentProfile.value !== undefined) {
      saveProfileToLocalStorage(currentProfileName.value, currentProfile.value)
    }

    currentProfileName.value = name
    currentProfile.value = template

    // Also immediately save the new one
    saveProfileToLocalStorage(currentProfileName.value, currentProfile.value)
  }

  function loadProfileFromLocalStorage (name: string) {
    saveCurrentProfileToLocalStorage()
    const profile = getProfileFromLocalStorage(name)
    if (profile !== undefined) {
      currentProfileName.value = name
      currentProfile.value = profile
    }
  }

  function updateCurrentProfile (newValues: Partial<InternalDefaults>) {
    console.log(newValues)
    currentProfile.value = {
      ...currentProfile.value,
      ...newValues
    }

    saveProfileToLocalStorage(currentProfileName.value, currentProfile.value)
  }

  function saveCurrentProfileToLocalStorage () {
    if (currentProfile.value !== undefined && currentProfileName.value.trim() !== '') {
      saveProfileToLocalStorage(currentProfileName.value, currentProfile.value)
      availableProfiles.value = listProfilesInLocalStorage()
    }
  }

  function removeProfileFromLocalStorage (name: string) {
    const appData = getAppDataFromLocalStorage()
    const existingIndex = appData.profiles.findIndex(x => x.name === name)
    if (existingIndex > -1) {
      appData.profiles.splice(existingIndex, 1)
      saveAppDataToLocalStorage(appData)
      availableProfiles.value = listProfilesInLocalStorage()
    }
  }

  function closeProfile () {
    if (currentProfile.value !== undefined) {
      saveProfileToLocalStorage(currentProfileName.value, currentProfile.value)
    }

    currentProfileName.value = ''
    currentProfile.value = undefined
  }

  return {
    currentProfile,
    currentProfileName,
    availableProfiles,
    createNewProfile,
    updateCurrentProfile,
    saveCurrentProfileToLocalStorage,
    loadProfileFromLocalStorage,
    removeProfileFromLocalStorage,
    closeProfile
  }
})
