import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistAPI from "../api/wishlistAPI";

// --------------------
// Async Thunks
// --------------------

// Fetch wishlist from server
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response.data; // should include { wishlist: [...], count: number }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

// Add product to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (product, { rejectWithValue }) => {
    try {
      const productId = typeof product === "string" ? product : product._id;
      const response = await wishlistAPI.addToWishlist(productId);
      return response.data; // should include { wishlist: [...], count: number }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// Remove product from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      return response.data; // should include { wishlist: [...], count: number }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

// Clear entire wishlist
export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.clearWishlist();
      return response.data; // { wishlist: [], count: 0 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear wishlist");
    }
  }
);

// Move wishlist item to cart
export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.moveToCart(productId, data);
      return response.data; // { wishlist: [...], count: number }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to move item to cart");
    }
  }
);

// --------------------
// Initial State
// --------------------
const initialState = {
  items: [],
  count: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isAddingToWishlist: false,
  isRemovingFromWishlist: false,
  movingToCart: new Set(),
};

// --------------------
// Slice
// --------------------
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic add to wishlist
    optimisticAddToWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((item) => item._id === product._id);
      if (!exists) {
        state.items.push(product);
        state.count = state.items.length;
        state.lastUpdated = new Date().toISOString();
      }
    },
    // Optimistic remove from wishlist
    optimisticRemoveFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      state.count = state.items.length;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // -------------------- Fetch Wishlist --------------------
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.wishlist || [];
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // -------------------- Add to Wishlist --------------------
      .addCase(addToWishlist.pending, (state) => {
        state.isAddingToWishlist = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isAddingToWishlist = false;
        state.items = action.payload.wishlist || state.items;
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isAddingToWishlist = false;
        state.error = action.payload;
      })

      // -------------------- Remove from Wishlist --------------------
      .addCase(removeFromWishlist.pending, (state) => {
        state.isRemovingFromWishlist = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isRemovingFromWishlist = false;
        state.items = action.payload.wishlist || state.items;
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isRemovingFromWishlist = false;
        state.error = action.payload;
      })

      // -------------------- Clear Wishlist --------------------
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.wishlist || [];
        state.count = action.payload.count || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // -------------------- Move to Cart --------------------
      .addCase(moveToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.items = action.payload.wishlist || state.items;
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// --------------------
// Export Actions & Reducer
// --------------------
export const { clearError, optimisticAddToWishlist, optimisticRemoveFromWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

// --------------------
// Selectors
// --------------------
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.count;
export const selectWishlistIsLoading = (state) => state.wishlist.isLoading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectIsAddingToWishlist = (state) => state.wishlist.isAddingToWishlist;
export const selectIsRemovingFromWishlist = (state) => state.wishlist.isRemovingFromWishlist;

// Check if product exists in wishlist
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => item._id === productId);
