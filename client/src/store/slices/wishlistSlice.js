import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistAPI from "../api/wishlistAPI";

// Helper function to save wishlist to localStorage
const saveToLocalStorage = (items) => {
  try {
    localStorage.setItem('guest_wishlist', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save wishlist to localStorage:', err);
  }
};

// Helper function to get wishlist from localStorage
const getFromLocalStorage = () => {
  try {
    const items = localStorage.getItem('guest_wishlist');
    return items ? JSON.parse(items) : [];
  } catch (err) {
    console.error('Failed to get wishlist from localStorage:', err);
    return [];
  }
};

// --------------------
// Async Thunks
// --------------------

// Fetch wishlist from server
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;
      
      // For guest users, return localStorage items
      if (!isAuthenticated) {
        const items = getFromLocalStorage();
        return {
          wishlist: items,
          count: items.length
        };
      }

      // For authenticated users, fetch from server
      const response = await wishlistAPI.getWishlist();
      return response.data;
    } catch (error) {
      // If auth error, return localStorage items
      if (error.response?.status === 401) {
        const items = getFromLocalStorage();
        return {
          wishlist: items,
          count: items.length
        };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

// Add product to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (product, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;

      // For guest users, handle locally
      if (!isAuthenticated) {
        const currentItems = getFromLocalStorage();
        const productToAdd = typeof product === "string" 
          ? getState().wishlist.items.find(item => item._id === product)
          : product;

        if (!productToAdd) {
          return rejectWithValue("Product not found");
        }

        // Check if already exists
        const existingIndex = currentItems.findIndex(item => item._id === productToAdd._id);
        if (existingIndex === -1) {
          const updatedItems = [...currentItems, productToAdd];
          saveToLocalStorage(updatedItems);
          return {
            wishlist: updatedItems,
            count: updatedItems.length,
            productId: productToAdd._id,
            product: productToAdd
          };
        }
        return {
          wishlist: currentItems,
          count: currentItems.length,
          productId: productToAdd._id,
          product: productToAdd
        };
      }

      // For authenticated users
      const productId = typeof product === "string" ? product : product._id;
      const response = await wishlistAPI.addToWishlist(productId);
      return {
        ...response.data,
        productId,
        product: typeof product === "object" ? product : null,
      };
    } catch (error) {
      // If auth error for guest, handle locally
      if (error.response?.status === 401 && !getState().auth.isAuthenticated) {
        const items = getFromLocalStorage();
        return {
          wishlist: items,
          count: items.length,
          product: product
        };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// Remove product from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;

      // For guest users, handle locally
      if (!isAuthenticated) {
        const currentItems = getFromLocalStorage();
        const updatedItems = currentItems.filter(item => item._id !== productId);
        saveToLocalStorage(updatedItems);
        return {
          wishlist: updatedItems,
          count: updatedItems.length,
          productId
        };
      }

      // For authenticated users
      const response = await wishlistAPI.removeFromWishlist(productId);
      return { ...response.data, productId }; // Include productId in response
    } catch (error) {
      // If auth error for guest, handle locally
      if (error.response?.status === 401 && !getState().auth.isAuthenticated) {
        const currentItems = getFromLocalStorage();
        const updatedItems = currentItems.filter(item => item._id !== productId);
        saveToLocalStorage(updatedItems);
        return {
          wishlist: updatedItems,
          count: updatedItems.length,
          productId
        };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

// Clear entire wishlist
export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue, getState }) => {
    try {
      const isAuthenticated = getState().auth.isAuthenticated;

      // For guest users, handle locally
      if (!isAuthenticated) {
        saveToLocalStorage([]);
        return { wishlist: [], count: 0 };
      }

      // For authenticated users
      const response = await wishlistAPI.clearWishlist();
      return response.data; // { wishlist: [], count: 0 }
    } catch (error) {
      // If auth error for guest, handle locally
      if (error.response?.status === 401 && !getState().auth.isAuthenticated) {
        saveToLocalStorage([]);
        return { wishlist: [], count: 0 };
      }
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
  items: getFromLocalStorage(),
  count: getFromLocalStorage().length,
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
    clearWishlistLocal: (state) => {
      state.items = [];
      state.count = 0;
      saveToLocalStorage([]);
    },
    // Optimistic add to wishlist
    optimisticAddToWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((item) => item._id === product._id);
      if (!exists) {
        state.items.push(product);
        state.count = state.items.length;
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        saveToLocalStorage(state.items);
      }
    },
    // Optimistic remove from wishlist
    optimisticRemoveFromWishlist: (state, action) => {
      const productId = action.payload;
      const existingIndex = state.items.findIndex((item) => item._id === productId);
      if (existingIndex > -1) {
        state.items.splice(existingIndex, 1);
        state.count = state.items.length;
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        saveToLocalStorage(state.items);
      }
    },
    // Toggle wishlist item (for immediate UI feedback)
    toggleWishlistItem: (state, action) => {
      const product = action.payload;
      const productId = typeof product === "string" ? product : product._id;
      const existingIndex = state.items.findIndex((item) => item._id === productId);
      if (existingIndex > -1) {
        // Remove from wishlist
        state.items.splice(existingIndex, 1);
      } else {
        // Add to wishlist (only if we have product data)
        if (typeof product === "object") {
          state.items.push(product);
        }
      }
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
        // Save to localStorage for guest users
        saveToLocalStorage(state.items);
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
        if (action.payload.productId) {
          // Remove by id if productId is provided
          state.items = state.items.filter(item => item._id !== action.payload.productId);
        } else {
          // Otherwise use the server response
          state.items = action.payload.wishlist || state.items;
        }
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage for guest users
        saveToLocalStorage(state.items);
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
        // Clear localStorage for guest users
        saveToLocalStorage([]);
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // -------------------- Move to Cart --------------------
      .addCase(moveToCart.pending, (state, action) => {
        state.error = null;
        if (action.meta.arg.productId) {
          state.movingToCart = new Set([...state.movingToCart, action.meta.arg.productId]);
        }
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        if (action.payload.productId) {
          // Remove the moved item from wishlist
          state.items = state.items.filter(item => item._id !== action.payload.productId);
          if (state.movingToCart) {
            state.movingToCart.delete(action.payload.productId);
          }
        } else {
          // Otherwise use the server response
          state.items = action.payload.wishlist || state.items;
        }
        state.count = action.payload.count || state.items.length;
        state.lastUpdated = new Date().toISOString();
        // Update localStorage for guest users
        saveToLocalStorage(state.items);
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.error = action.payload;
        if (action.meta.arg.productId && state.movingToCart) {
          state.movingToCart.delete(action.meta.arg.productId);
        }
      });
  },
});

// --------------------
// Export Actions & Reducer
// --------------------
export const { 
  clearError, 
  clearWishlistLocal,
  optimisticAddToWishlist, 
  optimisticRemoveFromWishlist,
  toggleWishlistItem 
} = wishlistSlice.actions;

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
export const selectMovingToCart = (state) => state.wishlist.movingToCart;

// Check if product exists in wishlist
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => item._id === productId);
