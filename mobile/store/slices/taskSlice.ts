import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskAPI } from '../../services/api';
import type { Task, TaskState, TaskStats } from '../../types';

const initialState: TaskState = {
  tasks:       [],
  currentTask: null,
  stats:       null,
  isLoading:   false,
  error:       null,
  filter:      { status: '', priority: '', search: '' },
};

// ── Thunks ────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: { status?: string; priority?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.getAll(params);
      return data.tasks as Task[];
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to fetch tasks'
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.getById(id);
      return data.task as Task;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to fetch task'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.create(taskData);
      return data.task as Task;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data: taskData }: { id: number; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.update(id, taskData);
      return data.task as Task;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await taskAPI.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete task'
      );
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.getStats();
      return data.stats as TaskStats;
    } catch (err: unknown) {
      return rejectWithValue(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to fetch stats'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter:        (state, action: PayloadAction<Partial<TaskState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter:      (state) => { state.filter = { status: '', priority: '', search: '' }; },
    clearError:       (state) => { state.error       = null; },
    clearCurrentTask: (state) => { state.currentTask = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending,    (state)         => { state.isLoading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled,  (state, action) => { state.isLoading = false; state.tasks = action.payload; })
      .addCase(fetchTasks.rejected,   (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      // fetchTaskById
      .addCase(fetchTaskById.pending,   (state)         => { state.isLoading = true; })
      .addCase(fetchTaskById.fulfilled, (state, action) => { state.isLoading = false; state.currentTask = action.payload; })
      .addCase(fetchTaskById.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => { state.tasks.unshift(action.payload); })
      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
        if (state.currentTask?.id === action.payload.id) state.currentTask = action.payload;
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      // fetchTaskStats
      .addCase(fetchTaskStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export const { setFilter, clearFilter, clearError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
