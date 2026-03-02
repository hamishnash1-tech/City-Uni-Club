import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ReciprocalClub {
  id: string
  name: string
  location: string
  region: string
  country: string
  note?: string
}

export interface LoiRequest {
  club_id: string
  arrival_date: string
  departure_date: string
  purpose: 'Business' | 'Leisure' | 'Both'
  special_requests?: string
}

interface MemberState {
  clubs: ReciprocalClub[]
  selectedRegion: string
  isLoading: boolean
  error: string | null
  loiRequest: LoiRequest | null
}

const initialState: MemberState = {
  clubs: [],
  selectedRegion: 'All',
  isLoading: false,
  error: null,
  loiRequest: null,
}

export const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.selectedRegion = action.payload
    },
    loadClubsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loadClubsSuccess: (state, action: PayloadAction<ReciprocalClub[]>) => {
      state.clubs = action.payload
      state.isLoading = false
    },
    loadClubsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setLoiRequest: (state, action: PayloadAction<LoiRequest | null>) => {
      state.loiRequest = action.payload
    },
  },
})

export const {
  setRegion,
  loadClubsStart,
  loadClubsSuccess,
  loadClubsFailure,
  setLoiRequest,
} = memberSlice.actions

export default memberSlice.reducer
