import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Member {
  id: string
  email: string
  full_name: string
  first_name: string
  membership_number: string
  membership_type: string
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  member: Member | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: localStorage.getItem('authToken'),
  member: null,
  isLoading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; member: Member }>) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.member = action.payload.member
      state.isLoading = false
      state.error = null
      localStorage.setItem('authToken', action.payload.token)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.member = null
      localStorage.removeItem('authToken')
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
