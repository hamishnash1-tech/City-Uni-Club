import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isMobileMenuOpen: boolean
  isMemberAreaOpen: boolean
  activeModal: string | null
}

const initialState: UIState = {
  isMobileMenuOpen: false,
  isMemberAreaOpen: false,
  activeModal: null,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    toggleMemberArea: (state) => {
      state.isMemberAreaOpen = !state.isMemberAreaOpen
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
  },
})

export const {
  toggleMobileMenu,
  toggleMemberArea,
  openModal,
  closeModal,
} = uiSlice.actions

export default uiSlice.reducer
