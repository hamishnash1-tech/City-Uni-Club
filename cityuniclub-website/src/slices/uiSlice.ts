import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LoiRequest {
  club_id: string
  arrival_date: string
  departure_date: string
  purpose: string
}

interface UIState {
  selectedRegion: string
  loiRequest: LoiRequest | null
}

const initialState: UIState = {
  selectedRegion: 'All',
  loiRequest: null,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.selectedRegion = action.payload
    },
    setLoiRequest: (state, action: PayloadAction<LoiRequest>) => {
      state.loiRequest = action.payload
    },
  },
})

export const { setRegion, setLoiRequest } = uiSlice.actions
export default uiSlice.reducer
