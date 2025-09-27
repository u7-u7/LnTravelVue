import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    currentProvince: '',
    selectedScenic: null,
    mapInstance: null,
    theme: 'light'
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    getCurrentProvince: (state) => state.currentProvince,
    getSelectedScenic: (state) => state.selectedScenic
  },
  
  actions: {
    setLoading(loading) {
      this.loading = loading
    },
    
    setCurrentProvince(province) {
      this.currentProvince = province
    },
    
    setSelectedScenic(scenic) {
      this.selectedScenic = scenic
    },
    
    setMapInstance(map) {
      this.mapInstance = map
    },
    
    setTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    }
  }
})
