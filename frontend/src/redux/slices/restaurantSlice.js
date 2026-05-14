import { createSlice } from "@reduxjs/toolkit";
import { 
  getRestaurants, 
  getRestaurantById,
  searchRestaurants,
  getFeaturedRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
  toggleRestaurantStatus,
  getOperatingHours,
  checkIsOpen,
  getRestaurantStats
} from "../actions/restaurantAction";

const initialState = {
    restaurants: [],
    selectedRestaurant: null,
    featuredRestaurants: [],
    myRestaurants: [],
    count: 0,
    total: 0,
    loading: false,
    error: null,
    showVegOnly: false,
    pureVegRestaurantCount: 0,
    operatingHours: null,
    isOpen: null,
    restaurantStats: null,
    success: false,
    page: 1,
    pages: 1,
    results: 0,
}

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState,
    reducers: {
        sortByRating: (state) => {
            const restaurants = state.showVegOnly 
                ? state.restaurants.filter(r => r.isVeg || r.isveg)
                : state.restaurants;
            
            state.restaurants = [...restaurants].sort((a, b) => 
                (b.rating?.average || b.rating || 0) - (a.rating?.average || a.rating || 0)
            );
        },
        
        sortByReview: (state) => {
            const restaurants = state.showVegOnly 
                ? state.restaurants.filter(r => r.isVeg || r.isveg)
                : state.restaurants;
            
            state.restaurants = [...restaurants].sort((a, b) => 
                (b.totalReviews || 0) - (a.totalReviews || 0)
            );
        },
        
        sortByPrice: (state) => {
            const restaurants = state.showVegOnly 
                ? state.restaurants.filter(r => r.isVeg || r.isveg)
                : state.restaurants;
            
            state.restaurants = [...restaurants].sort((a, b) => 
                (a.pricing?.averageCost || a.averageCost || 0) - (b.pricing?.averageCost || b.averageCost || 0)
            );
        },
        
        toggleVegOnly: (state) => {
            state.showVegOnly = !state.showVegOnly;
            state.pureVegRestaurantCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
        },
        
        clearError: (state) => {
            state.error = null;
        },
        
        clearSelectedRestaurant: (state) => {
            state.selectedRestaurant = null;
            state.error = null;
        },
        
        clearSuccess: (state) => {
            state.success = false;
        },
        
        resetRestaurantState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
                state.count = action.payload.count;
                state.total = action.payload.total || action.payload.count;
                state.page = action.payload.page || 1;
                state.pages = action.payload.pages || 1;
                state.results = action.payload.results || action.payload.restaurants.length;
                state.pureVegRestaurantCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
            })
            .addCase(getRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurants";
            })
            
            .addCase(getRestaurantById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurantById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRestaurant = action.payload;
            })
            .addCase(getRestaurantById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurant details";
            })
            
            .addCase(searchRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload.restaurants;
                state.results = action.payload.results;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.pureVegRestaurantCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
            })
            .addCase(searchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to search restaurants";
            })
            
            .addCase(getFeaturedRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFeaturedRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredRestaurants = action.payload;
            })
            .addCase(getFeaturedRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch featured restaurants";
            })
            
            .addCase(createRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                state.myRestaurants.push(action.payload);
                state.success = true;
            })
            .addCase(createRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create restaurant";
                state.success = false;
            })
            
            .addCase(updateRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRestaurant = action.payload;
                
                const index = state.restaurants.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.restaurants[index] = action.payload;
                }
                
                const myIndex = state.myRestaurants.findIndex(r => r._id === action.payload._id);
                if (myIndex !== -1) {
                    state.myRestaurants[myIndex] = action.payload;
                }
                
                state.success = true;
            })
            .addCase(updateRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update restaurant";
                state.success = false;
            })
            
            .addCase(deleteRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = state.restaurants.filter(r => r._id !== action.payload);
                state.myRestaurants = state.myRestaurants.filter(r => r._id !== action.payload);
                if (state.selectedRestaurant?._id === action.payload) {
                    state.selectedRestaurant = null;
                }
                state.count = state.restaurants.length;
                state.pureVegRestaurantCount = calculatePureVegCount(state.restaurants, state.showVegOnly);
            })
            .addCase(deleteRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete restaurant";
            })
            
            .addCase(getMyRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.myRestaurants = action.payload;
            })
            .addCase(getMyRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch your restaurants";
            })
            
            .addCase(toggleRestaurantStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleRestaurantStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { id, isActive } = action.payload;
                
                const index = state.restaurants.findIndex(r => r._id === id);
                if (index !== -1) {
                    state.restaurants[index].isActive = isActive;
                }
                
                const myIndex = state.myRestaurants.findIndex(r => r._id === id);
                if (myIndex !== -1) {
                    state.myRestaurants[myIndex].isActive = isActive;
                }
                
                if (state.selectedRestaurant?._id === id) {
                    state.selectedRestaurant.isActive = isActive;
                }
            })
            .addCase(toggleRestaurantStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to toggle restaurant status";
            })
            
            .addCase(getOperatingHours.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOperatingHours.fulfilled, (state, action) => {
                state.loading = false;
                state.operatingHours = action.payload;
            })
            .addCase(getOperatingHours.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch operating hours";
            })
            
            .addCase(checkIsOpen.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkIsOpen.fulfilled, (state, action) => {
                state.loading = false;
                state.isOpen = action.payload;
            })
            .addCase(checkIsOpen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to check restaurant status";
            })
            
            .addCase(getRestaurantStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurantStats.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurantStats = action.payload;
            })
            .addCase(getRestaurantStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurant statistics";
            });
    }
});


const calculatePureVegCount = (restaurants, showVegOnly) => {
    if (!showVegOnly) return restaurants.length;
    return restaurants.filter(restaurant => restaurant.isVeg === true || restaurant.isveg === true).length;
};

export const selectFilteredRestaurants = (state) => {
    if (!state.restaurants.showVegOnly) {
        return state.restaurants.restaurants;
    }
    return state.restaurants.restaurants.filter(
        restaurant => restaurant.isVeg === true || restaurant.isveg === true
    );
};

export const selectFilteredCount = (state) => {
    if (!state.restaurants.showVegOnly) {
        return state.restaurants.count;
    }
    return state.restaurants.restaurants.filter(
        restaurant => restaurant.isVeg === true || restaurant.isveg === true
    ).length;
};

export const selectRestaurantLoading = (state) => state.restaurants.loading;
export const selectRestaurantError = (state) => state.restaurants.error;
export const selectSelectedRestaurant = (state) => state.restaurants.selectedRestaurant;
export const selectMyRestaurants = (state) => state.restaurants.myRestaurants;
export const selectFeaturedRestaurants = (state) => state.restaurants.featuredRestaurants;

export const {
    sortByRating,
    sortByReview,
    sortByPrice,
    toggleVegOnly,
    clearError,
    clearSelectedRestaurant,
    clearSuccess,
    resetRestaurantState
} = restaurantSlice.actions;

export default restaurantSlice.reducer;