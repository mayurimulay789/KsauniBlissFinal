import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminAPI from '../api/adminAPI'

// Async thunks
export const fetchAllInnovations = createAsyncThunk(
  'innovations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.get('/innovations/admin')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch innovations')
    }
  }
)

export const createInnovation = createAsyncThunk(
  'innovations/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createInnovation(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create innovation')
    }
  }
)

export const updateInnovation = createAsyncThunk(
  'innovations/update',
  async ({ innovationId, formData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateInnovation(innovationId, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update innovation')
    }
  }
)

export const deleteInnovation = createAsyncThunk(
  'innovations/delete',
  async (innovationId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteInnovation(innovationId)
      return innovationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete innovation')
    }
  }
)

const innovationSlice = createSlice({
  name: 'innovations',
  initialState: {
    innovations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all innovations
      .addCase(fetchAllInnovations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllInnovations.fulfilled, (state, action) => {
        state.loading = false
        state.innovations = action.payload.innovations || action.payload
      })
      .addCase(fetchAllInnovations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create innovation
      .addCase(createInnovation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInnovation.fulfilled, (state, action) => {
        state.loading = false
        state.innovations.unshift(action.payload.innovation || action.payload)
      })
      .addCase(createInnovation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update innovation
      .addCase(updateInnovation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInnovation.fulfilled, (state, action) => {
        state.loading = false
        const updatedInnovation = action.payload.innovation || action.payload
        const index = state.innovations.findIndex(inv => inv._id === updatedInnovation._id)
        if (index !== -1) {
          state.innovations[index] = updatedInnovation
        }
      })
      .addCase(updateInnovation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete innovation
      .addCase(deleteInnovation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInnovation.fulfilled, (state, action) => {
        state.loading = false
        state.innovations = state.innovations.filter(inv => inv._id !== action.payload)
      })
      .addCase(deleteInnovation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = innovationSlice.actions
export default innovationSlice.reducer
