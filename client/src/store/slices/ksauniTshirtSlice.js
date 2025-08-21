import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "/api/ksauni-tshirt"

// Helper function to get auth headers
const getAuthHeaders = (getState) => {
  const token = getState().auth.token || localStorage.getItem("token")
  return {
    "Content-Type": "multipart/form-data",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Async thunks
export const fetchKsauniTshirts = createAsyncThunk("ksauniTshirt/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL)
    return response.data.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch Ksauni T-shirts")
  }
})

export const createKsauniTshirt = createAsyncThunk(
  "ksauniTshirt/create",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(API_URL, formData, {
        headers: getAuthHeaders(getState),
      })
      return response.data.tshirt
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create Ksauni T-shirt")
    }
  },
)

export const updateKsauniTshirt = createAsyncThunk(
  "ksauniTshirt/update",
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: getAuthHeaders(getState),
      })
      return response.data.tshirt
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update Ksauni T-shirt")
    }
  },
)

export const deleteKsauniTshirt = createAsyncThunk("ksauniTshirt/delete", async (id, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token")
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete Ksauni T-shirt")
  }
})

const ksauniTshirtSlice = createSlice({
  name: "ksauniTshirt",
  initialState: {
    tshirts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchKsauniTshirts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKsauniTshirts.fulfilled, (state, action) => {
        state.loading = false
        state.tshirts = action.payload
      })
      .addCase(fetchKsauniTshirts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create
    builder
      .addCase(createKsauniTshirt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createKsauniTshirt.fulfilled, (state, action) => {
        state.loading = false
        state.tshirts.unshift(action.payload)
      })
      .addCase(createKsauniTshirt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update
    builder
      .addCase(updateKsauniTshirt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateKsauniTshirt.fulfilled, (state, action) => {
        state.loading = false
        const index = state.tshirts.findIndex((t) => t._id === action.payload._id)
        if (index !== -1) {
          state.tshirts[index] = action.payload
        }
      })
      .addCase(updateKsauniTshirt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete
    builder
      .addCase(deleteKsauniTshirt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteKsauniTshirt.fulfilled, (state, action) => {
        state.loading = false
        state.tshirts = state.tshirts.filter((t) => t._id !== action.payload)
      })
      .addCase(deleteKsauniTshirt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = ksauniTshirtSlice.actions
export default ksauniTshirtSlice.reducer
