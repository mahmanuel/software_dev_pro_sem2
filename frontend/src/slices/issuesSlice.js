// src/slices/issuesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const issuesSlice = createSlice({
  name: "issues",
  initialState: { list: [], loading: false, error: "" },
  reducers: {
    fetchIssuesStart(state) {
      state.loading = true;
      state.error = "";
    },
    fetchIssuesSuccess(state, action) {
      state.list = action.payload;
      state.loading = false;
    },
    fetchIssuesFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    updateIssue(state, action) {
      const index = state.list.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
    },
  },
});

export const { fetchIssuesStart, fetchIssuesSuccess, fetchIssuesFailure, updateIssue } = issuesSlice.actions;
export default issuesSlice.reducer;