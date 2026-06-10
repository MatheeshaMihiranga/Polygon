import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';
import type { AuthState, User } from '../../types';

const initialState: AuthState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
};

// ── Thunks ────────────────────────────────────────────────────

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(email, password);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user',  JSON.stringify(data.user));
      return { token: data.token as string, user: data.user as User };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token   = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (!token || !userStr) return rejectWithValue('No session');
      return { token, user: JSON.parse(userStr) as User };
    } catch {
      return rejectWithValue('Failed to restore session');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
});

// ── Slice ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        AsyncStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,  (state)         => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled,(state, action) => {
        state.isLoading       = false;
        state.isAuthenticated = true;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
