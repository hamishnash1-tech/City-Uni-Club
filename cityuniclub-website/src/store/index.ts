import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import memberReducer from '../slices/memberSlice'
import uiReducer from '../slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    member: memberReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
