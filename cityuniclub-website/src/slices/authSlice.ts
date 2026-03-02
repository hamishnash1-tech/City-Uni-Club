import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  member: {
    id: string
    email: string
    full_name: string
    first_name: string
    membership_number: string
    membership_type: string
  } | null
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
    loginSuccess: (state, action: PayloadAction<{ token: string; member: AuthState['member'] }>) => {
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
    checkAuth: (state) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        state.token = token
        state.isAuthenticated = true
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  checkAuth,
} = authSlice.actions

export default authSlice.reducer
