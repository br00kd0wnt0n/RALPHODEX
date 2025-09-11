import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import creatorSlice from './slices/creatorSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    creators: creatorSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;