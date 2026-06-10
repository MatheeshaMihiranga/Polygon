import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';
import type { UserState } from '../../types';

const initialState: UserState = {
  employees: [],
  isLoading: false,
  error:     null,
};

export const fetchEmployees = createAsyncThunk(
  'users/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.getEmployees();
      return data.employees;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to fetch employees'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async ({ id, data: payload }: { id: number; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.update(id, payload);
      return data.user;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update profile'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending,   (state)         => { state.isLoading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.isLoading = false; state.employees = action.payload; })
      .addCase(fetchEmployees.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
