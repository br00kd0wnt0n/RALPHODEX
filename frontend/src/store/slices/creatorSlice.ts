import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { creatorAPI } from '../../services/api';

interface Creator {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  social_handles: Record<string, string>;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  primary_content_type?: string;
  audience_size: number;
  engagement_rate: number;
  contact_date?: string;
  source_of_contact?: string;
  potential_projects: any[];
  notes?: string;
  tags: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
  interactions?: any[];
}

interface CreatorState {
  creators: Creator[];
  selectedCreator: Creator | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
}

const initialState: CreatorState = {
  creators: [],
  selectedCreator: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

export const fetchCreators = createAsyncThunk(
  'creators/fetchCreators',
  async (params: { page?: number; limit?: number; search?: string; tags?: string; verified?: boolean; metaFilter?: boolean }) => {
    const response = await creatorAPI.getCreators(params);
    return response.data;
  }
);

export const fetchCreatorById = createAsyncThunk(
  'creators/fetchCreatorById',
  async (id: string) => {
    const response = await creatorAPI.getCreatorById(id);
    return response.data;
  }
);

export const createCreator = createAsyncThunk(
  'creators/createCreator',
  async (creatorData: Partial<Creator>) => {
    const response = await creatorAPI.createCreator(creatorData);
    return response.data;
  }
);

export const updateCreator = createAsyncThunk(
  'creators/updateCreator',
  async ({ id, data }: { id: string; data: Partial<Creator> }) => {
    const response = await creatorAPI.updateCreator(id, data);
    return response.data;
  }
);

export const deleteCreator = createAsyncThunk(
  'creators/deleteCreator',
  async (id: string) => {
    await creatorAPI.deleteCreator(id);
    return id;
  }
);

const creatorSlice = createSlice({
  name: 'creators',
  initialState,
  reducers: {
    clearSelectedCreator: (state) => {
      state.selectedCreator = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreators.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreators.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creators = action.payload.creators;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchCreators.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch creators';
      })
      .addCase(fetchCreatorById.fulfilled, (state, action) => {
        state.selectedCreator = action.payload;
      })
      .addCase(createCreator.fulfilled, (state, action) => {
        state.creators.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateCreator.fulfilled, (state, action) => {
        const index = state.creators.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.creators[index] = action.payload;
        }
        if (state.selectedCreator?.id === action.payload.id) {
          state.selectedCreator = action.payload;
        }
      })
      .addCase(deleteCreator.fulfilled, (state, action) => {
        state.creators = state.creators.filter(c => c.id !== action.payload);
        state.total -= 1;
        if (state.selectedCreator?.id === action.payload) {
          state.selectedCreator = null;
        }
      });
  },
});

export const { clearSelectedCreator, clearError } = creatorSlice.actions;
export default creatorSlice.reducer;