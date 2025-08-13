import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortType = 'relavent' | 'low-high' | 'high-low' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export interface Filters {
  category: string[];
  subCategory: string[];
  sortType: SortType;
}

export interface UIState {
  search: string;
  showSearch: boolean;
  filters: Filters;
  showFilter: boolean;
}

export interface RootState {
  ui: UIState;
}

const initialState: UIState = {
  search: '',
  showSearch: false,
  filters: {
    category: [],
    subCategory: [],
    sortType: 'relavent',
  },
  showFilter: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    
    setShowSearch: (state, action: PayloadAction<boolean>) => {
      state.showSearch = action.payload;
    },
    
    setShowFilter: (state, action: PayloadAction<boolean>) => {
      state.showFilter = action.payload;
    },
    
    toggleCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      const categoryIndex = state.filters.category.indexOf(category);
      
      if (categoryIndex > -1) {
        state.filters.category.splice(categoryIndex, 1);
      } else {
        state.filters.category.push(category);
      }
    },
    
    toggleSubCategory: (state, action: PayloadAction<string>) => {
      const subCategory = action.payload;
      const subCategoryIndex = state.filters.subCategory.indexOf(subCategory);
      
      if (subCategoryIndex > -1) {
        state.filters.subCategory.splice(subCategoryIndex, 1);
      } else {
        state.filters.subCategory.push(subCategory);
      }
    },
    
    setSortType: (state, action: PayloadAction<SortType>) => {
      state.filters.sortType = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters.category = [];
      state.filters.subCategory = [];
      state.filters.sortType = 'relavent';
    },

    clearSearch: (state) => {
      state.search = '';
    },

    toggleSearchVisibility: (state) => {
      state.showSearch = !state.showSearch;
    },

    toggleFilterVisibility: (state) => {
      state.showFilter = !state.showFilter;
    },

    setCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.category = action.payload;
    },

    setSubCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.subCategory = action.payload;
    },

    removeCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      state.filters.category = state.filters.category.filter(cat => cat !== category);
    },

    removeSubCategory: (state, action: PayloadAction<string>) => {
      const subCategory = action.payload;
      state.filters.subCategory = state.filters.subCategory.filter(sub => sub !== subCategory);
    },

    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetUI: (state) => {
      state.search = '';
      state.showSearch = false;
      state.showFilter = false;
      state.filters = {
        category: [],
        subCategory: [],
        sortType: 'relavent',
      };
    },
  },
});

export const {
  setSearch,
  setShowSearch,
  setShowFilter,
  toggleCategory,
  toggleSubCategory,
  setSortType,
  clearFilters,
  clearSearch,
  toggleSearchVisibility,
  toggleFilterVisibility,
  setCategories,
  setSubCategories,
  removeCategory,
  removeSubCategory,
  setFilters,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectSearch = (state: RootState): string => state.ui.search;
export const selectShowSearch = (state: RootState): boolean => state.ui.showSearch;
export const selectShowFilter = (state: RootState): boolean => state.ui.showFilter;
export const selectFilters = (state: RootState): Filters => state.ui.filters;
export const selectSortType = (state: RootState): SortType => state.ui.filters.sortType;

// Additional selectors
export const selectCategories = (state: RootState): string[] => state.ui.filters.category;
export const selectSubCategories = (state: RootState): string[] => state.ui.filters.subCategory;

export const selectHasActiveFilters = (state: RootState): boolean => {
  const { category, subCategory } = state.ui.filters;
  return category.length > 0 || subCategory.length > 0;
};

export const selectFilterCount = (state: RootState): number => {
  const { category, subCategory } = state.ui.filters;
  return category.length + subCategory.length;
};

export const selectIsCategorySelected = (category: string) => (state: RootState): boolean =>
  state.ui.filters.category.includes(category);

export const selectIsSubCategorySelected = (subCategory: string) => (state: RootState): boolean =>
  state.ui.filters.subCategory.includes(subCategory);

export const selectSearchQuery = (state: RootState): string => state.ui.search.trim().toLowerCase();

export const selectHasSearchQuery = (state: RootState): boolean => state.ui.search.trim().length > 0;

export const selectUIStateSummary = (state: RootState) => ({
  hasSearch: state.ui.search.trim().length > 0,
  searchVisible: state.ui.showSearch,
  filterVisible: state.ui.showFilter,
  activeFiltersCount: state.ui.filters.category.length + state.ui.filters.subCategory.length,
  sortType: state.ui.filters.sortType,
});

export const selectHasActiveUIControls = (state: RootState): boolean => {
  return (
    state.ui.search.trim().length > 0 ||
    state.ui.filters.category.length > 0 ||
    state.ui.filters.subCategory.length > 0 ||
    state.ui.filters.sortType !== 'relavent'
  );
};

export default uiSlice.reducer;