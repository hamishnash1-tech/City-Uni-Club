import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  activeTab: string
  selectedRegion: string
  isLoading: boolean
}

const initialState: UIState = {
  activeTab: 'home',
  selectedRegion: 'All',
  isLoading: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setSelectedRegion: (state, action) => {
      state.selectedRegion = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const { setActiveTab, setSelectedRegion, setLoading } = uiSlice.actions
export default uiSlice.reducer
