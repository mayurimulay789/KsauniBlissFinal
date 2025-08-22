import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_BASE_URL = "http://localhost:5000/api/ksauni-tshirts"

export const fetchKsauniTshirts = createAsyncThunk("ksauniTshirt/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_BASE_URL)
    if (!response.ok) {
      throw new Error("Failed to fetch Ksauni T-shirts")
    }
    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createKsauniTshirt = createAsyncThunk("ksauniTshirt/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("fashionhub_token")}`,
      },
      body: formData,
    })
    if (!response.ok) {
      throw new Error("Failed to create Ksauni T-shirt")
    }
    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateKsauniTshirt = createAsyncThunk(
  "ksauniTshirt/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("fashionhub_token")}`,
        },
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to update Ksauni T-shirt")
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteKsauniTshirt = createAsyncThunk("ksauniTshirt/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("fashionhub_token")}`,
      },
    })
    if (!response.ok) {
      throw new Error("Failed to delete Ksauni T-shirt")
    }
    return id
  } catch (error) {
    return rejectWithValue(error.message)
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
    builder
      // Fetch Ksauni T-shirts
      .addCase(fetchKsauniTshirts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKsauniTshirts.fulfilled, (state, action) => {
        state.loading = false
        state.tshirts = action.payload.data || action.payload
      })
      .addCase(fetchKsauniTshirts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Ksauni T-shirt
      .addCase(createKsauniTshirt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createKsauniTshirt.fulfilled, (state, action) => {
        state.loading = false
        state.tshirts.push(action.payload.tshirt || action.payload)
      })
      .addCase(createKsauniTshirt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Ksauni T-shirt
      .addCase(updateKsauniTshirt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateKsauniTshirt.fulfilled, (state, action) => {
        state.loading = false
        const updatedTshirt = action.payload.tshirt || action.payload
        const index = state.tshirts.findIndex((t) => t._id === updatedTshirt._id)
        if (index !== -1) {
          state.tshirts[index] = updatedTshirt
        }
      })
      .addCase(updateKsauniTshirt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Ksauni T-shirt
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
